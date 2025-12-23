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

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente com service role para criar usuários
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Cliente com token do usuário para verificar se é admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verificar se o usuário é admin
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: userData.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Apenas administradores podem aprovar usuários" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { solicitacao_id, acao, motivo_rejeicao } = await req.json();

    if (!solicitacao_id || !acao) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar a solicitação
    const { data: solicitacao, error: solicitacaoError } = await supabaseAdmin
      .from("solicitacoes_acesso")
      .select("*")
      .eq("id", solicitacao_id)
      .single();

    if (solicitacaoError || !solicitacao) {
      return new Response(JSON.stringify({ error: "Solicitação não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (solicitacao.status !== "pendente") {
      return new Response(JSON.stringify({ error: "Solicitação já foi processada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (acao === "rejeitar") {
      // Atualizar status para rejeitado
      await supabaseAdmin
        .from("solicitacoes_acesso")
        .update({
          status: "rejeitado",
          motivo_rejeicao: motivo_rejeicao || "Solicitação rejeitada pelo administrador",
          aprovado_por: userData.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", solicitacao_id);

      return new Response(JSON.stringify({ success: true, message: "Solicitação rejeitada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (acao === "aprovar") {
      // Criar o usuário no Supabase Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: solicitacao.email,
        password: solicitacao.senha_hash, // Armazenamos a senha em texto para poder criar o usuário
        email_confirm: true, // Auto-confirmar email
        user_metadata: { nome: solicitacao.nome },
      });

      if (createError) {
        console.error("Erro ao criar usuário:", createError);
        return new Response(JSON.stringify({ error: "Erro ao criar usuário: " + createError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Criar perfil do usuário
      await supabaseAdmin.from("profiles").insert({
        id: newUser.user.id,
        nome: solicitacao.nome,
        email: solicitacao.email,
        telefone: solicitacao.telefone,
        ativo: true,
      });

      // Atualizar status da solicitação
      await supabaseAdmin
        .from("solicitacoes_acesso")
        .update({
          status: "aprovado",
          aprovado_por: userData.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", solicitacao_id);

      return new Response(JSON.stringify({ success: true, message: "Usuário aprovado e criado com sucesso" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
