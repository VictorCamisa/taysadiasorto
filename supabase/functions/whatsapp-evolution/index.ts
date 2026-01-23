import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Evolution API não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();
    console.log("Action:", action, "Params:", JSON.stringify(params));

    const evolutionFetch = async (endpoint: string, method = "GET", body?: unknown) => {
      const url = `${EVOLUTION_API_URL}${endpoint}`;
      console.log(`Evolution API: ${method} ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const text = await response.text();
      
      console.log(`Evolution Response (${response.status}):`, text.substring(0, 500));
      
      if (!response.ok) {
        throw new Error(`Evolution API error: ${response.status} - ${text}`);
      }
      
      return text ? JSON.parse(text) : null;
    };

    let result;

    switch (action) {
      // Listar instâncias
      case "list_instances": {
        result = await evolutionFetch("/instance/fetchInstances");
        break;
      }

      // Criar nova instância
      case "create_instance": {
        const { instanceName, nome } = params;
        
        const instanceData = {
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
        };
        
        result = await evolutionFetch("/instance/create", "POST", instanceData);
        
        // Salvar no banco
        const { error: dbError } = await supabase
          .from("whatsapp_instances")
          .insert({
            nome,
            instance_name: instanceName,
            instance_id: result?.instance?.instanceId || instanceName,
            status: "connecting",
          });
          
        if (dbError) {
          console.error("DB Error:", dbError);
        }
        
        break;
      }

      // Obter QR Code
      case "get_qrcode": {
        const { instanceName } = params;
        result = await evolutionFetch(`/instance/connect/${instanceName}`);
        break;
      }

      // Status da conexão
      case "connection_state": {
        const { instanceName } = params;
        result = await evolutionFetch(`/instance/connectionState/${instanceName}`);
        
        // Atualizar status no banco
        const status = result?.instance?.state === "open" ? "connected" : "disconnected";
        await supabase
          .from("whatsapp_instances")
          .update({ status })
          .eq("instance_name", instanceName);
          
        break;
      }

      // Buscar conversas
      case "fetch_chats": {
        const { instanceName } = params;
        result = await evolutionFetch(`/chat/findChats/${instanceName}`);
        break;
      }

      // Buscar mensagens de uma conversa
      case "fetch_messages": {
        const { instanceName, remoteJid, count = 50 } = params;
        result = await evolutionFetch(`/chat/findMessages/${instanceName}`, "POST", {
          where: {
            key: {
              remoteJid,
            },
          },
          limit: count,
        });
        break;
      }

      // Enviar mensagem de texto
      case "send_message": {
        const { instanceName, remoteJid, message } = params;
        result = await evolutionFetch(`/message/sendText/${instanceName}`, "POST", {
          number: remoteJid.replace("@s.whatsapp.net", ""),
          text: message,
        });
        
        // Salvar mensagem no banco
        const { data: conversa } = await supabase
          .from("whatsapp_conversas")
          .select("id")
          .eq("remote_jid", remoteJid)
          .single();
          
        if (conversa) {
          await supabase.from("whatsapp_mensagens").insert({
            conversa_id: conversa.id,
            message_id: result?.key?.id,
            from_me: true,
            tipo: "text",
            conteudo: message,
            status: "sent",
          });
          
          await supabase
            .from("whatsapp_conversas")
            .update({
              ultima_mensagem: message,
              ultima_mensagem_at: new Date().toISOString(),
            })
            .eq("id", conversa.id);
        }
        
        break;
      }

      // Sincronizar conversas com banco de dados
      case "sync_chats": {
        const { instanceId, chats } = params;
        
        for (const chat of chats) {
          const remoteJid = chat.id || chat.remoteJid;
          const nome = chat.name || chat.pushName || remoteJid.split("@")[0];
          
          // Tentar vincular com paciente pelo telefone
          const telefone = remoteJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
          const { data: paciente } = await supabase
            .from("pacientes")
            .select("id")
            .or(`telefone.ilike.%${telefone.slice(-9)}%,telefone.ilike.%${telefone}%`)
            .limit(1)
            .single();
          
          await supabase
            .from("whatsapp_conversas")
            .upsert({
              instance_id: instanceId,
              remote_jid: remoteJid,
              nome_contato: nome,
              foto_url: chat.profilePicUrl || null,
              paciente_id: paciente?.id || null,
              ultima_mensagem: chat.lastMessage?.message || null,
              ultima_mensagem_at: chat.lastMessage?.messageTimestamp 
                ? new Date(chat.lastMessage.messageTimestamp * 1000).toISOString() 
                : null,
              nao_lidas: chat.unreadMessages || 0,
            }, {
              onConflict: "instance_id,remote_jid",
            });
        }
        
        result = { success: true, synced: chats.length };
        break;
      }

      // Sincronizar mensagens
      case "sync_messages": {
        const { conversaId, messages } = params;
        
        for (const msg of messages) {
          const messageId = msg.key?.id;
          const fromMe = msg.key?.fromMe || false;
          const conteudo = msg.message?.conversation || 
                          msg.message?.extendedTextMessage?.text ||
                          msg.message?.imageMessage?.caption ||
                          "[Mídia]";
          
          await supabase
            .from("whatsapp_mensagens")
            .upsert({
              conversa_id: conversaId,
              message_id: messageId,
              from_me: fromMe,
              tipo: msg.message?.imageMessage ? "image" : 
                    msg.message?.audioMessage ? "audio" : 
                    msg.message?.videoMessage ? "video" : "text",
              conteudo,
              media_url: msg.message?.imageMessage?.url || msg.message?.videoMessage?.url || null,
              timestamp_msg: new Date(msg.messageTimestamp * 1000).toISOString(),
            }, {
              onConflict: "message_id",
            });
        }
        
        result = { success: true, synced: messages.length };
        break;
      }

      // Desconectar instância
      case "logout": {
        const { instanceName } = params;
        result = await evolutionFetch(`/instance/logout/${instanceName}`, "DELETE");
        
        await supabase
          .from("whatsapp_instances")
          .update({ status: "disconnected", qrcode: null })
          .eq("instance_name", instanceName);
          
        break;
      }

      // Deletar instância
      case "delete_instance": {
        const { instanceName } = params;
        result = await evolutionFetch(`/instance/delete/${instanceName}`, "DELETE");
        
        await supabase
          .from("whatsapp_instances")
          .delete()
          .eq("instance_name", instanceName);
          
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Ação não reconhecida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
