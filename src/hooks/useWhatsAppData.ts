import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WhatsAppInstance {
  id: string;
  nome: string;
  instance_name: string;
  instance_id: string | null;
  status: string;
  qrcode: string | null;
  created_at: string;
}

export interface WhatsAppConversa {
  id: string;
  instance_id: string;
  paciente_id: string | null;
  remote_jid: string;
  nome_contato: string | null;
  foto_url: string | null;
  ultima_mensagem: string | null;
  ultima_mensagem_at: string | null;
  nao_lidas: number;
  paciente?: {
    id: string;
    nome: string;
    telefone: string | null;
    foto_url: string | null;
  } | null;
}

export interface WhatsAppMensagem {
  id: string;
  conversa_id: string;
  message_id: string | null;
  from_me: boolean;
  tipo: string;
  conteudo: string | null;
  media_url: string | null;
  status: string;
  timestamp_msg: string;
}

export function useWhatsAppInstances() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInstances = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error: unknown) {
      console.error("Error fetching instances:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as instâncias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const createInstance = async (nome: string, instanceName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "create_instance", nome, instanceName },
      });

      if (error) throw error;

      toast({
        title: "Instância criada",
        description: "Escaneie o QR Code para conectar",
      });

      await fetchInstances();
      return data;
    } catch (error: unknown) {
      console.error("Error creating instance:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a instância",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getQRCode = async (instanceName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "get_qrcode", instanceName },
      });

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error("Error getting QR code:", error);
      throw error;
    }
  };

  const checkConnectionState = async (instanceName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "connection_state", instanceName },
      });

      if (error) throw error;
      await fetchInstances();
      return data;
    } catch (error: unknown) {
      console.error("Error checking connection:", error);
      throw error;
    }
  };

  const deleteInstance = async (instanceName: string) => {
    try {
      const { error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "delete_instance", instanceName },
      });

      if (error) throw error;

      toast({
        title: "Instância removida",
        description: "A instância foi removida com sucesso",
      });

      await fetchInstances();
    } catch (error: unknown) {
      console.error("Error deleting instance:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a instância",
        variant: "destructive",
      });
    }
  };

  return {
    instances,
    loading,
    fetchInstances,
    createInstance,
    getQRCode,
    checkConnectionState,
    deleteInstance,
  };
}

export function useWhatsAppConversas(instanceId: string | null) {
  const [conversas, setConversas] = useState<WhatsAppConversa[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConversas = useCallback(async () => {
    if (!instanceId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_conversas")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, foto_url)
        `)
        .eq("instance_id", instanceId)
        .order("ultima_mensagem_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversas(data || []);
    } catch (error: unknown) {
      console.error("Error fetching conversas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [instanceId, toast]);

  useEffect(() => {
    fetchConversas();
  }, [fetchConversas]);

  const syncChats = async (instanceName: string) => {
    try {
      const { data: chats, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "fetch_chats", instanceName },
      });

      if (error) throw error;

      if (Array.isArray(chats)) {
        await supabase.functions.invoke("whatsapp-evolution", {
          body: { action: "sync_chats", instanceId, chats },
        });
      }

      await fetchConversas();
      toast({
        title: "Sincronizado",
        description: "Conversas sincronizadas com sucesso",
      });
    } catch (error: unknown) {
      console.error("Error syncing chats:", error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar conversas",
        variant: "destructive",
      });
    }
  };

  return {
    conversas,
    loading,
    fetchConversas,
    syncChats,
  };
}

export function useWhatsAppMensagens(conversaId: string | null) {
  const [mensagens, setMensagens] = useState<WhatsAppMensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMensagens = useCallback(async () => {
    if (!conversaId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_mensagens")
        .select("*")
        .eq("conversa_id", conversaId)
        .order("timestamp_msg", { ascending: true });

      if (error) throw error;
      setMensagens(data || []);
    } catch (error: unknown) {
      console.error("Error fetching mensagens:", error);
    } finally {
      setLoading(false);
    }
  }, [conversaId]);

  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);

  const sendMessage = async (instanceName: string, remoteJid: string, message: string) => {
    try {
      const { error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "send_message", instanceName, remoteJid, message },
      });

      if (error) throw error;

      await fetchMensagens();
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
      throw error;
    }
  };

  const syncMessages = async (instanceName: string, remoteJid: string) => {
    try {
      const { data: messages, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "fetch_messages", instanceName, remoteJid },
      });

      if (error) throw error;

      if (Array.isArray(messages)) {
        await supabase.functions.invoke("whatsapp-evolution", {
          body: { action: "sync_messages", conversaId, messages },
        });
      }

      await fetchMensagens();
    } catch (error: unknown) {
      console.error("Error syncing messages:", error);
    }
  };

  return {
    mensagens,
    loading,
    fetchMensagens,
    sendMessage,
    syncMessages,
  };
}
