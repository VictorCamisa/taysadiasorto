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
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex w-full overflow-hidden relative">
      {/* Adaptive Background */}
      <div className="fixed inset-0 -z-10">
        {/* Light Mode Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 dark:hidden" />
        
        {/* Dark Mode Background with mesh gradient */}
        <div className="hidden dark:block absolute inset-0">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/8 rounded-full blur-[100px]" />
            <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[80px]" />
          </div>
        </div>

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
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
            "flex-1",
            isAssistenteIA
              ? "flex flex-col min-h-0"
              : "p-6 md:p-8 lg:p-10"
          )}
        >
          <div
            className={cn(
              isAssistenteIA
                ? "flex-1 flex flex-col min-h-0"
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
