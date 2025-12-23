import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, Activity, Package, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DRE = () => {
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, "yyyy-MM"));
  const [isCorrectingWithAI, setIsCorrectingWithAI] = useState(false);

  const handleCorrigirComIA = async () => {
    setIsCorrectingWithAI(true);
    try {
      toast.info("Analisando categorias e lançamentos com IA...", { duration: 10000 });
      
      const response = await fetch("https://ynstyufdfrctktsgwxwv.supabase.co/functions/v1/corrigir-dre-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao corrigir com IA");
      }

      toast.success(data.message, { duration: 5000 });
      
      if (data.detalhes?.observacoes_ia) {
        toast.info(data.detalhes.observacoes_ia, { duration: 8000 });
      }

      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["dre-anual"] });
      queryClient.invalidateQueries({ queryKey: ["dre-evolucao"] });

    } catch (error) {
      console.error("Erro ao corrigir com IA:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar com IA");
    } finally {
      setIsCorrectingWithAI(false);
    }
  };

  // Dados da DRE do mês selecionado - usando td_fluxo_de_caixa com natureza_dre
  const { data: dreData } = useQuery({
    queryKey: ["dre", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      // Buscar todos os lançamentos do período com joins para as novas tabelas
      const { data: lancamentos, error } = await supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          tratamentos(nome),
          categorias(nome_sintetico, nome_analitico, natureza_dre)
        `)
        .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      // Receita por tratamento
      const receitaPorTratamento = new Map<string, { quantidade: number; total: number }>();
      const custoPorTratamento = new Map<string, number>();
      
      // Despesas separadas por natureza_dre
      const despesasOpex = new Map<string, Map<string, number>>();
      const despesasCusto = new Map<string, Map<string, number>>();
      const despesasInvestimento = new Map<string, Map<string, number>>();
      const despesasDistribuicao = new Map<string, Map<string, number>>();
      const despesasFinanceiro = new Map<string, Map<string, number>>();

      lancamentos?.forEach(l => {
        if (l.tipo === "receita") {
          const tratamento = l.tratamentos?.nome || "Outros";
          const atual = receitaPorTratamento.get(tratamento) || { quantidade: 0, total: 0 };
          receitaPorTratamento.set(tratamento, {
            quantidade: atual.quantidade + 1,
            total: atual.total + Number(l.valor || 0),
          });

          const custoAtual = custoPorTratamento.get(tratamento) || 0;
          custoPorTratamento.set(tratamento, custoAtual + Number(l.custo_material || 0));
        }

        if (l.tipo === "despesa") {
          const catSintetica = l.categorias?.nome_sintetico || "Sem categoria";
          const catAnalitica = l.categorias?.nome_analitico || "Não especificado";
          const naturezaDre = l.categorias?.natureza_dre || "opex";
          
          let targetMap: Map<string, Map<string, number>>;
          switch (naturezaDre) {
            case "custo":
              targetMap = despesasCusto;
              break;
            case "investimento":
              targetMap = despesasInvestimento;
              break;
            case "distribuicao":
              targetMap = despesasDistribuicao;
              break;
            case "financeiro":
              targetMap = despesasFinanceiro;
              break;
            default:
              targetMap = despesasOpex;
          }
          
          if (!targetMap.has(catSintetica)) {
            targetMap.set(catSintetica, new Map());
          }
          const analiticas = targetMap.get(catSintetica)!;
          const valorAtual = analiticas.get(catAnalitica) || 0;
          analiticas.set(catAnalitica, valorAtual + Number(l.valor || 0));
        }
      });

      // Função para calcular total de um mapa de categorias
      const calcularTotalMapa = (mapa: Map<string, Map<string, number>>) => 
        Array.from(mapa.values()).reduce((sum, map) => 
          sum + Array.from(map.values()).reduce((s, v) => s + v, 0), 0
        );

      // Função para converter mapa em array
      const mapaParaArray = (mapa: Map<string, Map<string, number>>) => 
        Array.from(mapa.entries()).map(([sintetica, analiticas]) => ({
          sintetica,
          analiticas: Array.from(analiticas.entries()).map(([analitica, valor]) => ({
            analitica,
            valor,
          })),
          total: Array.from(analiticas.values()).reduce((sum, v) => sum + v, 0),
        }));

      // Calcular totais
      const receitaTotal = Array.from(receitaPorTratamento.values()).reduce((sum, r) => sum + r.total, 0);
      const custoMaterial = Array.from(custoPorTratamento.values()).reduce((sum, c) => sum + c, 0);
      const custosVariaveis = calcularTotalMapa(despesasCusto);
      const custoTotal = custoMaterial + custosVariaveis;
      const despesaOpexTotal = calcularTotalMapa(despesasOpex);
      const despesaInvestimentoTotal = calcularTotalMapa(despesasInvestimento);
      const despesaDistribuicaoTotal = calcularTotalMapa(despesasDistribuicao);
      const despesaFinanceiroTotal = calcularTotalMapa(despesasFinanceiro);
      
      const margemBruta = receitaTotal - custoTotal;
      const resultadoOperacional = margemBruta - despesaOpexTotal;
      const resultadoAntesIR = resultadoOperacional - despesaFinanceiroTotal;
      const lucroLiquido = resultadoAntesIR - despesaDistribuicaoTotal - despesaInvestimentoTotal;

      return {
        receitaTotal,
        custoMaterial,
        custosVariaveis,
        custoTotal,
        margemBruta,
        despesaOpexTotal,
        despesaInvestimentoTotal,
        despesaDistribuicaoTotal,
        despesaFinanceiroTotal,
        resultadoOperacional,
        resultadoAntesIR,
        lucroLiquido,
        percentualMargemBruta: receitaTotal > 0 ? (margemBruta / receitaTotal) * 100 : 0,
        percentualResultadoOp: receitaTotal > 0 ? (resultadoOperacional / receitaTotal) * 100 : 0,
        percentualLucro: receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0,
        receitaPorTratamento: Array.from(receitaPorTratamento.entries()).map(([nome, data]) => ({
          tratamento: nome,
          quantidade: data.quantidade,
          total: data.total,
        })),
        custoPorTratamento: Array.from(custoPorTratamento.entries()).map(([nome, total]) => ({
          tratamento: nome,
          total,
        })),
        despesasOpex: mapaParaArray(despesasOpex),
        despesasCusto: mapaParaArray(despesasCusto),
        despesasInvestimento: mapaParaArray(despesasInvestimento),
        despesasDistribuicao: mapaParaArray(despesasDistribuicao),
        despesasFinanceiro: mapaParaArray(despesasFinanceiro),
      };
    },
  });

  // DRE Anual (últimos 12 meses) - usando td_fluxo_de_caixa
  const { data: dreAnual } = useQuery({
    queryKey: ["dre-anual", selectedMonth],
    queryFn: async () => {
      const [year] = selectedMonth.split("-");
      const meses = [];

      for (let i = 0; i < 12; i++) {
        const date = new Date(parseInt(year), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const { data: lancamentos } = await supabase
          .from("td_fluxo_de_caixa")
          .select("tipo, valor, custo_material, categorias(natureza_dre)")
          .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
          .lte("data_lancamento", format(endDate, "yyyy-MM-dd"));

        const receita = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const custoMaterial = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_material || 0), 0) || 0;
        const custosVariaveis = lancamentos?.filter(l => 
          l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "custo"
        ).reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const custo = custoMaterial + custosVariaveis;
        const despesasOpex = lancamentos?.filter(l => 
          l.tipo === "despesa" && ((l.categorias as any)?.natureza_dre === "opex" || !(l.categorias as any)?.natureza_dre)
        ).reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const margemBruta = receita - custo;
        const resultadoOp = margemBruta - despesasOpex;

        meses.push({
          mes: format(date, "MMM", { locale: ptBR }),
          receita,
          custo,
          margemBruta,
          despesasOpex,
          resultadoOp,
        });
      }

      return meses;
    },
  });

  // Gráfico de evolução (últimos 12 meses) - usando td_fluxo_de_caixa
  const { data: evolucaoMensal } = useQuery({
    queryKey: ["dre-evolucao"],
    queryFn: async () => {
      const meses = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const { data: lancamentos } = await supabase
          .from("td_fluxo_de_caixa")
          .select("tipo, valor, custo_material, categorias(natureza_dre)")
          .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
          .lte("data_lancamento", format(endDate, "yyyy-MM-dd"));

        const receita = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const custoMaterial = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_material || 0), 0) || 0;
        const custosVariaveis = lancamentos?.filter(l => 
          l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "custo"
        ).reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const custo = custoMaterial + custosVariaveis;
        const despesasOpex = lancamentos?.filter(l => 
          l.tipo === "despesa" && ((l.categorias as any)?.natureza_dre === "opex" || !(l.categorias as any)?.natureza_dre)
        ).reduce((sum, l) => sum + Number(l.valor || 0), 0) || 0;
        const margemBruta = receita - custo;
        const resultadoOp = margemBruta - despesasOpex;

        meses.push({
          mes: format(date, "MMM/yy", { locale: ptBR }),
          receita,
          margemBruta,
          resultadoOp,
        });
      }
      return meses;
    },
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">DRE - Demonstração do Resultado</h1>
          <p className="text-muted-foreground mt-1">Análise completa dos resultados financeiros</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCorrigirComIA}
            disabled={isCorrectingWithAI}
            variant="outline"
            className="gap-2"
          >
            {isCorrectingWithAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Corrigir com IA
              </>
            )}
          </Button>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = subMonths(new Date(), i);
                const value = format(date, "yyyy-MM");
                const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {(dreData?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(dreData?.margemBruta || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualMargemBruta.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Operacional</CardTitle>
            <Briefcase className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(dreData?.resultadoOperacional || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
              R$ {(dreData?.resultadoOperacional || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualResultadoOp.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Activity className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              R$ {(dreData?.lucroLiquido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualLucro.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DRE Detalhada - Mês Atual */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Demonstração do Resultado - Mês Atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Receita Bruta */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receita Bruta
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tratamento</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreData?.receitaPorTratamento.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.tratamento}</TableCell>
                    <TableCell className="text-right">{item.quantidade}</TableCell>
                    <TableCell className="text-right text-primary font-medium">
                      R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>Total Receita Bruta</TableCell>
                  <TableCell className="text-right text-primary">
                    R$ {(dreData?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Custo dos Tratamentos (Material) */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              (-) Custos Variáveis dos Tratamentos (Material)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tratamento</TableHead>
                  <TableHead className="text-right">Custo Material</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreData?.custoPorTratamento.filter(item => item.total > 0).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.tratamento}</TableCell>
                    <TableCell className="text-right text-orange-600">
                      R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Custo Material</TableCell>
                  <TableCell className="text-right text-orange-600">
                    R$ {(dreData?.custoMaterial || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Custos Variáveis Adicionais (categoria natureza_dre = custo) */}
          {dreData?.despesasCusto && dreData.despesasCusto.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">(-) Outros Custos Variáveis</h3>
              {dreData.despesasCusto.map((cat, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-orange-600">{cat.sintetica}</h4>
                  <Table>
                    <TableBody>
                      {cat.analiticas.map((ana, anaIdx) => (
                        <TableRow key={anaIdx}>
                          <TableCell className="pl-6">{ana.analitica}</TableCell>
                          <TableCell className="text-right text-orange-600">
                            R$ {ana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
              <div className="flex justify-between items-center bg-muted/50 px-4 py-3 rounded font-bold">
                <span>Total Outros Custos Variáveis</span>
                <span className="text-orange-600">
                  R$ {(dreData?.custosVariaveis || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Margem Bruta */}
          <div className="flex justify-between items-center border-y py-4 bg-blue-50 dark:bg-blue-950/20 px-4 rounded">
            <span className="text-xl font-bold">(=) Margem Bruta</span>
            <span className="text-xl font-bold text-blue-600">
              R$ {(dreData?.margemBruta || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              <span className="text-sm ml-2">({dreData?.percentualMargemBruta.toFixed(1)}%)</span>
            </span>
          </div>

          {/* Despesas Operacionais */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-destructive" />
              (-) Despesas Operacionais
            </h3>
            {dreData?.despesasOpex.map((cat, idx) => (
              <div key={idx} className="mb-4">
                <h4 className="font-semibold text-sm mb-2 text-primary">{cat.sintetica}</h4>
                <Table>
                  <TableBody>
                    {cat.analiticas.map((ana, anaIdx) => (
                      <TableRow key={anaIdx}>
                        <TableCell className="pl-6">{ana.analitica}</TableCell>
                        <TableCell className="text-right text-destructive">
                          R$ {ana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell>Subtotal {cat.sintetica}</TableCell>
                      <TableCell className="text-right text-destructive">
                        R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
            <div className="flex justify-between items-center bg-muted/50 px-4 py-3 rounded font-bold">
              <span>Total Despesas Operacionais</span>
              <span className="text-destructive">
                R$ {(dreData?.despesaOpexTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Resultado Operacional */}
          <div className="flex justify-between items-center border-y py-4 bg-green-50 dark:bg-green-950/20 px-4 rounded">
            <span className="text-xl font-bold">(=) Resultado Operacional (EBITDA)</span>
            <span className={`text-xl font-bold ${(dreData?.resultadoOperacional || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
              R$ {(dreData?.resultadoOperacional || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              <span className="text-sm ml-2">({dreData?.percentualResultadoOp.toFixed(1)}%)</span>
            </span>
          </div>

          {/* Despesas Financeiras (se houver) */}
          {dreData?.despesasFinanceiro && dreData.despesasFinanceiro.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">(-) Despesas Financeiras</h3>
              {dreData.despesasFinanceiro.map((cat, idx) => (
                <div key={idx} className="mb-2">
                  <Table>
                    <TableBody>
                      {cat.analiticas.map((ana, anaIdx) => (
                        <TableRow key={anaIdx}>
                          <TableCell>{ana.analitica}</TableCell>
                          <TableCell className="text-right text-destructive">
                            R$ {ana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {/* Investimentos (se houver) */}
          {dreData?.despesasInvestimento && dreData.despesasInvestimento.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">(-) Investimentos</h3>
              {dreData.despesasInvestimento.map((cat, idx) => (
                <div key={idx} className="mb-2">
                  <Table>
                    <TableBody>
                      {cat.analiticas.map((ana, anaIdx) => (
                        <TableRow key={anaIdx}>
                          <TableCell>{ana.analitica}</TableCell>
                          <TableCell className="text-right text-amber-600">
                            R$ {ana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {/* Distribuição de Dividendos (se houver) */}
          {dreData?.despesasDistribuicao && dreData.despesasDistribuicao.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">(-) Distribuição de Dividendos</h3>
              {dreData.despesasDistribuicao.map((cat, idx) => (
                <div key={idx} className="mb-2">
                  <Table>
                    <TableBody>
                      {cat.analiticas.map((ana, anaIdx) => (
                        <TableRow key={anaIdx}>
                          <TableCell>{ana.analitica}</TableCell>
                          <TableCell className="text-right text-purple-600">
                            R$ {ana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {/* Lucro Líquido */}
          <div className="flex justify-between items-center border-t pt-4 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-4 rounded">
            <span className="text-2xl font-bold">(=) Lucro Líquido</span>
            <span className={`text-2xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              R$ {(dreData?.lucroLiquido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              <span className="text-base ml-2">({dreData?.percentualLucro.toFixed(1)}%)</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* DRE Anual */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>DRE Anual - {selectedMonth.split("-")[0]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Descrição</TableHead>
                  {dreAnual?.map((m) => (
                    <TableHead key={m.mes} className="text-right">
                      {m.mes}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Receita Bruta</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right text-primary">
                      {m.receita.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-primary">
                    {dreAnual?.reduce((sum, m) => sum + m.receita, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">(-) Custos Variáveis</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right text-orange-600">
                      {m.custo.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-orange-600">
                    {dreAnual?.reduce((sum, m) => sum + m.custo, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-bold">(=) Margem Bruta</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right font-bold text-blue-600">
                      {m.margemBruta.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-blue-600">
                    {dreAnual?.reduce((sum, m) => sum + m.margemBruta, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">(-) Despesas Operacionais</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right text-destructive">
                      {m.despesasOpex.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-destructive">
                    {dreAnual?.reduce((sum, m) => sum + m.despesasOpex, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-bold">(=) Resultado Operacional</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className={`text-right font-bold ${m.resultadoOp >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {m.resultadoOp.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className={`text-right font-bold ${(dreAnual?.reduce((sum, m) => sum + m.resultadoOp, 0) || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {dreAnual?.reduce((sum, m) => sum + m.resultadoOp, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Evolução Financeira - Últimos 12 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolucaoMensal || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Receita"
              />
              <Line 
                type="monotone" 
                dataKey="margemBruta" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Margem Bruta"
              />
              <Line 
                type="monotone" 
                dataKey="resultadoOp" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Resultado Operacional"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DRE;
