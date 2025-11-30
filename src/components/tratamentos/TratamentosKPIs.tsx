import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign, Percent, CheckCircle } from "lucide-react";

interface TratamentosKPIsProps {
  tratamentos: any[];
}

export const TratamentosKPIs = ({ tratamentos }: TratamentosKPIsProps) => {
  const totalTratamentos = tratamentos.length;
  const tratamentosAtivos = tratamentos.filter(t => t.ativo).length;
  
  const ticketMedio = tratamentos.length > 0
    ? tratamentos.reduce((sum, t) => sum + Number(t.preco_venda || 0), 0) / tratamentos.length
    : 0;
  
  const margemMedia = tratamentos.length > 0
    ? tratamentos.reduce((sum, t) => sum + Number(t.margem_contribuicao || 0), 0) / tratamentos.length
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
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

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold">{tratamentosAtivos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
