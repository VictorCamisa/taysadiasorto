import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrcamentoData, type OrcamentoItem } from "@/hooks/useOrcamentoData";

interface OrcamentoItensEditorProps {
  orcamentoId: string;
  periodoInicio: string;
  periodoFim: string;
}

interface ItemEdit {
  id?: string;
  categoria_id?: string;
  tratamento_id?: string;
  tipo: "receita" | "despesa";
  valor_orcado: number;
  nome: string;
  natureza_dre?: string;
}

export function OrcamentoItensEditor({ orcamentoId, periodoInicio, periodoFim }: OrcamentoItensEditorProps) {
  const { useOrcamentoItens, saveOrcamentoItens, sugerirValoresHistorico } = useOrcamentoData();
  const { data: itensExistentes = [], isLoading: loadingItens } = useOrcamentoItens(orcamentoId);
  
  const [itensReceita, setItensReceita] = useState<ItemEdit[]>([]);
  const [itensDespesa, setItensDespesa] = useState<ItemEdit[]>([]);
  const [sugerindo, setSugerindo] = useState(false);

  // Buscar categorias e tratamentos
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias_orcamento"],
    queryFn: async () => {
      const { data } = await supabase.from("categorias").select("*").order("nome_sintetico");
      return data || [];
    },
  });

  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos_orcamento"],
    queryFn: async () => {
      const { data } = await supabase.from("tratamentos").select("*").order("nome");
      return data || [];
    },
  });

  // Inicializar itens baseado nas categorias e tratamentos
  useEffect(() => {
    if (categorias.length === 0 && tratamentos.length === 0) return;

    // Mapear itens existentes por categoria/tratamento
    const existentesPorId = new Map(
      itensExistentes.map((item) => [
        item.categoria_id || item.tratamento_id,
        item,
      ])
    );

    // Receitas: tratamentos
    const receitas: ItemEdit[] = tratamentos.map((t: any) => {
      const existente = existentesPorId.get(t.id);
      return {
        id: existente?.id,
        tratamento_id: t.id,
        tipo: "receita" as const,
        valor_orcado: existente?.valor_orcado || 0,
        nome: t.nome,
      };
    });

    // Despesas: categorias de despesa
    const despesas: ItemEdit[] = categorias
      .filter((c: any) => c.tipo === "despesa")
      .map((c: any) => {
        const existente = existentesPorId.get(c.id);
        return {
          id: existente?.id,
          categoria_id: c.id,
          tipo: "despesa" as const,
          valor_orcado: existente?.valor_orcado || 0,
          nome: c.nome_sintetico + (c.nome_analitico ? ` - ${c.nome_analitico}` : ""),
          natureza_dre: c.natureza_dre,
        };
      });

    setItensReceita(receitas);
    setItensDespesa(despesas);
  }, [categorias, tratamentos, itensExistentes]);

  const handleValorChange = (
    items: ItemEdit[],
    setItems: React.Dispatch<React.SetStateAction<ItemEdit[]>>,
    index: number,
    valor: string
  ) => {
    const newItems = [...items];
    newItems[index].valor_orcado = parseFloat(valor) || 0;
    setItems(newItems);
  };

  const handleSugerirHistorico = async () => {
    setSugerindo(true);
    try {
      const sugestoes = await sugerirValoresHistorico(periodoInicio, periodoFim);
      
      // Aplicar sugestões
      setItensReceita((prev) =>
        prev.map((item) => {
          const sugestao = sugestoes.find((s) => s.tratamento_id === item.tratamento_id);
          return sugestao ? { ...item, valor_orcado: sugestao.valor_orcado } : item;
        })
      );

      setItensDespesa((prev) =>
        prev.map((item) => {
          const sugestao = sugestoes.find((s) => s.categoria_id === item.categoria_id);
          return sugestao ? { ...item, valor_orcado: sugestao.valor_orcado } : item;
        })
      );
    } finally {
      setSugerindo(false);
    }
  };

  const handleSalvar = () => {
    const todosItens = [
      ...itensReceita.filter((i) => i.valor_orcado > 0).map(({ nome, natureza_dre, id, ...rest }) => ({
        ...rest,
        orcamento_id: orcamentoId,
      })),
      ...itensDespesa.filter((i) => i.valor_orcado > 0).map(({ nome, natureza_dre, id, ...rest }) => ({
        ...rest,
        orcamento_id: orcamentoId,
      })),
    ];

    saveOrcamentoItens.mutate({ orcamentoId, itens: todosItens });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalReceitas = itensReceita.reduce((sum, i) => sum + i.valor_orcado, 0);
  const totalDespesas = itensDespesa.reduce((sum, i) => sum + i.valor_orcado, 0);

  // Agrupar despesas por natureza_dre
  const despesasPorNatureza = itensDespesa.reduce((acc, item) => {
    const natureza = item.natureza_dre || "outros";
    if (!acc[natureza]) acc[natureza] = [];
    acc[natureza].push(item);
    return acc;
  }, {} as Record<string, ItemEdit[]>);

  if (loadingItens) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleSugerirHistorico} disabled={sugerindo}>
            {sugerindo ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Sugerir com Base no Histórico
          </Button>
        </div>
        <Button onClick={handleSalvar} disabled={saveOrcamentoItens.isPending}>
          {saveOrcamentoItens.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Itens
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Receitas Orçadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{formatCurrency(totalReceitas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Despesas Orçadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDespesas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultado Orçado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? "text-chart-2" : "text-destructive"}`}>
              {formatCurrency(totalReceitas - totalDespesas)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Receitas e Despesas */}
      <Tabs defaultValue="receitas" className="w-full">
        <TabsList>
          <TabsTrigger value="receitas">Receitas ({itensReceita.length})</TabsTrigger>
          <TabsTrigger value="despesas">Despesas ({itensDespesa.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <CardTitle>Orçamento de Receitas por Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tratamento</TableHead>
                    <TableHead className="text-right w-48">Valor Orçado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensReceita.map((item, index) => (
                    <TableRow key={item.tratamento_id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.valor_orcado || ""}
                          onChange={(e) => handleValorChange(itensReceita, setItensReceita, index, e.target.value)}
                          className="text-right w-40 ml-auto"
                          placeholder="0,00"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <div className="space-y-4">
            {Object.entries(despesasPorNatureza).map(([natureza, items]) => (
              <Card key={natureza}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {natureza === "opex" ? "OPEX (Despesas Operacionais)" :
                     natureza === "custo" ? "Custos Diretos" :
                     natureza === "investimento" ? "Investimentos" :
                     natureza === "distribuicao" ? "Distribuição" :
                     natureza === "financeiro" ? "Despesas Financeiras" :
                     natureza.charAt(0).toUpperCase() + natureza.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right w-48">Valor Orçado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const globalIndex = itensDespesa.findIndex((i) => i.categoria_id === item.categoria_id);
                        return (
                          <TableRow key={item.categoria_id}>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.valor_orcado || ""}
                                onChange={(e) => handleValorChange(itensDespesa, setItensDespesa, globalIndex, e.target.value)}
                                className="text-right w-40 ml-auto"
                                placeholder="0,00"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
