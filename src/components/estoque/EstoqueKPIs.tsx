import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

interface EstoqueKPIsProps {
  valorTotalEstoque: number;
  produtosAtivos: number;
  produtosCriticos: number;
  totalComprasMes: number;
}

export const EstoqueKPIs = ({
  valorTotalEstoque,
  produtosAtivos,
  produtosCriticos,
  totalComprasMes,
}: EstoqueKPIsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total do Estoque</p>
              <p className="text-2xl font-bold">
                {valorTotalEstoque.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos Ativos</p>
              <p className="text-2xl font-bold">{produtosAtivos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos Críticos</p>
              <p className="text-2xl font-bold">{produtosCriticos}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Compras (Mês)</p>
              <p className="text-2xl font-bold">
                {totalComprasMes.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
