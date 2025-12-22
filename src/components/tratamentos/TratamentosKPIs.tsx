import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign, Percent } from "lucide-react";

interface TratamentosKPIsProps {
  tratamentos: any[];
}

export const TratamentosKPIs = ({ tratamentos }: TratamentosKPIsProps) => {
  const totalTratamentos = tratamentos.length;
  
  // Usar preco_padrao da nova tabela tratamentos
  const ticketMedio = tratamentos.length > 0
    ? tratamentos.reduce((sum, t) => sum + Number(t.preco_padrao || 0), 0) / tratamentos.length
    : 0;
  
  // Calcular margem média baseado em preco_padrao e custo_estimado
  const margemMedia = tratamentos.length > 0
    ? tratamentos.reduce((sum, t) => {
        const preco = Number(t.preco_padrao || 0);
        const custo = Number(t.custo_estimado || 0);
        const margem = preco > 0 ? ((preco - custo) / preco) * 100 : 0;
        return sum + margem;
      }, 0) / tratamentos.length
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tratamentos</p>
              <p className="text-2xl font-bold">{totalTratamentos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {ticketMedio.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margem Média</p>
              <p className="text-2xl font-bold">{margemMedia.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};