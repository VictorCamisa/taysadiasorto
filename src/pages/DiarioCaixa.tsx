import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const DiarioCaixa = () => {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [tipoFiltro, setTipoFiltro] = useState<string | "todos">("todos");

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["diario-caixa", startDate, endDate, tipoFiltro],
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

  // Calcular totais do período
  const receitaTotal = lancamentos
    .filter(l => l.tipo === "receita")
    .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0);

  const despesaTotal = lancamentos
    .filter(l => l.tipo === "despesa")
    .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0);

  const resultadoLiquido = receitaTotal - despesaTotal;

  // Agrupar por data
  const lancamentosPorData = lancamentos.reduce((acc: any, lanc) => {
    const data = lanc.data;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(lanc);
    return acc;
  }, {});

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "receita": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "despesa": return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "transferencia": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Diário de Caixa</h1>
        <p className="text-muted-foreground mt-1">Extrato detalhado de todas as movimentações financeiras</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ {receitaTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">R$ {despesaTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${resultadoLiquido >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              R$ {resultadoLiquido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Receita - Despesa</p>
          </CardContent>
        </Card>
      </div>

      {/* Extrato por Dia */}
      <div className="space-y-4">
        {Object.entries(lancamentosPorData).map(([data, lancamentosData]: [string, any]) => {
          const receitaDia = lancamentosData
            .filter((l: any) => l.tipo === "receita")
            .reduce((sum: number, l: any) => sum + Number(l.valor_entrada || 0), 0);
          
          const despesaDia = lancamentosData
            .filter((l: any) => l.tipo === "despesa")
            .reduce((sum: number, l: any) => sum + Number(l.valor_saida || 0), 0);

          const resultadoDia = receitaDia - despesaDia;

          return (
            <Card key={data} className="shadow-md">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">+R$ {receitaDia.toFixed(2)}</span>
                    <span className="text-destructive font-medium">-R$ {despesaDia.toFixed(2)}</span>
                    <span className={`font-bold ${resultadoDia >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      = R$ {resultadoDia.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {lancamentosData.map((lanc: any) => (
                    <div key={lanc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={getTipoColor(lanc.tipo)}>
                          {lanc.tipo}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{lanc.cliente || lanc.observacoes || "Sem descrição"}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            {lanc.financeiro_tratamentos && (
                              <span>Tratamento: {lanc.financeiro_tratamentos.nome}</span>
                            )}
                            {lanc.financeiro_categorias && (
                              <span>Cat: {lanc.financeiro_categorias.categoria_sintetica}</span>
                            )}
                            {lanc.financeiro_formas_pagamento && (
                              <span>Pgto: {lanc.financeiro_formas_pagamento.nome}</span>
                            )}
                            {lanc.conta_financeira && (
                              <span>Conta: {lanc.conta_financeira.nome}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${lanc.tipo === 'receita' ? 'text-green-600' : 'text-destructive'}`}>
                        {lanc.tipo === 'receita' ? '+' : '-'}R$ {Number(lanc.valor_entrada || lanc.valor_saida || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {Object.keys(lancamentosPorData).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum lançamento encontrado no período selecionado
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiarioCaixa;
