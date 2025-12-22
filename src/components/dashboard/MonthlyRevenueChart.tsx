import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function MonthlyRevenueChart() {
  // NOVA TABELA: td_fluxo_de_caixa
  const { data = [] } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 6);

      const { data: lancamentos, error } = await supabase
        .from("td_fluxo_de_caixa")
        .select("data_lancamento, tipo, valor")
        .gte("data_lancamento", format(sixMonthsAgo, "yyyy-MM-dd"))
        .order("data_lancamento");

      if (error) throw error;

      const monthlyData = (lancamentos || []).reduce((acc: any, item: any) => {
        const month = format(new Date(item.data_lancamento), "MMM/yy");
        if (!acc[month]) {
          acc[month] = { month, receita: 0, despesa: 0 };
        }
        if (item.tipo === "receita") {
          acc[month].receita += Number(item.valor || 0);
        } else if (item.tipo === "despesa") {
          acc[month].despesa += Number(item.valor || 0);
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
            <defs>
              <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="despesaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#94A3B8' }}
              style={{ fontSize: '12px' }} 
            />
            <YAxis 
              tick={{ fill: '#94A3B8' }}
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
            <Legend 
              wrapperStyle={{ 
                color: '#94A3B8',
                fontSize: '13px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Receita"
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="despesa" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Despesa"
              dot={{ fill: '#EF4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
