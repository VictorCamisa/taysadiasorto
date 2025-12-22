import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useFinanceData = () => {
  const currentMonth = new Date();
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  // Lançamentos do mês - NOVA TABELA: td_fluxo_de_caixa
  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos", format(startDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          categorias(nome_sintetico, nome_analitico),
          tratamentos(nome),
          origens(nome),
          formas_pagamento(nome),
          contas_financeiras(nome, saldo_atual),
          clientes_fornecedores(nome, tipo)
        `)
        .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(endDate, "yyyy-MM-dd"))
        .order("data_lancamento", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Contas financeiras - NOVA TABELA: contas_financeiras
  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_financeiras")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Contas a pagar
  const { data: contasPagar = [] } = useQuery({
    queryKey: ["contas-pagar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas_pagar")
        .select("*, financeiro_fornecedores(nome)")
        .order("data_vencimento", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos"],
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

  // Tratamentos - NOVA TABELA: tratamentos
  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular KPIs - ajustado para nova estrutura
  const receitaMes = lancamentos
    .filter((l: any) => l.tipo === "receita")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);

  const despesaMes = lancamentos
    .filter((l: any) => l.tipo === "despesa")
    .reduce((sum: number, l: any) => sum + Number(l.valor || 0), 0);

  const lucroMes = receitaMes - despesaMes;

  const saldoTotal = contas.reduce((sum: number, c: any) => sum + Number(c.saldo_atual || 0), 0);

  const contasVencidas = contasPagar.filter(
    (c: any) => (c.status === "aberto" || c.status === "pendente") && new Date(c.data_vencimento) < new Date()
  ).length;

  const produtosBaixos = produtos.filter(
    (p: any) => Number(p.estoque_atual || 0) <= Number(p.estoque_minimo || 0)
  );

  return {
    lancamentos,
    contas,
    contasPagar,
    produtos,
    tratamentos,
    kpis: {
      receitaMes,
      despesaMes,
      lucroMes,
      saldoTotal,
      totalLancamentos: lancamentos.length,
      contasVencidas,
      produtosBaixos: produtosBaixos.length,
    },
  };
};
