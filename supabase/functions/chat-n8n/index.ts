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
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    console.log('Sending message to N8N:', message);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('N8N response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-n8n function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});