import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface FornecedoresKPIsProps {
  totalFornecedores: number;
  fornecedoresAtivos: number;
  fornecedoresInativos: number;
}

export const FornecedoresKPIs = ({
  totalFornecedores,
}: FornecedoresKPIsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-1">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Fornecedores</p>
              <p className="text-2xl font-bold">{totalFornecedores}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};