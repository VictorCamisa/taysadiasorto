import { TopNav } from "@/components/TopNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between gap-6 px-6 py-3">
          <div className="flex-1">
            <TopNav />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-[200px]">
                  {user.email}
                </span>
                <div className="h-6 w-px bg-border hidden md:block" />
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className={isAssistenteIA ? "flex-1 overflow-hidden" : "flex-1 p-6 overflow-auto"}>
        {children}
      </main>
    </div>
  );
}
