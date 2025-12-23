import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to query database and get clinic context
async function getClinicContext(supabase: any) {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // Fetch multiple data sources in parallel
  const [
    fluxoCaixaRes,
    pacientesRes,
    agendamentosRes,
    tratamentosRes,
    produtosRes,
    contasPagarRes,
    origensRes
  ] = await Promise.all([
    supabase.from('td_fluxo_de_caixa')
      .select('*, tratamento:tratamentos(nome), origem:origens(nome), categoria:categorias(nome_sintetico, tipo)')
      .gte('data_lancamento', startOfMonth)
      .order('data_lancamento', { ascending: false })
      .limit(100),
    
    supabase.from('pacientes')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(50),
    
    supabase.from('crm_agendamentos')
      .select('*, paciente:pacientes(nome), tratamento:tratamentos(nome, preco), origem:origens(nome)')
      .order('data_agendamento', { ascending: false })
      .limit(50),
    
    supabase.from('tratamentos')
      .select('*')
      .eq('ativo', true),
    
    supabase.from('estoque_produtos')
      .select('*')
      .eq('ativo', true),
    
    supabase.from('financeiro_contas_pagar')
      .select('*, categoria:financeiro_categorias_old(categoria_sintetica), fornecedor:financeiro_fornecedores_old(nome)')
      .order('data_vencimento', { ascending: true })
      .limit(30),
    
    supabase.from('origens')
      .select('*')
  ]);

  // Calculate KPIs
  const fluxoCaixa = fluxoCaixaRes.data || [];
  const receitas = fluxoCaixa.filter((f: any) => f.tipo === 'receita');
  const despesas = fluxoCaixa.filter((f: any) => f.tipo === 'despesa');
  
  const totalReceitas = receitas.reduce((sum: number, r: any) => sum + (r.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum: number, d: any) => sum + (d.valor || 0), 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(1) : 0;

  const pacientes = pacientesRes.data || [];
  const agendamentos = agendamentosRes.data || [];
  const tratamentos = tratamentosRes.data || [];
  const produtos = produtosRes.data || [];
  const contasPagar = contasPagarRes.data || [];
  const origens = origensRes.data || [];

  // Agendamentos analysis
  const agendamentosConfirmados = agendamentos.filter((a: any) => a.status === 'confirmado').length;
  const agendamentosConcluidos = agendamentos.filter((a: any) => a.status === 'concluido').length;
  const agendamentosCancelados = agendamentos.filter((a: any) => a.status === 'cancelado').length;
  const taxaConversao = agendamentos.length > 0 
    ? ((agendamentosConcluidos / agendamentos.length) * 100).toFixed(1) 
    : 0;

  // Low stock products
  const produtosBaixoEstoque = produtos.filter((p: any) => 
    p.estoque_atual !== null && p.estoque_minimo !== null && p.estoque_atual <= p.estoque_minimo
  );

  // Overdue bills
  const contasVencidas = contasPagar.filter((c: any) => 
    c.status === 'pendente' && c.data_vencimento < today
  );
  const totalContasVencidas = contasVencidas.reduce((sum: number, c: any) => sum + (c.valor || 0), 0);

  // Top treatments by revenue
  const tratamentoReceitas: Record<string, number> = {};
  receitas.forEach((r: any) => {
    const nome = r.tratamento?.nome || 'Outros';
    tratamentoReceitas[nome] = (tratamentoReceitas[nome] || 0) + (r.valor || 0);
  });
  const topTratamentos = Object.entries(tratamentoReceitas)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Revenue by origin
  const receitasPorOrigem: Record<string, number> = {};
  receitas.forEach((r: any) => {
    const nome = r.origem?.nome || 'Não especificado';
    receitasPorOrigem[nome] = (receitasPorOrigem[nome] || 0) + (r.valor || 0);
  });

  return {
    dataAtual: today,
    periodoAnalise: `${startOfMonth} a ${today}`,
    kpis: {
      receitaTotal: totalReceitas,
      despesaTotal: totalDespesas,
      lucroLiquido,
      margemLucro: `${margemLucro}%`,
      ticketMedio: receitas.length > 0 ? (totalReceitas / receitas.length).toFixed(2) : 0,
      totalPacientesAtivos: pacientes.length,
      totalTratamentosAtivos: tratamentos.length,
      agendamentosConfirmados,
      agendamentosConcluidos,
      agendamentosCancelados,
      taxaConversao: `${taxaConversao}%`,
      produtosBaixoEstoque: produtosBaixoEstoque.length,
      contasVencidas: contasVencidas.length,
      valorContasVencidas: totalContasVencidas
    },
    detalhes: {
      topTratamentos: topTratamentos.map(([nome, valor]) => ({ nome, valor })),
      receitasPorOrigem: Object.entries(receitasPorOrigem).map(([nome, valor]) => ({ nome, valor })),
      produtosBaixoEstoque: produtosBaixoEstoque.map((p: any) => ({ 
        nome: p.nome, 
        estoqueAtual: p.estoque_atual, 
        estoqueMinimo: p.estoque_minimo 
      })),
      proximasContasPagar: contasPagar.slice(0, 5).map((c: any) => ({
        descricao: c.descricao,
        valor: c.valor,
        vencimento: c.data_vencimento,
        status: c.status
      })),
      ultimosAgendamentos: agendamentos.slice(0, 10).map((a: any) => ({
        paciente: a.paciente?.nome,
        tratamento: a.tratamento?.nome,
        data: a.data_agendamento,
        status: a.status,
        valor: a.valor_previsto
      }))
    },
    tratamentosDisponiveis: tratamentos.map((t: any) => ({ 
      nome: t.nome, 
      preco: t.preco, 
      custoEstimado: t.custo_estimado,
      grupo: t.grupo
    })),
    origensMarketing: origens.map((o: any) => o.nome)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Create Supabase client for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get clinic context from database
    console.log('Fetching clinic context...');
    const clinicContext = await getClinicContext(supabase);
    console.log('Clinic context fetched successfully');

    const systemPrompt = `Você é a ARIA (Assistente de Relatórios e Inteligência Analítica), uma assistente de IA especializada em gestão de clínicas de estética e saúde. Você tem acesso direto aos dados da clínica e deve responder de forma profissional, precisa e útil.

## Dados Atuais da Clínica (${clinicContext.dataAtual}):

### KPIs do Mês Atual (${clinicContext.periodoAnalise}):
- Receita Total: R$ ${clinicContext.kpis.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesa Total: R$ ${clinicContext.kpis.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido: R$ ${clinicContext.kpis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro: ${clinicContext.kpis.margemLucro}
- Ticket Médio: R$ ${clinicContext.kpis.ticketMedio}
- Total de Pacientes Ativos: ${clinicContext.kpis.totalPacientesAtivos}
- Tratamentos Ativos: ${clinicContext.kpis.totalTratamentosAtivos}

### Performance Comercial:
- Agendamentos Confirmados: ${clinicContext.kpis.agendamentosConfirmados}
- Agendamentos Concluídos: ${clinicContext.kpis.agendamentosConcluidos}
- Agendamentos Cancelados: ${clinicContext.kpis.agendamentosCancelados}
- Taxa de Conversão: ${clinicContext.kpis.taxaConversao}

### Alertas:
- Produtos com Estoque Baixo: ${clinicContext.kpis.produtosBaixoEstoque}
- Contas Vencidas: ${clinicContext.kpis.contasVencidas} (Total: R$ ${clinicContext.kpis.valorContasVencidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})

### Top 5 Tratamentos por Receita:
${clinicContext.detalhes.topTratamentos.map((t: any, i: number) => `${i + 1}. ${t.nome}: R$ ${t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Receita por Canal de Marketing:
${clinicContext.detalhes.receitasPorOrigem.map((o: any) => `- ${o.nome}: R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Produtos com Estoque Baixo:
${clinicContext.detalhes.produtosBaixoEstoque.length > 0 
  ? clinicContext.detalhes.produtosBaixoEstoque.map((p: any) => `- ${p.nome}: ${p.estoqueAtual}/${p.estoqueMinimo} unidades`).join('\n')
  : 'Nenhum produto com estoque baixo'}

### Próximas Contas a Pagar:
${clinicContext.detalhes.proximasContasPagar.map((c: any) => `- ${c.descricao}: R$ ${c.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Venc: ${c.vencimento}, Status: ${c.status})`).join('\n')}

### Últimos Agendamentos:
${clinicContext.detalhes.ultimosAgendamentos.map((a: any) => `- ${a.paciente || 'N/A'}: ${a.tratamento || 'N/A'} em ${a.data || 'N/A'} (${a.status})`).join('\n')}

## Suas Capacidades:
1. **Análise Financeira**: Analisar receitas, despesas, lucros, margens e tendências
2. **Gestão de Pacientes**: Informações sobre pacientes, histórico, agendamentos
3. **Performance de Tratamentos**: Quais tratamentos geram mais receita, margem, popularidade
4. **Análise de Marketing**: Performance por canal de aquisição, ROI de marketing
5. **Gestão de Estoque**: Alertas de estoque baixo, previsão de reposição
6. **Contas a Pagar**: Status de pagamentos, alertas de vencimento
7. **Previsões e Insights**: Projeções baseadas em tendências históricas
8. **KPIs e Métricas**: Fornecer indicadores relevantes para tomada de decisão

## Diretrizes de Resposta:
- Seja objetiva e profissional
- Use dados concretos nas suas respostas
- Formate valores monetários em Reais (R$)
- Quando relevante, sugira ações baseadas nos dados
- Se não tiver dados suficientes, informe claramente
- Use emojis com moderação para deixar a conversa mais amigável
- Formate suas respostas com markdown para melhor legibilidade`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    console.log('Streaming response from OpenAI...');
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in assistente-ia function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
