import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEstoqueData = () => {
  const { data: produtos = [], isLoading: loadingProdutos, refetch: refetchProdutos } = useQuery({
    queryKey: ["estoque_produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select(`
          *,
          fornecedor:financeiro_fornecedores!fornecedor_id(id, nome)
        `)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: compras = [], isLoading: loadingCompras, refetch: refetchCompras } = useQuery({
    queryKey: ["estoque_compras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_compras")
        .select(`
          *,
          fornecedor:financeiro_fornecedores!fornecedor_id(id, nome),
          forma_pagamento:financeiro_formas_pagamento!forma_pagamento_id(id, nome),
          conta_financeira:financeiro_contas!conta_financeira_id(id, nome),
          itens:estoque_compras_itens(
            *,
            produto:estoque_produtos!produto_id(id, nome, unidade_medida)
          )
        `)
        .order("data_compra", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: fornecedores = [], isLoading: loadingFornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_fornecedores")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: formasPagamento = [], isLoading: loadingFormasPagamento } = useQuery({
    queryKey: ["formas_pagamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_formas_pagamento")
        .select("*")
        .eq("ativa", true)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: contasFinanceiras = [], isLoading: loadingContasFinanceiras } = useQuery({
    queryKey: ["contas_financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas")
        .select("*")
        .eq("ativa", true)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // KPIs
  const valorTotalEstoque = produtos.reduce(
    (sum, p) => sum + (Number(p.estoque_atual) * Number(p.custo_medio)),
    0
  );

  const produtosAtivos = produtos.filter(p => p.ativo).length;
  
  const produtosCriticos = produtos.filter(
    p => Number(p.estoque_atual) < Number(p.estoque_minimo)
  ).length;

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const totalComprasMes = compras
    .filter(c => new Date(c.data_compra) >= inicioMes)
    .reduce((sum, c) => sum + Number(c.valor_total), 0);

  return {
    produtos,
    compras,
    fornecedores,
    formasPagamento,
    contasFinanceiras,
    loadingProdutos,
    loadingCompras,
    loadingFornecedores,
    loadingFormasPagamento,
    loadingContasFinanceiras,
    refetchProdutos,
    refetchCompras,
    kpis: {
      valorTotalEstoque,
      produtosAtivos,
      produtosCriticos,
      totalComprasMes,
    },
  };
};
