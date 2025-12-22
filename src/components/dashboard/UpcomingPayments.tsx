import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFinanceData } from "@/hooks/useFinanceData";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

export function UpcomingPayments() {
  const { contasPagar } = useFinanceData();

  const proximas = contasPagar.filter((conta) => {
    const vencimento = new Date(conta.data_vencimento);
    const seteDias = addDays(new Date(), 7);
    return (
      (conta.status === "aberto" || conta.status === "pendente") &&
      isAfter(vencimento, new Date()) &&
      isBefore(vencimento, seteDias)
    );
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Contas a Vencer (7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {proximas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conta próxima do vencimento
          </p>
        ) : (
          <div className="space-y-3">
            {proximas.slice(0, 5).map((conta: any) => (
              <div key={conta.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{conta.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {conta.financeiro_fornecedores?.nome || "Sem fornecedor"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vence em {format(new Date(conta.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant="outline">
                  {formatCurrency(Number(conta.valor || 0))}
                </Badge>
              </div>
            ))}
            {proximas.length > 5 && (
              <p className="text-xs text-muted-foreground">
                + {proximas.length - 5} contas
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
