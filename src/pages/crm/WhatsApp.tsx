import { useState, useEffect } from "react";
import { ChatList } from "@/components/whatsapp/ChatList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { PatientPanel } from "@/components/whatsapp/PatientPanel";
import { WhatsAppInstance, WhatsAppConversa, useWhatsAppInstances } from "@/hooks/useWhatsAppData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Settings, 
  Wifi, 
  WifiOff, 
  Plus,
  QrCode,
  ChevronDown,
  User,
  X
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function WhatsApp() {
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [selectedConversa, setSelectedConversa] = useState<WhatsAppConversa | null>(null);
  const [showPatientPanel, setShowPatientPanel] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState<{ base64?: string; code?: string } | null>(null);
  const [formData, setFormData] = useState({ nome: "", instanceName: "" });
  const [creatingInstance, setCreatingInstance] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { instances, loading, createInstance, getQRCode, checkConnectionState, deleteInstance } = useWhatsAppInstances();

  // Auto-select first connected instance
  useEffect(() => {
    if (instances.length > 0 && !selectedInstance) {
      const connected = instances.find(i => i.status === "connected");
      setSelectedInstance(connected || instances[0]);
    }
  }, [instances, selectedInstance]);

  // Auto-select conversation based on URL params (from CRM lead card)
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
          setShowPatientPanel(true);
        }
      };
      
      findAndSelectConversa();
    }
  }, [searchParams, instances, selectedInstance]);

  // Show patient panel when conversa has patient
  useEffect(() => {
    if (selectedConversa?.paciente_id) {
      setShowPatientPanel(true);
    }
  }, [selectedConversa]);

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

  const connectedInstance = selectedInstance?.status === "connected";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r bg-card">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate("/crm/pipeline")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {/* Instance Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    connectedInstance ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {selectedInstance?.nome || "Selecionar"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {instances.map((instance) => (
                  <DropdownMenuItem
                    key={instance.id}
                    onClick={() => setSelectedInstance(instance)}
                    className="gap-2"
                  >
                    {instance.status === "connected" ? (
                      <Wifi className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="flex-1 truncate">{instance.nome}</span>
                    {instance.status !== "connected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstance(instance);
                          handleShowQR(instance);
                        }}
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        QR
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova instância
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            instance={selectedInstance}
            selectedConversa={selectedConversa}
            onSelectConversa={setSelectedConversa}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow 
          instance={selectedInstance} 
          conversa={selectedConversa}
          onTogglePatientPanel={() => setShowPatientPanel(!showPatientPanel)}
          showPatientPanel={showPatientPanel}
        />
      </div>

      {/* Right Panel - Patient Info */}
      {showPatientPanel && selectedConversa && (
        <div className="w-[340px] flex-shrink-0 border-l bg-card flex flex-col">
          <div className="h-14 flex items-center justify-between px-4 border-b">
            <span className="font-medium text-sm">Informações do contato</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowPatientPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PatientPanel conversa={selectedConversa} />
        </div>
      )}

      {/* Create Instance Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
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
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-center">Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrData?.base64 ? (
              <div className="p-4 bg-white rounded-xl">
                <img
                  src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                  alt="QR Code"
                  className="w-56 h-56"
                />
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-muted rounded-xl">
                <div className="animate-pulse text-muted-foreground">
                  Carregando QR Code...
                </div>
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                1. Abra o WhatsApp no celular
              </p>
              <p className="text-sm text-muted-foreground">
                2. Toque em Menu ou Configurações
              </p>
              <p className="text-sm text-muted-foreground">
                3. Toque em Aparelhos conectados
              </p>
              <p className="text-sm text-muted-foreground">
                4. Escaneie o código QR
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
