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

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    // GET - buscar dados do paciente pelo token
    if (req.method === "GET") {
      if (!token) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: paciente, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("form_token", token)
        .single();

      if (error || !paciente) {
        console.error("Erro ao buscar paciente:", error);
        return new Response(JSON.stringify({ error: "Link inválido ou expirado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Retorna apenas os campos necessários para o formulário
      return new Response(JSON.stringify({
        id: paciente.id,
        nome: paciente.nome,
        telefone: paciente.telefone,
        cpf: paciente.cpf,
        rg: paciente.rg,
        rg_orgao_expedidor: paciente.rg_orgao_expedidor,
        email: paciente.email,
        data_nascimento: paciente.data_nascimento,
        sexo: paciente.sexo,
        estado_civil: paciente.estado_civil,
        nacionalidade: paciente.nacionalidade,
        naturalidade: paciente.naturalidade,
        profissao: paciente.profissao,
        instagram: paciente.instagram,
        contato_emergencia_telefone: paciente.contato_emergencia_telefone,
        contato_emergencia_parentesco: paciente.contato_emergencia_parentesco,
        endereco: paciente.endereco,
        cidade: paciente.cidade,
        estado: paciente.estado,
        cep: paciente.cep,
        endereco_profissional: paciente.endereco_profissional,
        indicado_por: paciente.indicado_por,
        responsavel_nome: paciente.responsavel_nome,
        responsavel_rg: paciente.responsavel_rg,
        responsavel_rg_orgao: paciente.responsavel_rg_orgao,
        responsavel_cpf: paciente.responsavel_cpf,
        responsavel_data_nascimento: paciente.responsavel_data_nascimento,
        responsavel_sexo: paciente.responsavel_sexo,
        responsavel_estado_civil: paciente.responsavel_estado_civil,
        responsavel_nacionalidade: paciente.responsavel_nacionalidade,
        responsavel_naturalidade: paciente.responsavel_naturalidade,
        responsavel_profissao: paciente.responsavel_profissao,
        responsavel_telefone: paciente.responsavel_telefone,
        responsavel_email: paciente.responsavel_email,
        responsavel_endereco: paciente.responsavel_endereco,
        responsavel_cep: paciente.responsavel_cep,
        responsavel_parentesco: paciente.responsavel_parentesco,
        form_completed_at: paciente.form_completed_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - atualizar dados do paciente
    if (req.method === "POST") {
      const body = await req.json();
      const { token: bodyToken, ...updateData } = body;
      
      const formToken = token || bodyToken;
      
      if (!formToken) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Primeiro verifica se o token existe
      const { data: existing, error: findError } = await supabase
        .from("pacientes")
        .select("id")
        .eq("form_token", formToken)
        .single();

      if (findError || !existing) {
        return new Response(JSON.stringify({ error: "Link inválido ou expirado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Sanitiza os dados - converte strings vazias em null para campos de data
      const dateFields = ['data_nascimento', 'responsavel_data_nascimento'];
      const sanitizedData: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        if (dateFields.includes(key)) {
          // Converte string vazia para null em campos de data
          sanitizedData[key] = value === '' ? null : value;
        } else {
          // Para outros campos, mantém string vazia ou valor original
          sanitizedData[key] = value;
        }
      }

      console.log("Dados sanitizados para atualização:", JSON.stringify(sanitizedData));

      // Atualiza os dados do paciente
      const { error: updateError } = await supabase
        .from("pacientes")
        .update({
          ...sanitizedData,
          form_completed_at: new Date().toISOString(),
        })
        .eq("form_token", formToken);

      if (updateError) {
        console.error("Erro ao atualizar paciente:", updateError);
        return new Response(JSON.stringify({ error: "Erro ao salvar dados" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no formulario-paciente:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
