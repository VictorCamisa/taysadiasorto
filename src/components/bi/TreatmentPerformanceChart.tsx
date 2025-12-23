import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatmentAnalysis {
  id: string;
  nome: string;
  receita: number;
  custo: number;
  margem: number;
  margemPercentual: number;
  quantidade: number;
  ticketMedio: number;
  recorrencia: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface TreatmentPerformanceChartProps {
  data: TreatmentAnalysis[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function TreatmentPerformanceChart({ data }: TreatmentPerformanceChartProps) {
  const chartData = data.slice(0, 10).map((item, index) => ({
    ...item,
    nomeShort: item.nome.length > 15 ? item.nome.substring(0, 15) + '...' : item.nome,
    color: COLORS[index % COLORS.length],
  }));

  const TrendIcon = ({ tendencia }: { tendencia: 'up' | 'down' | 'stable' }) => {
    if (tendencia === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (tendencia === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Tratamentos por Receita</CardTitle>
          <CardDescription>
            Performance dos principais tratamentos no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
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
                  dataKey="nomeShort" 
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'receita') return [formatCurrency(value), 'Receita'];
                    if (name === 'margem') return [formatCurrency(value), 'Margem'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="receita" name="receita" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Detalhada por Tratamento</CardTitle>
          <CardDescription>
            Métricas completas de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tratamento</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Ticket</TableHead>
                  <TableHead className="text-right">Recorrência</TableHead>
                  <TableHead className="text-center">Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 15).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {item.nome}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.receita)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.margem)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={
                        item.margemPercentual >= 50 ? 'default' :
                        item.margemPercentual >= 30 ? 'secondary' :
                        'destructive'
                      }>
                        {item.margemPercentual.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantidade}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.ticketMedio)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        item.recorrencia >= 30 ? "text-emerald-600 dark:text-emerald-400" :
                        item.recorrencia >= 10 ? "text-amber-600 dark:text-amber-400" :
                        "text-muted-foreground"
                      )}>
                        {item.recorrencia.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendIcon tendencia={item.tendencia} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
