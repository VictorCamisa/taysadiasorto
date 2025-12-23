import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, subDays, differenceInMonths, differenceInDays, parseISO } from "date-fns";

interface BIFilters {
  periodo: 'mes' | 'trimestre' | 'semestre' | 'ano' | 'custom';
  dataInicio?: Date;
  dataFim?: Date;
}

interface CohortData {
  cohort: string;
  mes0: number;
  mes1: number;
  mes2: number;
  mes3: number;
  mes4: number;
  mes5: number;
  total: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

interface TreatmentAnalysis {
  id: string;
  nome: string;
  receita: number;
  custo: number;
  margem: number;
  margemPercentual: number;
  quantidade: number;
  ticketMedio: number;
  recorrencia: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface OrigemAnalysis {
  id: string;
  nome: string;
  leads: number;
  conversoes: number;
  receita: number;
  cac: number;
  roas: number;
  taxaConversao: number;
}

interface SeasonalityData {
  mes: string;
  receita: number;
  quantidade: number;
  mediaHistorica: number;
  variacao: number;
}

export const useBIData = (filters: BIFilters) => {
  const { periodo, dataInicio: customDataInicio, dataFim: customDataFim } = filters;
  
  // Calculate date ranges based on period
  const getDateRange = () => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date = endOfMonth(hoje);
    
    switch (periodo) {
      case 'mes':
        inicio = startOfMonth(hoje);
        break;
      case 'trimestre':
        inicio = startOfMonth(subMonths(hoje, 2));
        break;
      case 'semestre':
        inicio = startOfMonth(subMonths(hoje, 5));
        break;
      case 'ano':
        inicio = startOfMonth(subMonths(hoje, 11));
        break;
      case 'custom':
        inicio = customDataInicio || startOfMonth(hoje);
        fim = customDataFim || endOfMonth(hoje);
        break;
      default:
        inicio = startOfMonth(hoje);
    }
    
    return { inicio, fim };
  };
  
  const { inicio, fim } = getDateRange();
  const dataInicioStr = format(inicio, 'yyyy-MM-dd');
  const dataFimStr = format(fim, 'yyyy-MM-dd');

  // Previous period for comparison
  const mesesPeriodo = differenceInMonths(fim, inicio) + 1;
  const inicioPrevious = subMonths(inicio, mesesPeriodo);
  const fimPrevious = subMonths(fim, mesesPeriodo);
  const dataInicioPrevStr = format(inicioPrevious, 'yyyy-MM-dd');
  const dataFimPrevStr = format(fimPrevious, 'yyyy-MM-dd');

  // Fetch all financial data
  const { data: lancamentos = [], isLoading: loadingLancamentos } = useQuery({
    queryKey: ['bi_lancamentos', dataInicioStr, dataFimStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('td_fluxo_de_caixa')
        .select(`
          *,
          tratamento:tratamentos(*),
          origem:origens(*),
          categoria:categorias(*),
          forma_pagamento:formas_pagamento(*)
        `)
        .gte('data_lancamento', dataInicioStr)
        .lte('data_lancamento', dataFimStr)
        .order('data_lancamento', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch previous period data for comparison
  const { data: lancamentosPrevious = [] } = useQuery({
    queryKey: ['bi_lancamentos_prev', dataInicioPrevStr, dataFimPrevStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('td_fluxo_de_caixa')
        .select(`
          *,
          tratamento:tratamentos(*),
          origem:origens(*)
        `)
        .gte('data_lancamento', dataInicioPrevStr)
        .lte('data_lancamento', dataFimPrevStr);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch historical data for LTV calculation (2 years)
  const { data: historicalData = [] } = useQuery({
    queryKey: ['bi_historical'],
    queryFn: async () => {
      const twoYearsAgo = format(subMonths(new Date(), 24), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('td_fluxo_de_caixa')
        .select(`
          *,
          tratamento:tratamentos(*),
          origem:origens(*)
        `)
        .eq('tipo', 'receita')
        .gte('data_lancamento', twoYearsAgo);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch CRM agendamentos for funnel
  const { data: agendamentos = [] } = useQuery({
    queryKey: ['bi_agendamentos', dataInicioStr, dataFimStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_agendamentos')
        .select(`
          *,
          paciente:pacientes(*),
          tratamento:tratamentos(*),
          origem:origens(*)
        `)
        .gte('created_at', dataInicioStr)
        .lte('created_at', dataFimStr);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all patients for cohort analysis
  const { data: pacientes = [] } = useQuery({
    queryKey: ['bi_pacientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('ativo', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch treatments for analysis
  const { data: tratamentos = [] } = useQuery({
    queryKey: ['bi_tratamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tratamentos')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch origins for marketing analysis
  const { data: origens = [] } = useQuery({
    queryKey: ['bi_origens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('origens')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // === CALCULATIONS ===

  const receitas = lancamentos.filter((l: any) => l.tipo === 'receita');
  const despesas = lancamentos.filter((l: any) => l.tipo === 'despesa');
  const receitasPrev = lancamentosPrevious.filter((l: any) => l.tipo === 'receita');
  const despesasPrev = lancamentosPrevious.filter((l: any) => l.tipo === 'despesa');

  // Basic KPIs
  const receitaTotal = receitas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const despesaTotal = despesas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const lucroLiquido = receitaTotal - despesaTotal;
  const custoMaterialTotal = receitas.reduce((sum: number, l: any) => sum + Number(l.custo_material || 0), 0);
  const margemBruta = receitaTotal - custoMaterialTotal;
  const margemBrutaPercent = receitaTotal > 0 ? (margemBruta / receitaTotal) * 100 : 0;

  // Previous period KPIs
  const receitaTotalPrev = receitasPrev.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const despesaTotalPrev = despesasPrev.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const lucroLiquidoPrev = receitaTotalPrev - despesaTotalPrev;

  // Growth rates
  const crescimentoReceita = receitaTotalPrev > 0 ? ((receitaTotal - receitaTotalPrev) / receitaTotalPrev) * 100 : 0;
  const crescimentoLucro = lucroLiquidoPrev > 0 ? ((lucroLiquido - lucroLiquidoPrev) / lucroLiquidoPrev) * 100 : 0;

  // === LTV / CAC ANALYSIS ===
  
  // Calculate unique customers from historical data
  const clientesUnicos = new Set(historicalData.map((l: any) => l.descricao).filter(Boolean));
  const numClientes = clientesUnicos.size || 1;
  
  // Average Revenue Per User (ARPU)
  const receitaHistoricaTotal = historicalData.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const arpu = receitaHistoricaTotal / numClientes;
  
  // Customer Lifespan (average months between first and last purchase)
  const clienteTransactions = historicalData.reduce((acc: Record<string, any[]>, l: any) => {
    const cliente = l.descricao || 'unknown';
    if (!acc[cliente]) acc[cliente] = [];
    acc[cliente].push(l);
    return acc;
  }, {});
  
  let totalLifespan = 0;
  let clientesComMultiplas = 0;
  Object.values(clienteTransactions).forEach((transactions: any[]) => {
    if (transactions.length > 1) {
      const dates = transactions.map(t => parseISO(t.data_lancamento)).sort((a, b) => a.getTime() - b.getTime());
      const lifespan = differenceInMonths(dates[dates.length - 1], dates[0]);
      totalLifespan += Math.max(lifespan, 1);
      clientesComMultiplas++;
    }
  });
  const avgLifespan = clientesComMultiplas > 0 ? totalLifespan / clientesComMultiplas : 12; // default 12 months
  
  // LTV Calculation
  const ltv = arpu * (avgLifespan / 12);
  
  // CAC - Marketing expenses / New customers
  const despesasMarketing = despesas.filter((d: any) => 
    d.categoria?.nome_sintetico?.toLowerCase().includes('marketing') ||
    d.categoria?.nome_analitico?.toLowerCase().includes('marketing') ||
    d.descricao?.toLowerCase().includes('marketing') ||
    d.descricao?.toLowerCase().includes('publicidade')
  );
  const custoMarketing = despesasMarketing.reduce((sum: number, d: any) => sum + Number(d.valor || 0), 0);
  const novosClientes = agendamentos.filter((a: any) => a.status === 'convertido').length || 1;
  const cac = custoMarketing / novosClientes;
  
  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  // === MARKETING / ROAS ANALYSIS ===
  
  const origemAnalysis: OrigemAnalysis[] = origens.map((origem: any) => {
    const leadsOrigem = agendamentos.filter((a: any) => a.origem_id === origem.id);
    const conversoesOrigem = leadsOrigem.filter((a: any) => a.status === 'convertido' || a.status === 'atendido');
    const receitaOrigem = receitas
      .filter((r: any) => r.origem_id === origem.id)
      .reduce((sum: number, r: any) => sum + Number(r.valor || 0), 0);
    
    // Estimate marketing cost per origin (proportional)
    const cacOrigem = leadsOrigem.length > 0 ? (custoMarketing / agendamentos.length) * leadsOrigem.length : 0;
    const roasOrigem = cacOrigem > 0 ? receitaOrigem / cacOrigem : 0;
    
    return {
      id: origem.id,
      nome: origem.nome,
      leads: leadsOrigem.length,
      conversoes: conversoesOrigem.length,
      receita: receitaOrigem,
      cac: conversoesOrigem.length > 0 ? cacOrigem / conversoesOrigem.length : 0,
      roas: roasOrigem,
      taxaConversao: leadsOrigem.length > 0 ? (conversoesOrigem.length / leadsOrigem.length) * 100 : 0,
    };
  }).filter((o: OrigemAnalysis) => o.leads > 0 || o.receita > 0);

  // === FUNNEL ANALYSIS ===
  
  const statusOrder = ['lead', 'agendado', 'confirmado', 'atendido', 'convertido'];
  const funnelData: FunnelStage[] = statusOrder.map((status, index) => {
    const stageItems = agendamentos.filter((a: any) => a.status === status);
    const previousStage = index > 0 ? agendamentos.filter((a: any) => 
      statusOrder.indexOf(a.status) >= statusOrder.indexOf(statusOrder[index - 1])
    ).length : agendamentos.length;
    
    return {
      stage: status.charAt(0).toUpperCase() + status.slice(1),
      count: stageItems.length,
      value: stageItems.reduce((sum: number, a: any) => sum + Number(a.valor_previsto || a.valor_realizado || 0), 0),
      conversionRate: previousStage > 0 ? (stageItems.length / previousStage) * 100 : 0,
    };
  });

  const taxaConversaoGeral = agendamentos.length > 0 
    ? (agendamentos.filter((a: any) => a.status === 'convertido' || a.status === 'atendido').length / agendamentos.length) * 100 
    : 0;

  // === TREATMENT ANALYSIS ===
  
  const treatmentAnalysis: TreatmentAnalysis[] = tratamentos.map((trat: any) => {
    const receitasTrat = receitas.filter((r: any) => r.tratamento_id === trat.id);
    const receitasTratPrev = receitasPrev.filter((r: any) => r.tratamento_id === trat.id);
    
    const receitaTrat = receitasTrat.reduce((sum: number, r: any) => sum + Number(r.valor || 0), 0);
    const custoTrat = receitasTrat.reduce((sum: number, r: any) => sum + Number(r.custo_material || 0), 0);
    const margemTrat = receitaTrat - custoTrat;
    const quantidade = receitasTrat.length;
    
    const receitaTratPrev = receitasTratPrev.reduce((sum: number, r: any) => sum + Number(r.valor || 0), 0);
    
    // Calculate recurrence (unique customers who came back)
    const clientesTrat = new Set(receitasTrat.map((r: any) => r.descricao).filter(Boolean));
    const historicTrat = historicalData.filter((h: any) => h.tratamento_id === trat.id);
    const clientesRecorrentes = new Set(historicTrat.filter((h: any) => {
      const mesmoCliente = historicTrat.filter((hh: any) => hh.descricao === h.descricao);
      return mesmoCliente.length > 1;
    }).map((h: any) => h.descricao));
    const recorrencia = clientesTrat.size > 0 ? (clientesRecorrentes.size / clientesTrat.size) * 100 : 0;
    
    let tendencia: 'up' | 'down' | 'stable' = 'stable';
    if (receitaTratPrev > 0) {
      const crescimento = ((receitaTrat - receitaTratPrev) / receitaTratPrev) * 100;
      if (crescimento > 10) tendencia = 'up';
      else if (crescimento < -10) tendencia = 'down';
    }
    
    return {
      id: trat.id,
      nome: trat.nome,
      receita: receitaTrat,
      custo: custoTrat,
      margem: margemTrat,
      margemPercentual: receitaTrat > 0 ? (margemTrat / receitaTrat) * 100 : 0,
      quantidade,
      ticketMedio: quantidade > 0 ? receitaTrat / quantidade : 0,
      recorrencia,
      tendencia,
    };
  }).filter((t: TreatmentAnalysis) => t.quantidade > 0 || t.receita > 0)
    .sort((a: TreatmentAnalysis, b: TreatmentAnalysis) => b.receita - a.receita);

  // === SEASONALITY ANALYSIS ===
  
  const seasonalityData: SeasonalityData[] = [];
  for (let i = 11; i >= 0; i--) {
    const mesDate = subMonths(new Date(), i);
    const mesStr = format(mesDate, 'MMM/yy');
    const mesInicio = format(startOfMonth(mesDate), 'yyyy-MM-dd');
    const mesFim = format(endOfMonth(mesDate), 'yyyy-MM-dd');
    
    const receitasMes = historicalData.filter((l: any) => 
      l.data_lancamento >= mesInicio && l.data_lancamento <= mesFim
    );
    
    const receitaMes = receitasMes.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
    const quantidadeMes = receitasMes.length;
    
    // Historical average for the same month
    const mesHistorico = historicalData.filter((l: any) => {
      const dataL = parseISO(l.data_lancamento);
      return dataL.getMonth() === mesDate.getMonth();
    });
    const mediaHistorica = mesHistorico.length > 0 
      ? mesHistorico.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0) / Math.ceil(mesHistorico.length / 12)
      : 0;
    
    const variacao = mediaHistorica > 0 ? ((receitaMes - mediaHistorica) / mediaHistorica) * 100 : 0;
    
    seasonalityData.push({
      mes: mesStr,
      receita: receitaMes,
      quantidade: quantidadeMes,
      mediaHistorica,
      variacao,
    });
  }

  // === COHORT ANALYSIS ===
  
  const cohortData: CohortData[] = [];
  for (let i = 5; i >= 0; i--) {
    const cohortDate = subMonths(new Date(), i);
    const cohortStr = format(cohortDate, 'MMM/yy');
    const cohortInicio = format(startOfMonth(cohortDate), 'yyyy-MM-dd');
    const cohortFim = format(endOfMonth(cohortDate), 'yyyy-MM-dd');
    
    // Patients who became customers in this cohort
    const pacientesCohort = pacientes.filter((p: any) => 
      p.created_at >= cohortInicio && p.created_at <= cohortFim
    );
    
    const cohortIds = new Set(pacientesCohort.map((p: any) => p.id));
    
    // Calculate retention for each month
    const retencao: number[] = [];
    for (let m = 0; m <= 5; m++) {
      if (i - m < 0) {
        retencao.push(0);
        continue;
      }
      
      const mesAnalise = subMonths(new Date(), i - m);
      const mesInicio = format(startOfMonth(mesAnalise), 'yyyy-MM-dd');
      const mesFim = format(endOfMonth(mesAnalise), 'yyyy-MM-dd');
      
      // Check how many from the cohort made transactions in this month
      const transacoesMes = historicalData.filter((l: any) => 
        l.data_lancamento >= mesInicio && 
        l.data_lancamento <= mesFim
      );
      
      // Simplified: count by description matching patient names
      const clientesAtivos = new Set(transacoesMes.map((t: any) => t.descricao).filter(Boolean));
      const pacientesAtivosCohort = pacientesCohort.filter((p: any) => 
        Array.from(clientesAtivos).some(c => c?.toLowerCase().includes(p.nome?.toLowerCase()))
      );
      
      const taxa = pacientesCohort.length > 0 
        ? (pacientesAtivosCohort.length / pacientesCohort.length) * 100 
        : 0;
      retencao.push(m === 0 ? 100 : taxa);
    }
    
    cohortData.push({
      cohort: cohortStr,
      mes0: retencao[0] || 0,
      mes1: retencao[1] || 0,
      mes2: retencao[2] || 0,
      mes3: retencao[3] || 0,
      mes4: retencao[4] || 0,
      mes5: retencao[5] || 0,
      total: pacientesCohort.length,
    });
  }

  // === EXPENSE BREAKDOWN ===
  
  const despesasPorCategoria = despesas.reduce((acc: Record<string, number>, d: any) => {
    const cat = d.categoria?.nome_sintetico || 'Outros';
    acc[cat] = (acc[cat] || 0) + Number(d.valor || 0);
    return acc;
  }, {});

  const despesasPorNatureza = despesas.reduce((acc: Record<string, number>, d: any) => {
    const natureza = d.categoria?.natureza_dre || 'opex';
    acc[natureza] = (acc[natureza] || 0) + Number(d.valor || 0);
    return acc;
  }, {});

  // === PROJECTIONS ===
  
  // Simple projection based on trend
  const mediaMensal = receitaTotal / Math.max(mesesPeriodo, 1);
  const tendenciaMensal = (receitaTotal - receitaTotalPrev) / Math.max(mesesPeriodo, 1);
  
  const projecoes = Array.from({ length: 6 }, (_, i) => {
    const mesProj = subMonths(new Date(), -1 - i);
    return {
      mes: format(mesProj, 'MMM/yy'),
      projecaoOtimista: mediaMensal * (1.1 + (tendenciaMensal / mediaMensal) * 0.5),
      projecaoBase: mediaMensal * (1 + (tendenciaMensal / mediaMensal) * 0.3),
      projecaoPessimista: mediaMensal * (0.9 + (tendenciaMensal / mediaMensal) * 0.1),
    };
  });

  return {
    isLoading: loadingLancamentos,
    periodo: { inicio, fim, inicioPrevious, fimPrevious },
    
    // Core KPIs
    kpis: {
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      margemBruta,
      margemBrutaPercent,
      crescimentoReceita,
      crescimentoLucro,
      ticketMedio: receitas.length > 0 ? receitaTotal / receitas.length : 0,
      totalTransacoes: receitas.length,
    },
    
    // LTV / CAC
    ltvCac: {
      ltv,
      cac,
      ltvCacRatio,
      arpu,
      avgLifespan,
      numClientes,
      novosClientes,
    },
    
    // Marketing
    marketing: {
      custoMarketing,
      roas: custoMarketing > 0 ? receitaTotal / custoMarketing : 0,
      origemAnalysis,
      taxaConversaoGeral,
    },
    
    // Funnel
    funnel: funnelData,
    
    // Treatments
    treatments: treatmentAnalysis,
    
    // Seasonality
    seasonality: seasonalityData,
    
    // Cohorts
    cohorts: cohortData,
    
    // Expenses
    expenses: {
      porCategoria: Object.entries(despesasPorCategoria).map(([nome, valor]) => ({ nome, valor })),
      porNatureza: Object.entries(despesasPorNatureza).map(([nome, valor]) => ({ nome, valor })),
    },
    
    // Projections
    projecoes,
    
    // Reference data
    tratamentos,
    origens,
  };
};
