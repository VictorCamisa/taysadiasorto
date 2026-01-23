import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AIAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  memory_enabled: boolean;
  memory_window: number;
  rag_enabled: boolean;
  rag_similarity_threshold: number;
  rag_max_results: number;
  db_connection_enabled: boolean;
  db_tables_access: string[];
  is_active: boolean;
  is_public: boolean;
  public_slug: string | null;
  total_conversations: number;
  total_messages: number;
  created_at: string;
  updated_at: string;
}

export interface AIAgentDocument {
  id: string;
  agent_id: string;
  name: string;
  type: string;
  source_url: string | null;
  file_path: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
  chunk_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAgentConversation {
  id: string;
  agent_id: string;
  user_id: string | null;
  session_id: string | null;
  title: string;
  summary: string | null;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIAgentMessage {
  id: string;
  conversation_id: string;
  agent_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number | null;
  model_used: string | null;
  sources: unknown[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export type CreateAgentInput = {
  name: string;
  description?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  memory_enabled?: boolean;
  memory_window?: number;
  rag_enabled?: boolean;
  db_connection_enabled?: boolean;
};

export function useAIAgents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const agentsQuery = useQuery({
    queryKey: ["ai-agents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIAgent[];
    },
    enabled: !!user?.id,
  });

  const createAgentMutation = useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("ai_agents")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          system_prompt: input.system_prompt || "Você é um assistente útil e profissional.",
          model: input.model || "gpt-4o-mini",
          temperature: input.temperature ?? 0.7,
          max_tokens: input.max_tokens ?? 4096,
          memory_enabled: input.memory_enabled ?? true,
          memory_window: input.memory_window ?? 20,
          rag_enabled: input.rag_enabled ?? false,
          db_connection_enabled: input.db_connection_enabled ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIAgent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar agente: " + error.message);
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, ...input }: Partial<AIAgent> & { id: string }) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as AIAgent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    createAgent: createAgentMutation.mutateAsync,
    updateAgent: updateAgentMutation.mutateAsync,
    deleteAgent: deleteAgentMutation.mutateAsync,
    isCreating: createAgentMutation.isPending,
  };
}

export function useAIAgentDocuments(agentId: string | null) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["ai-agent-documents", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from("ai_agent_documents")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIAgentDocument[];
    },
    enabled: !!agentId,
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (input: { name: string; type: string; content: string; source_url?: string }) => {
      if (!agentId) throw new Error("No agent selected");

      const { data, error } = await supabase
        .from("ai_agent_documents")
        .insert({
          agent_id: agentId,
          name: input.name,
          type: input.type,
          content: input.content,
          source_url: input.source_url || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIAgentDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-documents", agentId] });
      toast.success("Documento adicionado!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar documento: " + error.message);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agent_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-documents", agentId] });
      toast.success("Documento removido!");
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    addDocument: addDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isAdding: addDocumentMutation.isPending,
  };
}

export function useAIAgentConversations(agentId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["ai-agent-conversations", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from("ai_agent_conversations")
        .select("*")
        .eq("agent_id", agentId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as AIAgentConversation[];
    },
    enabled: !!agentId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string = "Nova Conversa") => {
      if (!agentId) throw new Error("No agent selected");

      const { data, error } = await supabase
        .from("ai_agent_conversations")
        .insert({
          agent_id: agentId,
          user_id: user?.id || null,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIAgentConversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-conversations", agentId] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agent_conversations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-conversations", agentId] });
      toast.success("Conversa excluída!");
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    createConversation: createConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
  };
}

export function useAIAgentMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["ai-agent-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("ai_agent_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AIAgentMessage[];
    },
    enabled: !!conversationId,
  });

  const addMessageMutation = useMutation({
    mutationFn: async (input: { role: "user" | "assistant"; content: string; agent_id: string }) => {
      if (!conversationId) throw new Error("No conversation selected");

      const { data, error } = await supabase
        .from("ai_agent_messages")
        .insert({
          conversation_id: conversationId,
          agent_id: input.agent_id,
          role: input.role,
          content: input.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIAgentMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-messages", conversationId] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    addMessage: addMessageMutation.mutateAsync,
    refetch: messagesQuery.refetch,
  };
}