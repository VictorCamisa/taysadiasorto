import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

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
    default: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-destructive",
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
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
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
