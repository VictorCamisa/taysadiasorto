import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TopTreatmentsChartProps {
  data: Array<{ nome: string; receita: number; margem?: number; margemPercentual?: number }>;
  title: string;
  dataKey: "receita" | "margemPercentual";
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" />
            <YAxis dataKey="nome" type="category" width={150} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => 
                dataKey === "receita" 
                  ? `R$ ${value.toFixed(2)}` 
                  : `${value.toFixed(1)}%`
              }
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
