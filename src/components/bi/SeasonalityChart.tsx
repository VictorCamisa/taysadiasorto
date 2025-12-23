import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Line, Bar } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SeasonalityData {
  mes: string;
  receita: number;
  quantidade: number;
  mediaHistorica: number;
  variacao: number;
}

interface SeasonalityChartProps {
  data: SeasonalityData[];
}

export function SeasonalityChart({ data }: SeasonalityChartProps) {
  const avgReceita = data.reduce((sum, d) => sum + d.receita, 0) / data.length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sazonalidade de Receita</CardTitle>
          <CardDescription>
            Comparação com média histórica e identificação de padrões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'receita' || name === 'Receita') return [formatCurrency(value), 'Receita'];
                    if (name === 'mediaHistorica' || name === 'Média Histórica') return [formatCurrency(value), 'Média Histórica'];
                    if (name === 'quantidade' || name === 'Qtd Transações') return [value, 'Qtd Transações'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <ReferenceLine 
                  yAxisId="left"
                  y={avgReceita} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Média', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#colorReceita)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mediaHistorica"
                  name="Média Histórica"
                  stroke="hsl(var(--chart-4))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Bar
                  yAxisId="right"
                  dataKey="quantidade"
                  name="Qtd Transações"
                  fill="hsl(var(--chart-2))"
                  opacity={0.6}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Variation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variação vs Média Histórica</CardTitle>
          <CardDescription>
            Identifique meses acima ou abaixo da média
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {data.map((item) => {
              const isPositive = item.variacao >= 0;
              const absVariation = Math.abs(item.variacao);
              const maxVariation = Math.max(...data.map(d => Math.abs(d.variacao)), 1);
              const barWidth = (absVariation / maxVariation) * 50;
              
              return (
                <div key={item.mes} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">{item.mes}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="w-1/2 flex justify-end">
                      {!isPositive && (
                        <div 
                          className="h-4 bg-red-500/60 rounded-l"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="w-1/2 flex justify-start">
                      {isPositive && (
                        <div 
                          className="h-4 bg-emerald-500/60 rounded-r"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className={`w-16 text-right text-sm font-medium ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{item.variacao.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
