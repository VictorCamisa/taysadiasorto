import React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-4 mb-6",
      className
    )}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {(actions || children) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
