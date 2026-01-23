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
const moduleRoutes = ["/financeiro", "/crm", "/admin", "/bi", "/gestao"];

function shouldShowModuleNav(pathname: string): boolean {
  return moduleRoutes.some((route) => pathname.startsWith(route));
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAssistenteIA = location.pathname === "/assistente-ia";
  const isWhatsApp = location.pathname === "/crm/whatsapp";
  const isFullHeightPage = isAssistenteIA || isWhatsApp;
  const showModuleNav = shouldShowModuleNav(location.pathname) && !isWhatsApp;
  const isHome = location.pathname === "/";

  return (
    <div className={cn(
      "flex w-full overflow-hidden relative",
      isFullHeightPage ? "h-screen" : "min-h-screen"
    )}>
      {/* Adaptive Background */}
      <div className="fixed inset-0 -z-10">
        {/* Light Mode Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 dark:hidden" />
        
        {/* Dark Mode Background - Minimal */}
        <div className="hidden dark:block absolute inset-0">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.02] rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Main Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        isFullHeightPage ? "h-full overflow-hidden" : "min-h-screen"
      )}>
        {/* Mobile Top Bar */}
        <TopBar />

        {/* Desktop Top Actions */}
        <header className={cn(
          "hidden lg:flex h-16 items-center justify-end gap-4 px-8",
          "border-b transition-all duration-300",
          "bg-background/60 dark:bg-background/40",
          "backdrop-blur-xl",
          "border-border/40 dark:border-border/20"
        )}>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-px h-6 bg-border/50" />
            <UserAuthMenu />
          </div>
        </header>

        {/* Module Navigation */}
        {showModuleNav && <ModuleNav />}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-hidden",
            isFullHeightPage
              ? "flex flex-col min-h-0"
              : "p-6 md:p-8 lg:p-10 overflow-y-auto"
          )}
        >
          <div
            className={cn(
              isFullHeightPage
                ? "flex-1 flex flex-col min-h-0 h-full"
                : "max-w-[1600px] mx-auto w-full"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
