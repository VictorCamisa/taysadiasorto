import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useConfiguracoesData } from "@/components/configuracoes/hooks/useConfiguracoesData";
import { CategoriaForm } from "@/components/configuracoes/CategoriaForm";
import { ContaForm } from "@/components/configuracoes/ContaForm";
import { FormaPagamentoForm } from "@/components/configuracoes/FormaPagamentoForm";
import { OrigemForm } from "@/components/configuracoes/OrigemForm";

const Configuracoes = () => {
  const {
    categorias,
    contas,
    formasPagamento,
    origens,
    refetchCategorias,
    refetchContas,
    refetchFormas,
    refetchOrigens,
  } = useConfiguracoesData();

  const [categoriaFormOpen, setCategoriaFormOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; table: string } | null>(null);

  const [contaFormOpen, setContaFormOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<any>(null);

  const [formaFormOpen, setFormaFormOpen] = useState(false);
  const [selectedForma, setSelectedForma] = useState<any>(null);

  const [origemFormOpen, setOrigemFormOpen] = useState(false);
  const [selectedOrigem, setSelectedOrigem] = useState<any>(null);

  // Categoria mutations
  const saveCategoriaMutation = useMutation({
    mutationFn: async (categoria: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (categoria.id) {
        const { error } = await supabase
          .from("financeiro_categorias")
          .update(categoria)
          .eq("id", categoria.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financeiro_categorias")
          .insert({ ...categoria, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchCategorias();
      setCategoriaFormOpen(false);
      setSelectedCategoria(null);
      toast({ title: "Categoria salva com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar categoria", description: error.message, variant: "destructive" });
    },
  });

  // Conta mutations
  const saveContaMutation = useMutation({
    mutationFn: async (conta: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (conta.id) {
        const { error } = await supabase
          .from("financeiro_contas")
          .update(conta)
          .eq("id", conta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financeiro_contas")
          .insert({ ...conta, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchContas();
      setContaFormOpen(false);
      setSelectedConta(null);
      toast({ title: "Conta salva com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar conta", description: error.message, variant: "destructive" });
    },
  });

  // Forma pagamento mutations
  const saveFormaMutation = useMutation({
    mutationFn: async (forma: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (forma.id) {
        const { error } = await supabase
          .from("financeiro_formas_pagamento")
          .update(forma)
          .eq("id", forma.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financeiro_formas_pagamento")
          .insert({ ...forma, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchFormas();
      setFormaFormOpen(false);
      setSelectedForma(null);
      toast({ title: "Forma de pagamento salva com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar forma de pagamento", description: error.message, variant: "destructive" });
    },
  });

  // Origem mutations
  const saveOrigemMutation = useMutation({
    mutationFn: async (origem: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (origem.id) {
        const { error } = await supabase
          .from("financeiro_origens")
          .update(origem)
          .eq("id", origem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financeiro_origens")
          .insert({ ...origem, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchOrigens();
      setOrigemFormOpen(false);
      setSelectedOrigem(null);
      toast({ title: "Origem salva com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar origem", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, table }: { id: string; table: string }) => {
      let error;
      if (table === "financeiro_categorias") {
        const result = await supabase.from("financeiro_categorias").delete().eq("id", id);
        error = result.error;
      } else if (table === "financeiro_contas") {
        const result = await supabase.from("financeiro_contas").delete().eq("id", id);
        error = result.error;
      } else if (table === "financeiro_formas_pagamento") {
        const result = await supabase.from("financeiro_formas_pagamento").delete().eq("id", id);
        error = result.error;
      } else if (table === "financeiro_origens") {
        const result = await supabase.from("financeiro_origens").delete().eq("id", id);
        error = result.error;
      }
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.table === "financeiro_categorias") refetchCategorias();
      if (variables.table === "financeiro_contas") refetchContas();
      if (variables.table === "financeiro_formas_pagamento") refetchFormas();
      if (variables.table === "financeiro_origens") refetchOrigens();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: "Item excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir item", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const tipoLabels: Record<string, string> = {
    fixa: "Fixa",
    variavel: "Variável",
    impostos: "Impostos",
    estruturais: "Estruturais",
    comissoes: "Comissões",
    marketing: "Marketing",
    servicos: "Serviços",
    caixa_fisico: "Caixa Físico",
    conta_bancaria: "Conta Bancária",
    cartao: "Cartão",
    conta_socio: "Conta Sócio",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure categorias, contas, formas de pagamento e origens
        </p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="formas">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="origens">Origens</TabsTrigger>
        </TabsList>

        {/* CATEGORIAS */}
        <TabsContent value="categorias" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedCategoria(null);
                setCategoriaFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Categorias Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria Sintética</TableHead>
                    <TableHead>Categoria Analítica</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma categoria cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    categorias.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell>{tipoLabels[String(categoria.tipo)] || categoria.tipo}</TableCell>
                        <TableCell className="font-medium">{categoria.categoria_sintetica}</TableCell>
                        <TableCell>{categoria.categoria_analitica || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={categoria.ativa ? "default" : "secondary"}>
                            {categoria.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedCategoria(categoria);
                                setCategoriaFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: categoria.id, table: "financeiro_categorias" });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
        </TabsContent>

        {/* CONTAS */}
        <TabsContent value="contas" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedConta(null);
                setContaFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contas Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Saldo Inicial</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma conta cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    contas.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.nome}</TableCell>
                        <TableCell>{tipoLabels[String(conta.tipo)] || conta.tipo}</TableCell>
                        <TableCell className="text-right">
                          {Number(conta.saldo_inicial).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(conta.saldo_atual).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={conta.ativa ? "default" : "secondary"}>
                            {conta.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedConta(conta);
                                setContaFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: conta.id, table: "financeiro_contas" });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
        </TabsContent>

        {/* FORMAS DE PAGAMENTO */}
        <TabsContent value="formas" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedForma(null);
                setFormaFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Forma
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Permite Parcelamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formasPagamento.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma forma de pagamento cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    formasPagamento.map((forma) => (
                      <TableRow key={forma.id}>
                        <TableCell className="font-medium">{forma.nome}</TableCell>
                        <TableCell>
                          <Badge variant={forma.permite_parcelamento ? "default" : "secondary"}>
                            {forma.permite_parcelamento ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={forma.ativa ? "default" : "secondary"}>
                            {forma.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedForma(forma);
                                setFormaFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({
                                  id: forma.id,
                                  table: "financeiro_formas_pagamento",
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
        </TabsContent>

        {/* ORIGENS */}
        <TabsContent value="origens" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedOrigem(null);
                setOrigemFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Origem
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Origens de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Nenhuma origem cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    origens.map((origem) => (
                      <TableRow key={origem.id}>
                        <TableCell className="font-medium">{origem.nome}</TableCell>
                        <TableCell>
                          <Badge variant={origem.ativa ? "default" : "secondary"}>
                            {origem.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrigem(origem);
                                setOrigemFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: origem.id, table: "financeiro_origens" });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <CategoriaForm
        open={categoriaFormOpen}
        onClose={() => {
          setCategoriaFormOpen(false);
          setSelectedCategoria(null);
        }}
        onSave={(categoria) => {
          if (selectedCategoria) {
            saveCategoriaMutation.mutate({ ...categoria, id: selectedCategoria.id });
          } else {
            saveCategoriaMutation.mutate(categoria);
          }
        }}
        categoria={selectedCategoria}
      />

      <ContaForm
        open={contaFormOpen}
        onClose={() => {
          setContaFormOpen(false);
          setSelectedConta(null);
        }}
        onSave={(conta) => {
          if (selectedConta) {
            saveContaMutation.mutate({ ...conta, id: selectedConta.id });
          } else {
            saveContaMutation.mutate(conta);
          }
        }}
        conta={selectedConta}
      />

      <FormaPagamentoForm
        open={formaFormOpen}
        onClose={() => {
          setFormaFormOpen(false);
          setSelectedForma(null);
        }}
        onSave={(forma) => {
          if (selectedForma) {
            saveFormaMutation.mutate({ ...forma, id: selectedForma.id });
          } else {
            saveFormaMutation.mutate(forma);
          }
        }}
        formaPagamento={selectedForma}
      />

      <OrigemForm
        open={origemFormOpen}
        onClose={() => {
          setOrigemFormOpen(false);
          setSelectedOrigem(null);
        }}
        onSave={(origem) => {
          if (selectedOrigem) {
            saveOrigemMutation.mutate({ ...origem, id: selectedOrigem.id });
          } else {
            saveOrigemMutation.mutate(origem);
          }
        }}
        origem={selectedOrigem}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
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

export default Configuracoes;
