import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompraItensEditor } from "./CompraItensEditor";

interface CompraFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  fornecedores: any[];
  formasPagamento: any[];
  contasFinanceiras: any[];
  produtos: any[];
}

export const CompraForm = ({
  open,
  onClose,
  onSave,
  fornecedores,
  formasPagamento,
  contasFinanceiras,
  produtos,
}: CompraFormProps) => {
  const [formData, setFormData] = useState({
    numero_nf: "",
    data_compra: new Date().toISOString().split("T")[0],
    fornecedor_id: "",
    forma_pagamento_id: "",
    conta_financeira_id: "",
    observacoes: "",
  });

  const [itens, setItens] = useState<any[]>([]);

  useEffect(() => {
    if (!open) {
      setFormData({
        numero_nf: "",
        data_compra: new Date().toISOString().split("T")[0],
        fornecedor_id: "",
        forma_pagamento_id: "",
        conta_financeira_id: "",
        observacoes: "",
      });
      setItens([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) {
      alert("Adicione pelo menos um item à compra");
      return;
    }

    const valorTotal = itens.reduce((sum, item) => sum + item.valor_total, 0);

    onSave({
      ...formData,
      valor_total: valorTotal,
      fornecedor_id: formData.fornecedor_id || null,
      forma_pagamento_id: formData.forma_pagamento_id || null,
      conta_financeira_id: formData.conta_financeira_id || null,
      observacoes: formData.observacoes || null,
      itens,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Dados Principais</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="numero_nf">Nº NF</Label>
                <Input
                  id="numero_nf"
                  value={formData.numero_nf}
                  onChange={(e) => setFormData({ ...formData, numero_nf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_compra">Data da Compra *</Label>
                <Input
                  id="data_compra"
                  type="date"
                  value={formData.data_compra}
                  onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento_id}
                  onValueChange={(value) => setFormData({ ...formData, forma_pagamento_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conta_financeira">Conta Financeira</Label>
                <Select
                  value={formData.conta_financeira_id}
                  onValueChange={(value) => setFormData({ ...formData, conta_financeira_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasFinanceiras.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={1}
                />
              </div>
            </div>
          </div>

          <CompraItensEditor itens={itens} setItens={setItens} produtos={produtos} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Compra</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
