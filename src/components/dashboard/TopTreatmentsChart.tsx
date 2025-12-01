import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface TopTreatmentsChartProps {
  data: Array<{ nome: string; receita: number; margem?: number; margemPercentual?: number }>;
  title: string;
  dataKey: "receita" | "margemPercentual";
}

// Professional gradient colors
const GRADIENTS = [
  { id: 'gradient1', start: '#3B82F6', end: '#1D4ED8' },
  { id: 'gradient2', start: '#8B5CF6', end: '#6D28D9' },
  { id: 'gradient3', start: '#06B6D4', end: '#0891B2' },
  { id: 'gradient4', start: '#10B981', end: '#059669' },
  { id: 'gradient5', start: '#F59E0B', end: '#D97706' },
];

export function TopTreatmentsChart({ data, title, dataKey }: TopTreatmentsChartProps) {
  const chartData = data.map(item => ({
    nome: item.nome.length > 20 ? item.nome.substring(0, 20) + '...' : item.nome,
    value: dataKey === "receita" ? item.receita : item.margemPercentual || 0,
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <defs>
              {GRADIENTS.map((gradient) => (
                <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={gradient.start} stopOpacity={1} />
                  <stop offset="100%" stopColor={gradient.end} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              type="number" 
              tick={{ fill: 'hsl(var(--foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              dataKey="nome" 
              type="category" 
              width={150}
              tick={{ fill: 'hsl(var(--foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number) => 
                dataKey === "receita" 
                  ? formatCurrency(value)
                  : `${formatNumber(value, 1)}%`
              }
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
