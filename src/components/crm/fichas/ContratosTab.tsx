import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSignature, Plus, Eye, Download, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ContratosTabProps {
  pacienteId: string;
  pacienteNome: string;
}

interface Contrato {
  id: string;
  paciente_id: string;
  titulo: string;
  tipo: string;
  descricao: string | null;
  arquivo_url: string | null;
  status: string;
  data_assinatura: string | null;
  created_at: string;
  updated_at: string;
}

const tiposContrato = [
  "Termo de Consentimento",
  "Contrato de Prestação de Serviços",
  "Termo de Responsabilidade",
  "Autorização de Imagem",
  "Outros",
];

export function ContratosTab({ pacienteId, pacienteNome }: ContratosTabProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    descricao: "",
    status: "pendente",
  });

  const { data: contratos, isLoading } = useQuery({
    queryKey: ["contratos", pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_paciente" as any)
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Contrato[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { arquivo_url?: string }) => {
      if (selectedContrato) {
        const { error } = await supabase
          .from("contratos_paciente" as any)
          .update({
            titulo: data.titulo,
            tipo: data.tipo,
            descricao: data.descricao,
            status: data.status,
          } as any)
          .eq("id", selectedContrato.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contratos_paciente" as any).insert({
          paciente_id: pacienteId,
          titulo: data.titulo,
          tipo: data.tipo,
          descricao: data.descricao,
          status: data.status,
          arquivo_url: data.arquivo_url,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos", pacienteId] });
      handleCloseForm();
      toast.success("Contrato salvo com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar contrato");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contratos_paciente" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos", pacienteId] });
      toast.success("Contrato excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir contrato");
    },
  });

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedContrato(null);
    setFormData({ titulo: "", tipo: "", descricao: "", status: "pendente" });
  };

  const handleOpenNew = () => {
    setSelectedContrato(null);
    setFormData({ titulo: "", tipo: "", descricao: "", status: "pendente" });
    setFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${pacienteId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("contratos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("contratos")
        .getPublicUrl(fileName);

      await saveMutation.mutateAsync({
        ...formData,
        arquivo_url: urlData.publicUrl,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendente: { label: "Pendente", variant: "secondary" },
      assinado: { label: "Assinado", variant: "default" },
      cancelado: { label: "Cancelado", variant: "destructive" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {contratos && contratos.length > 0 ? (
          <div className="space-y-3">
            {contratos.map((contrato) => (
              <Card key={contrato.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileSignature className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contrato.titulo}</span>
                        {getStatusBadge(contrato.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contrato.tipo} • {formatDate(contrato.created_at)}
                      </div>
                      {contrato.descricao && (
                        <p className="text-sm text-muted-foreground">{contrato.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {contrato.arquivo_url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(contrato.arquivo_url!, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={contrato.arquivo_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(contrato.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileSignature className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum contrato cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione contratos, termos e autorizações do paciente
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedContrato ? "Editar Contrato" : "Novo Contrato"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Termo de Consentimento - Botox"
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposContrato.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Observações sobre o contrato..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="assinado">Assinado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="arquivo">Arquivo (PDF)</Label>
              <Input
                id="arquivo"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Fazendo upload...
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.titulo || !formData.tipo || saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
