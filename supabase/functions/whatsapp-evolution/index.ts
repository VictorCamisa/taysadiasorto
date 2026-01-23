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
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Evolution API não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    console.log("Action:", action, "Params:", JSON.stringify(params));

    // Helper para formatar telefone no padrão WhatsApp: 55XX999999999
    const formatPhoneNumber = (phone: string) => {
      if (!phone) return phone;
      // Remove todos caracteres não numéricos
      const cleaned = phone.replace(/\D/g, "");
      
      // Se já tem 13 dígitos (55 + DDD + 9 dígitos), retorna como está
      if (cleaned.length === 13) {
        return cleaned;
      }
      // Se tem 12 dígitos (55 + DDD + 8 dígitos), pode ser número antigo
      if (cleaned.length === 12) {
        return cleaned;
      }
      // Se tem 11 dígitos (DDD + 9 dígitos), adiciona 55
      if (cleaned.length === 11) {
        return `55${cleaned}`;
      }
      // Se tem 10 dígitos (DDD + 8 dígitos), adiciona 55
      if (cleaned.length === 10) {
        return `55${cleaned}`;
      }
      // Se tem 9 dígitos (só o número), não tem como saber o DDD
      return cleaned;
    };

    const evolutionFetch = async (endpoint: string, method = "GET", body?: unknown) => {
      // Remove trailing slash from URL and leading slash from endpoint to avoid //
      const baseUrl = EVOLUTION_API_URL.replace(/\/+$/, "");
      const path = endpoint.replace(/^\/+/, "");
      const url = `${baseUrl}/${path}`;
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
        
        // URL do webhook para receber eventos
        const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-webhook`;
        
        const instanceData = {
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: {
            url: webhookUrl,
            byEvents: false,
            base64: false,
            headers: {},
            events: [
              "MESSAGES_UPSERT",
              "MESSAGES_UPDATE",
              "CONNECTION_UPDATE",
              "CONTACTS_UPDATE",
            ],
          },
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
            webhook_url: webhookUrl,
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
        
        // Se conectado, garantir que o webhook está configurado
        if (status === "connected") {
          const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-webhook`;
          try {
            await evolutionFetch(`/webhook/set/${instanceName}`, "POST", {
              url: webhookUrl,
              events: [
                "MESSAGES_UPSERT",
                "MESSAGES_UPDATE",
                "CONNECTION_UPDATE",
                "CONTACTS_UPDATE",
              ],
              byEvents: false,
              base64: false,
            });
            console.log("Webhook configurado:", webhookUrl);
            
            // Atualizar no banco
            await supabase
              .from("whatsapp_instances")
              .update({ webhook_url: webhookUrl })
              .eq("instance_name", instanceName);
          } catch (webhookError) {
            console.error("Erro ao configurar webhook:", webhookError);
          }
        }
          
        break;
      }

      // Buscar conversas
      case "fetch_chats": {
        const { instanceName } = params;
        // Evolution API v2: POST /chat/findChats/{instanceName} with empty body or filters
        const chats = await evolutionFetch(`/chat/findChats/${instanceName}`, "POST", {});
        
        // Tentar buscar contatos para obter nomes reais
        let contacts: Record<string, { pushName?: string; profilePictureUrl?: string }> = {};
        try {
          const contactsResponse = await evolutionFetch(`/chat/findContacts/${instanceName}`, "POST", {});
          if (Array.isArray(contactsResponse)) {
            for (const contact of contactsResponse) {
              const jid = contact.id || contact.remoteJid;
              if (jid) {
                contacts[jid] = {
                  pushName: contact.pushName || contact.name || contact.verifiedName || contact.notify,
                  profilePictureUrl: contact.profilePictureUrl || contact.profilePicUrl,
                };
              }
            }
          }
        } catch (e) {
          console.log("Could not fetch contacts, using chat data only:", e);
        }
        
        // Enriquecer chats com dados dos contatos
        result = Array.isArray(chats) ? chats.map((chat: Record<string, unknown>) => {
          const jid = (chat.id || chat.remoteJid) as string;
          const contact = contacts[jid];
          return {
            ...chat,
            pushName: chat.pushName || contact?.pushName || null,
            profilePictureUrl: chat.profilePictureUrl || chat.profilePicUrl || contact?.profilePictureUrl || null,
          };
        }) : chats;
        
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
        
        // Verificar se é LID ou número normal
        const isLid = remoteJid.endsWith("@lid");
        
        if (isLid) {
          // Para LID, usar o remoteJid completo
          result = await evolutionFetch(`/message/sendText/${instanceName}`, "POST", {
            number: remoteJid,
            text: message,
          });
        } else {
          // Para número normal, remover o sufixo
          result = await evolutionFetch(`/message/sendText/${instanceName}`, "POST", {
            number: remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", ""),
            text: message,
          });
        }
        
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
        
        // Primeiro, deletar conversas com remote_jid inválido (IDs internos da Evolution)
        const { error: deleteError } = await supabase
          .from("whatsapp_conversas")
          .delete()
          .eq("instance_id", instanceId)
          .not("remote_jid", "like", "%@%");
        
        if (deleteError) {
          console.log("Erro ao limpar conversas inválidas:", deleteError);
        }
        
        let syncedCount = 0;
        
        for (const chat of chats) {
          // CRÍTICO: Usar SOMENTE remoteJid, NUNCA o id interno
          // O remoteJid SEMPRE contém @ (ex: 5511999999999@s.whatsapp.net ou hash@lid)
          const remoteJid = chat.remoteJid as string;
          
          // Se não tiver remoteJid válido (com @), ignorar este chat
          if (!remoteJid || !remoteJid.includes("@")) {
            console.log("Ignorando chat sem remoteJid válido:", chat.id);
            continue;
          }
          
          // Extrair telefone do remoteJid (formato: 5511999999999@s.whatsapp.net ou hash@lid)
          const isLid = remoteJid.endsWith("@lid");
          const telefoneRaw = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "").replace("@lid", "").replace(/\D/g, "");
          
          // Nome do contato - priorizar:
          // 1. pushName do chat (já enriquecido com dados dos contatos)
          // 2. pushName da última mensagem recebida (não fromMe)
          // 3. Nome ou notify do contato
          // 4. Número formatado (se não for LID)
          let nome = chat.pushName;
          
          // Se não tem pushName, tentar pegar da última mensagem recebida
          if (!nome && chat.lastMessage && !chat.lastMessage.key?.fromMe) {
            nome = chat.lastMessage.pushName;
          }
          
          // Se ainda não tem nome, usar o número formatado ou um placeholder
          if (!nome) {
            if (isLid) {
              // LID não tem número de telefone, usar placeholder com últimos dígitos do ID
              nome = `Contato ${telefoneRaw.slice(-6)}`;
            } else {
              nome = formatPhoneNumber(telefoneRaw);
            }
          }
          
          // Extrair texto da última mensagem (pode vir em diferentes formatos)
          let ultimaMensagem = null;
          if (chat.lastMessage) {
            const msg = chat.lastMessage.message;
            if (typeof msg === "string") {
              ultimaMensagem = msg;
            } else if (msg) {
              ultimaMensagem = msg.conversation || 
                              msg.extendedTextMessage?.text ||
                              msg.imageMessage?.caption ||
                              msg.videoMessage?.caption ||
                              msg.documentMessage?.fileName ||
                              (msg.audioMessage ? "🎵 Áudio" : null) ||
                              (msg.stickerMessage ? "Sticker" : null) ||
                              (msg.contactMessage ? "📇 Contato" : null) ||
                              (msg.locationMessage ? "📍 Localização" : null) ||
                              "[Mídia]";
            }
          }
          
          // Tentar vincular com paciente pelo telefone (somente se não for LID)
          let pacienteId = null;
          if (!isLid && telefoneRaw.length >= 9) {
            const { data: paciente } = await supabase
              .from("pacientes")
              .select("id")
              .or(`telefone.ilike.%${telefoneRaw.slice(-9)}%,telefone.ilike.%${telefoneRaw}%`)
              .limit(1)
              .single();
            pacienteId = paciente?.id || null;
          }
          
          await supabase
            .from("whatsapp_conversas")
            .upsert({
              instance_id: instanceId,
              remote_jid: remoteJid,
              nome_contato: nome,
              foto_url: chat.profilePictureUrl || chat.profilePicUrl || null,
              paciente_id: pacienteId,
              ultima_mensagem: ultimaMensagem,
              ultima_mensagem_at: chat.lastMessage?.messageTimestamp 
                ? new Date(chat.lastMessage.messageTimestamp * 1000).toISOString() 
                : (chat.updatedAt ? new Date(chat.updatedAt).toISOString() : null),
              nao_lidas: chat.unreadCount || chat.unreadMessages || 0,
            }, {
              onConflict: "instance_id,remote_jid",
            });
          
          syncedCount++;
        }
        
        result = { success: true, synced: syncedCount };
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
