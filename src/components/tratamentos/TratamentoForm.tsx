import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    grupo: "",
    nome: "",
    preco: 0,
    custo_estimado: 0,
    duracao_minutos: 60,
    descricao: "",
    ativo: true,
  });

  const [fichaTecnicaItems, setFichaTecnicaItems] = useState<any[]>([]);

  useEffect(() => {
    if (tratamento) {
      setFormData({
        grupo: tratamento.grupo || "",
        nome: tratamento.nome || "",
        preco: tratamento.preco || 0,
        custo_estimado: tratamento.custo_estimado || 0,
        duracao_minutos: tratamento.duracao_minutos || 60,
        descricao: tratamento.descricao || "",
        ativo: tratamento.ativo ?? true,
      });
      setFichaTecnicaItems(tratamento.fichaTecnica || []);
    } else {
      setFormData({
        grupo: "",
        nome: "",
        preco: 0,
        custo_estimado: 0,
        duracao_minutos: 60,
        descricao: "",
        ativo: true,
      });
      setFichaTecnicaItems([]);
    }
  }, [tratamento, open]);

  const calculations = calcularCustos(
    formData.preco,
    formData.custo_estimado,
    fichaTecnicaItems
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Passar os campos com nomes corretos do banco
    onSave({
      ...formData,
      custo_estimado: calculations.custo_total, // Atualizar custo_estimado com o custo total calculado
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="custos">Custos</TabsTrigger>
              <TabsTrigger value="tecnico">Técnico</TabsTrigger>
              <TabsTrigger value="ficha">Ficha Técnica</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo *</Label>
                  <Input
                    id="grupo"
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    placeholder="Ex: Facial, Corporal"
                    required
                  />
                </div>

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
                  <Label htmlFor="preco">Preço de Venda *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco || ""}
                    onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-8">
                  <Label htmlFor="ativo">Tratamento Ativo</Label>
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
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

            <TabsContent value="tecnico" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duracao_minutos">Tempo de Execução (minutos)</Label>
                  <Input
                    id="duracao_minutos"
                    type="number"
                    value={formData.duracao_minutos || ""}
                    onChange={(e) => setFormData({ ...formData, duracao_minutos: Number(e.target.value) })}
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do tratamento, contraindicações, observações..."
                  rows={6}
                />
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
