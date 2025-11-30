import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFornecedoresData = () => {
  const { data: fornecedores = [], isLoading, refetch } = useQuery({
    queryKey: ["fornecedores_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_fornecedores")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // KPIs
  const totalFornecedores = fornecedores.length;
  const fornecedoresAtivos = fornecedores.filter(f => f.ativo).length;
  const fornecedoresInativos = fornecedores.filter(f => !f.ativo).length;

  // Contagem de produtos por fornecedor
  const { data: produtosPorFornecedor = [] } = useQuery({
    queryKey: ["produtos_por_fornecedor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("fornecedor_id");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Contagem de compras por fornecedor
  const { data: comprasPorFornecedor = [] } = useQuery({
    queryKey: ["compras_por_fornecedor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_compras")
        .select("fornecedor_id, valor_total");
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    fornecedores,
    isLoading,
    refetch,
    kpis: {
      totalFornecedores,
      fornecedoresAtivos,
      fornecedoresInativos,
    },
    produtosPorFornecedor,
    comprasPorFornecedor,
  };
};
