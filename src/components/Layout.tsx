import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";
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

  // Listen for pin state changes from FloatingDock
  useEffect(() => {
    const handlePinChange = (e: CustomEvent<boolean>) => {
      setIsPinned(e.detail);
    };
    
    window.addEventListener("dock-pin-change", handlePinChange as EventListener);
    return () => {
      window.removeEventListener("dock-pin-change", handlePinChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Floating Dock Navigation */}
      <FloatingDock />

      {/* Top bar - minimal macOS style */}
      <header 
        className={cn(
          "sticky top-0 z-40 transition-all duration-300 ease-out",
          isPinned ? "pl-[252px]" : "pl-4"
        )}
      >
        <div className="glass border-b border-border/30 rounded-b-xl mx-3 mt-0 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            {/* Left side - can add breadcrumbs or search later */}
            <div className="flex-1" />
            
            {/* Right side - actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="h-5 w-px bg-border/50" />
              <UserAuthMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-out",
          isAssistenteIA
            ? "flex flex-col min-h-0 p-0"
            : "p-6",
          isPinned ? "pl-[264px]" : "pl-6"
        )}
      >
        <div className={cn(
          isAssistenteIA ? "flex-1 flex flex-col min-h-0" : "max-w-[1600px] mx-auto w-full"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
