import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface FichaTecnicaItem {
  id?: string;
  produto_id: string;
  produto?: {
    nome: string;
    unidade_medida: string;
    custo_medio: number;
  };
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
}

interface FichaTecnicaEditorProps {
  items: FichaTecnicaItem[];
  produtos: any[];
  onAddItem: (item: Omit<FichaTecnicaItem, "id">) => void;
  onRemoveItem: (index: number) => void;
}

export const FichaTecnicaEditor = ({ items, produtos, onAddItem, onRemoveItem }: FichaTecnicaEditorProps) => {
  const [newItem, setNewItem] = useState({
    produto_id: "",
    quantidade: 0,
    custo_unitario: 0,
  });

  const handleProdutoChange = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    setNewItem({
      produto_id: produtoId,
      quantidade: 0,
      custo_unitario: produto?.custo_medio || 0,
    });
  };

  const handleAddItem = () => {
    if (!newItem.produto_id || newItem.quantidade <= 0) {
      toast.error("Selecione um produto e informe a quantidade");
      return;
    }

    const custo_total = newItem.quantidade * newItem.custo_unitario;
    onAddItem({
      ...newItem,
      custo_total,
    });

    setNewItem({ produto_id: "", quantidade: 0, custo_unitario: 0 });
  };

  const produtoSelecionado = produtos.find(p => p.id === newItem.produto_id);

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.produto?.nome || "N/A"}</TableCell>
                  <TableCell>{item.produto?.unidade_medida || "N/A"}</TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell className="text-right">
                    {item.custo_unitario.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.custo_total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
        <div className="font-medium">Adicionar Item</div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Produto *</Label>
            <Select value={newItem.produto_id} onValueChange={handleProdutoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unidade</Label>
            <Input
              value={produtoSelecionado?.unidade_medida || ""}
              disabled
              placeholder="Auto"
            />
          </div>

          <div className="space-y-2">
            <Label>Quantidade *</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.quantidade || ""}
              onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Custo Unitário *</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.custo_unitario || ""}
              onChange={(e) => setNewItem({ ...newItem, custo_unitario: Number(e.target.value) })}
              placeholder="0.00"
            />
          </div>
        </div>

        <Button type="button" onClick={handleAddItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item à Ficha Técnica
        </Button>
      </div>
    </div>
  );
};
