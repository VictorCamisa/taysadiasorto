import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { ModuleNav } from "@/components/ModuleNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";

interface LayoutProps {
  children: React.ReactNode;
}

// Routes where ModuleNav should be shown
const moduleRoutes = ["/financeiro", "/crm", "/admin", "/bi"];

function shouldShowModuleNav(pathname: string): boolean {
  return moduleRoutes.some((route) => pathname.startsWith(route));
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";
  const showModuleNav = shouldShowModuleNav(location.pathname);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
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

        {/* Module Navigation - Quick access tabs */}
        {showModuleNav && <ModuleNav />}

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
