import { Menu, BarChart3, Building2, DollarSign, Settings, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  end?: boolean;
};

const navItems: NavItem[] = [
  { label: "Início", to: "/", icon: DollarSign, end: true },
  { label: "Financeiro", to: "/financeiro", icon: DollarSign },
  { label: "Comercial", to: "/crm", icon: Users },
  { label: "Administrativo", to: "/admin", icon: Building2 },
  { label: "BI", to: "/bi", icon: BarChart3 },
  { label: "Assistente IA", to: "/assistente-ia", icon: Sparkles },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
];

function NavbarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-accent/50 transition-colors",
      )}
      activeClassName={cn(
        "text-foreground bg-accent",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AppNavbar() {
  const location = useLocation();

  const current = useMemo(() => {
    const exact = navItems.find((i) => i.end && location.pathname === i.to);
    if (exact) return exact;
    return navItems.find((i) => !i.end && location.pathname.startsWith(i.to));
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            end
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-accent/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-foreground/5 border border-border/40 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground/80">TD</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-foreground">Taysa Dias</p>
              <p className="text-xs text-muted-foreground">Gestão Clínica</p>
            </div>
          </NavLink>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.slice(0, 5).map((item) => (
            <NavbarLink key={item.to} item={item} />
          ))}
          <Separator orientation="vertical" className="mx-2 h-6" />
          {navItems.slice(5).map((item) => (
            <NavbarLink key={item.to} item={item} />
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Abrir menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-sm">Navegação</SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = current?.to === item.to;

                    return (
                      <SheetClose asChild key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SheetClose>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <UserAuthMenu />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <div className="h-5 w-px bg-border" />
            <UserAuthMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
