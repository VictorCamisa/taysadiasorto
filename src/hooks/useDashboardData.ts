import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  // Fetch lancamentos with filters - NOVA TABELA: td_fluxo_de_caixa
  const { data: lancamentos = [] } = useQuery({
    queryKey: ["dashboard_lancamentos", filters],
    queryFn: async () => {
      let query = supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          tratamento:tratamentos(*),
          origem:origens(*)
        `)
        .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(endDate, "yyyy-MM-dd"));

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
        .from("td_fluxo_de_caixa")
        .select("*")
        .gte("data_lancamento", format(compareStartDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(compareEndDate, "yyyy-MM-dd"));

      if (error) throw error;
      return data || [];
    },
    enabled: !!compareStartDate && !!compareEndDate,
  });

  // Fetch other data - NOVAS TABELAS
  const { data: contas = [] } = useQuery({
    queryKey: ["dashboard_contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_financeiras")
        .select("*");
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
        .order("data_vencimento");
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

  // NOVA TABELA: tratamentos
  const { data: tratamentos = [] } = useQuery({
    queryKey: ["dashboard_tratamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // NOVA TABELA: origens
  const { data: origens = [] } = useQuery({
    queryKey: ["dashboard_origens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("origens")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate KPIs - ajustado para nova estrutura (valor único em vez de valor_entrada/valor_saida)
  const receitas = lancamentos.filter((l: any) => l.tipo === "receita");
  const despesas = lancamentos.filter((l: any) => l.tipo === "despesa");
  
  const receitaTotal = receitas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const despesaTotal = despesas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const lucroLiquido = receitaTotal - despesaTotal;
  
  const totalReceitas = receitas.length;
  const ticketMedio = totalReceitas > 0 ? receitaTotal / totalReceitas : 0;
  
  // Calcular margem usando custo_material
  const custoMaterialTotal = receitas.reduce((sum: number, l: any) => sum + Number(l.custo_material || 0), 0);
  const margemTotal = receitaTotal - custoMaterialTotal;
  const margemMedia = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0;

  // Comparison period calculations
  const compareReceitas = compareLancamentos.filter((l: any) => l.tipo === "receita");
  const compareDespesas = compareLancamentos.filter((l: any) => l.tipo === "despesa");
  const compareReceitaTotal = compareReceitas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareDespesaTotal = compareDespesas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareLucro = compareReceitaTotal - compareDespesaTotal;

  const taxaCrescimentoReceita = compareReceitaTotal > 0 
    ? ((receitaTotal - compareReceitaTotal) / compareReceitaTotal) * 100 
    : 0;
  const taxaCrescimentoLucro = compareLucro > 0 
    ? ((lucroLiquido - compareLucro) / compareLucro) * 100 
    : 0;

  // Top treatments by revenue
  const tratamentosReceita = receitas.reduce((acc: any, l: any) => {
    if (l.tratamento?.nome) {
      if (!acc[l.tratamento.nome]) {
        acc[l.tratamento.nome] = { receita: 0, margem: 0, count: 0 };
      }
      const valor = Number(l.valor || 0);
      const custo = Number(l.custo_material || 0);
      acc[l.tratamento.nome].receita += valor;
      acc[l.tratamento.nome].margem += (valor - custo);
      acc[l.tratamento.nome].count += 1;
    }
    return acc;
  }, {} as Record<string, { receita: number; margem: number; count: number }>);

  const topTratamentosReceita = Object.entries(tratamentosReceita)
    .map(([nome, data]: [string, any]) => ({ nome, ...data }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  const topTratamentosMargem = Object.entries(tratamentosReceita)
    .map(([nome, data]: [string, any]) => ({ 
      nome, 
      ...data,
      margemPercentual: data.receita > 0 ? (data.margem / data.receita) * 100 : 0
    }))
    .sort((a, b) => b.margemPercentual - a.margemPercentual)
    .slice(0, 5);

  // Revenue by origin
  const receitaPorOrigem = receitas.reduce((acc: any, l: any) => {
    const origem = l.origem?.nome || "Sem Origem";
    if (!acc[origem]) {
      acc[origem] = 0;
    }
    acc[origem] += Number(l.valor || 0);
    return acc;
  }, {} as Record<string, number>);

  // Other KPIs
  const saldoTotal = contas.reduce((sum: number, c: any) => sum + Number(c.saldo_atual || 0), 0);
  const contasVencidas = contasPagar.filter(
    (c: any) => c.status !== "pago" && new Date(c.data_vencimento) < new Date()
  ).length;
  const produtosBaixos = produtos.filter(
    (p: any) => (p.estoque_atual || 0) <= (p.estoque_minimo || 0)
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
