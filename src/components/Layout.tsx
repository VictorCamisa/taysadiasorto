import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <TopBar />

        {/* Desktop Top Actions */}
        <header className="hidden lg:flex h-14 items-center justify-end gap-3 border-b border-border/50 px-6 bg-background/50 backdrop-blur-sm">
          <ThemeToggle />
          <UserAuthMenu />
        </header>

        {/* Main content */}
        <main
          className={cn(
            "flex-1",
            isAssistenteIA
              ? "flex flex-col min-h-0"
              : "p-4 md:p-6"
          )}
        >
          <div
            className={cn(
              "animate-fade-in",
              isAssistenteIA
                ? "flex-1 flex flex-col min-h-0"
                : "max-w-[1400px] mx-auto w-full"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
