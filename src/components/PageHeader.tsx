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
  children
}: PageHeaderProps) {
  return <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      
      
      {(actions || children) && <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
          {children}
        </div>}
    </div>;
}