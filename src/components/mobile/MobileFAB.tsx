import { cn } from "@/lib/utils";
import { Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileFABProps {
  onClick: () => void;
  icon?: LucideIcon;
  label?: string;
  variant?: "primary" | "secondary";
  position?: "right" | "center";
}

export function MobileFAB({
  onClick,
  icon: Icon = Plus,
  label,
  variant = "primary",
  position = "right"
}: MobileFABProps) {
  return (
    <div className={cn(
      "fixed z-40 lg:hidden",
      "bottom-20 safe-area-bottom",
      position === "right" ? "right-4" : "left-1/2 -translate-x-1/2"
    )}>
      <Button
        onClick={onClick}
        size={label ? "default" : "icon"}
        className={cn(
          "rounded-full shadow-lg",
          "transition-all duration-200 active:scale-95",
          label ? "h-12 px-5 gap-2" : "h-14 w-14",
          variant === "primary" 
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-card border border-border/50 text-foreground hover:bg-muted"
        )}
      >
        <Icon className="h-5 w-5" />
        {label && <span className="font-medium">{label}</span>}
      </Button>
    </div>
  );
}
