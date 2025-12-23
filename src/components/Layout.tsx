import { AppNavbar } from "@/components/AppNavbar";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <AppNavbar />

      {/* Main content area */}
      <main
        className={cn(
          "flex-1",
          isAssistenteIA ? "flex flex-col min-h-0 p-0" : "p-6",
        )}
      >
        <div
          className={cn(
            isAssistenteIA
              ? "flex-1 flex flex-col min-h-0"
              : "max-w-[1600px] mx-auto w-full",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
