import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { useState } from "react";

const DRE = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, "yyyy-MM"));

  // Dados da DRE do mês selecionado
  const { data: dreData } = useQuery({
    queryKey: ["dre", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      // Buscar todos os lançamentos do período com joins
      const { data: lancamentos, error } = await supabase
        .from("financeiro_lancamentos")
        .select(`
          *,
          financeiro_tratamentos(nome),
          financeiro_categorias(categoria_sintetica, categoria_analitica)
        `)
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      // Receita por tratamento
      const receitaPorTratamento = new Map<string, { quantidade: number; total: number }>();
      const custoPorTratamento = new Map<string, number>();
      const despesaPorCategoria = new Map<string, Map<string, number>>();

      lancamentos?.forEach(l => {
        if (l.tipo === "receita") {
          const tratamento = l.financeiro_tratamentos?.nome || "Outros";
          const atual = receitaPorTratamento.get(tratamento) || { quantidade: 0, total: 0 };
          receitaPorTratamento.set(tratamento, {
            quantidade: atual.quantidade + 1,
            total: atual.total + Number(l.valor_entrada || 0),
          });

          const custoAtual = custoPorTratamento.get(tratamento) || 0;
          custoPorTratamento.set(tratamento, custoAtual + Number(l.custo_tratamento || 0));
        }

        if (l.tipo === "despesa") {
          const catSintetica = l.financeiro_categorias?.categoria_sintetica || "Sem categoria";
          const catAnalitica = l.financeiro_categorias?.categoria_analitica || "Não especificado";
          
          if (!despesaPorCategoria.has(catSintetica)) {
            despesaPorCategoria.set(catSintetica, new Map());
          }
          const analiticas = despesaPorCategoria.get(catSintetica)!;
          const valorAtual = analiticas.get(catAnalitica) || 0;
          analiticas.set(catAnalitica, valorAtual + Number(l.valor_saida || 0));
        }
      });

      // Calcular totais
      const receitaTotal = Array.from(receitaPorTratamento.values()).reduce((sum, r) => sum + r.total, 0);
      const custoTotal = Array.from(custoPorTratamento.values()).reduce((sum, c) => sum + c, 0);
      const despesaTotal = Array.from(despesaPorCategoria.values()).reduce((sum, map) => 
        sum + Array.from(map.values()).reduce((s, v) => s + v, 0), 0
      );
      const margemBruta = receitaTotal - custoTotal;
      const lucroLiquido = margemBruta - despesaTotal;

      return {
        receitaTotal,
        custoTotal,
        margemBruta,
        despesaTotal,
        lucroLiquido,
        percentualMargemBruta: receitaTotal > 0 ? (margemBruta / receitaTotal) * 100 : 0,
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
        despesaPorCategoria: Array.from(despesaPorCategoria.entries()).map(([sintetica, analiticas]) => ({
          sintetica,
          analiticas: Array.from(analiticas.entries()).map(([analitica, valor]) => ({
            analitica,
            valor,
          })),
          total: Array.from(analiticas.values()).reduce((sum, v) => sum + v, 0),
        })),
      };
    },
  });

  // DRE Anual (últimos 12 meses)
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
          .from("financeiro_lancamentos")
          .select("tipo, valor_entrada, valor_saida, custo_tratamento")
          .gte("data", format(startDate, "yyyy-MM-dd"))
          .lte("data", format(endDate, "yyyy-MM-dd"));

        const receita = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0) || 0;
        const custo = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_tratamento || 0), 0) || 0;
        const despesas = lancamentos?.filter(l => l.tipo === "despesa")
          .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0) || 0;
        const margemBruta = receita - custo;
        const lucro = margemBruta - despesas;

        meses.push({
          mes: format(date, "MMM", { locale: ptBR }),
          receita,
          custo,
          margemBruta,
          despesas,
          lucro,
        });
      }

      return meses;
    },
  });

  // Gráfico de evolução (últimos 12 meses)
  const { data: evolucaoMensal } = useQuery({
    queryKey: ["dre-evolucao"],
    queryFn: async () => {
      const meses = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const { data: lancamentos } = await supabase
          .from("financeiro_lancamentos")
          .select("tipo, valor_entrada, valor_saida, custo_tratamento")
          .gte("data", format(startDate, "yyyy-MM-dd"))
          .lte("data", format(endDate, "yyyy-MM-dd"));

        const receita = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0) || 0;
        const custo = lancamentos?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_tratamento || 0), 0) || 0;
        const despesas = lancamentos?.filter(l => l.tipo === "despesa")
          .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0) || 0;
        const margemBruta = receita - custo;
        const lucro = margemBruta - despesas;

        meses.push({
          mes: format(date, "MMM/yy", { locale: ptBR }),
          receita,
          margemBruta,
          lucro,
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
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              R$ {(dreData?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {(dreData?.margemBruta || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualMargemBruta.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
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
            <h3 className="text-lg font-semibold mb-3">Receita Bruta</h3>
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

          {/* Custo dos Tratamentos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">(-) Custo dos Tratamentos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tratamento</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreData?.custoPorTratamento.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.tratamento}</TableCell>
                    <TableCell className="text-right text-destructive">
                      R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Custos dos Tratamentos</TableCell>
                  <TableCell className="text-right text-destructive">
                    R$ {(dreData?.custoTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Margem Bruta */}
          <div className="flex justify-between items-center border-y py-4">
            <span className="text-xl font-bold">(=) Margem Bruta</span>
            <span className="text-xl font-bold text-green-600">
              R$ {(dreData?.margemBruta || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              <span className="text-sm ml-2">({dreData?.percentualMargemBruta.toFixed(1)}%)</span>
            </span>
          </div>

          {/* Despesas Operacionais */}
          <div>
            <h3 className="text-lg font-semibold mb-3">(-) Despesas Operacionais</h3>
            {dreData?.despesaPorCategoria.map((cat, idx) => (
              <div key={idx} className="mb-4">
                <h4 className="font-semibold text-sm mb-2 text-primary">{cat.sintetica}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subcategoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
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
                R$ {(dreData?.despesaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Lucro Líquido */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-2xl font-bold">(=) Lucro Líquido</span>
            <span className={`text-2xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
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
                  <TableCell className="font-semibold">Custo dos Tratamentos</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right text-muted-foreground">
                      {m.custo.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-muted-foreground">
                    {dreAnual?.reduce((sum, m) => sum + m.custo, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-bold">Margem Bruta</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right font-semibold text-green-600">
                      {m.margemBruta.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-green-600">
                    {dreAnual?.reduce((sum, m) => sum + m.margemBruta, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Despesas Operacionais</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className="text-right text-destructive">
                      {m.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-destructive">
                    {dreAnual?.reduce((sum, m) => sum + m.despesas, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold text-lg">Lucro Líquido</TableCell>
                  {dreAnual?.map((m, idx) => (
                    <TableCell key={idx} className={`text-right font-bold ${m.lucro >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {m.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                  <TableCell className={`text-right font-bold text-lg ${(dreAnual?.reduce((sum, m) => sum + m.lucro, 0) || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {dreAnual?.reduce((sum, m) => sum + m.lucro, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Evolução */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Evolução do Lucro Líquido (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro Líquido" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Comparativo: Receita x Margem x Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="receita" fill="hsl(var(--primary))" name="Receita" />
                <Bar dataKey="margemBruta" fill="#f59e0b" name="Margem Bruta" />
                <Bar dataKey="lucro" fill="#10b981" name="Lucro Líquido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DRE;
