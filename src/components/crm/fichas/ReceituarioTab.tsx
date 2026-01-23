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
import { Pill, Plus, Loader2, Trash2, Calendar, Pencil, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ReceituarioTabProps {
  pacienteId: string;
  pacienteNome: string;
}

interface Receituario {
  id: string;
  paciente_id: string;
  data_prescricao: string;
  medicamentos: string;
  posologia: string;
  orientacoes: string | null;
  validade_dias: number | null;
  created_at: string;
}

export function ReceituarioTab({ pacienteId, pacienteNome }: ReceituarioTabProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState<Receituario | null>(null);

  const [formData, setFormData] = useState({
    data_prescricao: format(new Date(), "yyyy-MM-dd"),
    medicamentos: "",
    posologia: "",
    orientacoes: "",
    validade_dias: 30,
  });

  const { data: receitas, isLoading } = useQuery({
    queryKey: ["receituario", pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receituario_digital" as any)
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_prescricao", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Receituario[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (selectedReceita) {
        const { error } = await supabase
          .from("receituario_digital" as any)
          .update(data as any)
          .eq("id", selectedReceita.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("receituario_digital" as any).insert({
          paciente_id: pacienteId,
          ...data,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receituario", pacienteId] });
      handleCloseForm();
      toast.success("Receita salva com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar receita");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("receituario_digital" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receituario", pacienteId] });
      toast.success("Receita excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir receita");
    },
  });

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedReceita(null);
    setFormData({
      data_prescricao: format(new Date(), "yyyy-MM-dd"),
      medicamentos: "",
      posologia: "",
      orientacoes: "",
      validade_dias: 30,
    });
  };

  const handleOpenNew = () => {
    setSelectedReceita(null);
    setFormData({
      data_prescricao: format(new Date(), "yyyy-MM-dd"),
      medicamentos: "",
      posologia: "",
      orientacoes: "",
      validade_dias: 30,
    });
    setFormOpen(true);
  };

  const handleEdit = (receita: Receituario) => {
    setSelectedReceita(receita);
    setFormData({
      data_prescricao: receita.data_prescricao,
      medicamentos: receita.medicamentos,
      posologia: receita.posologia,
      orientacoes: receita.orientacoes || "",
      validade_dias: receita.validade_dias || 30,
    });
    setFormOpen(true);
  };

  const handlePrint = (receita: Receituario) => {
    const printContent = `
      <html>
        <head>
          <title>Receituário Digital</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .paciente { font-size: 16px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; margin-bottom: 5px; color: #555; }
            .content { white-space: pre-wrap; line-height: 1.6; }
            .footer { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center; }
            .data { text-align: right; margin-bottom: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Receituário Médico</h1>
          </div>
          <div class="data">${format(new Date(receita.data_prescricao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
          <div class="paciente"><strong>Paciente:</strong> ${pacienteNome}</div>
          <div class="section">
            <div class="label">Medicamentos:</div>
            <div class="content">${receita.medicamentos}</div>
          </div>
          <div class="section">
            <div class="label">Posologia:</div>
            <div class="content">${receita.posologia}</div>
          </div>
          ${receita.orientacoes ? `
          <div class="section">
            <div class="label">Orientações:</div>
            <div class="content">${receita.orientacoes}</div>
          </div>
          ` : ""}
          <div class="footer">
            <p>Validade: ${receita.validade_dias || 30} dias</p>
            <br><br>
            <p>_______________________________</p>
            <p>Assinatura e Carimbo do Profissional</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
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
            Nova Receita
          </Button>
        </div>

        {receitas && receitas.length > 0 ? (
          <div className="space-y-3">
            {receitas.map((receita) => (
              <Card key={receita.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(receita.data_prescricao)}
                        </span>
                        <Badge variant="outline">
                          Validade: {receita.validade_dias || 30} dias
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs text-muted-foreground">Medicamentos:</span>
                          <p className="text-sm whitespace-pre-wrap">{receita.medicamentos}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Posologia:</span>
                          <p className="text-sm whitespace-pre-wrap">{receita.posologia}</p>
                        </div>
                        {receita.orientacoes && (
                          <div>
                            <span className="text-xs text-muted-foreground">Orientações:</span>
                            <p className="text-sm">{receita.orientacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(receita)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(receita)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(receita.id)}
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
              <Pill className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma receita cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie prescrições digitais para o paciente
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReceita ? "Editar Receita" : "Nova Receita"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_prescricao">Data da Prescrição</Label>
                <Input
                  id="data_prescricao"
                  type="date"
                  value={formData.data_prescricao}
                  onChange={(e) => setFormData({ ...formData, data_prescricao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="validade_dias">Validade (dias)</Label>
                <Input
                  id="validade_dias"
                  type="number"
                  value={formData.validade_dias}
                  onChange={(e) => setFormData({ ...formData, validade_dias: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="medicamentos">Medicamentos</Label>
              <Textarea
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                placeholder="Liste os medicamentos prescritos..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="posologia">Posologia</Label>
              <Textarea
                id="posologia"
                value={formData.posologia}
                onChange={(e) => setFormData({ ...formData, posologia: e.target.value })}
                placeholder="Descreva a forma de uso e dosagem..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="orientacoes">Orientações Adicionais</Label>
              <Textarea
                id="orientacoes"
                value={formData.orientacoes}
                onChange={(e) => setFormData({ ...formData, orientacoes: e.target.value })}
                placeholder="Recomendações e cuidados especiais..."
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
              disabled={!formData.medicamentos || !formData.posologia || saveMutation.isPending}
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
