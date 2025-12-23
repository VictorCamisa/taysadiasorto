import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BIKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'bi';
  size?: 'sm' | 'md' | 'lg';
  comparison?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  success: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
  warning: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20',
  danger: 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20',
  info: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20',
  bi: 'bg-gradient-to-br from-[hsl(var(--module-bi))]/10 to-[hsl(var(--module-bi))]/5 border-[hsl(var(--module-bi))]/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/20 text-red-600 dark:text-red-400',
  info: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  bi: 'bg-[hsl(var(--module-bi))]/20 text-[hsl(var(--module-bi))]',
};

export function BIKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  size = 'md',
  comparison,
}: BIKPICardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-md", variantStyles[variant])}>
      <CardContent className={cn("flex flex-col gap-2", sizeClasses[size])}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className={cn("font-bold text-foreground mt-1", valueSizeClasses[size])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg", iconVariantStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {(trend !== undefined || comparison) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                trend > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                trend < 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                "bg-muted text-muted-foreground"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
              </div>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
            {comparison && (
              <span className="text-xs text-muted-foreground">{comparison}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
