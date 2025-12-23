import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  observacoes: string | null;
  ativo: boolean | null;
  foto_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function usePacientesData() {
  const { data: pacientes = [], refetch, isLoading } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as Paciente[];
    },
  });

  const kpis = {
    totalPacientes: pacientes.length,
    pacientesAtivos: pacientes.filter((p) => p.ativo !== false).length,
    pacientesInativos: pacientes.filter((p) => p.ativo === false).length,
    novosEsteMes: pacientes.filter((p) => {
      if (!p.created_at) return false;
      const createdAt = new Date(p.created_at);
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return {
    pacientes,
    refetch,
    isLoading,
    kpis,
  };
}
