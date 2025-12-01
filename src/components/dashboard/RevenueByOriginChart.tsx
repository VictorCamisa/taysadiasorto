import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d", "#ffc658"];

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
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
