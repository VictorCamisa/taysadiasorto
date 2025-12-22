import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, XCircle, Package, ShoppingCart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFornecedoresData } from "@/components/fornecedores/hooks/useFornecedoresData";
import { FornecedoresKPIs } from "@/components/fornecedores/FornecedoresKPIs";
import { FornecedoresFilters } from "@/components/fornecedores/FornecedoresFilters";
import { FornecedorForm } from "@/components/fornecedores/FornecedorForm";

const Fornecedores = () => {
  const {
    fornecedores,
    refetch,
    kpis,
    produtosPorFornecedor,
    comprasPorFornecedor,
  } = useFornecedoresData();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<string | null>(null);

  const filteredFornecedores = useMemo(() => {
    return fornecedores.filter((f) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesNome = f.nome.toLowerCase().includes(searchLower);
        const matchesCnpj = f.cnpj?.toLowerCase().includes(searchLower);
        if (!matchesNome && !matchesCnpj) return false;
      }
      if (status === "ativo" && !f.ativo) return false;
      if (status === "inativo" && f.ativo) return false;
      return true;
    });
  }, [fornecedores, search, status]);

  const saveFornecedorMutation = useMutation({
    mutationFn: async (fornecedor: any) => {
      if (fornecedor.id) {
        const { id, user_id, ...fornecedorUpdate } = fornecedor;
        const { error } = await supabase
          .from("financeiro_fornecedores")
          .update(fornecedorUpdate)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financeiro_fornecedores")
          .insert(fornecedor);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setFormOpen(false);
      setSelectedFornecedor(null);
      toast({ title: "Fornecedor salvo com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFornecedorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financeiro_fornecedores")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setFornecedorToDelete(null);
      toast({ title: "Fornecedor excluído com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (fornecedor: any) => {
    setSelectedFornecedor(fornecedor);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedFornecedor(null);
    setFormOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setFornecedorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (fornecedorToDelete) {
      deleteFornecedorMutation.mutate(fornecedorToDelete);
    }
  };

  const getProdutosCount = (fornecedorId: string) => {
    return produtosPorFornecedor.filter(p => p.fornecedor_id === fornecedorId).length;
  };

  const getComprasCount = (fornecedorId: string) => {
    return comprasPorFornecedor.filter(c => c.fornecedor_id === fornecedorId).length;
  };

  const getComprasTotal = (fornecedorId: string) => {
    return comprasPorFornecedor
      .filter(c => c.fornecedor_id === fornecedorId)
      .reduce((sum, c) => sum + Number(c.valor_total || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus fornecedores</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <FornecedoresKPIs
        totalFornecedores={kpis.totalFornecedores}
        fornecedoresAtivos={kpis.fornecedoresAtivos}
        fornecedoresInativos={kpis.fornecedoresInativos}
      />

      <FornecedoresFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Total Comprado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredFornecedores.map((fornecedor) => {
                  const produtosCount = getProdutosCount(fornecedor.id);
                  const comprasCount = getComprasCount(fornecedor.id);
                  const comprasTotal = getComprasTotal(fornecedor.id);

                  return (
                    <TableRow key={fornecedor.id}>
                      <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                      <TableCell>{fornecedor.cnpj || "-"}</TableCell>
                      <TableCell>{fornecedor.telefone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {produtosCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          {comprasCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {comprasTotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                          {fornecedor.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(fornecedor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConfirmDelete(fornecedor.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FornecedorForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedFornecedor(null);
        }}
        onSave={(fornecedor) => {
          if (selectedFornecedor) {
            saveFornecedorMutation.mutate({ ...fornecedor, id: selectedFornecedor.id });
          } else {
            saveFornecedorMutation.mutate(fornecedor);
          }
        }}
        fornecedor={selectedFornecedor}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Fornecedores;
