import { TopNav } from "@/components/TopNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex-1 overflow-hidden">
            <TopNav />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <div className="h-6 w-px bg-border" />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className={isAssistenteIA ? "flex-1 overflow-hidden" : "flex-1 p-6 overflow-auto"}>
        {children}
      </main>
    </div>
  );
}
