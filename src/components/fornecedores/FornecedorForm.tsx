import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const fornecedorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  cnpj_cpf: z.string().trim().max(18, "CNPJ/CPF muito longo").optional(),
  telefone: z.string().trim().max(20, "Telefone muito longo").optional(),
  observacoes: z.string().trim().max(1000, "Observações muito longas").optional(),
  ativo: z.boolean(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  fornecedor: any | null;
}

export const FornecedorForm = ({ open, onClose, onSave, fornecedor }: FornecedorFormProps) => {
  const [formData, setFormData] = useState<FornecedorFormData>({
    nome: "",
    cnpj_cpf: "",
    telefone: "",
    observacoes: "",
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        nome: fornecedor.nome || "",
        cnpj_cpf: fornecedor.cnpj_cpf || "",
        telefone: fornecedor.telefone || "",
        observacoes: fornecedor.observacoes || "",
        ativo: fornecedor.ativo ?? true,
      });
    } else {
      setFormData({
        nome: "",
        cnpj_cpf: "",
        telefone: "",
        observacoes: "",
        ativo: true,
      });
    }
    setErrors({});
  }, [fornecedor, open]);

  const formatCNPJCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 10) {
      // (00) 0000-0000
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    } else {
      // (00) 00000-0000
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = fornecedorSchema.parse(formData);
      onSave({
        ...validatedData,
        cnpj_cpf: validatedData.cnpj_cpf || null,
        telefone: validatedData.telefone || null,
        observacoes: validatedData.observacoes || null,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informações Básicas</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={errors.nome ? "border-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={(e) => setFormData({ ...formData, cnpj_cpf: formatCNPJCPF(e.target.value) })}
                  maxLength={18}
                  className={errors.cnpj_cpf ? "border-destructive" : ""}
                />
                {errors.cnpj_cpf && (
                  <p className="text-sm text-destructive">{errors.cnpj_cpf}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contato</h3>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                maxLength={15}
                placeholder="(00) 00000-0000"
                className={errors.telefone ? "border-destructive" : ""}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Observações</h3>
            <div className="space-y-2">
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                maxLength={1000}
                className={errors.observacoes ? "border-destructive" : ""}
              />
              {errors.observacoes && (
                <p className="text-sm text-destructive">{errors.observacoes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.observacoes.length}/1000 caracteres
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Status</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Fornecedor Ativo</Label>
            </div>
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
