import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  Plus,
  QrCode,
  ChevronDown,
  RefreshCw,
  Search,
  Send,
  MoreVertical,
  Phone,
  Check,
  CheckCheck,
  Clock,
  User,
  ChevronRight,
  X,
  Camera,
  Mic,
  Image as ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  WhatsAppInstance, 
  WhatsAppConversa, 
  WhatsAppMensagem,
  useWhatsAppInstances, 
  useWhatsAppConversas, 
  useWhatsAppMensagens 
} from "@/hooks/useWhatsAppData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Status do pipeline - usando classes com opacidade para compatibilidade com tema
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-primary" },
  em_negociacao: { label: "Negociação", color: "bg-accent" },
  orcamento_enviado: { label: "Orçamento", color: "bg-secondary" },
  agendado: { label: "Agendado", color: "bg-muted-foreground" },
  confirmado: { label: "Confirmado", color: "bg-primary" },
  realizado: { label: "Realizado", color: "bg-primary" },
  perdido: { label: "Perdido", color: "bg-destructive" },
};

interface PipelineStatus {
  paciente_id: string;
  status: string;
  tratamento_nome: string | null;
}

type ViewState = "list" | "chat" | "profile";

export function MobileWhatsApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { instances, createInstance, getQRCode, checkConnectionState } = useWhatsAppInstances();
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [view, setView] = useState<ViewState>("list");
  const [selectedConversa, setSelectedConversa] = useState<WhatsAppConversa | null>(null);
  
  // Dialogs
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState<{ base64?: string } | null>(null);
  const [showInstanceSheet, setShowInstanceSheet] = useState(false);
  const [showNewInstanceDialog, setShowNewInstanceDialog] = useState(false);
  const [newInstanceForm, setNewInstanceForm] = useState({ nome: "", instanceName: "" });

  // Auto-select connected instance
  useEffect(() => {
    if (instances.length > 0 && !selectedInstance) {
      setSelectedInstance(instances.find(i => i.status === "connected") || instances[0]);
    }
  }, [instances, selectedInstance]);

  // URL params handling
  useEffect(() => {
    const pacienteId = searchParams.get("paciente");
    if (pacienteId && instances.length > 0) {
      const inst = instances.find(i => i.status === "connected") || instances[0];
      if (inst) {
        setSelectedInstance(inst);
        // Find conversation for this patient
        supabase
          .from("whatsapp_conversas")
          .select("*, paciente:pacientes(id, nome, telefone, foto_url)")
          .eq("paciente_id", pacienteId)
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setSelectedConversa(data);
              setView("chat");
            }
          });
      }
    }
  }, [searchParams, instances]);

  const handleShowQR = async (instance: WhatsAppInstance) => {
    setShowInstanceSheet(false);
    setQrData(null);
    setShowQRDialog(true);
    
    try {
      const data = await getQRCode(instance.instance_name);
      if (data?.base64) {
        setQrData({ base64: data.base64 });
      } else if (data?.qrcode?.base64) {
        setQrData({ base64: data.qrcode.base64 });
      }

      const interval = setInterval(async () => {
        const state = await checkConnectionState(instance.instance_name);
        if (state?.instance?.state === "open") {
          clearInterval(interval);
          setShowQRDialog(false);
        }
      }, 5000);

      setTimeout(() => clearInterval(interval), 120000);
    } catch {
      setQrData(null);
    }
  };

  const handleCreateInstance = async () => {
    if (!newInstanceForm.nome || !newInstanceForm.instanceName) return;
    await createInstance(newInstanceForm.nome, newInstanceForm.instanceName);
    setShowNewInstanceDialog(false);
    setNewInstanceForm({ nome: "", instanceName: "" });
  };

  const handleSelectConversa = (conversa: WhatsAppConversa) => {
    setSelectedConversa(conversa);
    setView("chat");
  };

  const handleBack = () => {
    if (view === "profile") {
      setView("chat");
    } else if (view === "chat") {
      setView("list");
      setSelectedConversa(null);
    } else {
      navigate(-1);
    }
  };

  const isConnected = selectedInstance?.status === "connected";

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {view === "list" && (
        <ChatListView
          instance={selectedInstance}
          instances={instances}
          isConnected={isConnected}
          onSelectConversa={handleSelectConversa}
          onBack={() => navigate("/crm/pipeline")}
          onShowInstanceSheet={() => setShowInstanceSheet(true)}
          onShowQR={handleShowQR}
          onShowNewInstance={() => setShowNewInstanceDialog(true)}
        />
      )}

      {view === "chat" && selectedConversa && (
        <ChatView
          instance={selectedInstance}
          conversa={selectedConversa}
          onBack={handleBack}
          onShowProfile={() => setView("profile")}
        />
      )}

      {view === "profile" && selectedConversa && (
        <ProfileView
          conversa={selectedConversa}
          onBack={handleBack}
        />
      )}

      {/* Instance Selector Sheet */}
      <Sheet open={showInstanceSheet} onOpenChange={setShowInstanceSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[70vh]">
          <SheetHeader className="pb-4">
            <SheetTitle>Instâncias WhatsApp</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {instances.map((inst) => (
              <button
                key={inst.id}
                onClick={() => {
                  setSelectedInstance(inst);
                  setShowInstanceSheet(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl transition-colors",
                  inst.id === selectedInstance?.id ? "bg-primary/10" : "bg-muted/50 active:bg-muted"
                )}
              >
                {inst.status === "connected" ? (
                  <Wifi className="h-5 w-5 text-primary" />
                ) : (
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="flex-1 text-left font-medium">{inst.nome}</span>
                {inst.status !== "connected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowQR(inst);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    QR
                  </Button>
                )}
              </button>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                setShowInstanceSheet(false);
                setShowNewInstanceDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="w-[85vw] max-w-xs rounded-2xl p-6" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-center">Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrData?.base64 ? (
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img
                  src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-2xl">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="mt-6 text-center space-y-1 text-sm text-muted-foreground">
              <p>1. Abra o WhatsApp no celular</p>
              <p>2. Toque em Aparelhos conectados</p>
              <p>3. Escaneie este código</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Instance Dialog */}
      <Dialog open={showNewInstanceDialog} onOpenChange={setShowNewInstanceDialog}>
        <DialogContent className="w-[85vw] max-w-sm rounded-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nova Instância</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Atendimento Principal"
                value={newInstanceForm.nome}
                onChange={(e) => setNewInstanceForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Identificador</Label>
              <Input
                placeholder="Ex: atendimento_principal"
                value={newInstanceForm.instanceName}
                onChange={(e) => setNewInstanceForm(prev => ({ 
                  ...prev, 
                  instanceName: e.target.value.replace(/\s/g, "_").toLowerCase() 
                }))}
              />
            </div>
            <Button onClick={handleCreateInstance} className="w-full">
              Criar Instância
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== CHAT LIST VIEW ==========
interface ChatListViewProps {
  instance: WhatsAppInstance | null;
  instances: WhatsAppInstance[];
  isConnected: boolean;
  onSelectConversa: (c: WhatsAppConversa) => void;
  onBack: () => void;
  onShowInstanceSheet: () => void;
  onShowQR: (i: WhatsAppInstance) => void;
  onShowNewInstance: () => void;
}

function ChatListView({
  instance,
  instances,
  isConnected,
  onSelectConversa,
  onBack,
  onShowInstanceSheet,
}: ChatListViewProps) {
  const { conversas, loading, syncChats } = useWhatsAppConversas(instance?.id || null, true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pipelineStatuses, setPipelineStatuses] = useState<Map<string, PipelineStatus>>(new Map());

  // Fetch pipeline status
  useEffect(() => {
    const pacienteIds = conversas.map(c => c.paciente_id).filter(Boolean) as string[];
    if (pacienteIds.length === 0) return;

    supabase
      .from("crm_agendamentos")
      .select("paciente_id, status, tratamento:tratamentos(nome)")
      .in("paciente_id", pacienteIds)
      .not("status", "in", '("perdido","realizado")')
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const statusMap = new Map<string, PipelineStatus>();
        (data || []).forEach((item: any) => {
          if (!statusMap.has(item.paciente_id)) {
            statusMap.set(item.paciente_id, {
              paciente_id: item.paciente_id,
              status: item.status,
              tratamento_nome: item.tratamento?.nome || null,
            });
          }
        });
        setPipelineStatuses(statusMap);
      });
  }, [conversas]);

  const filteredConversas = conversas.filter((c) => {
    if (!search) return true;
    const name = c.paciente?.nome || c.nome_contato || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSync = async () => {
    if (!instance) return;
    setSyncing(true);
    try {
      await syncChats(instance.instance_name);
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return format(d, "HH:mm");
    if (diff === 1) return "Ontem";
    if (diff < 7) return format(d, "EEE", { locale: ptBR });
    return format(d, "dd/MM");
  };

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <button 
            onClick={onShowInstanceSheet}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <div className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0",
              isConnected ? "bg-primary" : "bg-muted-foreground"
            )} />
            <span className="font-semibold truncate">{instance?.nome || "WhatsApp"}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 -mr-2"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={cn("h-5 w-5", syncing && "animate-spin")} />
          </Button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0 rounded-full"
                autoFocus
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa"}
            </p>
          </div>
        ) : (
          <div>
            {filteredConversas.map((conversa) => {
              const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
              const pipelineStatus = conversa.paciente_id ? pipelineStatuses.get(conversa.paciente_id) : null;
              const statusConfig = pipelineStatus ? STATUS_CONFIG[pipelineStatus.status] : null;
              
              return (
                <button
                  key={conversa.id}
                  onClick={() => onSelectConversa(conversa)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors border-b border-border/30"
                >
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">{name}</span>
                      <span className={cn(
                        "text-xs flex-shrink-0",
                        conversa.nao_lidas > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        {formatTime(conversa.ultima_mensagem_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {statusConfig && (
                          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusConfig.color)} />
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {conversa.ultima_mensagem || "Iniciar conversa..."}
                        </p>
                      </div>
                      {conversa.nao_lidas > 0 && (
                        <Badge className="h-5 min-w-5 rounded-full text-[11px] px-1.5 flex-shrink-0">
                          {conversa.nao_lidas > 99 ? "99+" : conversa.nao_lidas}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ========== CHAT VIEW ==========
interface ChatViewProps {
  instance: WhatsAppInstance | null;
  conversa: WhatsAppConversa;
  onBack: () => void;
  onShowProfile: () => void;
}

function ChatView({ instance, conversa, onBack, onShowProfile }: ChatViewProps) {
  const { mensagens, loading, sendMessage, syncMessages } = useWhatsAppMensagens(
    conversa.id, 
    conversa.instance_id
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Sync messages on mount
  useEffect(() => {
    if (instance) {
      syncMessages(instance.instance_name, conversa.remote_jid);
    }
  }, [conversa.id]);

  const handleSend = async () => {
    if (!message.trim() || !instance || sending) return;
    
    setSending(true);
    const msg = message;
    setMessage("");
    
    try {
      await sendMessage(instance.instance_name, conversa.remote_jid, msg);
    } catch {
      setMessage(msg);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];

  // Group messages by date
  const groupedMessages = mensagens.reduce((groups, msg) => {
    const date = format(new Date(msg.timestamp_msg), "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, WhatsAppMensagem[]>);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) return "Hoje";
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Ontem";
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <>
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b">
        <div className="flex items-center h-14 px-2 gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <button 
            onClick={onShowProfile}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold truncate text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground">
                {conversa.paciente ? "toque para ver info" : "contato"}
              </p>
            </div>
          </button>

          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 -mr-1">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-muted/30 px-3 py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 text-xs rounded-lg bg-card text-muted-foreground shadow-sm">
                    {formatDateLabel(date)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.from_me ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm",
                          msg.from_me
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card text-card-foreground rounded-bl-md"
                        )}
                      >
                        {msg.media_url && msg.tipo === "image" && (
                          <img src={msg.media_url} alt="" className="rounded-lg max-w-full mb-2" />
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.conteudo}
                        </p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          msg.from_me ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          <span className="text-[10px]">
                            {format(new Date(msg.timestamp_msg), "HH:mm")}
                          </span>
                          {msg.from_me && (
                            msg.status === "read" ? (
                              <CheckCheck className="h-3.5 w-3.5 text-primary" />
                            ) : msg.status === "delivered" || msg.status === "sent" ? (
                              <CheckCheck className="h-3.5 w-3.5" />
                            ) : msg.status === "sending" ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <footer className="flex-shrink-0 bg-card border-t px-2 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={sending}
              className="h-11 bg-muted/50 border-0 rounded-full pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          
          {message.trim() ? (
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={sending}
              className="h-11 w-11 rounded-full flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-11 w-11 flex-shrink-0">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </footer>
    </>
  );
}

// ========== PROFILE VIEW ==========
interface ProfileViewProps {
  conversa: WhatsAppConversa;
  onBack: () => void;
}

function ProfileView({ conversa, onBack }: ProfileViewProps) {
  const navigate = useNavigate();
  const [pacienteData, setPacienteData] = useState<any>(null);
  const [agendamento, setAgendamento] = useState<any>(null);

  useEffect(() => {
    if (!conversa.paciente_id) return;

    // Fetch patient details
    supabase
      .from("pacientes")
      .select("*")
      .eq("id", conversa.paciente_id)
      .single()
      .then(({ data }) => setPacienteData(data));

    // Fetch latest appointment
    supabase
      .from("crm_agendamentos")
      .select("*, tratamento:tratamentos(nome), origem:origens(nome)")
      .eq("paciente_id", conversa.paciente_id)
      .not("status", "in", '("perdido","realizado")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setAgendamento(data));
  }, [conversa.paciente_id]);

  const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
  const getInitials = (n: string) => n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
  const statusConfig = agendamento ? STATUS_CONFIG[agendamento.status] : null;

  return (
    <>
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Informações</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-8 pb-6 bg-card border-b">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{name}</h2>
          {conversa.paciente?.telefone && (
            <p className="text-muted-foreground">+55 {conversa.paciente.telefone}</p>
          )}
          {statusConfig && (
            <Badge className={cn("mt-3", statusConfig.color, "text-white")}>
              {statusConfig.label}
            </Badge>
          )}
        </div>

        {/* Info Sections */}
        <div className="divide-y divide-border">
          {/* Treatment Info */}
          {agendamento && (
            <div className="p-4 bg-card">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Oportunidade Ativa
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tratamento</span>
                  <span className="font-medium">{agendamento.tratamento?.nome || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium">
                    {agendamento.valor_previsto?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }) || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origem</span>
                  <span className="font-medium">{agendamento.origem?.nome || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Patient Info */}
          {pacienteData && (
            <div className="p-4 bg-card">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Dados do Paciente
              </h3>
              <div className="space-y-2">
                {pacienteData.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate ml-4">{pacienteData.email}</span>
                  </div>
                )}
                {pacienteData.data_nascimento && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nascimento</span>
                    <span className="font-medium">
                      {format(new Date(pacienteData.data_nascimento), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
                {pacienteData.cidade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cidade</span>
                    <span className="font-medium">{pacienteData.cidade}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {conversa.paciente_id && (
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => navigate(`/crm/pacientes/${conversa.paciente_id}`)}
              >
                <span className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  Ver Ficha Completa
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
