import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const DRE = () => {
  const { data: dreData } = useQuery({
    queryKey: ["dre"],
    queryFn: async () => {
      const currentMonth = new Date();
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const { data: lancamentos, error } = await supabase
        .from("financeiro_lancamentos")
        .select("tipo, valor_entrada, valor_saida, custo_tratamento, financeiro_categorias(categoria_sintetica)")
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      const receita = lancamentos
        ?.filter(l => l.tipo === "receita")
        .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0) || 0;

      const custo = lancamentos
        ?.filter(l => l.tipo === "receita")
        .reduce((sum, l) => sum + Number(l.custo_tratamento || 0), 0) || 0;

      const despesas = lancamentos
        ?.filter(l => l.tipo === "despesa")
        .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0) || 0;

      const margemBruta = receita - custo;
      const lucroLiquido = margemBruta - despesas;

      return {
        receita,
        custo,
        margemBruta,
        despesas,
        lucroLiquido,
        percentualMargemBruta: receita > 0 ? (margemBruta / receita) * 100 : 0,
        percentualLucro: receita > 0 ? (lucroLiquido / receita) * 100 : 0,
      };
    },
  });

  const { data: comparativoMensal } = useQuery({
    queryKey: ["dre-comparativo"],
    queryFn: async () => {
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const { data: lancamentos } = await supabase
          .from("financeiro_lancamentos")
          .select("tipo, valor_entrada, valor_saida, custo_tratamento")
          .gte("data", format(startDate, "yyyy-MM-dd"))
          .lte("data", format(endDate, "yyyy-MM-dd"));

        const receita = lancamentos
          ?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor_entrada || 0), 0) || 0;

        const custo = lancamentos
          ?.filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_tratamento || 0), 0) || 0;

        const despesas = lancamentos
          ?.filter(l => l.tipo === "despesa")
          .reduce((sum, l) => sum + Number(l.valor_saida || 0), 0) || 0;

        meses.push({
          mes: format(date, "MMM/yy", { locale: ptBR }),
          receita,
          custo,
          despesas,
          lucro: receita - custo - despesas,
        });
      }
      return meses;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">DRE - Demonstração do Resultado</h1>
        <p className="text-muted-foreground mt-1">Análise completa dos resultados financeiros</p>
      </div>

      {/* Resumo Principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              R$ {dreData?.receita.toFixed(2) || "0.00"}
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
              R$ {dreData?.margemBruta.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualMargemBruta.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingDown className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
              R$ {dreData?.lucroLiquido.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dreData?.percentualLucro.toFixed(1) || "0"}% da receita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DRE Detalhada */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Demonstração do Resultado - Mês Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="font-semibold text-lg">Receita Bruta</span>
              <span className="font-bold text-lg text-primary">
                R$ {dreData?.receita.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center pl-4">
              <span className="text-muted-foreground">(-) Custo dos Tratamentos</span>
              <span className="text-destructive">
                R$ {dreData?.custo.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center border-y py-3">
              <span className="font-semibold text-lg">(=) Margem Bruta</span>
              <span className="font-bold text-lg text-green-600">
                R$ {dreData?.margemBruta.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center pl-4">
              <span className="text-muted-foreground">(-) Despesas Operacionais</span>
              <span className="text-destructive">
                R$ {dreData?.despesas.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="font-bold text-xl">(=) Lucro Líquido</span>
              <span className={`font-bold text-xl ${(dreData?.lucroLiquido || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                R$ {dreData?.lucroLiquido.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Mensal */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparativoMensal}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend />
              <Bar dataKey="receita" fill="hsl(var(--primary))" name="Receita" />
              <Bar dataKey="custo" fill="#f59e0b" name="Custo" />
              <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" />
              <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DRE;
