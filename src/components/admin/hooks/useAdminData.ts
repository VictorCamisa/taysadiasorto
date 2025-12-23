import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = 'admin' | 'medico' | 'estagiario' | 'recepcionista';

export interface Profile {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  especialidade: string | null;
  crm: string | null;
  foto_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface LgpdTermo {
  id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
  versao: string;
  vigente: boolean;
  created_at: string;
  updated_at: string;
}

export interface LgpdConsentimento {
  id: string;
  paciente_id: string;
  termo_id: string;
  aceito: boolean;
  ip_address: string | null;
  data_aceite: string | null;
  data_revogacao: string | null;
  created_at: string;
  paciente?: { nome: string };
  termo?: { titulo: string; tipo: string };
}

export interface DocumentoLegal {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string | null;
  arquivo_url: string | null;
  vigente: boolean;
  data_vigencia: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  acao: string;
  tabela: string;
  registro_id: string | null;
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  medico: "Médico",
  estagiario: "Estagiário",
  recepcionista: "Recepcionista",
};

export const TERMO_TIPOS = [
  { value: "privacidade", label: "Política de Privacidade" },
  { value: "consentimento", label: "Termo de Consentimento" },
  { value: "tratamento_dados", label: "Tratamento de Dados" },
];

export const DOCUMENTO_TIPOS = [
  { value: "contrato", label: "Contrato" },
  { value: "termo", label: "Termo" },
  { value: "politica", label: "Política" },
  { value: "regulatorio", label: "Regulatório" },
];

export const useAdminData = () => {
  const queryClient = useQueryClient();

  // Profiles
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Profile[];
    },
  });

  // User Roles
  const { data: userRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // LGPD Termos
  const { data: termos = [], isLoading: loadingTermos } = useQuery({
    queryKey: ["admin_lgpd_termos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lgpd_termos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LgpdTermo[];
    },
  });

  // LGPD Consentimentos
  const { data: consentimentos = [], isLoading: loadingConsentimentos } = useQuery({
    queryKey: ["admin_lgpd_consentimentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lgpd_consentimentos")
        .select(`
          *,
          paciente:pacientes(nome),
          termo:lgpd_termos(titulo, tipo)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LgpdConsentimento[];
    },
  });

  // Documentos Legais
  const { data: documentos = [], isLoading: loadingDocumentos } = useQuery({
    queryKey: ["admin_documentos_legais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_legais")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DocumentoLegal[];
    },
  });

  // Audit Logs
  const { data: auditLogs = [], isLoading: loadingAuditLogs } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  // Mutations - Profile
  const updateProfile = useMutation({
    mutationFn: async (profile: Partial<Profile> & { id: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
      toast.success("Perfil atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  // Mutations - User Role
  const addUserRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Papel adicionado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao adicionar papel");
    },
  });

  const removeUserRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Papel removido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover papel");
    },
  });

  // Mutations - LGPD Termos
  const createTermo = useMutation({
    mutationFn: async (termo: Omit<LgpdTermo, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("lgpd_termos").insert(termo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_lgpd_termos"] });
      toast.success("Termo criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar termo");
    },
  });

  const updateTermo = useMutation({
    mutationFn: async (termo: Partial<LgpdTermo> & { id: string }) => {
      const { error } = await supabase
        .from("lgpd_termos")
        .update(termo)
        .eq("id", termo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_lgpd_termos"] });
      toast.success("Termo atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar termo");
    },
  });

  const deleteTermo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lgpd_termos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_lgpd_termos"] });
      toast.success("Termo excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir termo");
    },
  });

  // Mutations - Documentos Legais
  const createDocumento = useMutation({
    mutationFn: async (doc: Omit<DocumentoLegal, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("documentos_legais").insert(doc);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_documentos_legais"] });
      toast.success("Documento criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar documento");
    },
  });

  const updateDocumento = useMutation({
    mutationFn: async (doc: Partial<DocumentoLegal> & { id: string }) => {
      const { error } = await supabase
        .from("documentos_legais")
        .update(doc)
        .eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_documentos_legais"] });
      toast.success("Documento atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar documento");
    },
  });

  const deleteDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos_legais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_documentos_legais"] });
      toast.success("Documento excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir documento");
    },
  });

  return {
    // Data
    profiles,
    userRoles,
    termos,
    consentimentos,
    documentos,
    auditLogs,
    // Loading states
    loadingProfiles,
    loadingRoles,
    loadingTermos,
    loadingConsentimentos,
    loadingDocumentos,
    loadingAuditLogs,
    // Mutations
    updateProfile,
    addUserRole,
    removeUserRole,
    createTermo,
    updateTermo,
    deleteTermo,
    createDocumento,
    updateDocumento,
    deleteDocumento,
  };
};
