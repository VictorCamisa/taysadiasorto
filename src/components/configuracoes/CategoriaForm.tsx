import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const categoriaSchema = z.object({
  tipo: z.enum(["fixa", "variavel", "impostos", "estruturais", "comissoes", "marketing", "servicos"]),
  categoria_sintetica: z.string().trim().min(1, "Categoria Principal é obrigatória").max(100, "Categoria Principal muito longa"),
  categoria_analitica: z.string().trim().max(100, "Subcategoria muito longa").optional(),
  ativa: z.boolean(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  categoria: any | null;
}

export const CategoriaForm = ({ open, onClose, onSave, categoria }: CategoriaFormProps) => {
  const [formData, setFormData] = useState<CategoriaFormData>({
    tipo: "variavel",
    categoria_sintetica: "",
    categoria_analitica: "",
    ativa: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoria) {
      setFormData({
        tipo: categoria.tipo || "variavel",
        categoria_sintetica: categoria.categoria_sintetica || "",
        categoria_analitica: categoria.categoria_analitica || "",
        ativa: categoria.ativa ?? true,
      });
    } else {
      setFormData({
        tipo: "variavel",
        categoria_sintetica: "",
        categoria_analitica: "",
        ativa: true,
      });
    }
    setErrors({});
  }, [categoria, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = categoriaSchema.parse(formData);
      onSave({
        ...validatedData,
        categoria_analitica: validatedData.categoria_analitica || null,
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
          <DialogTitle>{categoria ? "Editar Categoria Financeira" : "Nova Categoria Financeira"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <SelectItem value="fixa">Fixa</SelectItem>
                <SelectItem value="variavel">Variável</SelectItem>
                <SelectItem value="impostos">Impostos</SelectItem>
                <SelectItem value="estruturais">Estruturais</SelectItem>
                <SelectItem value="comissoes">Comissões</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria_sintetica">Categoria Principal *</Label>
              <Input
                id="categoria_sintetica"
                placeholder="Ex.: Marketing, Insumos, Vendas..."
                value={formData.categoria_sintetica}
                onChange={(e) => setFormData({ ...formData, categoria_sintetica: e.target.value })}
                className={errors.categoria_sintetica ? "border-destructive" : ""}
              />
              {errors.categoria_sintetica && (
                <p className="text-sm text-destructive">{errors.categoria_sintetica}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria_analitica">Subcategoria <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="categoria_analitica"
                placeholder="Ex.: Facebook Ads, Agulhas, Pix..."
                value={formData.categoria_analitica}
                onChange={(e) => setFormData({ ...formData, categoria_analitica: e.target.value })}
                className={errors.categoria_analitica ? "border-destructive" : ""}
              />
              {errors.categoria_analitica && (
                <p className="text-sm text-destructive">{errors.categoria_analitica}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativa"
              checked={formData.ativa}
              onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
            />
            <Label htmlFor="ativa">Categoria Ativa</Label>
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
