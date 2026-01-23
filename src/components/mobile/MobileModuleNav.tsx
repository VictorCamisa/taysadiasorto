import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
}

interface MobileModuleNavProps {
  items: NavItem[];
  className?: string;
}

export function MobileModuleNav({ items, className }: MobileModuleNavProps) {
  const location = useLocation();

  const isActive = (to: string) => {
    // Handle query params
    if (to.includes("?")) {
      return location.pathname + location.search === to;
    }
    // Exact match or just pathname
    return location.pathname === to;
  };

  return (
    <div className={cn(
      "sticky top-14 z-30 lg:hidden",
      "bg-background/95 dark:bg-background/90",
      "backdrop-blur-xl",
      "border-b border-border/40 dark:border-border/20",
      className
    )}>
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1.5 px-4 py-2">
          {items.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-full",
                  "text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200 active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
