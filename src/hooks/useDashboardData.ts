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

  // Fetch lancamentos with filters - INCLUI CATEGORIAS para natureza_dre
  const { data: lancamentos = [] } = useQuery({
    queryKey: ["dashboard_lancamentos", filters],
    queryFn: async () => {
      let query = supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          tratamento:tratamentos(*),
          origem:origens(*),
          categorias(nome_sintetico, natureza_dre)
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

  // Fetch comparison period data if provided - INCLUI CATEGORIAS
  const { data: compareLancamentos = [] } = useQuery({
    queryKey: ["dashboard_compare_lancamentos", compareStartDate, compareEndDate],
    queryFn: async () => {
      if (!compareStartDate || !compareEndDate) return [];
      
      const { data, error } = await supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          categorias(nome_sintetico, natureza_dre)
        `)
        .gte("data_lancamento", format(compareStartDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(compareEndDate, "yyyy-MM-dd"));

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

  // ========== CÁLCULO DO DRE - MESMA LÓGICA DO useDREGerencial ==========
  const receitas = lancamentos.filter((l: any) => l.tipo === "receita");
  const despesas = lancamentos.filter((l: any) => l.tipo === "despesa");
  
  // 1. Receita Bruta
  const receitaBruta = receitas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 2. Deduções (ISS, PIS, COFINS - natureza_dre = 'deducao')
  const deducoes = despesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "deducao")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 3. Receita Líquida
  const receitaLiquida = receitaBruta - deducoes;
  
  // 4. Custo Material (do campo custo_material nas receitas)
  const custoMaterial = receitas.reduce((sum: number, l: any) => sum + Number(l.custo_material || 0), 0);
  
  // 5. Custos Variáveis (natureza_dre = 'custo')
  const custosVariaveis = despesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "custo")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 6. Lucro Bruto
  const lucroBruto = receitaLiquida - custoMaterial - custosVariaveis;
  
  // 7. Despesas Operacionais (OPEX - natureza_dre = 'opex' ou null)
  const despesasOperacionais = despesas
    .filter((l: any) => 
      (l.categorias as any)?.natureza_dre === "opex" || 
      !(l.categorias as any)?.natureza_dre
    )
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 8. Resultado Operacional (EBIT)
  const resultadoOperacional = lucroBruto - despesasOperacionais;
  
  // 9. Despesas Financeiras (natureza_dre = 'financeiro')
  const despesasFinanceiras = despesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "financeiro")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 10. Resultado antes do IR
  const resultadoAntesIR = resultadoOperacional - despesasFinanceiras;
  
  // 11. Impostos sobre Lucro (IRPJ, CSLL - natureza_dre = 'imposto_lucro')
  const impostoLucro = despesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "imposto_lucro")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  // 12. Lucro Líquido (IGUAL AO DRE)
  const lucroLiquido = resultadoAntesIR - impostoLucro;
  
  // Margens
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;
  
  // Total de despesas (para exibição)
  const despesaTotal = despesas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  
  const totalReceitas = receitas.length;
  const ticketMedio = totalReceitas > 0 ? receitaBruta / totalReceitas : 0;
  
  // Margem de contribuição média
  const margemTotal = receitaBruta - custoMaterial;
  const margemMedia = receitaBruta > 0 ? (margemTotal / receitaBruta) * 100 : 0;
  
  const receitaTotal = receitaBruta;

  // ========== COMPARISON PERIOD - MESMA LÓGICA ==========
  const compareReceitas = compareLancamentos.filter((l: any) => l.tipo === "receita");
  const compareDespesas = compareLancamentos.filter((l: any) => l.tipo === "despesa");
  
  const compareReceitaBruta = compareReceitas.reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareDeducoes = compareDespesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "deducao")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareReceitaLiquida = compareReceitaBruta - compareDeducoes;
  const compareCustoMaterial = compareReceitas.reduce((sum: number, l: any) => sum + Number(l.custo_material || 0), 0);
  const compareCustosVariaveis = compareDespesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "custo")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareLucroBruto = compareReceitaLiquida - compareCustoMaterial - compareCustosVariaveis;
  const compareDespesasOp = compareDespesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "opex" || !(l.categorias as any)?.natureza_dre)
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareEBIT = compareLucroBruto - compareDespesasOp;
  const compareDespesasFin = compareDespesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "financeiro")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareImpostos = compareDespesas
    .filter((l: any) => (l.categorias as any)?.natureza_dre === "imposto_lucro")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);
  const compareLucroLiquido = compareEBIT - compareDespesasFin - compareImpostos;

  const taxaCrescimentoReceita = compareReceitaBruta > 0 
    ? ((receitaTotal - compareReceitaBruta) / compareReceitaBruta) * 100 
    : 0;
  const taxaCrescimentoLucro = compareLucroLiquido !== 0 
    ? ((lucroLiquido - compareLucroLiquido) / Math.abs(compareLucroLiquido)) * 100 
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
      lucroBruto,
      resultadoOperacional,
      margemBruta,
      margemLiquida,
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
