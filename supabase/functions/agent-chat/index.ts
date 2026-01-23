import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, conversationId, message, conversationHistory } = await req.json();
    
    if (!agentId || !message) {
      throw new Error('Missing required fields: agentId and message');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    console.log(`Agent ${agent.name} - Model: ${agent.model}, RAG: ${agent.rag_enabled}, Memory: ${agent.memory_enabled}`);

    let contextChunks: string[] = [];

    // RAG: Search for relevant documents if enabled
    if (agent.rag_enabled) {
      try {
        // Create embedding for the user message
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: message,
          }),
        });

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          // Search for similar chunks
          const { data: chunks, error: chunksError } = await supabase.rpc(
            'search_document_chunks',
            {
              p_agent_id: agentId,
              p_embedding: embedding,
              p_match_threshold: agent.rag_similarity_threshold || 0.7,
              p_match_count: agent.rag_max_results || 5,
            }
          );

          if (!chunksError && chunks && chunks.length > 0) {
            contextChunks = chunks.map((c: any) => 
              `[Fonte: ${c.document_name}]\n${c.content}`
            );
            console.log(`Found ${chunks.length} relevant document chunks`);
          }
        }
      } catch (ragError) {
        console.error('RAG search error:', ragError);
      }
    }

    // Build system prompt with context
    let systemPrompt = agent.system_prompt || 'Você é um assistente útil e profissional.';
    
    if (contextChunks.length > 0) {
      systemPrompt += `\n\n## Contexto da Base de Conhecimento:\n\n${contextChunks.join('\n\n---\n\n')}\n\nUse as informações acima para responder quando relevante.`;
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (respecting memory window)
    if (agent.memory_enabled && conversationHistory) {
      const historyWindow = conversationHistory.slice(-(agent.memory_window || 20));
      messages.push(...historyWindow.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })));
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    console.log(`Calling OpenAI ${agent.model} with ${messages.length} messages...`);

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: agent.model || 'gpt-4o-mini',
        messages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Save user message to database
    if (conversationId) {
      await supabase.from('ai_agent_messages').insert({
        conversation_id: conversationId,
        agent_id: agentId,
        role: 'user',
        content: message,
      });
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));

            // Parse chunk to accumulate content for saving
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(line.slice(6));
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) {
                    assistantContent += delta;
                  }
                } catch {}
              }
            }
          }

          // Save assistant response to database
          if (conversationId && assistantContent) {
            await supabase.from('ai_agent_messages').insert({
              conversation_id: conversationId,
              agent_id: agentId,
              role: 'assistant',
              content: assistantContent,
              model_used: agent.model,
              sources: contextChunks.length > 0 ? contextChunks : [],
            });

            // Update conversation message count
            await supabase.from('ai_agent_conversations')
              .update({ 
                message_count: supabase.rpc('increment', { x: 2 }),
                updated_at: new Date().toISOString(),
              })
              .eq('id', conversationId);

            // Update agent stats
            await supabase.from('ai_agents')
              .update({
                total_messages: (agent.total_messages || 0) + 2,
                updated_at: new Date().toISOString(),
              })
              .eq('id', agentId);
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    console.error('Agent chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});