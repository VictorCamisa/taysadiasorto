import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function RevenueByTreatmentChart() {
  const { data = [] } = useQuery({
    queryKey: ["revenue-by-treatment"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      const { data: lancamentos, error } = await supabase
        .from("financeiro_lancamentos")
        .select("tratamento_id, valor_entrada, financeiro_tratamentos(nome)")
        .eq("tipo", "receita")
        .gte("data", format(startDate, "yyyy-MM-dd"))
        .lte("data", format(endDate, "yyyy-MM-dd"))
        .not("tratamento_id", "is", null);

      if (error) throw error;

      const grouped = (lancamentos || []).reduce((acc: any, item: any) => {
        const nome = item.financeiro_tratamentos?.nome || "Outros";
        if (!acc[nome]) acc[nome] = 0;
        acc[nome] += Number(item.valor_entrada || 0);
        return acc;
      }, {});

      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10);
    },
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Faturamento por Tratamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fill: 'hsl(var(--foreground))' }}
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              style={{ fontSize: '12px' }} 
            />
            <Tooltip 
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{ 
                backgroundColor: "hsl(var(--popover))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Bar 
              dataKey="value" 
              fill="url(#barGradient)" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
