import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProdutoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  produto: any | null;
  fornecedores: Array<{ id: string; nome: string }>;
}

export const ProdutoForm = ({ open, onClose, onSave, produto, fornecedores }: ProdutoFormProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    unidade_medida: "",
    fornecedor_id: "",
    custo_medio: "0",
    estoque_atual: "0",
    estoque_minimo: "0",
    lote: "",
    validade: "",
    ativo: true,
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || "",
        categoria: produto.categoria || "",
        unidade_medida: produto.unidade_medida || "",
        fornecedor_id: produto.fornecedor_id || "",
        custo_medio: produto.custo_medio?.toString() || "0",
        estoque_atual: produto.estoque_atual?.toString() || "0",
        estoque_minimo: produto.estoque_minimo?.toString() || "0",
        lote: produto.lote || "",
        validade: produto.validade || "",
        ativo: produto.ativo ?? true,
      });
    } else {
      setFormData({
        nome: "",
        categoria: "",
        unidade_medida: "",
        fornecedor_id: "",
        custo_medio: "0",
        estoque_atual: "0",
        estoque_minimo: "0",
        lote: "",
        validade: "",
        ativo: true,
      });
    }
  }, [produto, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      custo_medio: Number(formData.custo_medio),
      estoque_atual: Number(formData.estoque_atual),
      estoque_minimo: Number(formData.estoque_minimo),
      fornecedor_id: formData.fornecedor_id || null,
      lote: formData.lote || null,
      validade: formData.validade || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                <Input
                  id="unidade_medida"
                  value={formData.unidade_medida}
                  onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                  placeholder="Ex: UN, KG, ML"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Select
                  value={formData.fornecedor_id}
                  onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Estoque</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="estoque_atual">Estoque Atual *</Label>
                <Input
                  id="estoque_atual"
                  type="number"
                  step="0.01"
                  value={formData.estoque_atual}
                  onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo *</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  step="0.01"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_medio">Custo Médio</Label>
                <Input
                  id="custo_medio"
                  type="number"
                  step="0.01"
                  value={formData.custo_medio}
                  onChange={(e) => setFormData({ ...formData, custo_medio: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lote">Lote</Label>
                <Input
                  id="lote"
                  value={formData.lote}
                  onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade">Validade</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                />
              </div>
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
              <Label htmlFor="ativo">Produto Ativo</Label>
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
