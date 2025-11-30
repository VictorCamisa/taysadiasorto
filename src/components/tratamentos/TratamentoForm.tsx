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
    preco_venda: 0,
    custo_operacional: 0,
    tempo_execucao_minutos: 0,
    profissional_executor: "",
    contraindicacoes: "",
    observacoes: "",
    ativo: true,
  });

  const [fichaTecnicaItems, setFichaTecnicaItems] = useState<any[]>([]);

  useEffect(() => {
    if (tratamento) {
      setFormData({
        grupo: tratamento.grupo || "",
        nome: tratamento.nome || "",
        preco_venda: tratamento.preco_venda || 0,
        custo_operacional: tratamento.custo_operacional || 0,
        tempo_execucao_minutos: tratamento.tempo_execucao_minutos || 0,
        profissional_executor: tratamento.profissional_executor || "",
        contraindicacoes: tratamento.contraindicacoes || "",
        observacoes: tratamento.observacoes || "",
        ativo: tratamento.ativo ?? true,
      });
      setFichaTecnicaItems(tratamento.fichaTecnica || []);
    } else {
      setFormData({
        grupo: "",
        nome: "",
        preco_venda: 0,
        custo_operacional: 0,
        tempo_execucao_minutos: 0,
        profissional_executor: "",
        contraindicacoes: "",
        observacoes: "",
        ativo: true,
      });
      setFichaTecnicaItems([]);
    }
  }, [tratamento, open]);

  const calculations = calcularCustos(
    formData.preco_venda,
    formData.custo_operacional,
    fichaTecnicaItems
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...calculations,
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
                  <Label htmlFor="preco_venda">Preço de Venda *</Label>
                  <Input
                    id="preco_venda"
                    type="number"
                    step="0.01"
                    value={formData.preco_venda || ""}
                    onChange={(e) => setFormData({ ...formData, preco_venda: Number(e.target.value) })}
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
                <Label htmlFor="custo_operacional">Custo Operacional</Label>
                <Input
                  id="custo_operacional"
                  type="number"
                  step="0.01"
                  value={formData.custo_operacional || ""}
                  onChange={(e) => setFormData({ ...formData, custo_operacional: Number(e.target.value) })}
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
                  <Label htmlFor="tempo_execucao_minutos">Tempo de Execução (minutos)</Label>
                  <Input
                    id="tempo_execucao_minutos"
                    type="number"
                    value={formData.tempo_execucao_minutos || ""}
                    onChange={(e) => setFormData({ ...formData, tempo_execucao_minutos: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional_executor">Profissional Executor</Label>
                  <Input
                    id="profissional_executor"
                    value={formData.profissional_executor}
                    onChange={(e) => setFormData({ ...formData, profissional_executor: e.target.value })}
                    placeholder="Nome do profissional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindicacoes">Contraindicações</Label>
                <Textarea
                  id="contraindicacoes"
                  value={formData.contraindicacoes}
                  onChange={(e) => setFormData({ ...formData, contraindicacoes: e.target.value })}
                  placeholder="Liste as contraindicações do tratamento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={4}
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
