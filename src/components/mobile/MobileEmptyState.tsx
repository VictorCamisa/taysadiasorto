import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function MobileEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className
}: MobileEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
        "bg-muted/60"
      )}>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-[250px] mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="rounded-full">
          {action.label}
        </Button>
      )}
    </div>
  );
}
