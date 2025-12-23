import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Trash2, Eye, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrcamentoData, type Orcamento } from "@/hooks/useOrcamentoData";
import { OrcamentoForm } from "@/components/orcamento/OrcamentoForm";
import { OrcamentoItensEditor } from "@/components/orcamento/OrcamentoItensEditor";
import { PageHeader } from "@/components/PageHeader";

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  ativo: "bg-[rgb(var(--success))]/10 text-[rgb(var(--success))]",
  encerrado: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  ativo: "Ativo",
  encerrado: "Encerrado",
};

export default function OrcamentoPage() {
  const { orcamentos, loadingOrcamentos, createOrcamento, updateOrcamento, deleteOrcamento } = useOrcamentoData();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | undefined>();
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | undefined>();

  const handleCreate = () => {
    setEditingOrcamento(undefined);
    setFormOpen(true);
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setFormOpen(true);
  };

  const handleView = (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento);
  };

  const handleSubmit = async (data: Omit<Orcamento, "id" | "created_at" | "updated_at">) => {
    if (editingOrcamento) {
      await updateOrcamento.mutateAsync({ id: editingOrcamento.id, ...data });
    } else {
      await createOrcamento.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingOrcamento(undefined);
  };

  const handleDelete = async (id: string) => {
    await deleteOrcamento.mutateAsync(id);
  };

  const formatDate = (date: string) => format(new Date(date), "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Orçamento"
        description="Planejamento financeiro e controle orçamentário"
        icon={Target}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        }
      />

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrcamentos ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum orçamento cadastrado.</p>
              <p className="text-sm">Clique em "Novo Orçamento" para criar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">{orcamento.nome}</TableCell>
                    <TableCell>
                      {formatDate(orcamento.periodo_inicio)} - {formatDate(orcamento.periodo_fim)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[orcamento.status]}>
                        {statusLabels[orcamento.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {orcamento.observacoes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(orcamento)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(orcamento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o orçamento "{orcamento.nome}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(orcamento.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <OrcamentoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        orcamento={editingOrcamento}
        onSubmit={handleSubmit}
        isLoading={createOrcamento.isPending || updateOrcamento.isPending}
      />

      {/* View/Edit Items Modal */}
      <Dialog open={!!viewingOrcamento} onOpenChange={() => setViewingOrcamento(undefined)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingOrcamento?.nome} - Itens do Orçamento
            </DialogTitle>
          </DialogHeader>
          {viewingOrcamento && (
            <OrcamentoItensEditor
              orcamentoId={viewingOrcamento.id}
              periodoInicio={viewingOrcamento.periodo_inicio}
              periodoFim={viewingOrcamento.periodo_fim}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
