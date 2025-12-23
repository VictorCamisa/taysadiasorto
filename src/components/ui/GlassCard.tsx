import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "kpi" | "module";
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          {
            "card-glass": variant === "default",
            "card-elevated": variant === "elevated",
            "card-kpi": variant === "kpi",
            "card-module": variant === "module",
          },
          glow && "animate-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardHeader = forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
GlassCardHeader.displayName = "GlassCardHeader";

interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const GlassCardTitle = forwardRef<HTMLParagraphElement, GlassCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
);
GlassCardTitle.displayName = "GlassCardTitle";

interface GlassCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const GlassCardDescription = forwardRef<HTMLParagraphElement, GlassCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
GlassCardDescription.displayName = "GlassCardDescription";

interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardContent = forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
GlassCardContent.displayName = "GlassCardContent";

interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardFooter = forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
};
