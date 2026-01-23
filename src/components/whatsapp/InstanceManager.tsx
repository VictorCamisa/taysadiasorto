import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Smartphone, QrCode, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useWhatsAppInstances, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { Skeleton } from "@/components/ui/skeleton";

interface InstanceManagerProps {
  selectedInstance: WhatsAppInstance | null;
  onSelectInstance: (instance: WhatsAppInstance) => void;
}

export function InstanceManager({ selectedInstance, onSelectInstance }: InstanceManagerProps) {
  const { instances, loading, createInstance, getQRCode, checkConnectionState, deleteInstance } = useWhatsAppInstances();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState<{ base64?: string; code?: string } | null>(null);
  const [creatingInstance, setCreatingInstance] = useState(false);
  const [formData, setFormData] = useState({ nome: "", instanceName: "" });

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
      console.log("QR Code response:", data);
      
      // Handle different response formats from Evolution API
      if (data?.base64) {
        setQrData({ base64: data.base64, code: data.code || data.pairingCode });
      } else if (data?.qrcode?.base64) {
        setQrData({ base64: data.qrcode.base64, code: data.qrcode.code || data.qrcode.pairingCode });
      } else {
        console.log("No QR data in response:", data);
        setQrData({ code: "QR Code não disponível. Tente recriar a instância." });
      }

      // Poll for connection status
      const interval = setInterval(async () => {
        const state = await checkConnectionState(instance.instance_name);
        if (state?.instance?.state === "open") {
          clearInterval(interval);
          setShowQRDialog(false);
        }
      }, 5000);

      setTimeout(() => clearInterval(interval), 120000); // Stop after 2 minutes
    } catch (error) {
      console.error("Error getting QR:", error);
      setQrData({ code: "Erro ao obter QR Code. Tente novamente." });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Instâncias WhatsApp</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Nova Instância WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Instância</Label>
                <Input
                  placeholder="Ex: Atendimento Principal"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Identificador (sem espaços)</Label>
                <Input
                  placeholder="Ex: atendimento_principal"
                  value={formData.instanceName}
                  onChange={(e) => setFormData({ ...formData, instanceName: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                />
              </div>
              <Button onClick={handleCreateInstance} disabled={creatingInstance} className="w-full">
                {creatingInstance ? "Criando..." : "Criar Instância"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {instances.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma instância configurada</p>
            <p className="text-sm text-muted-foreground">Crie uma instância para conectar seu WhatsApp</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {instances.map((instance) => (
            <Card
              key={instance.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInstance?.id === instance.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelectInstance(instance)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{instance.nome}</p>
                      <p className="text-xs text-muted-foreground">{instance.instance_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={instance.status === "connected" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {instance.status === "connected" ? (
                        <Wifi className="h-3 w-3" />
                      ) : (
                        <WifiOff className="h-3 w-3" />
                      )}
                      {instance.status === "connected" ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {instance.status !== "connected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowQR(instance);
                      }}
                    >
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Code
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      checkConnectionState(instance.instance_name);
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Tem certeza que deseja remover esta instância?")) {
                        deleteInstance(instance.instance_name);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrData?.base64 ? (
              <img
                src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                alt="QR Code"
                className="w-64 h-64 rounded-lg"
              />
            ) : qrData?.code ? (
              <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-sm text-center text-muted-foreground p-4 break-all">
                  Código: {qrData.code.substring(0, 50)}...
                </p>
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos conectados &gt; Conectar aparelho
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
