import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL is not configured in secrets');
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    console.log('N8N Webhook URL:', N8N_WEBHOOK_URL.substring(0, 50) + '...');
    console.log('Sending message to N8N:', message);
    console.log('Conversation history length:', conversationHistory?.length || 0);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('N8N Response status:', response.status);
    console.log('N8N Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error response:', errorText);
      throw new Error(`N8N webhook failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('N8N response data:', data);

    // Se a resposta do N8N não tiver um campo específico, retornar o objeto todo
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-n8n function:', error);
    
    // Retornar uma mensagem de erro mais descritiva
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do N8N está configurado corretamente para aceitar requisições POST.',
        details: errorMessage
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});