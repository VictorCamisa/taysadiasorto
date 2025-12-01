import { TopNav } from "@/components/TopNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex-1 min-w-0">
            <TopNav />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {user && (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Sair</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
}
