import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFinanceData } from "@/hooks/useFinanceData";

export function LowStockAlert() {
  const { produtos } = useFinanceData();

  const produtosBaixos = produtos.filter(
    p => Number(p.estoque_atual || 0) <= Number(p.estoque_minimo || 0)
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Produtos com Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {produtosBaixos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum produto com estoque abaixo do mínimo
          </p>
        ) : (
          <div className="space-y-3">
            {produtosBaixos.slice(0, 5).map((produto) => (
              <div key={produto.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{produto.nome}</p>
                  <p className="text-xs text-muted-foreground">{produto.categoria}</p>
                </div>
                <Badge variant="destructive">
                  {Number(produto.estoque_atual || 0)} un.
                </Badge>
              </div>
            ))}
            {produtosBaixos.length > 5 && (
              <p className="text-xs text-muted-foreground">
                + {produtosBaixos.length - 5} produtos
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
