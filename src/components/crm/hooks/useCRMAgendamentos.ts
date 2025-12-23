import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type CRMAgendamento = Tables<"crm_agendamentos"> & {
  paciente?: Tables<"pacientes"> | null;
  tratamento?: Tables<"tratamentos"> | null;
};

export type AgendamentoStatus = "lead" | "agendado" | "confirmado" | "realizado" | "cancelado" | "no_show";

export const STATUS_LABELS: Record<AgendamentoStatus, string> = {
  lead: "Lead",
  agendado: "Agendado",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
  no_show: "No-show",
};

export const STATUS_COLORS: Record<AgendamentoStatus, string> = {
  lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  agendado: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  confirmado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  realizado: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  no_show: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function useCRMAgendamentos(filters?: {
  tratamentoId?: string;
  status?: AgendamentoStatus[];
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: ["crm-agendamentos", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_agendamentos")
        .select("*, paciente:pacientes(*), tratamento:tratamentos(*)")
        .order("data_agendamento", { ascending: true, nullsFirst: false });

      if (filters?.tratamentoId) {
        query = query.eq("tratamento_id", filters.tratamentoId);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("data_agendamento", filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte("data_agendamento", filters.endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRMAgendamento[];
    },
  });
}

export function useTratamentos() {
  return useQuery({
    queryKey: ["tratamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function usePacientes() {
  return useQuery({
    queryKey: ["pacientes-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome, telefone, email")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useAgendamentoMutations() {
  const queryClient = useQueryClient();

  const createAgendamento = useMutation({
    mutationFn: async (data: Partial<Tables<"crm_agendamentos">> & { paciente_id: string }) => {
      const { error } = await supabase.from("crm_agendamentos").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-agendamentos"] });
    },
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tables<"crm_agendamentos">> & { id: string }) => {
      const { error } = await supabase
        .from("crm_agendamentos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-agendamentos"] });
    },
  });

  const deleteAgendamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-agendamentos"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AgendamentoStatus }) => {
      const { error } = await supabase
        .from("crm_agendamentos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-agendamentos"] });
    },
  });

  return { createAgendamento, updateAgendamento, deleteAgendamento, updateStatus };
}
