import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function CashFlowProjection() {
  const [periodo, setPeriodo] = useState<"30" | "60" | "90">("30");
  
  const hoje = new Date();
  const dataFinal = addDays(hoje, Number(periodo));

  // Buscar saldo atual das contas
  const { data: contas } = useQuery({
    queryKey: ['contas-ativas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_contas')
        .select('*')
        .eq('ativa', true);
      return data || [];
    }
  });

  // Buscar contas a pagar futuras
  const { data: contasPagar } = useQuery({
    queryKey: ['contas-pagar-futuras', format(dataFinal, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_contas_pagar')
        .select('*, financeiro_fornecedores(nome)')
        .eq('status', 'aberto')
        .lte('vencimento', format(dataFinal, 'yyyy-MM-dd'))
        .gte('vencimento', format(hoje, 'yyyy-MM-dd'))
        .order('vencimento', { ascending: true });
      return data || [];
    }
  });

  // Calcular saldo atual total
  const saldoAtual = contas?.reduce((sum, c) => sum + Number(c.saldo_atual || 0), 0) || 0;

  // Agrupar contas a pagar por data
  const contasPorData = contasPagar?.reduce((acc: any, conta: any) => {
    const dataVenc = format(new Date(conta.vencimento), 'yyyy-MM-dd');
    if (!acc[dataVenc]) {
      acc[dataVenc] = [];
    }
    acc[dataVenc].push(conta);
    return acc;
  }, {}) || {};

  // Calcular total de despesas por período
  const totalDespesas = contasPagar?.reduce((sum, c) => sum + Number(c.valor || 0), 0) || 0;

  // Gerar dados para o gráfico de projeção diária
  const projecaoDiaria = [];
  let saldoAcumulado = saldoAtual;

  for (let i = 0; i <= Number(periodo); i++) {
    const data = addDays(hoje, i);
    const dataStr = format(data, 'yyyy-MM-dd');
    const despesasDoDia = contasPorData[dataStr]?.reduce((sum: number, c: any) => sum + Number(c.valor || 0), 0) || 0;
    
    saldoAcumulado -= despesasDoDia;
    
    projecaoDiaria.push({
      data: format(data, 'dd/MMM', { locale: ptBR }),
      dataCompleta: dataStr,
      saldo: saldoAcumulado,
      despesas: despesasDoDia,
      saldoOriginal: saldoAtual,
    });
  }

  // Resumo por período
  const saldoFinal = saldoAcumulado;
  const variacao = saldoFinal - saldoAtual;
  const variacaoPercentual = saldoAtual !== 0 ? (variacao / saldoAtual) * 100 : 0;

  // Próximos pagamentos agrupados
  const proximosPagamentos = contasPagar?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projeção de Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período de Projeção</label>
              <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Próximos 30 dias</SelectItem>
                  <SelectItem value="60">Próximos 60 dias</SelectItem>
                  <SelectItem value="90">Próximos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(saldoAtual)}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de todas as contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Despesas Previstas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDespesas)}</div>
            <p className="text-xs text-muted-foreground mt-1">Próximos {periodo} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Saldo Projetado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(saldoFinal)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={variacao >= 0 ? "default" : "destructive"}>
                {variacao >= 0 ? '+' : ''}{variacaoPercentual.toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {variacao >= 0 ? '+' : ''}{formatCurrency(variacao)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Projeção */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo Projetado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={projecaoDiaria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(Number(periodo) / 10)}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'Saldo Projetado' || name === 'Saldo Inicial') {
                    return formatCurrency(Number(value));
                  }
                  return formatCurrency(Number(value));
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Data: ${payload[0].payload.dataCompleta}`;
                  }
                  return label;
                }}
              />
              <Legend />
              <Bar dataKey="despesas" name="Despesas do Dia" fill="#ef4444" />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                name="Saldo Projetado" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="saldoOriginal" 
                name="Saldo Inicial" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Próximos Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {proximosPagamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum pagamento previsto para este período
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximosPagamentos.map((conta: any) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">
                      {format(new Date(conta.vencimento), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>{conta.financeiro_fornecedores?.nome || '-'}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(Number(conta.valor || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
