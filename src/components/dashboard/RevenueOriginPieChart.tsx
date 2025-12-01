import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueOriginPieChartProps {
  data: Record<string, number>;
}

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
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
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [
                `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
                'Receita'
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
