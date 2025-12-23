import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CohortData {
  cohort: string;
  mes0: number;
  mes1: number;
  mes2: number;
  mes3: number;
  mes4: number;
  mes5: number;
  total: number;
}

interface CohortChartProps {
  data: CohortData[];
}

const getRetentionColor = (value: number) => {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 60) return 'bg-emerald-400';
  if (value >= 40) return 'bg-amber-400';
  if (value >= 20) return 'bg-amber-500';
  if (value > 0) return 'bg-red-400';
  return 'bg-muted';
};

const getTextColor = (value: number) => {
  if (value >= 40) return 'text-white';
  if (value > 0) return 'text-white';
  return 'text-muted-foreground';
};

export function CohortChart({ data }: CohortChartProps) {
  const months = ['Mês 0', 'Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5'];

  // Calculate averages
  const averages = months.map((_, i) => {
    const key = `mes${i}` as 'mes0' | 'mes1' | 'mes2' | 'mes3' | 'mes4' | 'mes5';
    const values = data.filter(d => d[key] > 0).map(d => d[key]);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Análise de Coortes (Retenção)</CardTitle>
        <CardDescription>
          Acompanhe a retenção de clientes ao longo do tempo por coorte de entrada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Coorte</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Clientes</th>
                {months.map((month) => (
                  <th key={month} className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((cohort, rowIndex) => (
                <tr key={cohort.cohort} className="border-b border-border/50">
                  <td className="py-2 px-2 text-sm font-medium">{cohort.cohort}</td>
                  <td className="py-2 px-2 text-center text-sm text-muted-foreground">{cohort.total}</td>
                  {months.map((_, colIndex) => {
                    const key = `mes${colIndex}` as keyof CohortData;
                    const value = typeof cohort[key] === 'number' ? cohort[key] : 0;
                    
                    return (
                      <td key={colIndex} className="py-2 px-2">
                        <div 
                          className={cn(
                            "w-full h-10 flex items-center justify-center rounded text-xs font-medium transition-all",
                            getRetentionColor(value),
                            getTextColor(value)
                          )}
                        >
                          {value > 0 ? `${value.toFixed(0)}%` : '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Average row */}
              <tr className="bg-muted/30">
                <td className="py-2 px-2 text-sm font-semibold">Média</td>
                <td className="py-2 px-2 text-center text-sm text-muted-foreground">-</td>
                {averages.map((avg, colIndex) => (
                  <td key={colIndex} className="py-2 px-2">
                    <div 
                      className={cn(
                        "w-full h-10 flex items-center justify-center rounded text-xs font-semibold",
                        getRetentionColor(avg),
                        getTextColor(avg)
                      )}
                    >
                      {avg > 0 ? `${avg.toFixed(0)}%` : '-'}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-muted-foreground">80%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-400" />
            <span className="text-muted-foreground">60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-400" />
            <span className="text-muted-foreground">40-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-muted-foreground">20-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span className="text-muted-foreground">&lt;20%</span>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-semibold mb-2">Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• A retenção média no Mês 1 é de <strong className="text-foreground">{averages[1]?.toFixed(0) || 0}%</strong></li>
            <li>• {averages[3] >= 30 
              ? 'Boa retenção de longo prazo - clientes tendem a voltar' 
              : 'Foco em estratégias de retenção após o 2º mês'}</li>
            <li>• {data.some(d => d.mes0 === 100 && d.mes1 >= 50) 
              ? 'Coortes recentes mostram boa aderência inicial' 
              : 'Considere ações de engajamento nas primeiras semanas'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
