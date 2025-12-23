import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não está configurada');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar categorias existentes
    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .select('id, nome_sintetico, nome_analitico, tipo, natureza_dre');

    if (catError) throw catError;
    console.log(`Encontradas ${categorias?.length || 0} categorias`);

    // 2. Buscar lançamentos de despesa com suas categorias
    const { data: lancamentos, error: lancError } = await supabase
      .from('td_fluxo_de_caixa')
      .select(`
        id,
        descricao,
        valor,
        tipo,
        categoria_id,
        categorias(id, nome_sintetico, nome_analitico, natureza_dre)
      `)
      .eq('tipo', 'despesa');

    if (lancError) throw lancError;
    console.log(`Encontrados ${lancamentos?.length || 0} lançamentos de despesa`);

    // 3. Preparar dados para análise da IA
    const categoriasParaAnalise = categorias?.filter(c => c.tipo === 'despesa').map(c => ({
      id: c.id,
      nome_sintetico: c.nome_sintetico,
      nome_analitico: c.nome_analitico,
      natureza_dre_atual: c.natureza_dre,
    })) || [];

    // Agrupar lançamentos por categoria para análise
    const lancamentosPorCategoria = new Map<string, { descricoes: string[]; valor_total: number; count: number }>();
    lancamentos?.forEach(l => {
      const catId = l.categoria_id || 'sem_categoria';
      const atual = lancamentosPorCategoria.get(catId) || { descricoes: [], valor_total: 0, count: 0 };
      if (l.descricao && atual.descricoes.length < 5) {
        atual.descricoes.push(l.descricao);
      }
      atual.valor_total += Number(l.valor || 0);
      atual.count++;
      lancamentosPorCategoria.set(catId, atual);
    });

    const lancamentosResumo = Array.from(lancamentosPorCategoria.entries()).map(([catId, dados]) => {
      const cat = categorias?.find(c => c.id === catId);
      return {
        categoria_id: catId === 'sem_categoria' ? null : catId,
        categoria_nome: cat ? `${cat.nome_sintetico} - ${cat.nome_analitico}` : 'Sem categoria',
        quantidade_lancamentos: dados.count,
        valor_total: dados.valor_total,
        exemplos_descricao: dados.descricoes,
      };
    });

    // 4. Chamar OpenAI para análise
    const prompt = `Você é um especialista em contabilidade e DRE (Demonstração do Resultado do Exercício) para clínicas de estética.

Analise as categorias de despesa e os lançamentos abaixo e classifique cada categoria na natureza_dre correta:

**Naturezas DRE disponíveis:**
- "custo": Custos diretamente ligados aos serviços (ex: materiais para tratamentos, insumos, produtos usados nos procedimentos)
- "opex": Despesas operacionais do dia-a-dia (ex: aluguel, água, luz, internet, telefone, marketing, salários administrativos, materiais de escritório, limpeza)
- "investimento": Gastos com bens duráveis ou melhorias (ex: equipamentos, reformas, móveis, software)
- "distribuicao": Retiradas dos sócios, dividendos, pró-labore
- "financeiro": Juros, tarifas bancárias, IOF, multas

**Categorias de despesa existentes:**
${JSON.stringify(categoriasParaAnalise, null, 2)}

**Resumo dos lançamentos por categoria (para contexto):**
${JSON.stringify(lancamentosResumo, null, 2)}

**Retorne um JSON no formato:**
{
  "categorias_corrigidas": [
    { "id": "uuid-da-categoria", "natureza_dre_sugerida": "opex", "justificativa": "Despesa administrativa recorrente" }
  ],
  "observacoes": "Texto com observações gerais sobre a classificação"
}

Analise cuidadosamente cada categoria e sugira a natureza_dre mais adequada baseada no nome e nos exemplos de lançamentos.`;

    console.log('Chamando OpenAI para análise...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em contabilidade e classificação de despesas para DRE. Sempre responda em JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Erro OpenAI:', errorText);
      throw new Error(`Erro na API OpenAI: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = JSON.parse(openaiData.choices[0].message.content);
    
    console.log('Resposta da IA:', JSON.stringify(aiResponse, null, 2));

    // 5. Aplicar as correções no banco
    const correcoes = aiResponse.categorias_corrigidas || [];
    const resultados = {
      categorias_atualizadas: 0,
      erros: [] as string[],
    };

    for (const correcao of correcoes) {
      if (!correcao.id || !correcao.natureza_dre_sugerida) continue;

      // Validar natureza_dre
      const naturezasValidas = ['custo', 'opex', 'investimento', 'distribuicao', 'financeiro', 'receita'];
      if (!naturezasValidas.includes(correcao.natureza_dre_sugerida)) {
        resultados.erros.push(`Natureza inválida para categoria ${correcao.id}: ${correcao.natureza_dre_sugerida}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('categorias')
        .update({ natureza_dre: correcao.natureza_dre_sugerida })
        .eq('id', correcao.id);

      if (updateError) {
        resultados.erros.push(`Erro ao atualizar categoria ${correcao.id}: ${updateError.message}`);
      } else {
        resultados.categorias_atualizadas++;
      }
    }

    console.log('Correções aplicadas:', resultados);

    return new Response(JSON.stringify({
      success: true,
      message: `Análise concluída! ${resultados.categorias_atualizadas} categorias atualizadas.`,
      detalhes: {
        categorias_analisadas: categoriasParaAnalise.length,
        categorias_atualizadas: resultados.categorias_atualizadas,
        lancamentos_analisados: lancamentos?.length || 0,
        observacoes_ia: aiResponse.observacoes,
        correcoes: correcoes,
        erros: resultados.erros,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função corrigir-dre-ia:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
