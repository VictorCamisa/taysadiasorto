import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ModularGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
}

const ModularGrid = forwardRef<HTMLDivElement, ModularGridProps>(
  ({ className, columns = 4, gap = "lg", children, ...props }, ref) => {
    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };

    const gapClasses = {
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid stagger-children",
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModularGrid.displayName = "ModularGrid";

interface ModularGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

const ModularGridItem = forwardRef<HTMLDivElement, ModularGridItemProps>(
  ({ className, colSpan = 1, rowSpan = 1, children, ...props }, ref) => {
    const colSpanClasses = {
      1: "",
      2: "md:col-span-2",
      3: "md:col-span-2 lg:col-span-3",
      4: "md:col-span-2 lg:col-span-4",
    };

    const rowSpanClasses = {
      1: "",
      2: "row-span-2",
      3: "row-span-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          colSpanClasses[colSpan],
          rowSpanClasses[rowSpan],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModularGridItem.displayName = "ModularGridItem";

export { ModularGrid, ModularGridItem };
