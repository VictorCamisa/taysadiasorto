import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConfiguracoesData = () => {
  const { data: categorias = [], isLoading: loadingCategorias, refetch: refetchCategorias } = useQuery({
    queryKey: ["configuracoes_categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_categorias")
        .select("*")
        .order("categoria_sintetica");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: contas = [], isLoading: loadingContas, refetch: refetchContas } = useQuery({
    queryKey: ["configuracoes_contas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: formasPagamento = [], isLoading: loadingFormas, refetch: refetchFormas } = useQuery({
    queryKey: ["configuracoes_formas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_formas_pagamento")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: origens = [], isLoading: loadingOrigens, refetch: refetchOrigens } = useQuery({
    queryKey: ["configuracoes_origens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_origens")
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
