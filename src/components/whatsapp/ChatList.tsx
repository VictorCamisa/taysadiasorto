import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Search, MessageCircle, Plus, UserPlus, Target } from "lucide-react";
import { useWhatsAppConversas, WhatsAppConversa, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Paciente {
  id: string;
  nome: string;
  telefone: string | null;
  foto_url: string | null;
}

interface PipelineStatus {
  paciente_id: string;
  status: string;
  tratamento_nome: string | null;
  origem_nome: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; colorClass: string }> = {
  lead: { label: "Lead", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  em_negociacao: { label: "Negociação", colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  orcamento_enviado: { label: "Orçamento", colorClass: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  agendado: { label: "Agendado", colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  confirmado: { label: "Confirmado", colorClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  realizado: { label: "Realizado", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  perdido: { label: "Perdido", colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
};

interface ChatListProps {
  instance: WhatsAppInstance | null;
  selectedConversa: WhatsAppConversa | null;
  onSelectConversa: (conversa: WhatsAppConversa) => void;
}

export function ChatList({ instance, selectedConversa, onSelectConversa }: ChatListProps) {
  // Mostrar apenas conversas com paciente vinculado (CRM)
  const { conversas, loading, syncChats } = useWhatsAppConversas(instance?.id || null, true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [pipelineStatuses, setPipelineStatuses] = useState<Map<string, PipelineStatus>>(new Map());

  // Fetch pipeline status for all patients in conversas
  useEffect(() => {
    const fetchPipelineStatuses = async () => {
      const pacienteIds = conversas
        .map(c => c.paciente_id)
        .filter((id): id is string => !!id);
      
      if (pacienteIds.length === 0) return;

      try {
        const { data } = await supabase
          .from("crm_agendamentos")
          .select(`
            paciente_id,
            status,
            tratamento:tratamentos(nome),
            origem:origens(nome)
          `)
          .in("paciente_id", pacienteIds)
          .not("status", "in", '("perdido","realizado")')
          .order("created_at", { ascending: false });

        const statusMap = new Map<string, PipelineStatus>();
        (data || []).forEach((item: any) => {
          // Keep only the most recent one per patient
          if (!statusMap.has(item.paciente_id)) {
            statusMap.set(item.paciente_id, {
              paciente_id: item.paciente_id,
              status: item.status,
              tratamento_nome: item.tratamento?.nome || null,
              origem_nome: item.origem?.nome || null,
            });
          }
        });
        setPipelineStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching pipeline statuses:", error);
      }
    };

    fetchPipelineStatuses();
  }, [conversas]);

  // Fetch pacientes com telefone que não têm conversa ativa
  const fetchPacientesDisponiveis = async () => {
    setLoadingPacientes(true);
    try {
      // Buscar pacientes com telefone
      const { data: allPacientes } = await supabase
        .from("pacientes")
        .select("id, nome, telefone, foto_url")
        .not("telefone", "is", null)
        .neq("telefone", "")
        .eq("ativo", true)
        .order("nome");

      // IDs de pacientes que já têm conversa nesta instância
      const pacientesComConversa = conversas
        .filter(c => c.paciente_id)
        .map(c => c.paciente_id);

      // Filtrar pacientes que não têm conversa
      const disponiveis = (allPacientes || []).filter(
        p => !pacientesComConversa.includes(p.id)
      );

      setPacientes(disponiveis);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
    } finally {
      setLoadingPacientes(false);
    }
  };

  useEffect(() => {
    if (showNewChatDialog) {
      fetchPacientesDisponiveis();
    }
  }, [showNewChatDialog, conversas]);

  const filteredConversas = conversas.filter((c) =>
    (c.nome_contato || c.remote_jid).toLowerCase().includes(search.toLowerCase()) ||
    c.paciente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPacientes = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(pacienteSearch.toLowerCase()) ||
    p.telefone?.includes(pacienteSearch)
  );

  const handleSync = async () => {
    if (!instance) return;
    setSyncing(true);
    try {
      await syncChats(instance.instance_name);
    } finally {
      setSyncing(false);
    }
  };

  const handleStartChat = async (paciente: Paciente) => {
    if (!instance || !paciente.telefone) return;

    // Formatar telefone para remote_jid do WhatsApp
    const phone = paciente.telefone.replace(/\D/g, "");
    const remoteJid = `${phone}@s.whatsapp.net`;

    try {
      // Verificar se já existe uma conversa com esse telefone
      const { data: existingConversa } = await supabase
        .from("whatsapp_conversas")
        .select("*")
        .eq("instance_id", instance.id)
        .ilike("remote_jid", `%${phone.slice(-9)}%`)
        .single();

      if (existingConversa) {
        // Vincular paciente à conversa existente se não estiver vinculado
        if (!existingConversa.paciente_id) {
          await supabase
            .from("whatsapp_conversas")
            .update({ paciente_id: paciente.id, nome_contato: paciente.nome })
            .eq("id", existingConversa.id);
        }
        
        // Buscar conversa atualizada
        const { data: updatedConversa } = await supabase
          .from("whatsapp_conversas")
          .select(`*, paciente:pacientes(id, nome, telefone, foto_url)`)
          .eq("id", existingConversa.id)
          .single();
        
        if (updatedConversa) {
          onSelectConversa(updatedConversa);
        }
      } else {
        // Criar nova conversa
        const { data: newConversa, error } = await supabase
          .from("whatsapp_conversas")
          .insert({
            instance_id: instance.id,
            paciente_id: paciente.id,
            remote_jid: remoteJid,
            nome_contato: paciente.nome,
            foto_url: paciente.foto_url,
          })
          .select(`*, paciente:pacientes(id, nome, telefone, foto_url)`)
          .single();

        if (error) throw error;
        if (newConversa) {
          onSelectConversa(newConversa);
        }
      }

      setShowNewChatDialog(false);
      setPacienteSearch("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatTime = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Ontem";
    } else if (diffDays < 7) {
      return d.toLocaleDateString("pt-BR", { weekday: "short" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!instance) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">Nenhuma instância selecionada</h3>
        <p className="text-sm text-muted-foreground">
          Selecione ou crie uma instância WhatsApp
        </p>
      </div>
    );
  }

  if (instance.status !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="font-medium text-foreground mb-1">WhatsApp desconectado</h3>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code para conectar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + New Chat Button */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-16 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-8 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowNewChatDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations - Only CRM Patients */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-3">
              {search 
                ? "Nenhum paciente encontrado" 
                : "Nenhuma conversa com pacientes ainda"
              }
            </p>
            {!search && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewChatDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Iniciar conversa
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversas.map((conversa) => {
              const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
              const isSelected = selectedConversa?.id === conversa.id;
              const pipelineStatus = conversa.paciente_id ? pipelineStatuses.get(conversa.paciente_id) : null;
              const statusConfig = pipelineStatus ? STATUS_CONFIG[pipelineStatus.status] : null;
              
              return (
                <div
                  key={conversa.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => onSelectConversa(conversa)}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{name}</span>
                      <span className={cn(
                        "text-xs flex-shrink-0",
                        conversa.nao_lidas > 0 ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {formatTime(conversa.ultima_mensagem_at)}
                      </span>
                    </div>
                    
                    {/* Pipeline Status Badge ou indicador sem paciente */}
                    {statusConfig ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] px-1.5 py-0 h-4 font-normal border", statusConfig.colorClass)}
                        >
                          {statusConfig.label}
                        </Badge>
                        {pipelineStatus?.tratamento_nome && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            • {pipelineStatus.tratamento_nome}
                          </span>
                        )}
                      </div>
                    ) : !conversa.paciente_id ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 h-4 font-normal border border-muted-foreground/30 text-muted-foreground"
                        >
                          Sem paciente vinculado
                        </Badge>
                      </div>
                    ) : null}
                    
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {conversa.ultima_mensagem || "Iniciar conversa..."}
                      </p>
                      {conversa.nao_lidas > 0 && (
                        <Badge className="h-5 min-w-5 rounded-full text-xs px-1.5 flex-shrink-0">
                          {conversa.nao_lidas > 99 ? "99+" : conversa.nao_lidas}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* New Chat Dialog - Select Patient from CRM */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nova Conversa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nome ou telefone..."
                value={pacienteSearch}
                onChange={(e) => setPacienteSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[300px]">
              {loadingPacientes ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPacientes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {pacienteSearch 
                      ? "Nenhum paciente encontrado" 
                      : "Todos os pacientes já têm conversa"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPacientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleStartChat(paciente)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={paciente.foto_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(paciente.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{paciente.nome}</p>
                        <p className="text-xs text-muted-foreground">{paciente.telefone}</p>
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
