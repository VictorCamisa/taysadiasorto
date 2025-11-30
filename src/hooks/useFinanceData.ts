import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const useFinanceData = () => {
  const currentMonth = new Date();
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  // Lançamentos do mês
  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos", format(startDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_lancamentos")
        .select("*")
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"))
        .order("data", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Contas financeiras
  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas")
        .select("*")
        .eq("ativa", true);
      
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
        .order("vencimento", { ascending: true });
      
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

  // Tratamentos
  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_tratamentos")
        .select("*")
        .eq("ativo", true);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular KPIs
  const receitaMes = lancamentos
    .filter(l => l.tipo === "receita")
    .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0);

  const despesaMes = lancamentos
    .filter(l => l.tipo === "despesa")
    .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0);

  const lucroMes = receitaMes - despesaMes;

  const saldoTotal = contas.reduce((sum, c) => sum + Number(c.saldo_atual || 0), 0);

  const contasVencidas = contasPagar.filter(
    c => c.status === "aberto" && new Date(c.vencimento) < new Date()
  ).length;

  const produtosBaixos = produtos.filter(
    p => Number(p.estoque_atual || 0) <= Number(p.estoque_minimo || 0)
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
