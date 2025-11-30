import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const formaPagamentoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  permite_parcelamento: z.boolean(),
  ativa: z.boolean(),
});

type FormaPagamentoFormData = z.infer<typeof formaPagamentoSchema>;

interface FormaPagamentoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  formaPagamento: any | null;
}

export const FormaPagamentoForm = ({
  open,
  onClose,
  onSave,
  formaPagamento,
}: FormaPagamentoFormProps) => {
  const [formData, setFormData] = useState<FormaPagamentoFormData>({
    nome: "",
    permite_parcelamento: false,
    ativa: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formaPagamento) {
      setFormData({
        nome: formaPagamento.nome || "",
        permite_parcelamento: formaPagamento.permite_parcelamento ?? false,
        ativa: formaPagamento.ativa ?? true,
      });
    } else {
      setFormData({
        nome: "",
        permite_parcelamento: false,
        ativa: true,
      });
    }
    setErrors({});
  }, [formaPagamento, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = formaPagamentoSchema.parse(formData);
      onSave(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {formaPagamento ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={errors.nome ? "border-destructive" : ""}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="permite_parcelamento"
              checked={formData.permite_parcelamento}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, permite_parcelamento: checked })
              }
            />
            <Label htmlFor="permite_parcelamento">Permite Parcelamento</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativa"
              checked={formData.ativa}
              onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
            />
            <Label htmlFor="ativa">Forma de Pagamento Ativa</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
