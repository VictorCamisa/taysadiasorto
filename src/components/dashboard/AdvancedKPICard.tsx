import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AdvancedKPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "success" | "warning" | "danger";
  showProgress?: boolean;
  progressValue?: number;
  target?: number;
}

export function AdvancedKPICard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendLabel,
  variant = "default",
  showProgress = false,
  progressValue = 0,
  target,
}: AdvancedKPICardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-[rgb(var(--success))]",
    warning: "text-[rgb(var(--warning))]",
    danger: "text-destructive",
  };

  const trendColor = trend && trend > 0 ? "text-[rgb(var(--success))]" : "text-destructive";
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", variantStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}

        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm font-medium mt-2", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{formatNumber(Math.abs(trend), 1)}%</span>
            {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
          </div>
        )}

        {showProgress && (
          <div className="mt-3 space-y-2">
            <Progress value={progressValue} className="h-2" />
            {target && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatNumber(progressValue, 0)}%</span>
                <span>Meta: {formatCurrency(target)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
