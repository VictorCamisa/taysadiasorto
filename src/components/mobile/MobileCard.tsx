import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "interactive" | "highlight";
}

export function MobileCard({ 
  children, 
  className, 
  onClick,
  variant = "default" 
}: MobileCardProps) {
  const isInteractive = onClick || variant === "interactive";

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl border border-border/50",
        "transition-all duration-200",
        isInteractive && "active:scale-[0.98] cursor-pointer",
        variant === "highlight" && "border-primary/20 bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
}

export function MobileCardHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  iconColor = "text-primary",
  action 
}: MobileCardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 pb-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-muted/60"
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function MobileCardContent({ 
  children, 
  className,
  noPadding = false 
}: MobileCardContentProps) {
  return (
    <div className={cn(
      noPadding ? "" : "px-4 pb-4",
      className
    )}>
      {children}
    </div>
  );
}

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
  showChevron?: boolean;
  badge?: React.ReactNode;
}

export function MobileListItem({
  title,
  subtitle,
  value,
  valueColor = "text-foreground",
  icon: Icon,
  iconColor = "text-muted-foreground",
  onClick,
  showChevron = true,
  badge
}: MobileListItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 py-3 px-4",
        "border-b border-border/30 last:border-0",
        onClick && "cursor-pointer active:bg-muted/30"
      )}
      onClick={onClick}
    >
      {Icon && (
        <div className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg",
          "bg-muted/50 shrink-0"
        )}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{title}</span>
          {badge}
        </div>
        {subtitle && (
          <span className="text-sm text-muted-foreground truncate block">{subtitle}</span>
        )}
      </div>
      {value && (
        <span className={cn("font-semibold shrink-0", valueColor)}>{value}</span>
      )}
      {onClick && showChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      )}
    </div>
  );
}
