import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function MonthlyRevenueChart() {
  const { data = [] } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 6);

      const { data: lancamentos, error } = await supabase
        .from("financeiro_lancamentos")
        .select("data, tipo, valor_entrada, valor_saida")
        .gte("data", format(sixMonthsAgo, "yyyy-MM-dd"))
        .order("data");

      if (error) throw error;

      const monthlyData = (lancamentos || []).reduce((acc: any, item) => {
        const month = format(new Date(item.data), "MMM/yy");
        if (!acc[month]) {
          acc[month] = { month, receita: 0, despesa: 0 };
        }
        if (item.tipo === "receita") {
          acc[month].receita += Number(item.valor_entrada || 0);
        } else if (item.tipo === "despesa") {
          acc[month].despesa += Number(item.valor_saida || 0);
        }
        return acc;
      }, {});

      return Object.values(monthlyData);
    },
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Movimento Financeiro (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <Tooltip 
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Receita"
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="despesa" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Despesa"
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
