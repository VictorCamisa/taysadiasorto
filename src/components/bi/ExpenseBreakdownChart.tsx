import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ExpenseCategory {
  nome: string;
  valor: number;
}

interface ExpenseBreakdownChartProps {
  porCategoria: ExpenseCategory[];
  porNatureza: ExpenseCategory[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(211 100% 60%)',
  'hsl(158 64% 55%)',
  'hsl(35 100% 55%)',
];

const NATURE_COLORS: Record<string, string> = {
  'opex': 'hsl(var(--chart-1))',
  'capex': 'hsl(var(--chart-2))',
  'financeiro': 'hsl(var(--chart-3))',
  'impostos': 'hsl(var(--chart-4))',
  'pessoal': 'hsl(var(--chart-5))',
};

export function ExpenseBreakdownChart({ porCategoria, porNatureza }: ExpenseBreakdownChartProps) {
  const totalDespesas = porCategoria.reduce((sum, c) => sum + c.valor, 0);
  
  const categoriaData = porCategoria
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8)
    .map((c, i) => ({
      ...c,
      percent: totalDespesas > 0 ? (c.valor / totalDespesas) * 100 : 0,
      fill: COLORS[i % COLORS.length],
    }));

  const naturezaData = porNatureza.map(n => ({
    ...n,
    nomeFormatado: n.nome.charAt(0).toUpperCase() + n.nome.slice(1),
    fill: NATURE_COLORS[n.nome.toLowerCase()] || 'hsl(var(--chart-1))',
    percent: totalDespesas > 0 ? (n.valor / totalDespesas) * 100 : 0,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* By Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          <CardDescription>
            Distribuição de {formatCurrency(totalDespesas)} em despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="valor"
                  label={({ nome, percent }) => percent > 5 ? `${nome.substring(0, 10)}${nome.length > 10 ? '...' : ''} (${percent.toFixed(0)}%)` : ''}
                  labelLine={true}
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    formatCurrency(value),
                    props.payload.nome
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoriaData.slice(0, 6).map((cat, i) => (
              <div key={cat.nome} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: cat.fill }}
                />
                <span className="truncate text-muted-foreground">{cat.nome}</span>
                <span className="ml-auto font-medium">{cat.percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Nature (OPEX, CAPEX, etc) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Natureza</CardTitle>
          <CardDescription>
            Classificação DRE das despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={naturezaData} 
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tickFormatter={(v) => formatCurrency(v)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis 
                  type="category" 
                  dataKey="nomeFormatado" 
                  width={80}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {naturezaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="mt-4 space-y-2">
            {naturezaData.map((n) => (
              <div key={n.nome} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: n.fill }}
                  />
                  <span className="text-muted-foreground">{n.nomeFormatado}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatCurrency(n.valor)}</span>
                  <span className="text-muted-foreground w-12 text-right">
                    {n.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
