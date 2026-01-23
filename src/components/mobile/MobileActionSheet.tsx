import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { type LucideIcon } from "lucide-react";

interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  description?: string;
}

interface MobileActionSheetProps {
  trigger: React.ReactNode;
  title?: string;
  actions: ActionItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileActionSheet({
  trigger,
  title,
  actions,
  open,
  onOpenChange
}: MobileActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        {title && (
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-center">{title}</DrawerTitle>
          </DrawerHeader>
        )}
        <div className="p-4 pt-2 space-y-1">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <DrawerClose key={index} asChild>
                <button
                  onClick={action.onClick}
                  className={cn(
                    "flex items-center gap-3 w-full py-3.5 px-4 rounded-xl",
                    "text-left transition-all duration-200",
                    "active:scale-[0.98]",
                    action.variant === "destructive"
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {Icon && (
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl",
                      action.variant === "destructive"
                        ? "bg-destructive/10"
                        : "bg-muted/60"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{action.label}</span>
                    {action.description && (
                      <span className="block text-sm text-muted-foreground">
                        {action.description}
                      </span>
                    )}
                  </div>
                </button>
              </DrawerClose>
            );
          })}
        </div>
        <div className="p-4 pt-0">
          <DrawerClose asChild>
            <button className={cn(
              "w-full py-3.5 px-4 rounded-xl",
              "text-center font-medium",
              "bg-muted text-muted-foreground",
              "active:scale-[0.98] transition-all duration-200"
            )}>
              Cancelar
            </button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
