import React from "react";
import { cn } from "@/lib/utils";

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
      "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8",
      className
    )}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="text-primary-foreground">
              {icon}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {(actions || children) && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
