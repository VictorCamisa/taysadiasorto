import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

// Professional gradient colors
const GRADIENTS = [
  { id: 'originGrad1', start: '#3B82F6', end: '#1D4ED8' },
  { id: 'originGrad2', start: '#8B5CF6', end: '#6D28D9' },
  { id: 'originGrad3', start: '#06B6D4', end: '#0891B2' },
  { id: 'originGrad4', start: '#10B981', end: '#059669' },
  { id: 'originGrad5', start: '#F59E0B', end: '#D97706' },
  { id: 'originGrad6', start: '#EC4899', end: '#BE185D' },
];

export function RevenueByOriginChart() {
  const { data = [] } = useQuery({
    queryKey: ["revenue-by-origin"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      const { data: lancamentos, error } = await supabase
        .from("financeiro_lancamentos")
        .select("origem_id, valor_entrada, financeiro_origens(nome)")
        .eq("tipo", "receita")
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"))
        .not("origem_id", "is", null);

      if (error) throw error;

      const grouped = (lancamentos || []).reduce((acc: any, item: any) => {
        const nome = item.financeiro_origens?.nome || "Outros";
        if (!acc[nome]) acc[nome] = 0;
        acc[nome] += Number(item.valor_entrada || 0);
        return acc;
      }, {});

      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    },
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Receitas por Origem</CardTitle>
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
              data={data}
              cx="50%"
              cy="50%"
              labelLine={{stroke: 'hsl(var(--foreground))'}}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => formatCurrency(Number(value))} 
              contentStyle={{ 
                backgroundColor: "hsl(var(--popover))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
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
