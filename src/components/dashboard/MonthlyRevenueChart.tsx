import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";

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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Receita"
            />
            <Line 
              type="monotone" 
              dataKey="despesa" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Despesa"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
