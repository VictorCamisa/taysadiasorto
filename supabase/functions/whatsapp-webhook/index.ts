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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload).substring(0, 1000));

    // Evolution API envia eventos em diferentes formatos
    const event = payload.event || payload.type;
    const instanceName = payload.instance || payload.instanceName;
    const data = payload.data || payload;

    // Buscar a instância no banco
    const { data: instance } = await supabase
      .from("whatsapp_instances")
      .select("id")
      .eq("instance_name", instanceName)
      .single();

    if (!instance) {
      console.log("Instance not found:", instanceName);
      return new Response(
        JSON.stringify({ success: false, error: "Instance not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Helper para formatar telefone: 55XX999999999
    const formatPhoneNumber = (phone: string) => {
      if (!phone) return phone;
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 13) return cleaned;
      if (cleaned.length === 12) return cleaned;
      if (cleaned.length === 11) return `55${cleaned}`;
      if (cleaned.length === 10) return `55${cleaned}`;
      return cleaned;
    };

    // Helper para extrair telefone do JID
    const extractPhoneFromJid = (jid: string) => {
      if (!jid || jid.endsWith("@lid") || jid.endsWith("@g.us")) return null;
      return jid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
    };

    // Processar eventos de mensagem
    if (event === "messages.upsert" || event === "message" || event === "MESSAGES_UPSERT") {
      const messages = data.messages || [data];
      
      for (const msg of messages) {
        const key = msg.key || {};
        const remoteJid = key.remoteJid || msg.remoteJid;
        const fromMe = key.fromMe || false;
        const messageId = key.id || msg.id;
        const pushName = msg.pushName || data.pushName;
        
        if (!remoteJid) continue;

        // Extrair telefone do JID
        const telefoneRaw = extractPhoneFromJid(remoteJid);
        const isLid = remoteJid.endsWith("@lid");
        const telefoneFormatado = telefoneRaw ? formatPhoneNumber(telefoneRaw) : null;

        // Extrair conteúdo da mensagem
        const message = msg.message || {};
        const conteudo = message.conversation || 
                        message.extendedTextMessage?.text ||
                        message.imageMessage?.caption ||
                        message.videoMessage?.caption ||
                        message.documentMessage?.fileName ||
                        (message.audioMessage ? "🎵 Áudio" : null) ||
                        (message.stickerMessage ? "Sticker" : null) ||
                        (message.contactMessage ? "📇 Contato" : null) ||
                        (message.locationMessage ? "📍 Localização" : null) ||
                        "[Mídia]";

        // Verificar se já existe conversa
        let { data: conversa } = await supabase
          .from("whatsapp_conversas")
          .select("id, paciente_id")
          .eq("instance_id", instance.id)
          .eq("remote_jid", remoteJid)
          .single();

        // Se não existe conversa, criar
        if (!conversa) {
          let pacienteId = null;
          let nome = pushName;

          // Se tem telefone válido (não é LID), buscar ou criar paciente
          if (telefoneFormatado && telefoneFormatado.length >= 10) {
            // Buscar paciente pelo telefone
            const { data: pacienteExistente } = await supabase
              .from("pacientes")
              .select("id, nome")
              .or(`telefone.ilike.%${telefoneFormatado.slice(-9)}%,telefone.ilike.%${telefoneFormatado}%`)
              .limit(1)
              .single();

            if (pacienteExistente) {
              pacienteId = pacienteExistente.id;
              nome = nome || pacienteExistente.nome;
              console.log("Paciente encontrado:", pacienteExistente.id);
            } else {
              // Criar novo paciente
              const nomePaciente = pushName || `Contato WhatsApp ${telefoneFormatado.slice(-4)}`;
              const { data: novoPaciente, error: erroPaciente } = await supabase
                .from("pacientes")
                .insert({
                  nome: nomePaciente,
                  telefone: telefoneFormatado,
                  ativo: true,
                })
                .select("id")
                .single();

              if (!erroPaciente && novoPaciente) {
                pacienteId = novoPaciente.id;
                console.log("Novo paciente criado:", novoPaciente.id);

                // Criar negociação no CRM para o novo paciente
                // Buscar origem "WhatsApp" ou criar
                let { data: origemWhatsApp } = await supabase
                  .from("origens")
                  .select("id")
                  .eq("nome", "WhatsApp")
                  .single();

                if (!origemWhatsApp) {
                  const { data: novaOrigem } = await supabase
                    .from("origens")
                    .insert({ nome: "WhatsApp", descricao: "Contato via WhatsApp" })
                    .select("id")
                    .single();
                  origemWhatsApp = novaOrigem;
                }

                // Criar agendamento/negociação no CRM
                const { data: novoAgendamento, error: erroAgendamento } = await supabase
                  .from("crm_agendamentos")
                  .insert({
                    paciente_id: pacienteId,
                    status: "lead",
                    origem_id: origemWhatsApp?.id || null,
                    observacoes: `Lead criado automaticamente via WhatsApp em ${new Date().toLocaleString("pt-BR")}`,
                    prioridade: "media",
                  })
                  .select("id")
                  .single();

                if (!erroAgendamento && novoAgendamento) {
                  console.log("Nova negociação criada:", novoAgendamento.id);
                } else {
                  console.error("Erro ao criar negociação:", erroAgendamento);
                }
              } else {
                console.error("Erro ao criar paciente:", erroPaciente);
              }
            }
          }

          // Criar conversa
          const nomeContato = nome || (isLid ? `Contato ${remoteJid.slice(-10, -4)}` : telefoneFormatado);
          
          const { data: novaConversa, error: erroConversa } = await supabase
            .from("whatsapp_conversas")
            .insert({
              instance_id: instance.id,
              remote_jid: remoteJid,
              nome_contato: nomeContato,
              paciente_id: pacienteId,
              ultima_mensagem: conteudo,
              ultima_mensagem_at: new Date().toISOString(),
              nao_lidas: fromMe ? 0 : 1,
            })
            .select("id, paciente_id")
            .single();

          if (!erroConversa && novaConversa) {
            conversa = novaConversa;
            console.log("Nova conversa criada:", novaConversa.id);
          } else {
            console.error("Erro ao criar conversa:", erroConversa);
            continue;
          }
        } else {
          // Atualizar conversa existente
          const currentNaoLidas = (conversa as { nao_lidas?: number }).nao_lidas || 0;
          await supabase
            .from("whatsapp_conversas")
            .update({
              ultima_mensagem: conteudo,
              ultima_mensagem_at: new Date().toISOString(),
              nao_lidas: fromMe ? 0 : currentNaoLidas + 1,
              nome_contato: pushName || undefined,
            })
            .eq("id", conversa.id);
        }

        // Salvar mensagem
        const timestamp = msg.messageTimestamp 
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString();

        await supabase
          .from("whatsapp_mensagens")
          .upsert({
            conversa_id: conversa.id,
            message_id: messageId,
            from_me: fromMe,
            tipo: message.imageMessage ? "image" : 
                  message.audioMessage ? "audio" : 
                  message.videoMessage ? "video" : 
                  message.documentMessage ? "document" : "text",
            conteudo,
            media_url: message.imageMessage?.url || message.videoMessage?.url || message.audioMessage?.url || null,
            timestamp_msg: timestamp,
            status: fromMe ? "sent" : "received",
          }, {
            onConflict: "message_id",
          });

        console.log("Mensagem salva:", messageId);
      }
    }

    // Processar eventos de status de conexão
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const state = data.state || data.status;
      const status = state === "open" || state === "connected" ? "connected" : "disconnected";
      
      await supabase
        .from("whatsapp_instances")
        .update({ status })
        .eq("instance_name", instanceName);

      console.log("Status atualizado:", instanceName, status);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
