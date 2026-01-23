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

export function useWhatsAppConversas(instanceId: string | null, onlyCRM: boolean = true) {
  const [conversas, setConversas] = useState<WhatsAppConversa[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConversas = useCallback(async () => {
    if (!instanceId) return;

    setLoading(true);
    try {
      let query = supabase
        .from("whatsapp_conversas")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, foto_url)
        `)
        .eq("instance_id", instanceId)
        .order("ultima_mensagem_at", { ascending: false, nullsFirst: false });

      // Se onlyCRM = true, mostrar apenas conversas com pacientes vinculados
      if (onlyCRM) {
        query = query.not("paciente_id", "is", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Deduplicar por paciente_id - manter apenas a conversa mais recente de cada paciente
      const deduplicatedData = (data || []).reduce((acc: WhatsAppConversa[], conversa) => {
        if (!conversa.paciente_id) {
          acc.push(conversa);
          return acc;
        }
        
        const existingIndex = acc.findIndex(c => c.paciente_id === conversa.paciente_id);
        if (existingIndex === -1) {
          acc.push(conversa);
        } else {
          // Manter a mais recente
          const existing = acc[existingIndex];
          const existingDate = existing.ultima_mensagem_at ? new Date(existing.ultima_mensagem_at).getTime() : 0;
          const currentDate = conversa.ultima_mensagem_at ? new Date(conversa.ultima_mensagem_at).getTime() : 0;
          if (currentDate > existingDate) {
            acc[existingIndex] = conversa;
          }
        }
        return acc;
      }, []);
      
      setConversas(deduplicatedData);
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
  }, [instanceId, onlyCRM, toast]);

  // Realtime subscription para novas conversas/atualizações
  useEffect(() => {
    if (!instanceId) return;

    fetchConversas();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`whatsapp_conversas_${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_conversas',
          filter: `instance_id=eq.${instanceId}`,
        },
        async (payload) => {
          console.log('Realtime conversa update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Nova conversa - buscar com join do paciente
            const { data: newConversa } = await supabase
              .from("whatsapp_conversas")
              .select(`
                *,
                paciente:pacientes(id, nome, telefone, foto_url)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (newConversa) {
              setConversas(prev => {
                // Evitar duplicatas por ID
                if (prev.some(c => c.id === newConversa.id)) {
                  return prev;
                }
                // Evitar duplicatas por paciente_id - substituir se for mais recente
                if (newConversa.paciente_id) {
                  const existingIndex = prev.findIndex(c => c.paciente_id === newConversa.paciente_id);
                  if (existingIndex !== -1) {
                    const existing = prev[existingIndex];
                    const existingDate = existing.ultima_mensagem_at ? new Date(existing.ultima_mensagem_at).getTime() : 0;
                    const newDate = newConversa.ultima_mensagem_at ? new Date(newConversa.ultima_mensagem_at).getTime() : 0;
                    if (newDate > existingDate) {
                      const updated = [...prev];
                      updated[existingIndex] = newConversa;
                      return updated;
                    }
                    return prev; // Manter a existente que é mais recente
                  }
                }
                return [newConversa, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            // Conversa atualizada - buscar com join
            const { data: updatedConversa } = await supabase
              .from("whatsapp_conversas")
              .select(`
                *,
                paciente:pacientes(id, nome, telefone, foto_url)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (updatedConversa) {
              setConversas(prev => {
                // Remover a conversa atualizada e também outras do mesmo paciente se for a mais recente
                let filtered = prev.filter(c => c.id !== updatedConversa.id);
                
                if (updatedConversa.paciente_id) {
                  const samePacienteConversas = filtered.filter(c => c.paciente_id === updatedConversa.paciente_id);
                  const updatedDate = updatedConversa.ultima_mensagem_at ? new Date(updatedConversa.ultima_mensagem_at).getTime() : 0;
                  
                  // Verificar se a atualizada é a mais recente do paciente
                  const isNewest = samePacienteConversas.every(c => {
                    const cDate = c.ultima_mensagem_at ? new Date(c.ultima_mensagem_at).getTime() : 0;
                    return updatedDate >= cDate;
                  });
                  
                  if (isNewest) {
                    // Remover outras conversas do mesmo paciente
                    filtered = filtered.filter(c => c.paciente_id !== updatedConversa.paciente_id);
                  } else {
                    // Não adicionar a atualizada, manter a mais recente que já existe
                    return filtered.sort((a, b) => {
                      const dateA = a.ultima_mensagem_at ? new Date(a.ultima_mensagem_at).getTime() : 0;
                      const dateB = b.ultima_mensagem_at ? new Date(b.ultima_mensagem_at).getTime() : 0;
                      return dateB - dateA;
                    });
                  }
                }
                
                return [updatedConversa, ...filtered].sort((a, b) => {
                  const dateA = a.ultima_mensagem_at ? new Date(a.ultima_mensagem_at).getTime() : 0;
                  const dateB = b.ultima_mensagem_at ? new Date(b.ultima_mensagem_at).getTime() : 0;
                  return dateB - dateA;
                });
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setConversas(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instanceId, fetchConversas]);

  const syncChats = async (instanceName: string) => {
    try {
      const { data: chats, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "fetch_chats", instanceName },
      });

      if (error) throw error;

      if (Array.isArray(chats)) {
        // Passar instanceName para poder buscar contatos e mapear LIDs
        const { data: syncResult } = await supabase.functions.invoke("whatsapp-evolution", {
          body: { action: "sync_chats", instanceId, instanceName, chats },
        });
        console.log("Sync result:", syncResult);
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

export function useWhatsAppMensagens(conversaId: string | null, instanceId?: string | null) {
  const [mensagens, setMensagens] = useState<WhatsAppMensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMensagens = useCallback(async () => {
    if (!conversaId) return;

    setLoading(true);
    try {
      // Buscar mensagens desta conversa E de conversas relacionadas pelo mesmo paciente
      let conversasIds = [conversaId];
      
      // Verificar se existe outra conversa do mesmo paciente (LID vs número)
      if (instanceId) {
        const { data: thisConversa } = await supabase
          .from("whatsapp_conversas")
          .select("paciente_id, remote_jid")
          .eq("id", conversaId)
          .single();
        
        if (thisConversa?.paciente_id) {
          // Buscar outras conversas do mesmo paciente
          const { data: relatedConversas } = await supabase
            .from("whatsapp_conversas")
            .select("id")
            .eq("paciente_id", thisConversa.paciente_id)
            .eq("instance_id", instanceId)
            .neq("id", conversaId);
          
          if (relatedConversas && relatedConversas.length > 0) {
            conversasIds = [conversaId, ...relatedConversas.map(c => c.id)];
          }
        }
      }
      
      const { data, error } = await supabase
        .from("whatsapp_mensagens")
        .select("*")
        .in("conversa_id", conversasIds)
        .order("timestamp_msg", { ascending: true });

      if (error) throw error;
      setMensagens(data || []);
    } catch (error: unknown) {
      console.error("Error fetching mensagens:", error);
    } finally {
      setLoading(false);
    }
  }, [conversaId, instanceId]);

  // Realtime subscription para novas mensagens
  useEffect(() => {
    if (!conversaId) return;

    fetchMensagens();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`whatsapp_mensagens_${conversaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_mensagens',
          filter: `conversa_id=eq.${conversaId}`,
        },
        (payload) => {
          console.log('Realtime mensagem update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMensagens(prev => {
              // Evitar duplicatas
              if (prev.some(m => m.id === payload.new.id || m.message_id === payload.new.message_id)) {
                return prev;
              }
              return [...prev, payload.new as WhatsAppMensagem];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMensagens(prev => 
              prev.map(m => m.id === payload.new.id ? payload.new as WhatsAppMensagem : m)
            );
          } else if (payload.eventType === 'DELETE') {
            setMensagens(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaId, fetchMensagens]);

  const sendMessage = async (instanceName: string, remoteJid: string, message: string) => {
    try {
      // Adicionar mensagem otimista para feedback imediato
      const optimisticMessage: WhatsAppMensagem = {
        id: `temp-${Date.now()}`,
        conversa_id: conversaId!,
        message_id: `temp-${Date.now()}`,
        from_me: true,
        conteudo: message,
        tipo: 'text',
        media_url: null,
        timestamp_msg: new Date().toISOString(),
        status: 'sending',
      };
      
      setMensagens(prev => [...prev, optimisticMessage]);

      const { data, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "send_message", instanceName, remoteJid, message, conversaId },
      });

      if (error) throw error;

      // Atualizar mensagem otimista com a real se retornada
      if (data?.messageId) {
        setMensagens(prev => prev.map(m => 
          m.id === optimisticMessage.id 
            ? { ...m, id: data.messageId, message_id: data.messageId, status: 'sent' }
            : m
        ));
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      // Remover mensagem otimista em caso de erro
      setMensagens(prev => prev.filter(m => !m.id.startsWith('temp-')));
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
      // Buscar mensagens da Evolution API
      const { data: messages, error } = await supabase.functions.invoke("whatsapp-evolution", {
        body: { action: "fetch_messages", instanceName, remoteJid },
      });

      if (error) throw error;

      console.log("Mensagens recebidas da Evolution:", messages?.length || 0);

      if (Array.isArray(messages) && messages.length > 0) {
        // Sincronizar com o banco
        const { data: syncResult, error: syncError } = await supabase.functions.invoke("whatsapp-evolution", {
          body: { action: "sync_messages", conversaId, messages },
        });

        if (syncError) throw syncError;
        console.log("Sincronização resultado:", syncResult);
      }

      // Recarregar mensagens do banco
      await fetchMensagens();
    } catch (error: unknown) {
      console.error("Error syncing messages:", error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar mensagens",
        variant: "destructive",
      });
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
