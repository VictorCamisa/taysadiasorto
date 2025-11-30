import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MovimentacoesTabProps {
  compras: any[];
  produtos: any[];
}

export const MovimentacoesTab = ({ compras, produtos }: MovimentacoesTabProps) => {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [produtoId, setProdutoId] = useState("todos");
  const [tipo, setTipo] = useState("todos");

  const movimentacoes = useMemo(() => {
    const movs: any[] = [];

    compras.forEach((compra) => {
      if (compra.itens) {
        compra.itens.forEach((item: any) => {
          movs.push({
            data: compra.data_compra,
            produto_nome: item.produto?.nome || "-",
            produto_id: item.produto_id,
            tipo: "entrada",
            quantidade: item.quantidade,
            origem: `Compra NF ${compra.numero_nf || "S/N"}`,
            observacoes: compra.observacoes,
          });
        });
      }
    });

    return movs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [compras]);

  const filteredMovimentacoes = useMemo(() => {
    return movimentacoes.filter((mov) => {
      if (dataInicial && new Date(mov.data) < new Date(dataInicial)) return false;
      if (dataFinal && new Date(mov.data) > new Date(dataFinal)) return false;
      if (produtoId !== "todos" && mov.produto_id !== produtoId) return false;
      if (tipo !== "todos" && mov.tipo !== tipo) return false;
      return true;
    });
  }, [movimentacoes, dataInicial, dataFinal, produtoId, tipo]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Data Inicial</Label>
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Final</Label>
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Produto</Label>
          <Select value={produtoId} onValueChange={setProdutoId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {produtos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimentacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovimentacoes.map((mov, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(mov.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{mov.produto_nome}</TableCell>
                    <TableCell>
                      <Badge variant={mov.tipo === "entrada" ? "default" : "destructive"}>
                        {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell>{mov.origem}</TableCell>
                    <TableCell>{mov.observacoes || "-"}</TableCell>
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
