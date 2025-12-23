import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPICard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = "default" 
}: KPICardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-[hsl(145,60%,45%)]/10 text-[hsl(145,60%,45%)]",
    warning: "bg-[hsl(38,85%,55%)]/10 text-[hsl(38,85%,55%)]",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      <CardContent className="pt-6 relative">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </p>
          <div className={cn(
            "p-2.5 rounded-xl transition-colors duration-300",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Value - Large and bold */}
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
