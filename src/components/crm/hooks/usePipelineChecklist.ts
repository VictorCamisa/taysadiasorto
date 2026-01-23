import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChecklistItem {
  id: string;
  etapa: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  obrigatorio: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistProgress {
  id: string;
  agendamento_id: string;
  checklist_item_id: string;
  concluido: boolean;
  concluido_em: string | null;
  concluido_por: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItemWithProgress extends ChecklistItem {
  progress?: ChecklistProgress;
}

// Buscar todos os itens de checklist
export function useChecklistItems(etapa?: string) {
  return useQuery({
    queryKey: ["checklist-items", etapa],
    queryFn: async () => {
      let query = supabase
        .from("pipeline_checklist_items")
        .select("*")
        .eq("ativo", true)
        .order("ordem");

      if (etapa) {
        query = query.eq("etapa", etapa);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChecklistItem[];
    },
  });
}

// Buscar todos os itens (ativos e inativos) para administração
export function useAllChecklistItems() {
  return useQuery({
    queryKey: ["checklist-items-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_checklist_items")
        .select("*")
        .order("etapa")
        .order("ordem");

      if (error) throw error;
      return data as ChecklistItem[];
    },
  });
}

// Buscar progresso do checklist para um agendamento
export function useChecklistProgress(agendamentoId?: string) {
  return useQuery({
    queryKey: ["checklist-progress", agendamentoId],
    enabled: !!agendamentoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_checklist_progress")
        .select("*")
        .eq("agendamento_id", agendamentoId!);

      if (error) throw error;
      return data as ChecklistProgress[];
    },
  });
}

// Combinar itens com progresso para uma etapa específica
export function useChecklistWithProgress(agendamentoId?: string, etapa?: string) {
  const { data: items = [], isLoading: itemsLoading } = useChecklistItems(etapa);
  const { data: progress = [], isLoading: progressLoading } = useChecklistProgress(agendamentoId);

  const itemsWithProgress: ChecklistItemWithProgress[] = items.map((item) => ({
    ...item,
    progress: progress.find((p) => p.checklist_item_id === item.id),
  }));

  const totalItems = itemsWithProgress.filter(i => i.obrigatorio).length;
  const completedItems = itemsWithProgress.filter(i => i.obrigatorio && i.progress?.concluido).length;
  const isComplete = totalItems > 0 && completedItems === totalItems;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 100;

  return {
    items: itemsWithProgress,
    isLoading: itemsLoading || progressLoading,
    totalItems,
    completedItems,
    isComplete,
    progressPercent,
  };
}

// Mutations para gerenciar progresso
export function useChecklistProgressMutations() {
  const queryClient = useQueryClient();

  const toggleProgress = useMutation({
    mutationFn: async ({
      agendamentoId,
      checklistItemId,
      concluido,
    }: {
      agendamentoId: string;
      checklistItemId: string;
      concluido: boolean;
    }) => {
      // Upsert - cria ou atualiza o registro
      const { error } = await supabase
        .from("pipeline_checklist_progress")
        .upsert(
          {
            agendamento_id: agendamentoId,
            checklist_item_id: checklistItemId,
            concluido,
            concluido_em: concluido ? new Date().toISOString() : null,
          },
          {
            onConflict: "agendamento_id,checklist_item_id",
          }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["checklist-progress", variables.agendamentoId],
      });
    },
  });

  return { toggleProgress };
}

// Mutations para gerenciar itens (admin)
export function useChecklistItemsMutations() {
  const queryClient = useQueryClient();

  const createItem = useMutation({
    mutationFn: async (data: Omit<ChecklistItem, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("pipeline_checklist_items").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-items-all"] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<ChecklistItem> & { id: string }) => {
      const { error } = await supabase
        .from("pipeline_checklist_items")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-items-all"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pipeline_checklist_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-items-all"] });
    },
  });

  return { createItem, updateItem, deleteItem };
}
