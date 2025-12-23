import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Paciente = Tables<"pacientes">;
export type Anamnese = Tables<"anamneses">;
export type Prontuario = Tables<"prontuarios"> & {
  tratamento?: Tables<"tratamentos"> | null;
};

export function useFichaPacienteData(pacienteId: string | undefined) {
  const { data: paciente, isLoading: isLoadingPaciente } = useQuery({
    queryKey: ["paciente", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null;
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", pacienteId)
        .maybeSingle();
      if (error) throw error;
      return data as Paciente | null;
    },
    enabled: !!pacienteId,
  });

  const { data: anamneses = [], isLoading: isLoadingAnamneses } = useQuery({
    queryKey: ["anamneses", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return [];
      const { data, error } = await supabase
        .from("anamneses")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_anamnese", { ascending: false });
      if (error) throw error;
      return data as Anamnese[];
    },
    enabled: !!pacienteId,
  });

  const { data: prontuarios = [], isLoading: isLoadingProntuarios } = useQuery({
    queryKey: ["prontuarios", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return [];
      const { data, error } = await supabase
        .from("prontuarios")
        .select("*, tratamento:tratamentos(*)")
        .eq("paciente_id", pacienteId)
        .order("data_atendimento", { ascending: false });
      if (error) throw error;
      return data as Prontuario[];
    },
    enabled: !!pacienteId,
  });

  return {
    paciente,
    anamneses,
    prontuarios,
    isLoading: isLoadingPaciente || isLoadingAnamneses || isLoadingProntuarios,
    ultimaAnamnese: anamneses[0] || null,
    ultimoProntuario: prontuarios[0] || null,
    totalAtendimentos: prontuarios.length,
  };
}
