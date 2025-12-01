import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, subDays, format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target } from "lucide-react";

export function CashFlowProjection() {
  const [periodo, setPeriodo] = useState<"30" | "60" | "90">("30");
  
  const hoje = new Date();
  const dataFinal = addDays(hoje, Number(periodo));
  const dataInicioHistorico = subDays(hoje, 90); // 90 dias de histórico

  // Buscar histórico de receitas e despesas
  const { data: historicoLancamentos } = useQuery({
    queryKey: ['historico-lancamentos', format(dataInicioHistorico, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_lancamentos')
        .select('*')
        .gte('data', format(dataInicioHistorico, 'yyyy-MM-dd'))
        .lt('data', format(hoje, 'yyyy-MM-dd'))
        .order('data', { ascending: true });
      return data || [];
    }
  });

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

  // Análise de histórico e projeção inteligente
  const analiseHistorico = useMemo(() => {
    if (!historicoLancamentos || historicoLancamentos.length === 0) {
      return {
        receitaMediaDiaria: 0,
        despesaMediaDiaria: 0,
        tendenciaReceita: 0,
        tendenciaDespesa: 0,
        receitasPorDia: {},
        despesasPorDia: {}
      };
    }

    // Agrupar por dia
    const receitasPorDia: Record<string, number> = {};
    const despesasPorDia: Record<string, number> = {};

    historicoLancamentos.forEach((lanc: any) => {
      const dia = lanc.data;
      if (lanc.tipo === 'receita') {
        receitasPorDia[dia] = (receitasPorDia[dia] || 0) + Number(lanc.valor_entrada || 0);
      } else if (lanc.tipo === 'despesa') {
        despesasPorDia[dia] = (despesasPorDia[dia] || 0) + Number(lanc.valor_saida || 0);
      }
    });

    // Calcular médias diárias
    const diasComReceita = Object.values(receitasPorDia).filter(v => v > 0).length;
    const diasComDespesa = Object.values(despesasPorDia).filter(v => v > 0).length;
    
    const totalReceitas = Object.values(receitasPorDia).reduce((sum, v) => sum + v, 0);
    const totalDespesas = Object.values(despesasPorDia).reduce((sum, v) => sum + v, 0);
    
    const diasHistorico = differenceInDays(hoje, dataInicioHistorico);
    const receitaMediaDiaria = diasComReceita > 0 ? totalReceitas / diasHistorico : 0;
    const despesaMediaDiaria = diasComDespesa > 0 ? totalDespesas / diasHistorico : 0;

    // Calcular tendência (crescimento/queda)
    const metadeHistorico = Math.floor(diasHistorico / 2);
    const dataMetade = subDays(hoje, metadeHistorico);
    
    const receitaPrimeiraMetade = historicoLancamentos
      .filter((l: any) => l.tipo === 'receita' && new Date(l.data) < dataMetade)
      .reduce((sum, l: any) => sum + Number(l.valor_entrada || 0), 0);
    
    const receitaSegundaMetade = historicoLancamentos
      .filter((l: any) => l.tipo === 'receita' && new Date(l.data) >= dataMetade)
      .reduce((sum, l: any) => sum + Number(l.valor_entrada || 0), 0);

    const tendenciaReceita = receitaPrimeiraMetade > 0 
      ? ((receitaSegundaMetade - receitaPrimeiraMetade) / receitaPrimeiraMetade) * 100 
      : 0;

    const despesaPrimeiraMetade = historicoLancamentos
      .filter((l: any) => l.tipo === 'despesa' && new Date(l.data) < dataMetade)
      .reduce((sum, l: any) => sum + Number(l.valor_saida || 0), 0);
    
    const despesaSegundaMetade = historicoLancamentos
      .filter((l: any) => l.tipo === 'despesa' && new Date(l.data) >= dataMetade)
      .reduce((sum, l: any) => sum + Number(l.valor_saida || 0), 0);

    const tendenciaDespesa = despesaPrimeiraMetade > 0 
      ? ((despesaSegundaMetade - despesaPrimeiraMetade) / despesaPrimeiraMetade) * 100 
      : 0;

    return {
      receitaMediaDiaria,
      despesaMediaDiaria,
      tendenciaReceita,
      tendenciaDespesa,
      receitasPorDia,
      despesasPorDia
    };
  }, [historicoLancamentos, hoje, dataInicioHistorico]);

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

  // Calcular total de despesas programadas
  const totalDespesasProgramadas = contasPagar?.reduce((sum, c) => sum + Number(c.valor || 0), 0) || 0;

  // Gerar projeção inteligente com forecast
  const projecaoDiaria = useMemo(() => {
    const dados = [];
    let saldoAcumulado = saldoAtual;
    let receitasProjetadasAcum = 0;
    let despesasProjetadasAcum = 0;

    for (let i = 0; i <= Number(periodo); i++) {
      const data = addDays(hoje, i);
      const dataStr = format(data, 'yyyy-MM-dd');
      
      // Despesas programadas do dia
      const despesasProgramadas = contasPorData[dataStr]?.reduce((sum: number, c: any) => sum + Number(c.valor || 0), 0) || 0;
      
      // Projeção de receitas baseada em histórico com tendência
      const fatorTendencia = 1 + (analiseHistorico.tendenciaReceita / 100) * (i / Number(periodo));
      const receitaProjetada = analiseHistorico.receitaMediaDiaria * fatorTendencia;
      
      // Projeção de despesas operacionais (não programadas)
      const fatorTendenciaDespesa = 1 + (analiseHistorico.tendenciaDespesa / 100) * (i / Number(periodo));
      const despesaOperacional = analiseHistorico.despesaMediaDiaria * fatorTendenciaDespesa;
      
      const despesaTotal = despesasProgramadas + despesaOperacional;
      
      // Cenários: pessimista (70% receita), realista (100%), otimista (130%)
      const receitaPessimista = receitaProjetada * 0.7;
      const receitaOtimista = receitaProjetada * 1.3;
      
      saldoAcumulado = saldoAcumulado + receitaProjetada - despesaTotal;
      const saldoPessimista = saldoAtual + (receitaPessimista * (i + 1)) - (despesaTotal * (i + 1));
      const saldoOtimista = saldoAtual + (receitaOtimista * (i + 1)) - (despesaTotal * (i + 1));
      
      receitasProjetadasAcum += receitaProjetada;
      despesasProjetadasAcum += despesaTotal;
      
      dados.push({
        data: format(data, 'dd/MMM', { locale: ptBR }),
        dataCompleta: dataStr,
        saldo: saldoAcumulado,
        saldoPessimista,
        saldoOtimista,
        receitas: receitaProjetada,
        despesas: despesaTotal,
        despesasProgramadas,
        despesasOperacionais: despesaOperacional,
        saldoOriginal: saldoAtual,
      });
    }
    
    return { dados, receitasProjetadasAcum, despesasProjetadasAcum };
  }, [periodo, saldoAtual, contasPorData, analiseHistorico, hoje]);

  // Resumo por período
  const ultimoDia = projecaoDiaria.dados[projecaoDiaria.dados.length - 1];
  const saldoFinal = ultimoDia?.saldo || saldoAtual;
  const receitasProjetadas = projecaoDiaria.receitasProjetadasAcum;
  const despesasProjetadas = projecaoDiaria.despesasProjetadasAcum;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(saldoAtual)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Receitas Projetadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(receitasProjetadas)}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={analiseHistorico.tendenciaReceita >= 0 ? "default" : "destructive"} className="text-xs">
                {analiseHistorico.tendenciaReceita >= 0 ? '↗' : '↘'} {Math.abs(analiseHistorico.tendenciaReceita).toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">tendência</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Despesas Projetadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(despesasProjetadas)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Programadas: {formatCurrency(totalDespesasProgramadas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
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
                em {periodo} dias
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Análise de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Histórico (últimos 90 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Receita Média Diária</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(analiseHistorico.receitaMediaDiaria)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={analiseHistorico.tendenciaReceita >= 0 ? "default" : "destructive"}>
                  {analiseHistorico.tendenciaReceita >= 0 ? '↗ Crescimento' : '↘ Queda'} {Math.abs(analiseHistorico.tendenciaReceita).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Despesa Média Diária</span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(analiseHistorico.despesaMediaDiaria)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={analiseHistorico.tendenciaDespesa >= 0 ? "destructive" : "default"}>
                  {analiseHistorico.tendenciaDespesa >= 0 ? '↗ Aumento' : '↘ Redução'} {Math.abs(analiseHistorico.tendenciaDespesa).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Projeção com Cenários */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast de Saldo (baseado em histórico)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Projeção inteligente com cenários pessimista, realista e otimista
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={projecaoDiaria.dados}>
              <defs>
                <linearGradient id="gradientOtimista" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientPessimista" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="data" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                interval={Math.floor(Number(periodo) / 10)}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `${payload[0].payload.dataCompleta}`;
                  }
                  return label;
                }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              
              <Area 
                type="monotone" 
                dataKey="saldoOtimista" 
                name="Cenário Otimista (+30%)" 
                stroke="#10b981" 
                fill="url(#gradientOtimista)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Area 
                type="monotone" 
                dataKey="saldoPessimista" 
                name="Cenário Pessimista (-30%)" 
                stroke="#ef4444" 
                fill="url(#gradientPessimista)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                name="Projeção Realista" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="saldoOriginal" 
                name="Saldo Atual" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Receitas vs Despesas Projetadas */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas Projetadas (diárias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={projecaoDiaria.dados}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="data" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                interval={Math.floor(Number(periodo) / 10)}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="receitas" name="Receitas Projetadas" fill="url(#receitaGrad)" />
              <Bar dataKey="despesas" name="Despesas Totais" fill="url(#despesaGrad)" />
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
