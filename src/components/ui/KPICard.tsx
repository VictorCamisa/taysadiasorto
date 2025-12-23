import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

const KPICard = forwardRef<HTMLDivElement, KPICardProps>(
  ({ className, title, value, subtitle, icon, trend, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "from-primary/10 to-primary/5",
      success: "from-success/10 to-success/5",
      warning: "from-warning/10 to-warning/5",
      destructive: "from-destructive/10 to-destructive/5",
      info: "from-info/10 to-info/5",
    };

    const iconStyles = {
      default: "text-primary bg-primary/10",
      success: "text-success bg-success/10",
      warning: "text-warning bg-warning/10",
      destructive: "text-destructive bg-destructive/10",
      info: "text-info bg-info/10",
    };

    const getTrendIcon = () => {
      if (!trend) return null;
      if (trend.value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
      if (trend.value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    const getTrendColor = () => {
      if (!trend) return "";
      if (trend.value > 0) return "text-success";
      if (trend.value < 0) return "text-destructive";
      return "text-muted-foreground";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "card-kpi group",
          className
        )}
        {...props}
      >
        {/* Background gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 rounded-2xl",
          variantStyles[variant]
        )} />
        
        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {value}
              </p>
            </div>
            
            {icon && (
              <div className={cn(
                "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                iconStyles[variant]
              )}>
                {icon}
              </div>
            )}
          </div>

          {/* Footer with trend and subtitle */}
          <div className="flex items-center justify-between">
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
            
            {trend && (
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span>
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                  {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

KPICard.displayName = "KPICard";

export { KPICard };
