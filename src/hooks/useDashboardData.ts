import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  compareStartDate?: Date;
  compareEndDate?: Date;
  tratamentoIds?: string[];
  origemIds?: string[];
}

export const useDashboardData = (filters: DashboardFilters) => {
  const { startDate, endDate, compareStartDate, compareEndDate, tratamentoIds, origemIds } = filters;

  // Fetch lancamentos with filters
  const { data: lancamentos = [] } = useQuery({
    queryKey: ["dashboard_lancamentos", filters],
    queryFn: async () => {
      let query = supabase
        .from("financeiro_lancamentos")
        .select("*, tratamento:financeiro_tratamentos(*), origem:financeiro_origens(*)")
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"));

      if (tratamentoIds && tratamentoIds.length > 0) {
        query = query.in("tratamento_id", tratamentoIds);
      }
      if (origemIds && origemIds.length > 0) {
        query = query.in("origem_id", origemIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch comparison period data if provided
  const { data: compareLancamentos = [] } = useQuery({
    queryKey: ["dashboard_compare_lancamentos", compareStartDate, compareEndDate],
    queryFn: async () => {
      if (!compareStartDate || !compareEndDate) return [];
      
      const { data, error } = await supabase
        .from("financeiro_lancamentos")
        .select("*")
        .gte("data", format(compareStartDate, "yyyy-MM-dd"))
        .lte("data", format(compareEndDate, "yyyy-MM-dd"));

      if (error) throw error;
      return data || [];
    },
    enabled: !!compareStartDate && !!compareEndDate,
  });

  // Fetch other data
  const { data: contas = [] } = useQuery({
    queryKey: ["dashboard_contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ["dashboard_contas_pagar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas_pagar")
        .select("*")
        .order("vencimento");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["dashboard_produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tratamentos = [] } = useQuery({
    queryKey: ["dashboard_tratamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_tratamentos")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: origens = [] } = useQuery({
    queryKey: ["dashboard_origens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_origens")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate KPIs
  const receitas = lancamentos.filter(l => l.tipo === "receita");
  const despesas = lancamentos.filter(l => l.tipo === "despesa");
  
  const receitaTotal = receitas.reduce((sum, l) => sum + (l.valor_entrada || 0), 0);
  const despesaTotal = despesas.reduce((sum, l) => sum + (l.valor_saida || 0), 0);
  const lucroLiquido = receitaTotal - despesaTotal;
  
  const totalReceitas = receitas.length;
  const ticketMedio = totalReceitas > 0 ? receitaTotal / totalReceitas : 0;
  
  const margemTotal = receitas.reduce((sum, l) => sum + (l.margem || 0), 0);
  const margemMedia = totalReceitas > 0 ? (margemTotal / receitaTotal) * 100 : 0;

  // Comparison period calculations
  const compareReceitas = compareLancamentos.filter(l => l.tipo === "receita");
  const compareDespesas = compareLancamentos.filter(l => l.tipo === "despesa");
  const compareReceitaTotal = compareReceitas.reduce((sum, l) => sum + (l.valor_entrada || 0), 0);
  const compareDespesaTotal = compareDespesas.reduce((sum, l) => sum + (l.valor_saida || 0), 0);
  const compareLucro = compareReceitaTotal - compareDespesaTotal;

  const taxaCrescimentoReceita = compareReceitaTotal > 0 
    ? ((receitaTotal - compareReceitaTotal) / compareReceitaTotal) * 100 
    : 0;
  const taxaCrescimentoLucro = compareLucro > 0 
    ? ((lucroLiquido - compareLucro) / compareLucro) * 100 
    : 0;

  // Top treatments by revenue
  const tratamentosReceita = receitas.reduce((acc, l) => {
    if (l.tratamento?.nome) {
      if (!acc[l.tratamento.nome]) {
        acc[l.tratamento.nome] = { receita: 0, margem: 0, count: 0 };
      }
      acc[l.tratamento.nome].receita += l.valor_entrada || 0;
      acc[l.tratamento.nome].margem += l.margem || 0;
      acc[l.tratamento.nome].count += 1;
    }
    return acc;
  }, {} as Record<string, { receita: number; margem: number; count: number }>);

  const topTratamentosReceita = Object.entries(tratamentosReceita)
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  const topTratamentosMargem = Object.entries(tratamentosReceita)
    .map(([nome, data]) => ({ 
      nome, 
      ...data,
      margemPercentual: data.receita > 0 ? (data.margem / data.receita) * 100 : 0
    }))
    .sort((a, b) => b.margemPercentual - a.margemPercentual)
    .slice(0, 5);

  // Revenue by origin
  const receitaPorOrigem = receitas.reduce((acc, l) => {
    const origem = l.origem?.nome || "Sem Origem";
    if (!acc[origem]) {
      acc[origem] = 0;
    }
    acc[origem] += l.valor_entrada || 0;
    return acc;
  }, {} as Record<string, number>);

  // Other KPIs
  const saldoTotal = contas.reduce((sum, c) => sum + (c.saldo_atual || 0), 0);
  const contasVencidas = contasPagar.filter(
    c => c.status !== "pago" && new Date(c.vencimento) < new Date()
  ).length;
  const produtosBaixos = produtos.filter(
    p => p.estoque_atual < p.estoque_minimo
  ).length;

  return {
    kpis: {
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      ticketMedio,
      margemMedia,
      taxaCrescimentoReceita,
      taxaCrescimentoLucro,
      saldoTotal,
      contasVencidas,
      produtosBaixos,
      totalLancamentos: lancamentos.length,
    },
    charts: {
      topTratamentosReceita,
      topTratamentosMargem,
      receitaPorOrigem,
    },
    lists: {
      tratamentos,
      origens,
    },
  };
};
