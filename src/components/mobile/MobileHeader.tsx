import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, MoreVertical, Search, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAuthMenu } from "@/components/UserAuthMenu";
import logoTaysa from "@/assets/logo-dra-taysa.png";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  transparent?: boolean;
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  backTo,
  actions,
  transparent = false
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 lg:hidden",
      "transition-all duration-300",
      transparent 
        ? "bg-transparent" 
        : "bg-background/95 dark:bg-background/90 backdrop-blur-xl border-b border-border/40 dark:border-border/20"
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Side */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-xl shrink-0 -ml-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : isHome ? (
            <Link to="/" className="shrink-0">
              <div className={cn(
                "p-1 rounded-lg transition-all duration-300",
                "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
                "dark:from-primary/20 dark:via-transparent dark:to-accent/20"
              )}>
                <img 
                  src={logoTaysa} 
                  alt="Logo" 
                  className="h-8 w-auto dark:brightness-125"
                />
              </div>
            </Link>
          ) : null}

          {title && (
            <h1 className={cn(
              "text-base font-semibold truncate",
              showBack ? "" : "ml-1"
            )}>
              {title}
            </h1>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actions}
          
          {isHome && (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Bell className="h-5 w-5" />
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="cursor-pointer">
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer">
                  Admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/bi" className="cursor-pointer">
                  BI & Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">Tema</span>
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <UserAuthMenu />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
