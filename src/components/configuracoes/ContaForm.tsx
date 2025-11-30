import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const contaSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  tipo: z.enum(["caixa_fisico", "conta_bancaria", "cartao", "conta_socio"]),
  saldo_inicial: z.number().min(0, "Saldo inicial não pode ser negativo"),
  ativa: z.boolean(),
});

type ContaFormData = z.infer<typeof contaSchema>;

interface ContaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  conta: any | null;
}

export const ContaForm = ({ open, onClose, onSave, conta }: ContaFormProps) => {
  const [formData, setFormData] = useState<ContaFormData>({
    nome: "",
    tipo: "conta_bancaria",
    saldo_inicial: 0,
    ativa: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (conta) {
      setFormData({
        nome: conta.nome || "",
        tipo: conta.tipo || "conta_bancaria",
        saldo_inicial: Number(conta.saldo_inicial) || 0,
        ativa: conta.ativa ?? true,
      });
    } else {
      setFormData({
        nome: "",
        tipo: "conta_bancaria",
        saldo_inicial: 0,
        ativa: true,
      });
    }
    setErrors({});
  }, [conta, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = contaSchema.parse(formData);
      onSave({
        ...validatedData,
        saldo_atual: conta ? conta.saldo_atual : validatedData.saldo_inicial,
      });
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
          <DialogTitle>{conta ? "Editar Conta" : "Nova Conta"}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger className={errors.tipo ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caixa_fisico">Caixa Físico</SelectItem>
                <SelectItem value="conta_bancaria">Conta Bancária</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="conta_socio">Conta Sócio</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo_inicial">Saldo Inicial</Label>
            <Input
              id="saldo_inicial"
              type="number"
              step="0.01"
              value={formData.saldo_inicial}
              onChange={(e) => setFormData({ ...formData, saldo_inicial: Number(e.target.value) })}
              className={errors.saldo_inicial ? "border-destructive" : ""}
              disabled={!!conta}
            />
            {errors.saldo_inicial && (
              <p className="text-sm text-destructive">{errors.saldo_inicial}</p>
            )}
            {conta && (
              <p className="text-xs text-muted-foreground">
                Saldo atual não pode ser editado aqui
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativa"
              checked={formData.ativa}
              onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
            />
            <Label htmlFor="ativa">Conta Ativa</Label>
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
