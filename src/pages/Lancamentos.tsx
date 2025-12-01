import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const Lancamentos = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [tipoFiltro, setTipoFiltro] = useState<string | "todos">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: "receita" as "receita" | "despesa" | "transferencia" | "ajuste",
    data: format(new Date(), "yyyy-MM-dd"),
    cliente: "",
    observacoes: "",
    valor_entrada: "",
    valor_saida: "",
    categoria_id: "",
    forma_pagamento_id: "",
    conta_financeira_id: "",
    tratamento_id: "",
    origem_id: "",
  });

  const queryClient = useQueryClient();

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos-list", startDate, endDate, tipoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("financeiro_lancamentos")
        .select(`
          *,
          financeiro_categorias(categoria_sintetica, categoria_analitica),
          financeiro_formas_pagamento(nome),
          conta_financeira:financeiro_contas!financeiro_lancamentos_conta_financeira_id_fkey(nome),
          financeiro_tratamentos(nome),
          financeiro_origens(nome)
        `)
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data", { ascending: false });

      if (tipoFiltro !== "todos") {
        query = query.eq("tipo", tipoFiltro as "receita" | "despesa" | "transferencia" | "ajuste");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_categorias")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ["formas-pagamento-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_formas_pagamento")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: contas = [] } = useQuery({
    queryKey: ["contas-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_contas")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos-ativos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_tratamentos")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: origens = [] } = useQuery({
    queryKey: ["origens-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_origens")
        .select("*")
        .eq("ativa", true);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("financeiro_lancamentos")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos-list"] });
      toast.success("Lançamento criado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar lançamento: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("financeiro_lancamentos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos-list"] });
      toast.success("Lançamento atualizado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar lançamento: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financeiro_lancamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos-list"] });
      toast.success("Lançamento excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir lançamento: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      tipo: "receita",
      data: format(new Date(), "yyyy-MM-dd"),
      cliente: "",
      observacoes: "",
      valor_entrada: "",
      valor_saida: "",
      categoria_id: "",
      forma_pagamento_id: "",
      conta_financeira_id: "",
      tratamento_id: "",
      origem_id: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const valorEntrada = formData.tipo === "receita" ? parseFloat(formData.valor_entrada) || 0 : 0;
    const valorSaida = formData.tipo === "despesa" ? parseFloat(formData.valor_saida) || 0 : 0;

    // Quando houver tratamento vinculado, calcular automaticamente custo e margem
    let quantidade = 1;
    let custo_tratamento = 0;
    let margem = 0;

    if (formData.tipo === "receita" && formData.tratamento_id) {
      const tratamentoSelecionado = tratamentos.find((t: any) => t.id === formData.tratamento_id);
      if (tratamentoSelecionado) {
        const custoUnitarioTratamento = Number(tratamentoSelecionado.custo_total || 0);
        custo_tratamento = custoUnitarioTratamento * quantidade;
        margem = valorEntrada - custo_tratamento;
      }
    }
    
    const payload = {
      tipo: formData.tipo,
      data: formData.data,
      cliente: formData.cliente || null,
      observacoes: formData.observacoes || null,
      valor_entrada: valorEntrada,
      valor_saida: valorSaida,
      categoria_id: formData.categoria_id || null,
      forma_pagamento_id: formData.forma_pagamento_id || null,
      conta_financeira_id: formData.conta_financeira_id || null,
      tratamento_id: formData.tratamento_id || null,
      origem_id: formData.origem_id || null,
      quantidade: formData.tipo === "receita" ? quantidade : null,
      custo_tratamento: formData.tipo === "receita" ? custo_tratamento : 0,
      margem: formData.tipo === "receita" ? margem : 0,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      // Include user_id on insert
      createMutation.mutate({ ...payload, user_id: user.id });
    }
  };

  const handleEdit = (lanc: any) => {
    setEditingId(lanc.id);
    setFormData({
      tipo: lanc.tipo,
      data: lanc.data,
      cliente: lanc.cliente || "",
      observacoes: lanc.observacoes || "",
      valor_entrada: lanc.valor_entrada?.toString() || "",
      valor_saida: lanc.valor_saida?.toString() || "",
      categoria_id: lanc.categoria_id || "",
      forma_pagamento_id: lanc.forma_pagamento_id || "",
      conta_financeira_id: lanc.conta_financeira_id || "",
      tratamento_id: lanc.tratamento_id || "",
      origem_id: lanc.origem_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "receita": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200";
      case "despesa": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200";
      case "transferencia": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lançamentos Financeiros</h1>
          <p className="text-muted-foreground">Gerencie todas as movimentações financeiras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Novo"} Lançamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Cliente/Descrição</Label>
                <Input
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nome do cliente ou descrição"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.tipo === "receita" && (
                  <div>
                    <Label>Valor Entrada *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_entrada}
                      onChange={(e) => setFormData({ ...formData, valor_entrada: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}
                {formData.tipo === "despesa" && (
                  <div>
                    <Label>Valor Saída *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_saida}
                      onChange={(e) => setFormData({ ...formData, valor_saida: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.categoria_id} onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoria_sintetica}
                          {cat.categoria_analitica && (
                            <span className="text-muted-foreground"> → {cat.categoria_analitica}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={formData.forma_pagamento_id} onValueChange={(value) => setFormData({ ...formData, forma_pagamento_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map((fp: any) => (
                        <SelectItem key={fp.id} value={fp.id}>
                          {fp.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conta Financeira</Label>
                  <Select value={formData.conta_financeira_id} onValueChange={(value) => setFormData({ ...formData, conta_financeira_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta: any) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.tipo === "receita" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tratamento</Label>
                      <Select 
                        value={formData.tratamento_id} 
                        onValueChange={(value) => {
                          const tratamentoSelecionado = tratamentos.find((t: any) => t.id === value);
                          setFormData({ 
                            ...formData, 
                            tratamento_id: value,
                            valor_entrada: tratamentoSelecionado?.preco_venda?.toString() || formData.valor_entrada
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {tratamentos.map((trat: any) => (
                            <SelectItem key={trat.id} value={trat.id}>
                              {trat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Origem</Label>
                      <Select value={formData.origem_id} onValueChange={(value) => setFormData({ ...formData, origem_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {origens.map((orig: any) => (
                            <SelectItem key={orig.id} value={orig.id}>
                              {orig.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.tratamento_id && formData.valor_entrada && (
                    <Card className="bg-muted/50 border-primary/20">
                      <CardContent className="pt-4 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Cálculo Automático</p>
                        {(() => {
                          const tratamentoSelecionado = tratamentos.find((t: any) => t.id === formData.tratamento_id);
                          const valorEntrada = parseFloat(formData.valor_entrada) || 0;
                          const custoTratamento = tratamentoSelecionado ? Number(tratamentoSelecionado.custo_total || 0) : 0;
                          const margem = valorEntrada - custoTratamento;
                          const margemPercentual = valorEntrada > 0 ? (margem / valorEntrada) * 100 : 0;

                          return (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Custo do Tratamento</p>
                                <p className="text-lg font-semibold text-foreground">
                                  {custoTratamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Margem Bruta</p>
                                <p className={`text-lg font-semibold ${margem >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {margem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Margem %</p>
                                <p className={`text-lg font-semibold ${margemPercentual >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {margemPercentual.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"} Lançamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Forma Pgto</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum lançamento encontrado no período
                  </TableCell>
                </TableRow>
              ) : (
                lancamentos.map((lanc: any) => (
                  <TableRow key={lanc.id} className="hover:bg-muted/50">
                    <TableCell>{format(new Date(lanc.data), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(lanc.tipo)}>
                        {lanc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {lanc.cliente || lanc.observacoes || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_tratamentos?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_categorias?.categoria_sintetica || "-"}
                      {lanc.financeiro_categorias?.categoria_analitica && (
                        <span className="text-xs block">↳ {lanc.financeiro_categorias.categoria_analitica}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_formas_pagamento?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.conta_financeira?.nome || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${lanc.tipo === 'receita' ? 'text-green-600' : 'text-destructive'}`}>
                      {lanc.tipo === 'receita' ? '+' : '-'}{formatCurrency(Number(lanc.valor_entrada || lanc.valor_saida || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(lanc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lanc.id)}>
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
    </div>
  );
};

export default Lancamentos;
