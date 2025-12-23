import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, BarChart, Bar, ReferenceLine 
} from "recharts";
import { DREMensalData } from "@/hooks/useDREGerencial";

interface DREGerencialChartsProps {
  meses: DREMensalData[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const DREGerencialCharts = ({ meses }: DREGerencialChartsProps) => {
  const chartData = meses.map(m => ({
    mes: m.mesLabel,
    receitaLiquida: m.receitaLiquida,
    lucroLiquido: m.lucroLiquido,
    lucroBruto: m.lucroBruto,
    margemBruta: m.margemBruta,
    margemLiquida: m.margemLiquida,
    margemOperacional: m.margemOperacional,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Linhas: Receita vs Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Receita Líquida vs Lucro Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="receitaLiquida" 
                  name="Receita Líquida"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lucroLiquido" 
                  name="Lucro Líquido"
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras: Margens */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Margens (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number) => formatPercent(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar 
                  dataKey="margemBruta" 
                  name="Margem Bruta"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="margemOperacional" 
                  name="Margem Operacional"
                  fill="hsl(var(--chart-3))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="margemLiquida" 
                  name="Margem Líquida"
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
