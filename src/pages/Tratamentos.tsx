import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Tratamentos = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fichaTecnicaOpen, setFichaTecnicaOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTratamento, setSelectedTratamento] = useState<any>(null);
  const [formData, setFormData] = useState({
    grupo: "",
    nome: "",
    preco_venda: "",
    ativo: true,
  });

  const [fichaTecnicaForm, setFichaTecnicaForm] = useState({
    produto_id: "",
    quantidade: "",
  });

  const queryClient = useQueryClient();

  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_tratamentos")
        .select("*")
        .order("grupo", { ascending: true })
        .order("nome", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-ativos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: fichaTecnica = [] } = useQuery({
    queryKey: ["ficha-tecnica", selectedTratamento?.id],
    queryFn: async () => {
      if (!selectedTratamento?.id) return [];
      
      const { data, error } = await supabase
        .from("tratamentos_ficha_tecnica")
        .select(`
          *,
          estoque_produtos(nome, unidade_medida, custo_medio)
        `)
        .eq("tratamento_id", selectedTratamento.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTratamento?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("financeiro_tratamentos")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tratamentos-list"] });
      toast.success("Tratamento criado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar tratamento: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("financeiro_tratamentos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tratamentos-list"] });
      toast.success("Tratamento atualizado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar tratamento: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financeiro_tratamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tratamentos-list"] });
      toast.success("Tratamento excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir tratamento: " + error.message);
    },
  });

  const addItemFichaMutation = useMutation({
    mutationFn: async (data: any) => {
      // Buscar custo do produto
      const { data: produto } = await supabase
        .from("estoque_produtos")
        .select("custo_medio")
        .eq("id", data.produto_id)
        .single();

      const custoUnitario = produto?.custo_medio || 0;
      const custoTotal = custoUnitario * data.quantidade;

      const { error } = await supabase
        .from("tratamentos_ficha_tecnica")
        .insert([{
          ...data,
          custo_unitario: custoUnitario,
          custo_total: custoTotal,
        }]);
      
      if (error) throw error;
    },
    onSuccess: async () => {
      await recalcularCustoTratamento(selectedTratamento.id);
      queryClient.invalidateQueries({ queryKey: ["ficha-tecnica"] });
      queryClient.invalidateQueries({ queryKey: ["tratamentos-list"] });
      toast.success("Item adicionado à ficha técnica!");
      setFichaTecnicaForm({ produto_id: "", quantidade: "" });
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar item: " + error.message);
    },
  });

  const removeItemFichaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tratamentos_ficha_tecnica")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await recalcularCustoTratamento(selectedTratamento.id);
      queryClient.invalidateQueries({ queryKey: ["ficha-tecnica"] });
      queryClient.invalidateQueries({ queryKey: ["tratamentos-list"] });
      toast.success("Item removido da ficha técnica!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover item: " + error.message);
    },
  });

  const recalcularCustoTratamento = async (tratamentoId: string) => {
    // Buscar todos os itens da ficha técnica
    const { data: itens } = await supabase
      .from("tratamentos_ficha_tecnica")
      .select("custo_total")
      .eq("tratamento_id", tratamentoId);

    const custoTotal = itens?.reduce((acc, item) => acc + (Number(item.custo_total) || 0), 0) || 0;

    // Buscar preço de venda
    const { data: tratamento } = await supabase
      .from("financeiro_tratamentos")
      .select("preco_venda")
      .eq("id", tratamentoId)
      .single();

    const precoVenda = Number(tratamento?.preco_venda) || 0;
    const margemBruta = precoVenda - custoTotal;
    const margemContribuicao = precoVenda > 0 ? (margemBruta / precoVenda) * 100 : 0;

    // Atualizar tratamento
    await supabase
      .from("financeiro_tratamentos")
      .update({
        custo_total: custoTotal,
        margem_bruta: margemBruta,
        margem_contribuicao: margemContribuicao,
      })
      .eq("id", tratamentoId);
  };

  const resetForm = () => {
    setFormData({
      grupo: "",
      nome: "",
      preco_venda: "",
      ativo: true,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      grupo: formData.grupo,
      nome: formData.nome,
      preco_venda: parseFloat(formData.preco_venda),
      ativo: formData.ativo,
      custo_total: 0,
      margem_bruta: parseFloat(formData.preco_venda),
      margem_contribuicao: 100,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (tratamento: any) => {
    setEditingId(tratamento.id);
    setFormData({
      grupo: tratamento.grupo || "",
      nome: tratamento.nome || "",
      preco_venda: tratamento.preco_venda?.toString() || "",
      ativo: tratamento.ativo ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tratamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenFichaTecnica = (tratamento: any) => {
    setSelectedTratamento(tratamento);
    setFichaTecnicaOpen(true);
  };

  const handleAddItemFicha = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTratamento?.id || !fichaTecnicaForm.produto_id || !fichaTecnicaForm.quantidade) {
      toast.error("Preencha todos os campos");
      return;
    }

    addItemFichaMutation.mutate({
      tratamento_id: selectedTratamento.id,
      produto_id: fichaTecnicaForm.produto_id,
      quantidade: parseFloat(fichaTecnicaForm.quantidade),
    });
  };

  const getMargemColor = (margem: number) => {
    if (margem >= 50) return "text-green-600 dark:text-green-400";
    if (margem >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tratamentos</h1>
          <p className="text-muted-foreground">Gerencie os tratamentos e suas margens</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tratamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Novo"} Tratamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grupo *</Label>
                  <Input
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    placeholder="Ex: Facial, Corporal..."
                    required
                  />
                </div>
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do tratamento"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço de Venda *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="ativo" className="cursor-pointer">Tratamento Ativo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"} Tratamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Tratamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Preço Venda</TableHead>
                <TableHead className="text-right">Margem Bruta</TableHead>
                <TableHead className="text-right">Margem %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tratamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum tratamento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tratamentos.map((trat: any) => (
                  <TableRow key={trat.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{trat.grupo}</TableCell>
                    <TableCell>{trat.nome}</TableCell>
                    <TableCell className="text-right">
                      R$ {Number(trat.custo_total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      R$ {Number(trat.preco_venda || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${getMargemColor(trat.margem_contribuicao || 0)}`}>
                      R$ {Number(trat.margem_bruta || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${getMargemColor(trat.margem_contribuicao || 0)}`}>
                      {Number(trat.margem_contribuicao || 0).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={trat.ativo ? "default" : "secondary"}>
                        {trat.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenFichaTecnica(trat)}
                          title="Ficha Técnica"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(trat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(trat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sheet de Ficha Técnica */}
      <Sheet open={fichaTecnicaOpen} onOpenChange={setFichaTecnicaOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Ficha Técnica - {selectedTratamento?.nome}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Resumo de Custos */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Custo Total</p>
                    <p className="text-lg font-bold">
                      R$ {Number(selectedTratamento?.custo_total || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preço de Venda</p>
                    <p className="text-lg font-bold">
                      R$ {Number(selectedTratamento?.preco_venda || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margem Bruta</p>
                    <p className={`text-lg font-bold ${getMargemColor(selectedTratamento?.margem_contribuicao || 0)}`}>
                      R$ {Number(selectedTratamento?.margem_bruta || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margem %</p>
                    <p className={`text-lg font-bold ${getMargemColor(selectedTratamento?.margem_contribuicao || 0)}`}>
                      {Number(selectedTratamento?.margem_contribuicao || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Item */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddItemFicha} className="space-y-4">
                  <div>
                    <Label>Produto</Label>
                    <Select 
                      value={fichaTecnicaForm.produto_id} 
                      onValueChange={(value) => setFichaTecnicaForm({ ...fichaTecnicaForm, produto_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((prod: any) => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.nome} - R$ {Number(prod.custo_medio || 0).toFixed(2)}/{prod.unidade_medida}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={fichaTecnicaForm.quantidade}
                      onChange={(e) => setFichaTecnicaForm({ ...fichaTecnicaForm, quantidade: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Produtos do Tratamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fichaTecnica.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum produto adicionado
                    </p>
                  ) : (
                    fichaTecnica.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.estoque_produtos?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {Number(item.quantidade).toFixed(2)} {item.estoque_produtos?.unidade_medida} × R$ {Number(item.custo_unitario).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold">
                            R$ {Number(item.custo_total).toFixed(2)}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeItemFichaMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Tratamentos;
