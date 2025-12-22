import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FichaTecnicaEditor } from "./FichaTecnicaEditor";
import { useTratamentoCalculations } from "./hooks/useTratamentoCalculations";

interface TratamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tratamento?: any;
  produtos: any[];
  onSave: (data: any) => void;
}

export const TratamentoForm = ({ open, onOpenChange, tratamento, produtos, onSave }: TratamentoFormProps) => {
  const { calcularCustos, getMargemColor } = useTratamentoCalculations();
  
  const [formData, setFormData] = useState({
    nome: "",
    preco_padrao: 0,
    custo_estimado: 0,
    descricao: "",
  });

  const [fichaTecnicaItems, setFichaTecnicaItems] = useState<any[]>([]);

  useEffect(() => {
    if (tratamento) {
      setFormData({
        nome: tratamento.nome || "",
        preco_padrao: tratamento.preco_padrao || tratamento.preco || 0,
        custo_estimado: tratamento.custo_estimado || 0,
        descricao: tratamento.descricao || "",
      });
      setFichaTecnicaItems(tratamento.fichaTecnica || []);
    } else {
      setFormData({
        nome: "",
        preco_padrao: 0,
        custo_estimado: 0,
        descricao: "",
      });
      setFichaTecnicaItems([]);
    }
  }, [tratamento, open]);

  const calculations = calcularCustos(
    formData.preco_padrao,
    formData.custo_estimado,
    fichaTecnicaItems
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      custo_estimado: calculations.custo_total,
      fichaTecnica: fichaTecnicaItems,
    });
  };

  const handleAddItem = (item: any) => {
    const produto = produtos.find(p => p.id === item.produto_id);
    setFichaTecnicaItems([...fichaTecnicaItems, { ...item, produto }]);
  };

  const handleRemoveItem = (index: number) => {
    setFichaTecnicaItems(fichaTecnicaItems.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tratamento ? "Editar Tratamento" : "Novo Tratamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="custos">Custos</TabsTrigger>
              <TabsTrigger value="ficha">Ficha Técnica</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Tratamento *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Limpeza de Pele"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_padrao">Preço de Venda *</Label>
                  <Input
                    id="preco_padrao"
                    type="number"
                    step="0.01"
                    value={formData.preco_padrao || ""}
                    onChange={(e) => setFormData({ ...formData, preco_padrao: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do tratamento..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custos" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custo_estimado">Custo Operacional</Label>
                <Input
                  id="custo_estimado"
                  type="number"
                  step="0.01"
                  value={formData.custo_estimado || ""}
                  onChange={(e) => setFormData({ ...formData, custo_estimado: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Custo Total</p>
                      <p className="text-2xl font-bold">
                        {calculations.custo_total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Operacional + Ficha Técnica
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lucro por Sessão</p>
                      <p className="text-2xl font-bold">
                        {calculations.lucro_sessao.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Preço - Custo Total
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Margem Bruta</p>
                      <p className="text-2xl font-bold">
                        {calculations.margem_bruta.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Margem de Contribuição</p>
                      <p className={`text-2xl font-bold ${getMargemColor(calculations.margem_contribuicao)}`}>
                        {calculations.margem_contribuicao.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ficha" className="space-y-4">
              <FichaTecnicaEditor
                items={fichaTecnicaItems}
                produtos={produtos}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {tratamento ? "Salvar Alterações" : "Criar Tratamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};