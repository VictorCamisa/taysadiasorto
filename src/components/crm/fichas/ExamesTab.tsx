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
import { TestTube2, Plus, Eye, Download, Loader2, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ExamesTabProps {
  pacienteId: string;
}

interface Exame {
  id: string;
  paciente_id: string;
  nome: string;
  tipo: string;
  data_exame: string;
  laboratorio: string | null;
  resultado: string | null;
  observacoes: string | null;
  arquivo_url: string | null;
  created_at: string;
}

export function ExamesTab({ pacienteId }: ExamesTabProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
    data_exame: format(new Date(), "yyyy-MM-dd"),
    laboratorio: "",
    resultado: "",
    observacoes: "",
  });

  const { data: exames, isLoading } = useQuery({
    queryKey: ["exames", pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames_paciente")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_exame", { ascending: false });

      if (error) throw error;
      return data as Exame[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (selectedExame) {
        const { error } = await supabase
          .from("exames_paciente")
          .update(data)
          .eq("id", selectedExame.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("exames_paciente").insert({
          paciente_id: pacienteId,
          ...data,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames", pacienteId] });
      handleCloseForm();
      toast.success("Exame salvo com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar exame");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exames_paciente").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames", pacienteId] });
      toast.success("Exame excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir exame");
    },
  });

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedExame(null);
    setFormData({
      nome: "",
      tipo: "",
      data_exame: format(new Date(), "yyyy-MM-dd"),
      laboratorio: "",
      resultado: "",
      observacoes: "",
    });
  };

  const handleOpenNew = () => {
    setSelectedExame(null);
    setFormData({
      nome: "",
      tipo: "",
      data_exame: format(new Date(), "yyyy-MM-dd"),
      laboratorio: "",
      resultado: "",
      observacoes: "",
    });
    setFormOpen(true);
  };

  const handleEdit = (exame: Exame) => {
    setSelectedExame(exame);
    setFormData({
      nome: exame.nome,
      tipo: exame.tipo,
      data_exame: exame.data_exame,
      laboratorio: exame.laboratorio || "",
      resultado: exame.resultado || "",
      observacoes: exame.observacoes || "",
    });
    setFormOpen(true);
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
            Novo Exame
          </Button>
        </div>

        {exames && exames.length > 0 ? (
          <div className="space-y-3">
            {exames.map((exame) => (
              <Card key={exame.id} className="cursor-pointer hover:bg-muted/30" onClick={() => handleEdit(exame)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TestTube2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{exame.nome}</span>
                        {exame.tipo && (
                          <Badge variant="outline">{exame.tipo}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(exame.data_exame)}
                        {exame.laboratorio && ` • ${exame.laboratorio}`}
                      </div>
                      {exame.resultado && (
                        <p className="text-sm">{exame.resultado}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exame.arquivo_url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(exame.arquivo_url!, "_blank");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={exame.arquivo_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(exame.id);
                        }}
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
              <TestTube2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum exame cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Registre exames laboratoriais e de imagem
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedExame ? "Editar Exame" : "Novo Exame"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Exame</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Hemograma Completo"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: Laboratorial, Imagem"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_exame">Data do Exame</Label>
                <Input
                  id="data_exame"
                  type="date"
                  value={formData.data_exame}
                  onChange={(e) => setFormData({ ...formData, data_exame: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="laboratorio">Laboratório</Label>
                <Input
                  id="laboratorio"
                  value={formData.laboratorio}
                  onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                  placeholder="Ex: Lab XYZ"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="resultado">Resultado</Label>
              <Textarea
                id="resultado"
                value={formData.resultado}
                onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                placeholder="Descreva o resultado do exame..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.nome || saveMutation.isPending}
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
