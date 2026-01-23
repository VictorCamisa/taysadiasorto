import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  hideBottomNav?: boolean;
  hideHeader?: boolean;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export function MobileLayout({
  children,
  title,
  showBack,
  backTo,
  actions,
  hideBottomNav = false,
  hideHeader = false,
  fullHeight = false,
  noPadding = false
}: MobileLayoutProps) {
  const location = useLocation();
  
  // Determine if this is a full-height page (like chat)
  const isFullHeightPage = fullHeight || 
    location.pathname === "/assistente-ia" || 
    location.pathname === "/crm/whatsapp";

  return (
    <div className={cn(
      "lg:hidden flex flex-col min-h-screen w-full",
      "bg-background"
    )}>
      {/* Header */}
      {!hideHeader && (
        <MobileHeader 
          title={title}
          showBack={showBack}
          backTo={backTo}
          actions={actions}
        />
      )}

      {/* Content */}
      <main className={cn(
        "flex-1 min-w-0",
        isFullHeightPage 
          ? "flex flex-col overflow-hidden" 
          : "overflow-y-auto",
        !noPadding && !isFullHeightPage && "px-4 py-4",
        !hideBottomNav && "pb-20" // Space for bottom nav
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
}
