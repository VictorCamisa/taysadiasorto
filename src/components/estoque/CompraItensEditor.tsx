import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, X } from "lucide-react";

interface CompraItem {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface CompraItensEditorProps {
  itens: CompraItem[];
  setItens: (itens: CompraItem[]) => void;
  produtos: Array<{ id: string; nome: string; custo_medio: number; unidade_medida: string }>;
}

export const CompraItensEditor = ({ itens, setItens, produtos }: CompraItensEditorProps) => {
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");

  const handleAddItem = () => {
    if (!produtoId || !quantidade || !valorUnitario) return;

    const qtd = Number(quantidade);
    const vlrUnit = Number(valorUnitario);
    const novoItem: CompraItem = {
      produto_id: produtoId,
      quantidade: qtd,
      valor_unitario: vlrUnit,
      valor_total: qtd * vlrUnit,
    };

    setItens([...itens, novoItem]);
    setProdutoId("");
    setQuantidade("");
    setValorUnitario("");
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleProdutoChange = (value: string) => {
    setProdutoId(value);
    const produto = produtos.find(p => p.id === value);
    if (produto && produto.custo_medio > 0) {
      setValorUnitario(produto.custo_medio.toString());
    }
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.valor_total, 0);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Itens da Compra</h3>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Produto</Label>
          <Select value={produtoId} onValueChange={handleProdutoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            step="0.01"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Valor Unitário</Label>
          <Input
            type="number"
            step="0.01"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)}
            placeholder="0,00"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Total</Label>
          <Input
            type="text"
            value={
              quantidade && valorUnitario
                ? (Number(quantidade) * Number(valorUnitario)).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "R$ 0,00"
            }
            disabled
          />
        </div>
      </div>

      <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
        <Plus className="h-4 w-4" />
        Adicionar Item
      </Button>

      {itens.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item, index) => {
                const produto = produtos.find(p => p.id === item.produto_id);
                return (
                  <TableRow key={index}>
                    <TableCell>{produto?.nome || "-"}</TableCell>
                    <TableCell>{item.quantidade} {produto?.unidade_medida}</TableCell>
                    <TableCell>
                      {item.valor_unitario.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      {item.valor_total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total da Compra</p>
              <p className="text-2xl font-bold">
                {valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
