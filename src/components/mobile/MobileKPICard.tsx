import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface MobileKPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  compact?: boolean;
}

export function MobileKPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = "default",
  compact = false
}: MobileKPICardProps) {
  const variantStyles = {
    default: {
      bg: "bg-muted/50",
      icon: "text-primary",
      trend: ""
    },
    success: {
      bg: "bg-[hsl(145,60%,45%)]/10",
      icon: "text-[hsl(145,60%,45%)]",
      trend: "text-[hsl(145,60%,45%)]"
    },
    warning: {
      bg: "bg-warning/10",
      icon: "text-warning",
      trend: "text-warning"
    },
    danger: {
      bg: "bg-destructive/10",
      icon: "text-destructive",
      trend: "text-destructive"
    }
  };

  const styles = variantStyles[variant];

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        "bg-card border border-border/40"
      )}>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
            styles.bg
          )}>
            <Icon className={cn("h-4 w-4", styles.icon)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="font-bold text-foreground truncate">{value}</p>
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium shrink-0",
            trend >= 0 ? "text-[hsl(145,60%,45%)]" : "text-destructive"
          )}>
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-2xl",
      "bg-card border border-border/40"
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg",
            styles.bg
          )}>
            <Icon className={cn("h-4 w-4", styles.icon)} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend >= 0 ? "text-[hsl(145,60%,45%)]" : "text-destructive"
            )}>
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface MobileKPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export function MobileKPIGrid({ children, columns = 2 }: MobileKPIGridProps) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 ? "grid-cols-2" : "grid-cols-3"
    )}>
      {children}
    </div>
  );
}
