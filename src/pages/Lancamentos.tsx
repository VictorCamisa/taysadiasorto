import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Lancamentos = () => {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [tipoFiltro, setTipoFiltro] = useState<string | "todos">("todos");

  const { data: lancamentos = [] } = useQuery({
    queryKey: ["lancamentos-list", startDate, endDate, tipoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("financeiro_lancamentos")
        .select(`
          *,
          financeiro_categorias(categoria_sintetica, categoria_analitica),
          financeiro_formas_pagamento(nome),
          financeiro_contas(nome),
          financeiro_tratamentos(nome)
        `)
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data", { ascending: false });

      if (tipoFiltro !== "todos") {
        query = query.eq("tipo", tipoFiltro as "receita" | "despesa" | "transferencia" | "ajuste");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "receita": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200";
      case "despesa": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200";
      case "transferencia": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lançamentos Financeiros</h1>
          <p className="text-muted-foreground">Gerencie todas as movimentações financeiras</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Forma Pgto</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum lançamento encontrado no período
                  </TableCell>
                </TableRow>
              ) : (
                lancamentos.map((lanc: any) => (
                  <TableRow key={lanc.id} className="hover:bg-muted/50">
                    <TableCell>{format(new Date(lanc.data), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(lanc.tipo)}>
                        {lanc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {lanc.cliente || lanc.observacoes || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_tratamentos?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_categorias?.categoria_sintetica || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_formas_pagamento?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lanc.financeiro_contas?.nome || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${lanc.tipo === 'receita' ? 'text-green-600' : 'text-destructive'}`}>
                      {lanc.tipo === 'receita' ? '+' : '-'}R$ {Number(lanc.valor_entrada || lanc.valor_saida || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Lancamentos;
