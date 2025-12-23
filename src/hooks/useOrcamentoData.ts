import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, endOfYear, subMonths } from "date-fns";
import { toast } from "sonner";

export interface Orcamento {
  id: string;
  nome: string;
  periodo_inicio: string;
  periodo_fim: string;
  status: "rascunho" | "ativo" | "encerrado";
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  categoria_id?: string;
  tratamento_id?: string;
  tipo: "receita" | "despesa";
  valor_orcado: number;
  created_at?: string;
  updated_at?: string;
  categoria?: { nome_sintetico: string; natureza_dre: string };
  tratamento?: { nome: string };
}

export const useOrcamentoData = () => {
  const queryClient = useQueryClient();

  // Buscar todos os orçamentos
  const { data: orcamentos = [], isLoading: loadingOrcamentos } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("periodo_inicio", { ascending: false });

      if (error) throw error;
      return data as Orcamento[];
    },
  });

  // Buscar orçamento ativo para um período específico
  const useOrcamentoAtivo = (mes: string) => {
    return useQuery({
      queryKey: ["orcamento_ativo", mes],
      queryFn: async () => {
        const data = new Date(mes + "-01");
        const { data: orcamento, error } = await supabase
          .from("orcamentos")
          .select("*")
          .eq("status", "ativo")
          .lte("periodo_inicio", format(data, "yyyy-MM-dd"))
          .gte("periodo_fim", format(data, "yyyy-MM-dd"))
          .maybeSingle();

        if (error) throw error;
        return orcamento as Orcamento | null;
      },
    });
  };

  // Buscar itens de um orçamento
  const useOrcamentoItens = (orcamentoId: string | undefined) => {
    return useQuery({
      queryKey: ["orcamento_itens", orcamentoId],
      queryFn: async () => {
        if (!orcamentoId) return [];
        
        const { data, error } = await supabase
          .from("orcamento_itens")
          .select(`
            *,
            categoria:categorias(nome_sintetico, natureza_dre),
            tratamento:tratamentos(nome)
          `)
          .eq("orcamento_id", orcamentoId);

        if (error) throw error;
        return data as OrcamentoItem[];
      },
      enabled: !!orcamentoId,
    });
  };

  // Criar orçamento
  const createOrcamento = useMutation({
    mutationFn: async (orcamento: Omit<Orcamento, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("orcamentos")
        .insert(orcamento)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Budget criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar budget: " + error.message);
    },
  });

  // Atualizar orçamento
  const updateOrcamento = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Orcamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("orcamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar orçamento: " + error.message);
    },
  });

  // Deletar orçamento
  const deleteOrcamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Budget excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir budget: " + error.message);
    },
  });

  // Salvar itens do orçamento (upsert)
  const saveOrcamentoItens = useMutation({
    mutationFn: async ({ orcamentoId, itens }: { 
      orcamentoId: string; 
      itens: Array<Omit<OrcamentoItem, "id" | "created_at" | "updated_at" | "categoria" | "tratamento">> 
    }) => {
      // Primeiro, deletar itens existentes
      await supabase
        .from("orcamento_itens")
        .delete()
        .eq("orcamento_id", orcamentoId);

      // Inserir novos itens
      if (itens.length > 0) {
        const { error } = await supabase
          .from("orcamento_itens")
          .insert(itens.map(item => ({ ...item, orcamento_id: orcamentoId })));

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_itens", variables.orcamentoId] });
      toast.success("Itens do orçamento salvos com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar itens: " + error.message);
    },
  });

  // Sugerir valores baseado no histórico
  const sugerirValoresHistorico = async (periodoInicio: string, periodoFim: string) => {
    // Buscar dados dos últimos 12 meses antes do período
    const dataInicio = subMonths(new Date(periodoInicio), 12);
    const dataFim = subMonths(new Date(periodoInicio), 1);

    const { data: lancamentos } = await supabase
      .from("td_fluxo_de_caixa")
      .select(`
        tipo,
        valor,
        categoria_id,
        tratamento_id,
        categoria:categorias(nome_sintetico, natureza_dre)
      `)
      .gte("data_lancamento", format(dataInicio, "yyyy-MM-dd"))
      .lte("data_lancamento", format(dataFim, "yyyy-MM-dd"))
      .eq("status", "pago");

    if (!lancamentos) return [];

    // Agrupar por categoria e tratamento
    const agrupado = new Map<string, { 
      categoria_id?: string;
      tratamento_id?: string;
      tipo: "receita" | "despesa";
      total: number;
      count: number;
    }>();

    lancamentos.forEach((l: any) => {
      const key = l.categoria_id || l.tratamento_id || "outros";
      const existing = agrupado.get(key);
      
      if (existing) {
        existing.total += l.valor;
        existing.count += 1;
      } else {
        agrupado.set(key, {
          categoria_id: l.categoria_id,
          tratamento_id: l.tratamento_id,
          tipo: l.tipo === "receita" ? "receita" : "despesa",
          total: l.valor,
          count: 1,
        });
      }
    });

    // Calcular média mensal e projetar para o período
    const meses = Math.ceil(
      (new Date(periodoFim).getTime() - new Date(periodoInicio).getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    );

    return Array.from(agrupado.entries()).map(([_, value]) => ({
      categoria_id: value.categoria_id || undefined,
      tratamento_id: value.tratamento_id || undefined,
      tipo: value.tipo,
      valor_orcado: Math.round((value.total / 12) * meses * 100) / 100,
    }));
  };

  return {
    orcamentos,
    loadingOrcamentos,
    useOrcamentoAtivo,
    useOrcamentoItens,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    saveOrcamentoItens,
    sugerirValoresHistorico,
  };
};
