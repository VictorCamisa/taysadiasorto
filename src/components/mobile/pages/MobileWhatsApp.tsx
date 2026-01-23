import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Settings, 
  Wifi, 
  WifiOff, 
  Plus,
  QrCode,
  ChevronDown,
  RefreshCw,
  Search,
  MessageCircle,
  UserPlus,
  Send,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  Phone,
  FileText,
  X,
  Check,
  CheckCheck,
  Clock,
  Target,
  Mail,
  ArrowRight,
  User,
  Calendar,
  ExternalLink,
  AlertCircle,
  Play,
  ClipboardList
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  WhatsAppInstance, 
  WhatsAppConversa, 
  useWhatsAppInstances, 
  useWhatsAppConversas, 
  useWhatsAppMensagens 
} from "@/hooks/useWhatsAppData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  useChecklistWithProgress,
  useChecklistProgressMutations,
} from "@/components/crm/hooks/usePipelineChecklist";

// Status configurations
const STATUS_CONFIG: Record<string, { label: string; colorClass: string }> = {
  lead: { label: "Lead", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  em_negociacao: { label: "Negociação", colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  orcamento_enviado: { label: "Orçamento", colorClass: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  agendado: { label: "Agendado", colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  confirmado: { label: "Confirmado", colorClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  realizado: { label: "Realizado", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  perdido: { label: "Perdido", colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const PIPELINE_STAGES = [
  { key: "lead", label: "Lead", next: "em_negociacao" },
  { key: "em_negociacao", label: "Negociação", next: "orcamento_enviado" },
  { key: "orcamento_enviado", label: "Orçamento", next: "agendado" },
  { key: "agendado", label: "Agendado", next: "confirmado" },
  { key: "confirmado", label: "Confirmado", next: "realizado" },
  { key: "realizado", label: "Realizado", next: null },
];

interface PipelineStatus {
  paciente_id: string;
  status: string;
  tratamento_nome: string | null;
  origem_nome: string | null;
}

interface Paciente {
  id: string;
  nome: string;
  telefone: string | null;
  foto_url: string | null;
  email?: string | null;
  data_nascimento?: string | null;
  observacoes?: string | null;
  created_at?: string;
}

interface Agendamento {
  id: string;
  status: string;
  valor_previsto: number;
  data_agendamento: string | null;
  tratamento?: { nome: string } | null;
  origem?: { nome: string } | null;
}

// View states
type MobileView = "list" | "chat" | "info";

export function MobileWhatsApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Instance state
  const { instances, loading: loadingInstances, createInstance, getQRCode, checkConnectionState } = useWhatsAppInstances();
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  
  // View state
  const [currentView, setCurrentView] = useState<MobileView>("list");
  const [selectedConversa, setSelectedConversa] = useState<WhatsAppConversa | null>(null);
  
  // Dialogs
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState<{ base64?: string; code?: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ nome: "", instanceName: "" });
  const [creatingInstance, setCreatingInstance] = useState(false);

  // Auto-select first connected instance
  useEffect(() => {
    if (instances.length > 0 && !selectedInstance) {
      const connected = instances.find(i => i.status === "connected");
      setSelectedInstance(connected || instances[0]);
    }
  }, [instances, selectedInstance]);

  // Auto-select conversation based on URL params
  useEffect(() => {
    const phone = searchParams.get("phone");
    const pacienteId = searchParams.get("paciente");
    
    if ((phone || pacienteId) && instances.length > 0) {
      const connectedInstance = instances.find(i => i.status === "connected") || instances[0];
      if (connectedInstance && !selectedInstance) {
        setSelectedInstance(connectedInstance);
      }
      
      const findAndSelectConversa = async () => {
        let query = supabase.from("whatsapp_conversas").select(`
          *,
          paciente:pacientes(id, nome, telefone, foto_url)
        `);
        
        if (pacienteId) {
          query = query.eq("paciente_id", pacienteId);
        } else if (phone) {
          query = query.ilike("remote_jid", `%${phone.slice(-9)}%`);
        }
        
        const { data } = await query.limit(1).single();
        
        if (data) {
          setSelectedConversa(data);
          setCurrentView("chat");
        }
      };
      
      findAndSelectConversa();
    }
  }, [searchParams, instances, selectedInstance]);

  const handleCreateInstance = async () => {
    if (!formData.nome || !formData.instanceName) return;
    setCreatingInstance(true);
    try {
      await createInstance(formData.nome, formData.instanceName);
      setShowCreateDialog(false);
      setFormData({ nome: "", instanceName: "" });
    } finally {
      setCreatingInstance(false);
    }
  };

  const handleShowQR = async (instance: WhatsAppInstance) => {
    setQrData(null);
    setShowQRDialog(true);
    
    try {
      const data = await getQRCode(instance.instance_name);
      if (data?.base64) {
        setQrData({ base64: data.base64, code: data.code || data.pairingCode });
      } else if (data?.qrcode?.base64) {
        setQrData({ base64: data.qrcode.base64, code: data.qrcode.code });
      } else {
        setQrData({ code: "QR Code não disponível" });
      }

      const interval = setInterval(async () => {
        const state = await checkConnectionState(instance.instance_name);
        if (state?.instance?.state === "open") {
          clearInterval(interval);
          setShowQRDialog(false);
        }
      }, 5000);

      setTimeout(() => clearInterval(interval), 120000);
    } catch (error) {
      setQrData({ code: "Erro ao obter QR Code" });
    }
  };

  const handleSelectConversa = (conversa: WhatsAppConversa) => {
    setSelectedConversa(conversa);
    setCurrentView("chat");
  };

  const handleBack = () => {
    if (currentView === "info") {
      setCurrentView("chat");
    } else if (currentView === "chat") {
      setCurrentView("list");
      setSelectedConversa(null);
    } else {
      navigate(-1);
    }
  };

  const connectedInstance = selectedInstance?.status === "connected";

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Render current view */}
      {currentView === "list" && (
        <MobileChatList
          instance={selectedInstance}
          instances={instances}
          onSelectInstance={setSelectedInstance}
          onSelectConversa={handleSelectConversa}
          onBack={() => navigate("/crm/pipeline")}
          onShowQR={handleShowQR}
          onShowCreate={() => setShowCreateDialog(true)}
          connectedInstance={connectedInstance}
        />
      )}
      
      {currentView === "chat" && selectedConversa && (
        <MobileChatWindow
          instance={selectedInstance}
          conversa={selectedConversa}
          onBack={handleBack}
          onShowInfo={() => setCurrentView("info")}
        />
      )}
      
      {currentView === "info" && selectedConversa && (
        <MobilePatientInfo
          conversa={selectedConversa}
          onBack={handleBack}
        />
      )}

      {/* Create Instance Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[90vw] max-w-md rounded-xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nova Instância WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Instância</Label>
              <Input
                placeholder="Ex: Atendimento Principal"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Identificador (sem espaços)</Label>
              <Input
                placeholder="Ex: atendimento_principal"
                value={formData.instanceName}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  instanceName: e.target.value.replace(/\s/g, "_").toLowerCase() 
                })}
              />
            </div>
            <Button 
              onClick={handleCreateInstance} 
              disabled={creatingInstance} 
              className="w-full"
            >
              {creatingInstance ? "Criando..." : "Criar Instância"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="w-[90vw] max-w-sm rounded-xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-center">Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrData?.base64 ? (
              <div className="p-4 bg-white rounded-xl">
                <img
                  src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-xl">
                <div className="animate-pulse text-muted-foreground text-sm text-center px-4">
                  Carregando QR Code...
                </div>
              </div>
            )}
            <div className="mt-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">1. Abra o WhatsApp no celular</p>
              <p className="text-xs text-muted-foreground">2. Aparelhos conectados</p>
              <p className="text-xs text-muted-foreground">3. Escaneie o código</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= MOBILE CHAT LIST =============
interface MobileChatListProps {
  instance: WhatsAppInstance | null;
  instances: WhatsAppInstance[];
  onSelectInstance: (instance: WhatsAppInstance) => void;
  onSelectConversa: (conversa: WhatsAppConversa) => void;
  onBack: () => void;
  onShowQR: (instance: WhatsAppInstance) => void;
  onShowCreate: () => void;
  connectedInstance: boolean;
}

function MobileChatList({
  instance,
  instances,
  onSelectInstance,
  onSelectConversa,
  onBack,
  onShowQR,
  onShowCreate,
  connectedInstance,
}: MobileChatListProps) {
  const { conversas, loading, syncChats } = useWhatsAppConversas(instance?.id || null, true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [pipelineStatuses, setPipelineStatuses] = useState<Map<string, PipelineStatus>>(new Map());
  const [showInstanceSheet, setShowInstanceSheet] = useState(false);

  // Fetch pipeline status for all patients
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

  const filteredConversas = conversas.filter((c) =>
    (c.nome_contato || c.remote_jid).toLowerCase().includes(search.toLowerCase()) ||
    c.paciente?.nome?.toLowerCase().includes(search.toLowerCase())
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

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
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

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Instance selector */}
            <Sheet open={showInstanceSheet} onOpenChange={setShowInstanceSheet}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    connectedInstance ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {instance?.nome || "Selecionar"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Instâncias WhatsApp</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-2">
                  {instances.map((inst) => (
                    <Button
                      key={inst.id}
                      variant={inst.id === instance?.id ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        onSelectInstance(inst);
                        setShowInstanceSheet(false);
                      }}
                    >
                      {inst.status === "connected" ? (
                        <Wifi className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="flex-1 text-left">{inst.nome}</span>
                      {inst.status !== "connected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInstanceSheet(false);
                            onShowQR(inst);
                          }}
                        >
                          <QrCode className="h-3 w-3 mr-1" />
                          QR
                        </Button>
                      )}
                    </Button>
                  ))}
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setShowInstanceSheet(false);
                      onShowCreate();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Nova instância
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-20 h-10 bg-muted/50 border-0 rounded-full"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1">
        {!instance ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nenhuma instância</h3>
            <p className="text-sm text-muted-foreground">
              Selecione ou crie uma instância WhatsApp
            </p>
          </div>
        ) : instance.status !== "connected" ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <WifiOff className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-medium mb-1">Desconectado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Escaneie o QR Code para conectar
            </p>
            <Button onClick={() => onShowQR(instance)} className="gap-2">
              <QrCode className="h-4 w-4" />
              Conectar
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-1 p-2">
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
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhum paciente encontrado" : "Nenhuma conversa ainda"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredConversas.map((conversa) => {
              const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
              const pipelineStatus = conversa.paciente_id ? pipelineStatuses.get(conversa.paciente_id) : null;
              const statusConfig = pipelineStatus ? STATUS_CONFIG[pipelineStatus.status] : null;
              
              return (
                <div
                  key={conversa.id}
                  className="flex items-center gap-3 px-4 py-3 active:bg-muted/50"
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
                    
                    {statusConfig && (
                      <div className="flex items-center gap-1.5 mt-0.5">
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
                    )}
                    
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
    </>
  );
}

// ============= MOBILE CHAT WINDOW =============
interface MobileChatWindowProps {
  instance: WhatsAppInstance | null;
  conversa: WhatsAppConversa;
  onBack: () => void;
  onShowInfo: () => void;
}

function MobileChatWindow({ instance, conversa, onBack, onShowInfo }: MobileChatWindowProps) {
  const { mensagens, loading, sendMessage, syncMessages } = useWhatsAppMensagens(
    conversa.id, 
    conversa.instance_id
  );
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  useEffect(() => {
    if (instance && conversa) {
      syncMessages(instance.instance_name, conversa.remote_jid);
    }
  }, [conversa.id, instance?.instance_name]);

  const handleSend = async () => {
    if (!newMessage.trim() || !instance) return;

    setSending(true);
    try {
      await sendMessage(instance.instance_name, conversa.remote_jid, newMessage);
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const groupMessagesByDate = (messages: typeof mensagens) => {
    const groups: { date: string; messages: typeof mensagens }[] = [];
    let currentDate = "";
    
    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.timestamp_msg), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Hoje";
    }
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Ontem";
    }
    return format(date, "d 'de' MMM", { locale: ptBR });
  };

  const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
  const messageGroups = groupMessagesByDate(mensagens);

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b safe-area-top">
        <div className="flex items-center justify-between px-2 h-14">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={onShowInfo}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {conversa.paciente ? "Paciente vinculado" : "Contato WhatsApp"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onShowInfo}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-muted/20">
        <div className="px-3 py-3 min-h-full">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messageGroups.map((group) => (
                <div key={group.date}>
                  <div className="flex justify-center my-3">
                    <span className="px-3 py-1 text-[11px] rounded-lg bg-card text-muted-foreground shadow-sm">
                      {formatDateLabel(group.date)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {group.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn("flex", msg.from_me ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm relative",
                            msg.from_me
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-card text-card-foreground rounded-tl-sm"
                          )}
                        >
                          {msg.media_url && msg.tipo === "image" && (
                            <img
                              src={msg.media_url}
                              alt="Imagem"
                              className="rounded max-w-full mb-2"
                            />
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words pr-10">
                            {msg.conteudo}
                          </p>
                          <div className={cn(
                            "absolute bottom-1.5 right-2 flex items-center gap-1",
                            msg.from_me ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            <span className="text-[10px]">
                              {format(new Date(msg.timestamp_msg), "HH:mm")}
                            </span>
                            {msg.from_me && (
                              msg.status === "read" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : msg.status === "sent" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 px-3 py-2 border-t bg-card safe-area-bottom">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-10 w-10 flex-shrink-0">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending}
            className="flex-1 h-10 bg-muted/50 border-0 rounded-full focus-visible:ring-1"
          />
          {newMessage.trim() ? (
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={sending}
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="h-10 w-10 flex-shrink-0">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ============= MOBILE PATIENT INFO =============
interface MobilePatientInfoProps {
  conversa: WhatsAppConversa;
  onBack: () => void;
}

function MobilePatientInfo({ conversa, onBack }: MobilePatientInfoProps) {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const {
    items: checklistItems,
    totalItems,
    completedItems,
    isComplete,
    progressPercent,
  } = useChecklistWithProgress(agendamento?.id, agendamento?.status);
  
  const { toggleProgress } = useChecklistProgressMutations();

  useEffect(() => {
    const fetchData = async () => {
      if (!conversa.paciente_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: pacienteData } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", conversa.paciente_id)
          .single();

        setPaciente(pacienteData);

        const { data: agendamentosData } = await supabase
          .from("crm_agendamentos")
          .select(`
            *,
            tratamento:tratamentos(nome),
            origem:origens(nome)
          `)
          .eq("paciente_id", conversa.paciente_id)
          .not("status", "in", '("perdido","realizado")')
          .order("created_at", { ascending: false })
          .limit(1);

        setAgendamento(agendamentosData?.[0] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversa.paciente_id]);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const handleToggleChecklistItem = async (itemId: string, currentState: boolean) => {
    if (!agendamento) return;
    
    try {
      await toggleProgress.mutateAsync({
        agendamentoId: agendamento.id,
        checklistItemId: itemId,
        concluido: !currentState,
      });
    } catch (error) {
      toast.error("Erro ao atualizar checklist");
    }
  };

  const handleAdvanceStage = async () => {
    if (!agendamento || !isComplete) return;

    const currentStage = PIPELINE_STAGES.find(s => s.key === agendamento.status);
    if (!currentStage?.next) return;

    setAdvancing(true);
    try {
      const { error } = await supabase
        .from("crm_agendamentos")
        .update({ status: currentStage.next })
        .eq("id", agendamento.id);

      if (error) throw error;

      setAgendamento({ ...agendamento, status: currentStage.next });
      toast.success(`Avançou para: ${STATUS_CONFIG[currentStage.next]?.label || currentStage.next}`);
    } catch (error) {
      toast.error("Erro ao avançar etapa");
    } finally {
      setAdvancing(false);
    }
  };

  const handleCreateOpportunity = async () => {
    if (!paciente) return;

    setAdvancing(true);
    try {
      const { data, error } = await supabase
        .from("crm_agendamentos")
        .insert({
          paciente_id: paciente.id,
          status: "lead",
          observacoes: "Oportunidade criada via WhatsApp",
        })
        .select(`*, tratamento:tratamentos(nome), origem:origens(nome)`)
        .single();

      if (error) throw error;
      setAgendamento(data);
      toast.success("Oportunidade criada!");
    } catch (error) {
      toast.error("Erro ao criar oportunidade");
    } finally {
      setAdvancing(false);
    }
  };

  const currentStage = PIPELINE_STAGES.find(s => s.key === agendamento?.status);
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.key === agendamento?.status);
  const nextStage = currentStage?.next ? STATUS_CONFIG[currentStage.next] : null;
  const name = conversa.paciente?.nome || conversa.nome_contato || "";

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b safe-area-top">
        <div className="flex items-center px-4 h-14">
          <Button variant="ghost" size="icon" className="h-9 w-9 mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Informações do Contato</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-muted mb-3" />
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        ) : !paciente ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Contato não vinculado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este contato ainda não está vinculado a um paciente
            </p>
            <Button variant="outline">Vincular paciente</Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Profile header */}
            <div className="flex flex-col items-center text-center py-4">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={paciente.foto_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(paciente.nome)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{paciente.nome}</h2>
              {paciente.telefone && (
                <p className="text-sm text-muted-foreground">{paciente.telefone}</p>
              )}
            </div>

            {/* Pipeline status */}
            {agendamento ? (
              <div className={cn(
                "p-4 rounded-xl border",
                STATUS_CONFIG[agendamento.status]?.colorClass || "bg-muted"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                    Estágio Atual
                  </span>
                  {agendamento.origem && (
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {agendamento.origem.nome}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {STATUS_CONFIG[agendamento.status]?.label || agendamento.status}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentStageIndex + 1}/{PIPELINE_STAGES.length}
                  </Badge>
                </div>
                
                {agendamento.tratamento && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80">
                    <FileText className="h-3 w-3" />
                    <span>{agendamento.tratamento.nome}</span>
                  </div>
                )}
                
                {agendamento.valor_previsto > 0 && (
                  <div className="mt-2 text-lg font-bold">
                    R$ {agendamento.valor_previsto.toLocaleString("pt-BR")}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Sem oportunidade ativa</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Crie uma oportunidade para acompanhar no pipeline.
                </p>
                <Button 
                  className="w-full gap-2" 
                  onClick={handleCreateOpportunity}
                  disabled={advancing}
                >
                  <Play className="h-4 w-4" />
                  Criar Oportunidade
                </Button>
              </div>
            )}

            {/* Checklist */}
            {agendamento && checklistItems.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Checklist
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completedItems}/{totalItems}
                  </span>
                </div>
                
                <Progress value={progressPercent} className="h-2 mb-4" />
                
                <div className="space-y-2">
                  {checklistItems.map((item) => {
                    const isCompleted = item.progress?.concluido || false;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-colors",
                          isCompleted ? "bg-muted/50 opacity-60" : "bg-muted/30"
                        )}
                        onClick={() => handleToggleChecklistItem(item.id, isCompleted)}
                      >
                        <Checkbox checked={isCompleted} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", isCompleted && "line-through")}>
                            {item.titulo}
                          </p>
                          {item.descricao && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Advance button */}
            {agendamento && nextStage && (
              <Button
                className="w-full h-12 gap-2 text-base"
                disabled={!isComplete || advancing}
                onClick={handleAdvanceStage}
              >
                <ArrowRight className="h-5 w-5" />
                Avançar para {nextStage.label}
              </Button>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => navigate(`/crm/pacientes/${paciente.id}`)}
              >
                <ExternalLink className="h-4 w-4" />
                Ver Ficha
              </Button>
              
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => navigate(`/crm/pipeline`)}
              >
                <Target className="h-4 w-4" />
                Pipeline
              </Button>
              
              {paciente.telefone && (
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={() => window.open(`tel:${paciente.telefone}`, "_blank")}
                >
                  <Phone className="h-4 w-4" />
                  Ligar
                </Button>
              )}
              
              {paciente.email && (
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={() => window.open(`mailto:${paciente.email}`, "_blank")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}
            </div>

            {/* Extra info */}
            {paciente.observacoes && (
              <div className="rounded-xl border bg-card p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Observações
                </span>
                <p className="text-sm mt-2">{paciente.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

export default MobileWhatsApp;
