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
  const currentYear = new Date().getFullYear();
  const startOfMonth = new Date(currentYear, new Date().getMonth(), 1).toISOString().split('T')[0];
  const startOfYear = new Date(currentYear, 0, 1).toISOString().split('T')[0];

  // Fetch multiple data sources in parallel - including annual data
  const [
    fluxoCaixaMesRes,
    fluxoCaixaAnoRes,
    pacientesRes,
    agendamentosRes,
    tratamentosRes,
    produtosRes,
    contasPagarRes,
    origensRes
  ] = await Promise.all([
    // Monthly data
    supabase.from('td_fluxo_de_caixa')
      .select('*, tratamento:tratamentos(nome), origem:origens(nome), categoria:categorias(nome_sintetico, tipo, natureza_dre)')
      .gte('data_lancamento', startOfMonth)
      .order('data_lancamento', { ascending: false }),
    
    // Annual data for DRE
    supabase.from('td_fluxo_de_caixa')
      .select('*, tratamento:tratamentos(nome), origem:origens(nome), categoria:categorias(nome_sintetico, tipo, natureza_dre)')
      .gte('data_lancamento', startOfYear)
      .order('data_lancamento', { ascending: false }),
    
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

  // === MONTHLY KPIs ===
  const fluxoCaixaMes = fluxoCaixaMesRes.data || [];
  const receitasMes = fluxoCaixaMes.filter((f: any) => f.tipo === 'receita');
  const despesasMes = fluxoCaixaMes.filter((f: any) => f.tipo === 'despesa');
  
  const totalReceitasMes = receitasMes.reduce((sum: number, r: any) => sum + (r.valor || 0), 0);
  const totalDespesasMes = despesasMes.reduce((sum: number, d: any) => sum + (d.valor || 0), 0);
  const lucroLiquidoMes = totalReceitasMes - totalDespesasMes;
  const margemLucroMes = totalReceitasMes > 0 ? ((lucroLiquidoMes / totalReceitasMes) * 100).toFixed(1) : 0;

  // === ANNUAL KPIs (DRE) ===
  const fluxoCaixaAno = fluxoCaixaAnoRes.data || [];
  const receitasAno = fluxoCaixaAno.filter((f: any) => f.tipo === 'receita');
  const despesasAno = fluxoCaixaAno.filter((f: any) => f.tipo === 'despesa');
  
  const totalReceitasAno = receitasAno.reduce((sum: number, r: any) => sum + (r.valor || 0), 0);
  const totalDespesasAno = despesasAno.reduce((sum: number, d: any) => sum + (d.valor || 0), 0);
  const lucroLiquidoAno = totalReceitasAno - totalDespesasAno;
  const margemLucroAno = totalReceitasAno > 0 ? ((lucroLiquidoAno / totalReceitasAno) * 100).toFixed(1) : 0;

  // Calculate monthly breakdown for DRE
  const monthlyData: Record<number, { receitas: number; despesas: number; custos: number; opex: number }> = {};
  for (let m = 0; m < 12; m++) {
    monthlyData[m] = { receitas: 0, despesas: 0, custos: 0, opex: 0 };
  }
  
  fluxoCaixaAno.forEach((f: any) => {
    const month = new Date(f.data_lancamento).getMonth();
    if (f.tipo === 'receita') {
      monthlyData[month].receitas += f.valor || 0;
    } else if (f.tipo === 'despesa') {
      monthlyData[month].despesas += f.valor || 0;
      // Classify by natureza_dre
      const natureza = f.categoria?.natureza_dre || 'opex';
      if (natureza === 'custo') {
        monthlyData[month].custos += f.valor || 0;
      } else {
        monthlyData[month].opex += f.valor || 0;
      }
    }
  });

  // Calculate category breakdown for annual expenses
  const despesasPorCategoria: Record<string, number> = {};
  despesasAno.forEach((d: any) => {
    const categoria = d.categoria?.nome_sintetico || 'Não categorizado';
    despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + (d.valor || 0);
  });

  // Calculate revenue by treatment for the year
  const receitasPorTratamentoAno: Record<string, number> = {};
  receitasAno.forEach((r: any) => {
    const nome = r.tratamento?.nome || 'Outros';
    receitasPorTratamentoAno[nome] = (receitasPorTratamentoAno[nome] || 0) + (r.valor || 0);
  });
  const topTratamentosAno = Object.entries(receitasPorTratamentoAno)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10);

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

  // Top treatments by revenue (monthly)
  const tratamentoReceitas: Record<string, number> = {};
  receitasMes.forEach((r: any) => {
    const nome = r.tratamento?.nome || 'Outros';
    tratamentoReceitas[nome] = (tratamentoReceitas[nome] || 0) + (r.valor || 0);
  });
  const topTratamentos = Object.entries(tratamentoReceitas)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Revenue by origin (monthly)
  const receitasPorOrigem: Record<string, number> = {};
  receitasMes.forEach((r: any) => {
    const nome = r.origem?.nome || 'Não especificado';
    receitasPorOrigem[nome] = (receitasPorOrigem[nome] || 0) + (r.valor || 0);
  });

  // Revenue by origin (annual)
  const receitasPorOrigemAno: Record<string, number> = {};
  receitasAno.forEach((r: any) => {
    const nome = r.origem?.nome || 'Não especificado';
    receitasPorOrigemAno[nome] = (receitasPorOrigemAno[nome] || 0) + (r.valor || 0);
  });

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return {
    dataAtual: today,
    anoAtual: currentYear,
    periodoMensal: `${startOfMonth} a ${today}`,
    periodoAnual: `${startOfYear} a ${today}`,
    kpisMensais: {
      receitaTotal: totalReceitasMes,
      despesaTotal: totalDespesasMes,
      lucroLiquido: lucroLiquidoMes,
      margemLucro: `${margemLucroMes}%`,
      ticketMedio: receitasMes.length > 0 ? (totalReceitasMes / receitasMes.length).toFixed(2) : 0,
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
    kpisAnuais: {
      receitaTotal: totalReceitasAno,
      despesaTotal: totalDespesasAno,
      lucroLiquido: lucroLiquidoAno,
      margemLucro: `${margemLucroAno}%`,
      ticketMedio: receitasAno.length > 0 ? (totalReceitasAno / receitasAno.length).toFixed(2) : 0,
      totalTransacoes: fluxoCaixaAno.length
    },
    dreAnual: {
      receitaBrutaTotal: totalReceitasAno,
      custosTotal: despesasAno.filter((d: any) => d.categoria?.natureza_dre === 'custo').reduce((sum: number, d: any) => sum + (d.valor || 0), 0),
      despesasOperacionaisTotal: despesasAno.filter((d: any) => d.categoria?.natureza_dre !== 'custo').reduce((sum: number, d: any) => sum + (d.valor || 0), 0),
      lucroLiquido: lucroLiquidoAno,
      despesasPorCategoria: Object.entries(despesasPorCategoria)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([categoria, valor]) => ({ categoria, valor })),
      evolucaoMensal: Object.entries(monthlyData)
        .filter(([, data]) => data.receitas > 0 || data.despesas > 0)
        .map(([mes, data]) => ({
          mes: meses[parseInt(mes)],
          receitas: data.receitas,
          despesas: data.despesas,
          custos: data.custos,
          opex: data.opex,
          lucro: data.receitas - data.despesas
        }))
    },
    detalhes: {
      topTratamentosMes: topTratamentos.map(([nome, valor]) => ({ nome, valor })),
      topTratamentosAno: topTratamentosAno.map(([nome, valor]) => ({ nome, valor })),
      receitasPorOrigemMes: Object.entries(receitasPorOrigem).map(([nome, valor]) => ({ nome, valor })),
      receitasPorOrigemAno: Object.entries(receitasPorOrigemAno).map(([nome, valor]) => ({ nome, valor })),
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

### KPIs do Mês Atual (${clinicContext.periodoMensal}):
- Receita Total: R$ ${clinicContext.kpisMensais.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesa Total: R$ ${clinicContext.kpisMensais.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido: R$ ${clinicContext.kpisMensais.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro: ${clinicContext.kpisMensais.margemLucro}
- Ticket Médio: R$ ${clinicContext.kpisMensais.ticketMedio}
- Total de Pacientes Ativos: ${clinicContext.kpisMensais.totalPacientesAtivos}
- Tratamentos Ativos: ${clinicContext.kpisMensais.totalTratamentosAtivos}

### KPIs do Ano ${clinicContext.anoAtual} (${clinicContext.periodoAnual}):
- Receita Total Anual: R$ ${clinicContext.kpisAnuais.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesa Total Anual: R$ ${clinicContext.kpisAnuais.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido Anual: R$ ${clinicContext.kpisAnuais.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro Anual: ${clinicContext.kpisAnuais.margemLucro}
- Ticket Médio Anual: R$ ${clinicContext.kpisAnuais.ticketMedio}
- Total de Transações no Ano: ${clinicContext.kpisAnuais.totalTransacoes}

### DRE - Demonstrativo de Resultado do Exercício (${clinicContext.anoAtual}):
- Receita Bruta Total: R$ ${clinicContext.dreAnual.receitaBrutaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Custos (CMV): R$ ${clinicContext.dreAnual.custosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesas Operacionais: R$ ${clinicContext.dreAnual.despesasOperacionaisTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido: R$ ${clinicContext.dreAnual.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

### Despesas por Categoria (Anual):
${clinicContext.dreAnual.despesasPorCategoria.slice(0, 10).map((d: any) => `- ${d.categoria}: R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Evolução Mensal do Ano:
${clinicContext.dreAnual.evolucaoMensal.map((m: any) => `- ${m.mes}: Receitas R$ ${m.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Despesas R$ ${m.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Lucro R$ ${m.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Performance Comercial:
- Agendamentos Confirmados: ${clinicContext.kpisMensais.agendamentosConfirmados}
- Agendamentos Concluídos: ${clinicContext.kpisMensais.agendamentosConcluidos}
- Agendamentos Cancelados: ${clinicContext.kpisMensais.agendamentosCancelados}
- Taxa de Conversão: ${clinicContext.kpisMensais.taxaConversao}

### Alertas:
- Produtos com Estoque Baixo: ${clinicContext.kpisMensais.produtosBaixoEstoque}
- Contas Vencidas: ${clinicContext.kpisMensais.contasVencidas} (Total: R$ ${clinicContext.kpisMensais.valorContasVencidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})

### Top Tratamentos por Receita (Mês):
${clinicContext.detalhes.topTratamentosMes.map((t: any, i: number) => `${i + 1}. ${t.nome}: R$ ${t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Top 10 Tratamentos por Receita (Ano):
${clinicContext.detalhes.topTratamentosAno.map((t: any, i: number) => `${i + 1}. ${t.nome}: R$ ${t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Receita por Canal de Marketing (Mês):
${clinicContext.detalhes.receitasPorOrigemMes.map((o: any) => `- ${o.nome}: R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Receita por Canal de Marketing (Ano):
${clinicContext.detalhes.receitasPorOrigemAno.map((o: any) => `- ${o.nome}: R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

### Produtos com Estoque Baixo:
${clinicContext.detalhes.produtosBaixoEstoque.length > 0 
  ? clinicContext.detalhes.produtosBaixoEstoque.map((p: any) => `- ${p.nome}: ${p.estoqueAtual}/${p.estoqueMinimo} unidades`).join('\n')
  : 'Nenhum produto com estoque baixo'}

### Próximas Contas a Pagar:
${clinicContext.detalhes.proximasContasPagar.map((c: any) => `- ${c.descricao}: R$ ${c.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Venc: ${c.vencimento}, Status: ${c.status})`).join('\n')}

### Últimos Agendamentos:
${clinicContext.detalhes.ultimosAgendamentos.map((a: any) => `- ${a.paciente || 'N/A'}: ${a.tratamento || 'N/A'} em ${a.data || 'N/A'} (${a.status})`).join('\n')}

## Suas Capacidades:
1. **Análise Financeira**: Analisar receitas, despesas, lucros, margens e tendências (mensal E anual)
2. **DRE Completo**: Demonstrativo de Resultado do Exercício com evolução mensal
3. **Gestão de Pacientes**: Informações sobre pacientes, histórico, agendamentos
4. **Performance de Tratamentos**: Quais tratamentos geram mais receita, margem, popularidade
5. **Análise de Marketing**: Performance por canal de aquisição, ROI de marketing
6. **Gestão de Estoque**: Alertas de estoque baixo, previsão de reposição
7. **Contas a Pagar**: Status de pagamentos, alertas de vencimento
8. **Previsões e Insights**: Projeções baseadas em tendências históricas
9. **Comparativos**: Comparar mês atual vs ano, identificar sazonalidade

## Diretrizes de Resposta:
- Seja objetiva e profissional
- Use dados concretos nas suas respostas - você TEM acesso aos dados anuais e mensais
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
