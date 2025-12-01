import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface TopTreatmentsChartProps {
  data: Array<{ nome: string; receita: number; margem?: number; margemPercentual?: number }>;
  title: string;
  dataKey: "receita" | "margemPercentual";
}

// Professional color palette - vibrant blues, purples, and teals
const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="nome" type="category" width={150} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
              formatter={(value: number) => 
                dataKey === "receita" 
                  ? formatCurrency(value)
                  : `${formatNumber(value, 1)}%`
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
