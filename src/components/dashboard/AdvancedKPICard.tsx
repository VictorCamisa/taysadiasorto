import { Card, CardContent } from "@/components/ui/card";
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
    default: "bg-primary/10 text-primary",
    success: "bg-[hsl(145,60%,45%)]/10 text-[hsl(145,60%,45%)]",
    warning: "bg-[hsl(38,85%,55%)]/10 text-[hsl(38,85%,55%)]",
    danger: "bg-destructive/10 text-destructive",
  };

  const trendColor = trend && trend > 0 
    ? "text-[hsl(145,60%,45%)]" 
    : "text-destructive";
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      <CardContent className="pt-6 relative">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground/70">{description}</p>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-xl transition-colors duration-300",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Value - Large and bold */}
        <div className="text-3xl font-bold tracking-tight text-foreground mb-3">
          {value}
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full",
            trend > 0 ? "bg-[hsl(145,60%,45%)]/10" : "bg-destructive/10",
            trendColor
          )}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{formatNumber(Math.abs(trend), 1)}%</span>
            {trendLabel && (
              <span className="text-muted-foreground font-normal text-xs ml-1">
                {trendLabel}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-4 space-y-2">
            <Progress value={progressValue} className="h-1.5" />
            {target && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium">{formatNumber(progressValue, 0)}%</span>
                <span>Meta: {formatCurrency(target)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
