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

      {/* Top bar - Corporate style */}
      <header 
        className={cn(
          "sticky top-0 z-40 transition-all duration-300 ease-out bg-card border-b border-border",
          isPinned ? "pl-60" : "pl-0"
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          {/* Left side - Page context */}
          <div className="flex-1">
            {/* Can add breadcrumbs here if needed */}
          </div>
          
          {/* Right side - actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-5 w-px bg-border" />
            <UserAuthMenu />
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
          isPinned ? "pl-[calc(15rem+1.5rem)]" : "pl-6"
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
