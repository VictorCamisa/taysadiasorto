import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueOriginPieChartProps {
  data: Record<string, number>;
}

// Professional gradient colors
const GRADIENTS = [
  { id: 'pieGrad1', start: '#3B82F6', end: '#1D4ED8' },
  { id: 'pieGrad2', start: '#8B5CF6', end: '#6D28D9' },
  { id: 'pieGrad3', start: '#06B6D4', end: '#0891B2' },
  { id: 'pieGrad4', start: '#10B981', end: '#059669' },
  { id: 'pieGrad5', start: '#F59E0B', end: '#D97706' },
  { id: 'pieGrad6', start: '#EC4899', end: '#BE185D' },
];

export function RevenueOriginPieChart({ data }: RevenueOriginPieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Receita por Origem</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <defs>
              {GRADIENTS.map((gradient) => (
                <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={gradient.start} stopOpacity={1} />
                  <stop offset="100%" stopColor={gradient.end} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={{stroke: 'hsl(var(--foreground))'}}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number) => [
                `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
                'Receita'
              ]}
            />
            <Legend 
              wrapperStyle={{ 
                color: 'hsl(var(--foreground))',
                fontSize: '13px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
