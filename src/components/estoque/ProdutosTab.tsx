import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, XCircle } from "lucide-react";
import { ProdutosFilters } from "./ProdutosFilters";
import { ProdutoForm } from "./ProdutoForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProdutosTabProps {
  produtos: any[];
  fornecedores: any[];
  onSaveProduto: (produto: any) => void;
  onDeleteProduto: (id: string) => void;
}

export const ProdutosTab = ({ produtos, fornecedores, onSaveProduto, onDeleteProduto }: ProdutosTabProps) => {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [fornecedorId, setFornecedorId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [somenteEstoqueCritico, setSomenteEstoqueCritico] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const categorias = useMemo(() => {
    return [...new Set(produtos.map(p => p.categoria))].filter(Boolean);
  }, [produtos]);

  const filteredProdutos = useMemo(() => {
    return produtos.filter(p => {
      if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoria !== "todos" && p.categoria !== categoria) return false;
      if (fornecedorId !== "todos" && p.fornecedor_id !== fornecedorId) return false;
      if (status === "ativo" && !p.ativo) return false;
      if (status === "inativo" && p.ativo) return false;
      if (somenteEstoqueCritico && Number(p.estoque_atual) >= Number(p.estoque_minimo)) return false;
      return true;
    });
  }, [produtos, search, categoria, fornecedorId, status, somenteEstoqueCritico]);

  const handleEdit = (produto: any) => {
    setSelectedProduto(produto);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedProduto(null);
    setFormOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (produtoToDelete) {
      onDeleteProduto(produtoToDelete);
      setDeleteDialogOpen(false);
      setProdutoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ProdutosFilters
          search={search}
          setSearch={setSearch}
          categoria={categoria}
          setCategoria={setCategoria}
          fornecedorId={fornecedorId}
          setFornecedorId={setFornecedorId}
          status={status}
          setStatus={setStatus}
          somenteEstoqueCritico={somenteEstoqueCritico}
          setSomenteEstoqueCritico={setSomenteEstoqueCritico}
          categorias={categorias}
          fornecedores={fornecedores}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Custo Médio</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProdutos.map((produto) => {
                  const estoqueAtual = Number(produto.estoque_atual);
                  const estoqueMinimo = Number(produto.estoque_minimo);
                  const isCritico = estoqueAtual < estoqueMinimo;

                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell>{produto.unidade_medida}</TableCell>
                      <TableCell>{produto.fornecedor?.nome || "-"}</TableCell>
                      <TableCell>
                        {Number(produto.custo_medio).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        {isCritico ? (
                          <Badge variant="destructive">{estoqueAtual}</Badge>
                        ) : (
                          estoqueAtual
                        )}
                      </TableCell>
                      <TableCell>{estoqueMinimo}</TableCell>
                      <TableCell>{produto.lote || "-"}</TableCell>
                      <TableCell>
                        {produto.validade
                          ? new Date(produto.validade).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(produto)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConfirmDelete(produto.id)}
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

      <ProdutoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={onSaveProduto}
        produto={selectedProduto}
        fornecedores={fornecedores}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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
