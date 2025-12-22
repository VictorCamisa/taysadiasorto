import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TratamentosKPIs } from "@/components/tratamentos/TratamentosKPIs";
import { TratamentosFilters } from "@/components/tratamentos/TratamentosFilters";
import { TratamentoForm } from "@/components/tratamentos/TratamentoForm";
import { useTratamentoCalculations } from "@/components/tratamentos/hooks/useTratamentoCalculations";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Tratamentos() {
  const queryClient = useQueryClient();
  const { getMargemColor } = useTratamentoCalculations();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTratamento, setSelectedTratamento] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tratamentoToDelete, setTratamentoToDelete] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    search: "",
    grupo: "all",
    status: "all",
  });

  // Fetch tratamentos
  const { data: tratamentos = [], isLoading } = useQuery({
    queryKey: ["tratamentos"],
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

  // Fetch produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch ficha técnica for selected tratamento
  const { data: fichaTecnica = [] } = useQuery({
    queryKey: ["ficha-tecnica", selectedTratamento?.id],
    enabled: !!selectedTratamento?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos_ficha_tecnica")
        .select(`
          *,
          produto:estoque_produtos(id, nome, unidade_medida, custo_medio)
        `)
        .eq("tratamento_id", selectedTratamento.id);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { fichaTecnica, lucro_sessao, margem_bruta, margem_contribuicao, ...tratamentoData } = data;
      
      if (selectedTratamento) {
        const { user_id, ...tratamentoUpdate } = tratamentoData;
        const { error: updateError } = await supabase
          .from("financeiro_tratamentos")
          .update(tratamentoUpdate)
          .eq("id", selectedTratamento.id);
        
        if (updateError) throw updateError;

        await supabase
          .from("tratamentos_ficha_tecnica")
          .delete()
          .eq("tratamento_id", selectedTratamento.id);

        if (fichaTecnica && fichaTecnica.length > 0) {
          const items = fichaTecnica.map((item: any) => ({
            tratamento_id: selectedTratamento.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            custo_unitario: item.custo_unitario,
            custo_total: item.custo_total,
          }));

          const { error: insertError } = await supabase
            .from("tratamentos_ficha_tecnica")
            .insert(items);
          
          if (insertError) throw insertError;
        }

        return selectedTratamento.id;
      } else {
        const { data: newTratamento, error: createError } = await supabase
          .from("financeiro_tratamentos")
          .insert([tratamentoData])
          .select()
          .single();
        
        if (createError) throw createError;

        if (fichaTecnica && fichaTecnica.length > 0) {
          const items = fichaTecnica.map((item: any) => ({
            tratamento_id: newTratamento.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            custo_unitario: item.custo_unitario,
            custo_total: item.custo_total,
          }));

          const { error: insertError } = await supabase
            .from("tratamentos_ficha_tecnica")
            .insert(items);
          
          if (insertError) throw insertError;
        }

        return newTratamento.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tratamentos"] });
      queryClient.invalidateQueries({ queryKey: ["ficha-tecnica"] });
      setDialogOpen(false);
      setSelectedTratamento(null);
      toast.success(selectedTratamento ? "Tratamento atualizado!" : "Tratamento criado!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar tratamento: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if there are any lancamentos linked to this tratamento
      const { data: lancamentos, error: checkError } = await supabase
        .from("financeiro_lancamentos")
        .select("id")
        .eq("tratamento_id", id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (lancamentos && lancamentos.length > 0) {
        throw new Error("Este tratamento não pode ser excluído porque possui lançamentos financeiros vinculados. Remova ou edite os lançamentos primeiro.");
      }

      // Delete ficha técnica first
      await supabase
        .from("tratamentos_ficha_tecnica")
        .delete()
        .eq("tratamento_id", id);

      // Delete tratamento
      const { error } = await supabase
        .from("financeiro_tratamentos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tratamentos"] });
      toast.success("Tratamento excluído!");
      setDeleteDialogOpen(false);
      setTratamentoToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (tratamento: any) => {
    setSelectedTratamento(tratamento);
    // Fetch ficha técnica will be triggered by the query
    setTimeout(() => {
      setDialogOpen(true);
    }, 100);
  };

  const handleDelete = (tratamento: any) => {
    setTratamentoToDelete(tratamento);
    setDeleteDialogOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedTratamento(null);
    setDialogOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const filteredTratamentos = tratamentos.filter((t) => {
    if (filters.search && !t.nome.toLowerCase().includes(filters.search.toLowerCase()) &&
        !t.grupo.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.grupo !== "all" && t.grupo !== filters.grupo) {
      return false;
    }
    if (filters.status === "active" && !t.ativo) {
      return false;
    }
    if (filters.status === "inactive" && t.ativo) {
      return false;
    }
    return true;
  });

  // Get unique grupos for filter
  const grupos = Array.from(new Set(tratamentos.map((t) => t.grupo))).filter(Boolean);

  // Prepare tratamento with ficha técnica for form
  const tratamentoComFicha = selectedTratamento ? {
    ...selectedTratamento,
    fichaTecnica: fichaTecnica,
  } : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tratamentos</h1>
          <p className="text-muted-foreground">
            Gerencie tratamentos, custos e fichas técnicas
          </p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tratamento
        </Button>
      </div>

      <TratamentosKPIs tratamentos={tratamentos} />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <TratamentosFilters
            filters={filters}
            grupos={grupos}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : filteredTratamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum tratamento encontrado
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Preço Venda</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                    <TableHead className="text-right">Margem %</TableHead>
                    <TableHead className="text-center">Tempo (min)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTratamentos.map((tratamento) => (
                    <TableRow key={tratamento.id}>
                      <TableCell className="font-medium">{tratamento.nome}</TableCell>
                      <TableCell>{tratamento.grupo}</TableCell>
                      <TableCell className="text-right">
                        {Number(tratamento.preco_venda || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(tratamento.custo_total || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getMargemColor(tratamento.margem_contribuicao || 0)}`}>
                        {(tratamento.margem_contribuicao || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {tratamento.tempo_execucao_minutos || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tratamento.ativo ? "default" : "secondary"}>
                          {tratamento.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tratamento)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tratamento)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TratamentoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tratamento={tratamentoComFicha}
        produtos={produtos}
        onSave={(data) => saveMutation.mutate(data)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tratamento "{tratamentoToDelete?.nome}"?
              Esta ação não pode ser desfeita e todos os itens da ficha técnica também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tratamentoToDelete && deleteMutation.mutate(tratamentoToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
