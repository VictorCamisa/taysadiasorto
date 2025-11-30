import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, FileText, DollarSign, TrendingUp, Package, Filter, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

// Componente de Badge de Variação
const VariacaoBadge = ({ valor }: { valor: number }) => {
  if (valor === 0) return null;
  
  const isPositivo = valor > 0;
  const Icon = isPositivo ? ArrowUpRight : ArrowDownRight;
  
  return (
    <Badge variant={isPositivo ? "default" : "destructive"} className="ml-2">
      <Icon className="h-3 w-3 mr-1" />
      {Math.abs(valor).toFixed(1)}%
    </Badge>
  );
};

const Relatorios = () => {
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [compararPeriodos, setCompararPeriodos] = useState(false);
  const [dataInicioComp, setDataInicioComp] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [dataFimComp, setDataFimComp] = useState(format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [tratamentoFiltro, setTratamentoFiltro] = useState<string>("todos");
  const [origemFiltro, setOrigemFiltro] = useState<string>("todos");
  const [categoriaSinteticaFiltro, setCategoriaSinteticaFiltro] = useState<string>("todos");
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>("todos");
  const [categoriaEstoqueFiltro, setCategoriaEstoqueFiltro] = useState<string>("todos");
  const [statusEstoqueFiltro, setStatusEstoqueFiltro] = useState<string>("todos");

  // Queries para dados básicos
  const { data: tratamentos } = useQuery({
    queryKey: ['tratamentos'],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_tratamentos')
        .select('*')
        .eq('ativo', true);
      return data || [];
    }
  });

  const { data: origens } = useQuery({
    queryKey: ['origens'],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_origens')
        .select('*')
        .eq('ativa', true);
      return data || [];
    }
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_categorias')
        .select('*')
        .eq('ativa', true);
      return data || [];
    }
  });

  const { data: fornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const { data } = await supabase
        .from('financeiro_fornecedores')
        .select('*')
        .eq('ativo', true);
      return data || [];
    }
  });

  // Query para receitas - Período Principal
  const { data: receitas, isLoading: loadingReceitas } = useQuery({
    queryKey: ['relatorio-receitas', dataInicio, dataFim, tratamentoFiltro, origemFiltro],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          tratamento:tratamento_id(nome, grupo),
          origem:origem_id(nome),
          forma_pagamento:forma_pagamento_id(nome)
        `)
        .eq('tipo', 'receita')
        .gte('data', dataInicio)
        .lte('data', dataFim);

      if (tratamentoFiltro !== 'todos') query = query.eq('tratamento_id', tratamentoFiltro);
      if (origemFiltro !== 'todos') query = query.eq('origem_id', origemFiltro);

      const { data } = await query.order('data', { ascending: false });
      return data || [];
    }
  });

  // Query para receitas - Período de Comparação
  const { data: receitasComp } = useQuery({
    queryKey: ['relatorio-receitas-comp', dataInicioComp, dataFimComp, tratamentoFiltro, origemFiltro, compararPeriodos],
    queryFn: async () => {
      if (!compararPeriodos) return [];
      
      let query = supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          tratamento:tratamento_id(nome, grupo),
          origem:origem_id(nome),
          forma_pagamento:forma_pagamento_id(nome)
        `)
        .eq('tipo', 'receita')
        .gte('data', dataInicioComp)
        .lte('data', dataFimComp);

      if (tratamentoFiltro !== 'todos') query = query.eq('tratamento_id', tratamentoFiltro);
      if (origemFiltro !== 'todos') query = query.eq('origem_id', origemFiltro);

      const { data } = await query.order('data', { ascending: false });
      return data || [];
    },
    enabled: compararPeriodos
  });

  // Query para despesas - Período Principal
  const { data: despesas, isLoading: loadingDespesas } = useQuery({
    queryKey: ['relatorio-despesas', dataInicio, dataFim, categoriaSinteticaFiltro, fornecedorFiltro],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          categoria:categoria_id(categoria_sintetica, categoria_analitica),
          fornecedor:fornecedor_id(nome),
          forma_pagamento:forma_pagamento_id(nome)
        `)
        .eq('tipo', 'despesa')
        .gte('data', dataInicio)
        .lte('data', dataFim);

      if (fornecedorFiltro !== 'todos') query = query.eq('fornecedor_id', fornecedorFiltro);

      const { data } = await query.order('data', { ascending: false });
      
      let filteredData = data || [];
      if (categoriaSinteticaFiltro !== 'todos') {
        filteredData = filteredData.filter(d => d.categoria?.categoria_sintetica === categoriaSinteticaFiltro);
      }
      
      return filteredData;
    }
  });

  // Query para despesas - Período de Comparação
  const { data: despesasComp } = useQuery({
    queryKey: ['relatorio-despesas-comp', dataInicioComp, dataFimComp, categoriaSinteticaFiltro, fornecedorFiltro, compararPeriodos],
    queryFn: async () => {
      if (!compararPeriodos) return [];
      
      let query = supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          categoria:categoria_id(categoria_sintetica, categoria_analitica),
          fornecedor:fornecedor_id(nome),
          forma_pagamento:forma_pagamento_id(nome)
        `)
        .eq('tipo', 'despesa')
        .gte('data', dataInicioComp)
        .lte('data', dataFimComp);

      if (fornecedorFiltro !== 'todos') query = query.eq('fornecedor_id', fornecedorFiltro);

      const { data } = await query.order('data', { ascending: false });
      
      let filteredData = data || [];
      if (categoriaSinteticaFiltro !== 'todos') {
        filteredData = filteredData.filter(d => d.categoria?.categoria_sintetica === categoriaSinteticaFiltro);
      }
      
      return filteredData;
    },
    enabled: compararPeriodos
  });

  // Query para estoque
  const { data: estoque, isLoading: loadingEstoque } = useQuery({
    queryKey: ['relatorio-estoque', categoriaEstoqueFiltro, statusEstoqueFiltro],
    queryFn: async () => {
      let query = supabase
        .from('estoque_produtos')
        .select(`
          *,
          fornecedor:financeiro_fornecedores!fornecedor_id(nome)
        `)
        .eq('ativo', true);

      if (categoriaEstoqueFiltro !== 'todos') query = query.eq('categoria', categoriaEstoqueFiltro);

      const { data } = await query.order('nome');
      
      let filteredData = data || [];
      if (statusEstoqueFiltro === 'baixo') {
        filteredData = filteredData.filter(p => (p.estoque_atual || 0) <= (p.estoque_minimo || 0));
      } else if (statusEstoqueFiltro === 'ok') {
        filteredData = filteredData.filter(p => (p.estoque_atual || 0) > (p.estoque_minimo || 0));
      }
      
      return filteredData;
    }
  });

  // Cálculos para Receitas
  const receitaTotal = receitas?.reduce((sum, r) => sum + (r.valor_entrada || 0), 0) || 0;
  const quantidadeVendas = receitas?.length || 0;
  const ticketMedio = quantidadeVendas > 0 ? receitaTotal / quantidadeVendas : 0;
  
  const receitaTotalComp = receitasComp?.reduce((sum, r) => sum + (r.valor_entrada || 0), 0) || 0;
  const quantidadeVendasComp = receitasComp?.length || 0;
  const ticketMedioComp = quantidadeVendasComp > 0 ? receitaTotalComp / quantidadeVendasComp : 0;
  
  const variacaoReceita = receitaTotalComp > 0 ? ((receitaTotal - receitaTotalComp) / receitaTotalComp) * 100 : 0;
  const variacaoQuantidade = quantidadeVendasComp > 0 ? ((quantidadeVendas - quantidadeVendasComp) / quantidadeVendasComp) * 100 : 0;
  const variacaoTicket = ticketMedioComp > 0 ? ((ticketMedio - ticketMedioComp) / ticketMedioComp) * 100 : 0;

  const receitasPorTratamento = receitas?.reduce((acc: any[], r) => {
    const nome = r.tratamento?.nome || 'Sem tratamento';
    const existing = acc.find(item => item.nome === nome);
    if (existing) {
      existing.valor += r.valor_entrada || 0;
      existing.quantidade += 1;
    } else {
      acc.push({ nome, valor: r.valor_entrada || 0, quantidade: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.valor - a.valor).slice(0, 10) || [];

  const receitasPorOrigem = receitas?.reduce((acc: any[], r) => {
    const nome = r.origem?.nome || 'Sem origem';
    const existing = acc.find(item => item.name === nome);
    if (existing) {
      existing.value += r.valor_entrada || 0;
    } else {
      acc.push({ name: nome, value: r.valor_entrada || 0 });
    }
    return acc;
  }, []) || [];

  // Cálculos para Despesas
  const despesaTotal = despesas?.reduce((sum, d) => sum + (d.valor_saida || 0), 0) || 0;
  const despesaMedia = despesas && despesas.length > 0 ? despesaTotal / despesas.length : 0;
  const maiorDespesa = despesas?.reduce((max, d) => Math.max(max, d.valor_saida || 0), 0) || 0;
  
  const despesaTotalComp = despesasComp?.reduce((sum, d) => sum + (d.valor_saida || 0), 0) || 0;
  const despesaMediaComp = despesasComp && despesasComp.length > 0 ? despesaTotalComp / despesasComp.length : 0;
  
  const variacaoDespesa = despesaTotalComp > 0 ? ((despesaTotal - despesaTotalComp) / despesaTotalComp) * 100 : 0;
  const variacaoDespesaMedia = despesaMediaComp > 0 ? ((despesaMedia - despesaMediaComp) / despesaMediaComp) * 100 : 0;

  const despesasPorCategoria = despesas?.reduce((acc: any[], d) => {
    const nome = d.categoria?.categoria_sintetica || 'Sem categoria';
    const existing = acc.find(item => item.nome === nome);
    if (existing) {
      existing.valor += d.valor_saida || 0;
    } else {
      acc.push({ nome, valor: d.valor_saida || 0 });
    }
    return acc;
  }, []).sort((a, b) => b.valor - a.valor) || [];

  // Cálculos para Margens
  const margensPorTratamento = receitas?.reduce((acc: any[], r) => {
    if (!r.tratamento_id) return acc;
    
    const nome = r.tratamento?.nome || 'Sem nome';
    const receita = r.valor_entrada || 0;
    const custo = r.custo_tratamento || 0;
    const margem = receita - custo;
    
    const existing = acc.find(item => item.nome === nome);
    if (existing) {
      existing.receita += receita;
      existing.custo += custo;
      existing.margem += margem;
      existing.quantidade += r.quantidade || 1;
    } else {
      acc.push({
        nome,
        receita,
        custo,
        margem,
        quantidade: r.quantidade || 1,
        percentual: 0
      });
    }
    return acc;
  }, []) || [];

  margensPorTratamento.forEach(item => {
    item.percentual = item.receita > 0 ? (item.margem / item.receita) * 100 : 0;
  });

  const margemBrutaTotal = margensPorTratamento.reduce((sum, m) => sum + m.margem, 0);
  const margemPercentualTotal = receitaTotal > 0 ? (margemBrutaTotal / receitaTotal) * 100 : 0;
  const tratamentoMaisRentavel = margensPorTratamento.sort((a, b) => b.margem - a.margem)[0];

  const margensPorTratamentoComp = receitasComp?.reduce((acc: any[], r) => {
    if (!r.tratamento_id) return acc;
    
    const nome = r.tratamento?.nome || 'Sem nome';
    const receita = r.valor_entrada || 0;
    const custo = r.custo_tratamento || 0;
    const margem = receita - custo;
    
    const existing = acc.find(item => item.nome === nome);
    if (existing) {
      existing.receita += receita;
      existing.custo += custo;
      existing.margem += margem;
      existing.quantidade += r.quantidade || 1;
    } else {
      acc.push({
        nome,
        receita,
        custo,
        margem,
        quantidade: r.quantidade || 1,
        percentual: 0
      });
    }
    return acc;
  }, []) || [];

  margensPorTratamentoComp.forEach(item => {
    item.percentual = item.receita > 0 ? (item.margem / item.receita) * 100 : 0;
  });

  const margemBrutaTotalComp = margensPorTratamentoComp.reduce((sum, m) => sum + m.margem, 0);
  const margemPercentualTotalComp = receitaTotalComp > 0 ? (margemBrutaTotalComp / receitaTotalComp) * 100 : 0;
  
  const variacaoMargemBruta = margemBrutaTotalComp > 0 ? ((margemBrutaTotal - margemBrutaTotalComp) / margemBrutaTotalComp) * 100 : 0;
  const variacaoMargemPercentual = margemPercentualTotalComp > 0 ? ((margemPercentualTotal - margemPercentualTotalComp) / margemPercentualTotalComp) * 100 : 0;

  // Cálculos para Estoque
  const totalProdutos = estoque?.length || 0;
  const valorTotalEstoque = estoque?.reduce((sum, p) => sum + ((p.estoque_atual || 0) * (p.custo_medio || 0)), 0) || 0;
  const produtosCriticos = estoque?.filter(p => (p.estoque_atual || 0) <= (p.estoque_minimo || 0)).length || 0;

  const categoriasSinteticasUnicas = Array.from(new Set(categorias?.map(c => c.categoria_sintetica)));
  const categoriasEstoqueUnicas = Array.from(new Set(estoque?.map(p => p.categoria)));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análises e relatórios detalhados com comparação de períodos</p>
        </div>
      </div>

      <Tabs defaultValue="receitas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="margens">Margens</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        {/* ABA RECEITAS */}
        <TabsContent value="receitas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtros e Comparação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Switch
                    id="comparar-periodos"
                    checked={compararPeriodos}
                    onCheckedChange={setCompararPeriodos}
                  />
                  <Label htmlFor="comparar-periodos" className="cursor-pointer font-medium">
                    Comparar com período anterior
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início (Período Atual)</Label>
                    <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim (Período Atual)</Label>
                    <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  </div>
                  {compararPeriodos && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Início (Comparação)</Label>
                        <Input type="date" value={dataInicioComp} onChange={(e) => setDataInicioComp(e.target.value)} className="border-accent" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Fim (Comparação)</Label>
                        <Input type="date" value={dataFimComp} onChange={(e) => setDataFimComp(e.target.value)} className="border-accent" />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tratamento</Label>
                    <Select value={tratamentoFiltro} onValueChange={setTratamentoFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {tratamentos?.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Select value={origemFiltro} onValueChange={setOrigemFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {origens?.map(o => (
                          <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={variacaoReceita} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && receitaTotalComp > 0 
                    ? `Comparado a ${receitaTotalComp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` 
                    : 'Período selecionado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={variacaoTicket} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && ticketMedioComp > 0
                    ? `Comparado a ${ticketMedioComp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : 'Valor médio por venda'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quantidade de Vendas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{quantidadeVendas}</div>
                  {compararPeriodos && <VariacaoBadge valor={variacaoQuantidade} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && quantidadeVendasComp > 0
                    ? `Comparado a ${quantidadeVendasComp} vendas`
                    : 'Total de transações'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita por Tratamento (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={receitasPorTratamento}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                    <Bar dataKey="valor" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita por Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={receitasPorOrigem}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receitasPorOrigem.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Receitas Detalhadas</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReceitas ? (
                <p className="text-center text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tratamento</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Forma Pagamento</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitas?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(new Date(r.data), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{r.cliente || '-'}</TableCell>
                        <TableCell>{r.tratamento?.nome || '-'}</TableCell>
                        <TableCell>{r.origem?.nome || '-'}</TableCell>
                        <TableCell>{r.forma_pagamento?.nome || '-'}</TableCell>
                        <TableCell className="text-right">{r.quantidade || 1}</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {(r.valor_entrada || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA DESPESAS */}
        <TabsContent value="despesas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtros e Comparação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Switch
                    id="comparar-periodos-despesas"
                    checked={compararPeriodos}
                    onCheckedChange={setCompararPeriodos}
                  />
                  <Label htmlFor="comparar-periodos-despesas" className="cursor-pointer font-medium">
                    Comparar com período anterior
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início (Período Atual)</Label>
                    <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim (Período Atual)</Label>
                    <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  </div>
                  {compararPeriodos && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Início (Comparação)</Label>
                        <Input type="date" value={dataInicioComp} onChange={(e) => setDataInicioComp(e.target.value)} className="border-accent" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Fim (Comparação)</Label>
                        <Input type="date" value={dataFimComp} onChange={(e) => setDataFimComp(e.target.value)} className="border-accent" />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria Sintética</Label>
                    <Select value={categoriaSinteticaFiltro} onValueChange={setCategoriaSinteticaFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {categoriasSinteticasUnicas.map(cat => (
                          <SelectItem key={cat} value={cat || ''}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {fornecedores?.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-destructive">
                    {despesaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={-variacaoDespesa} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && despesaTotalComp > 0
                    ? `Comparado a ${despesaTotalComp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : 'Período selecionado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Despesa Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {despesaMedia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={-variacaoDespesaMedia} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && despesaMediaComp > 0
                    ? `Comparado a ${despesaMediaComp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : 'Média por transação'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Maior Despesa</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maiorDespesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maior transação</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Despesas por Categoria Sintética</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={despesasPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Bar dataKey="valor" fill="var(--destructive)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Despesas Detalhadas</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDespesas ? (
                <p className="text-center text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria Sintética</TableHead>
                      <TableHead>Categoria Analítica</TableHead>
                      <TableHead>Forma Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas?.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{format(new Date(d.data), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{d.fornecedor?.nome || '-'}</TableCell>
                        <TableCell>{d.categoria?.categoria_sintetica || '-'}</TableCell>
                        <TableCell>{d.categoria?.categoria_analitica || '-'}</TableCell>
                        <TableCell>{d.forma_pagamento?.nome || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          {(d.valor_saida || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA MARGENS */}
        <TabsContent value="margens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtros e Comparação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Switch
                    id="comparar-periodos-margens"
                    checked={compararPeriodos}
                    onCheckedChange={setCompararPeriodos}
                  />
                  <Label htmlFor="comparar-periodos-margens" className="cursor-pointer font-medium">
                    Comparar com período anterior
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início (Período Atual)</Label>
                    <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim (Período Atual)</Label>
                    <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  </div>
                  {compararPeriodos && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Início (Comparação)</Label>
                        <Input type="date" value={dataInicioComp} onChange={(e) => setDataInicioComp(e.target.value)} className="border-accent" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-accent-foreground">Data Fim (Comparação)</Label>
                        <Input type="date" value={dataFimComp} onChange={(e) => setDataFimComp(e.target.value)} className="border-accent" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Margem Bruta Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {margemBrutaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={variacaoMargemBruta} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && margemBrutaTotalComp > 0
                    ? `Comparado a ${margemBrutaTotalComp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : 'Período selecionado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Margem %</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {margemPercentualTotal.toFixed(1)}%
                  </div>
                  {compararPeriodos && <VariacaoBadge valor={variacaoMargemPercentual} />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {compararPeriodos && margemPercentualTotalComp > 0
                    ? `Comparado a ${margemPercentualTotalComp.toFixed(1)}%`
                    : 'Sobre a receita total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mais Rentável</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{tratamentoMaisRentavel?.nome || '-'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tratamentoMaisRentavel ? `${tratamentoMaisRentavel.percentual.toFixed(1)}% de margem` : 'Nenhum dado'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Margem por Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={margensPorTratamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="custo" fill="#ef4444" name="Custo" />
                  <Bar dataKey="margem" fill="var(--primary)" name="Margem" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Análise de Margem por Tratamento</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tratamento</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Margem Bruta</TableHead>
                    <TableHead className="text-right">% Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {margensPorTratamento.map((m, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{m.nome}</TableCell>
                      <TableCell className="text-right">{m.quantidade}</TableCell>
                      <TableCell className="text-right">
                        {m.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {m.margem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={m.percentual >= 50 ? "default" : m.percentual >= 30 ? "secondary" : "destructive"}>
                          {m.percentual.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA ESTOQUE */}
        <TabsContent value="estoque" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoriaEstoqueFiltro} onValueChange={setCategoriaEstoqueFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {categoriasEstoqueUnicas.map(cat => (
                        <SelectItem key={cat} value={cat || ''}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusEstoqueFiltro} onValueChange={setStatusEstoqueFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="baixo">Estoque Baixo</SelectItem>
                      <SelectItem value="ok">Estoque OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProdutos}</div>
                <p className="text-xs text-muted-foreground mt-1">Produtos ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor estimado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Produtos Críticos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{produtosCriticos}</div>
                <p className="text-xs text-muted-foreground mt-1">Abaixo do mínimo</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos em Estoque</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEstoque ? (
                <p className="text-center text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Estoque Atual</TableHead>
                      <TableHead className="text-right">Estoque Mínimo</TableHead>
                      <TableHead className="text-right">Custo Médio</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoque?.map((p) => {
                      const isBaixo = (p.estoque_atual || 0) <= (p.estoque_minimo || 0);
                      const valorTotal = (p.estoque_atual || 0) * (p.custo_medio || 0);
                      
                      return (
                        <TableRow key={p.id} className={isBaixo ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>{p.categoria}</TableCell>
                          <TableCell>{p.fornecedor?.nome || '-'}</TableCell>
                          <TableCell className="text-right">{p.estoque_atual || 0} {p.unidade_medida}</TableCell>
                          <TableCell className="text-right">{p.estoque_minimo || 0} {p.unidade_medida}</TableCell>
                          <TableCell className="text-right">
                            {(p.custo_medio || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isBaixo ? "destructive" : "default"}>
                              {isBaixo ? 'Crítico' : 'OK'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
