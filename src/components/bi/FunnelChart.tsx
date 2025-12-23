import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
  taxaConversaoGeral: number;
}

const stageColors = [
  'bg-[hsl(var(--chart-1))]',
  'bg-[hsl(var(--chart-2))]',
  'bg-[hsl(var(--chart-3))]',
  'bg-[hsl(var(--chart-4))]',
  'bg-[hsl(var(--chart-5))]',
];

export function FunnelChart({ data, taxaConversaoGeral }: FunnelChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Funil de Vendas</CardTitle>
            <CardDescription>
              Acompanhe a conversão em cada etapa
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Taxa Geral</p>
            <p className={cn(
              "text-2xl font-bold",
              taxaConversaoGeral >= 30 ? "text-emerald-600 dark:text-emerald-400" :
              taxaConversaoGeral >= 15 ? "text-amber-600 dark:text-amber-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {taxaConversaoGeral.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((stage, index) => {
            const widthPercent = (stage.count / maxCount) * 100;
            
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stage.stage}</span>
                    {index > 0 && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        stage.conversionRate >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        stage.conversionRate >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {stage.conversionRate.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{stage.count} leads</span>
                    <span className="w-24 text-right font-medium text-foreground">
                      {formatCurrency(stage.value)}
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full rounded-md transition-all duration-500",
                      stageColors[index % stageColors.length]
                    )}
                    style={{ 
                      width: `${Math.max(widthPercent, 2)}%`,
                      clipPath: index === data.length - 1 ? 'none' : `polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {stage.count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion metrics */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
              <p className="text-lg font-semibold">{data[0]?.count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Conversões</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {data[data.length - 1]?.count || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor Pipeline</p>
              <p className="text-lg font-semibold">
                {formatCurrency(data.reduce((sum, d) => sum + d.value, 0))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
