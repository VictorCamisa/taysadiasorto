import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConfiguracoesData = () => {
  // NOVA TABELA: categorias
  const { data: categorias = [], isLoading: loadingCategorias, refetch: refetchCategorias } = useQuery({
    queryKey: ["configuracoes_categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome_sintetico");
      
      if (error) throw error;
      return data || [];
    },
  });

  // NOVA TABELA: contas_financeiras
  const { data: contas = [], isLoading: loadingContas, refetch: refetchContas } = useQuery({
    queryKey: ["configuracoes_contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_financeiras")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // NOVA TABELA: formas_pagamento
  const { data: formasPagamento = [], isLoading: loadingFormas, refetch: refetchFormas } = useQuery({
    queryKey: ["configuracoes_formas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formas_pagamento")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // NOVA TABELA: origens
  const { data: origens = [], isLoading: loadingOrigens, refetch: refetchOrigens } = useQuery({
    queryKey: ["configuracoes_origens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("origens")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    categorias,
    contas,
    formasPagamento,
    origens,
    loadingCategorias,
    loadingContas,
    loadingFormas,
    loadingOrigens,
    refetchCategorias,
    refetchContas,
    refetchFormas,
    refetchOrigens,
  };
};
