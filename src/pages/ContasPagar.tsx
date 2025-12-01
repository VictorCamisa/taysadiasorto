import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, CheckCircle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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

const ContasPagar = () => {
  const { user } = useAuth();
  const [statusFiltro, setStatusFiltro] = useState<string | "todos">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    fornecedor_id: "",
    categoria_id: "",
    valor: "",
    vencimento: format(new Date(), "yyyy-MM-dd"),
    forma_pagamento_id: "",
    conta_financeira_id: "",
    observacoes: "",
    status: "aberto" as "aberto" | "pago" | "vencido",
  });

  const queryClient = useQueryClient();

  const { data: contasPagar = [] } = useQuery({
    queryKey: ["contas-pagar-list", statusFiltro],
    queryFn: async () => {
      let query = supabase
        .from("financeiro_contas_pagar")
        .select(`
          *,
          financeiro_fornecedores(nome),
          financeiro_categorias(categoria_sintetica),
          financeiro_formas_pagamento(nome),
          conta_financeira:financeiro_contas!financeiro_contas_pagar_conta_financeira_id_fkey(nome)
        `)
        .order("vencimento", { ascending: true });

      if (statusFiltro !== "todos") {
        query = query.eq("status", statusFiltro as "aberto" | "pago" | "atrasado" | "cancelado");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-ativos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_fornecedores")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-despesa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_categorias_sinteticas")
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("financeiro_contas_pagar")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar-list"] });
      toast.success("Conta a pagar criada com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar conta a pagar: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("financeiro_contas_pagar")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar-list"] });
      toast.success("Conta a pagar atualizada com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar conta a pagar: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financeiro_contas_pagar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar-list"] });
      toast.success("Conta a pagar excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir conta a pagar: " + error.message);
    },
  });

  const marcarPagoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financeiro_contas_pagar")
        .update({ 
          status: "pago",
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar-list"] });
      toast.success("Conta marcada como paga!");
    },
    onError: (error: any) => {
      toast.error("Erro ao marcar conta como paga: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      fornecedor_id: "",
      categoria_id: "",
      valor: "",
      vencimento: format(new Date(), "yyyy-MM-dd"),
      forma_pagamento_id: "",
      conta_financeira_id: "",
      observacoes: "",
      status: "aberto",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    const payload = {
      descricao: formData.descricao,
      fornecedor_id: formData.fornecedor_id || null,
      categoria_id: formData.categoria_id || null,
      valor: parseFloat(formData.valor),
      vencimento: formData.vencimento,
      forma_pagamento_id: formData.forma_pagamento_id || null,
      conta_financeira_id: formData.conta_financeira_id || null,
      observacoes: formData.observacoes || null,
      status: formData.status,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      // Include user_id on insert
      createMutation.mutate({ ...payload, user_id: user.id });
    }
  };

  const handleEdit = (conta: any) => {
    setEditingId(conta.id);
    setFormData({
      descricao: conta.descricao || "",
      fornecedor_id: conta.fornecedor_id || "",
      categoria_id: conta.categoria_id || "",
      valor: conta.valor?.toString() || "",
      vencimento: conta.vencimento || format(new Date(), "yyyy-MM-dd"),
      forma_pagamento_id: conta.forma_pagamento_id || "",
      conta_financeira_id: conta.conta_financeira_id || "",
      observacoes: conta.observacoes || "",
      status: conta.status || "aberto",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta a pagar?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarcarPago = (id: string) => {
    if (confirm("Deseja marcar esta conta como paga?")) {
      marcarPagoMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string, vencimento: string) => {
    if (status === "pago") return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200";
    if (status === "atrasado" || new Date(vencimento) < new Date()) {
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200";
    }
    if (status === "cancelado") return "bg-muted text-muted-foreground";
    return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200";
  };

  const getStatusLabel = (status: string, vencimento: string) => {
    if (status === "pago") return "Pago";
    if (status === "atrasado" || new Date(vencimento) < new Date()) return "Atrasado";
    if (status === "cancelado") return "Cancelado";
    return "Aberto";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e pagamentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} Conta a Pagar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Descrição *</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da conta"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor</Label>
                  <Select value={formData.fornecedor_id} onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((forn: any) => (
                        <SelectItem key={forn.id} value={forn.id}>
                          {forn.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label>Vencimento *</Label>
                  <Input
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                    required
                  />
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

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  {editingId ? "Atualizar" : "Criar"} Conta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtro por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Contas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasPagar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma conta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                contasPagar.map((conta: any) => (
                  <TableRow key={conta.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {conta.financeiro_fornecedores?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {conta.financeiro_categorias?.categoria_sintetica || "-"}
                    </TableCell>
                    <TableCell>{format(new Date(conta.vencimento), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(conta.status, conta.vencimento)}>
                        {getStatusLabel(conta.status, conta.vencimento)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {formatCurrency(Number(conta.valor || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {conta.status !== "pago" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleMarcarPago(conta.id)}
                            title="Marcar como pago"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(conta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(conta.id)}>
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

export default ContasPagar;
