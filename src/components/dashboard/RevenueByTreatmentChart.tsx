import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
