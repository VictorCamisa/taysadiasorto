import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("dock-pinned");
    return saved === "true";
  });

  // Listen for pin state changes
  useEffect(() => {
    const checkPinState = () => {
      const saved = localStorage.getItem("dock-pinned");
      setIsPinned(saved === "true");
    };
    
    // Check every 100ms for changes (simple approach)
    const interval = setInterval(checkPinState, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Floating Dock Navigation */}
      <FloatingDock />

      {/* Top bar with theme toggle and user menu */}
      <header 
        className={cn(
          "sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300",
          isPinned ? "pl-60" : "pl-6"
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex-1" />
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <div className="h-6 w-px bg-border" />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main 
        className={cn(
          isAssistenteIA
            ? "flex-1 flex flex-col min-h-0"
            : "flex-1 p-6 overflow-auto",
          "transition-all duration-300",
          isPinned ? "pl-56" : "pl-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
