import {
  BarChart3,
  Building2,
  Calendar,
  CalendarDays,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileBarChart,
  FileText,
  Heart,
  History,
  Home,
  Kanban,
  LineChart,
  Lock,
  Menu,
  Package,
  PieChart,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SubItem = {
  label: string;
  to: string;
  icon: React.ElementType;
};

type NavModule = {
  label: string;
  icon: React.ElementType;
  basePath: string;
  items: SubItem[];
};

const modules: NavModule[] = [
  {
    label: "Financeiro",
    icon: DollarSign,
    basePath: "/financeiro",
    items: [
      { label: "Dashboard", to: "/financeiro", icon: Home },
      { label: "Diário de Caixa", to: "/financeiro/diario-caixa", icon: FileText },
      { label: "Lançamentos", to: "/financeiro/lancamentos", icon: DollarSign },
      { label: "Contas a Pagar", to: "/financeiro/contas-pagar", icon: CreditCard },
      { label: "Tratamentos", to: "/financeiro/tratamentos", icon: TrendingUp },
      { label: "Estoque", to: "/financeiro/estoque", icon: Package },
      { label: "Fornecedores", to: "/financeiro/fornecedores", icon: Users },
      { label: "DRE", to: "/financeiro/dre", icon: BarChart3 },
      { label: "Orçamento", to: "/financeiro/orcamento", icon: Target },
      { label: "Relatórios", to: "/financeiro/relatorios", icon: FileBarChart },
    ],
  },
  {
    label: "Comercial",
    icon: Users,
    basePath: "/crm",
    items: [
      { label: "Pipeline", to: "/crm/pipeline", icon: Kanban },
      { label: "Agenda", to: "/crm/agenda", icon: CalendarDays },
      { label: "Agendamentos", to: "/crm/agendamentos", icon: Calendar },
      { label: "Pós-venda", to: "/crm/pos-venda", icon: Heart },
      { label: "Leads Perdidos", to: "/crm/perdidos", icon: XCircle },
      { label: "Pacientes", to: "/crm/pacientes", icon: Users },
    ],
  },
  {
    label: "Administrativo",
    icon: Building2,
    basePath: "/admin",
    items: [
      { label: "Usuários", to: "/admin?tab=usuarios", icon: Users },
      { label: "LGPD", to: "/admin?tab=lgpd", icon: Lock },
      { label: "Documentos", to: "/admin?tab=documentos", icon: FileText },
      { label: "Auditoria", to: "/admin?tab=auditoria", icon: History },
    ],
  },
  {
    label: "BI",
    icon: BarChart3,
    basePath: "/bi",
    items: [
      { label: "Dashboard BI", to: "/bi", icon: BarChart3 },
      { label: "LTV / CAC", to: "/bi?tab=ltv-cac", icon: Users },
      { label: "Marketing", to: "/bi?tab=marketing", icon: Target },
      { label: "Tratamentos", to: "/bi?tab=tratamentos", icon: PieChart },
      { label: "Sazonalidade", to: "/bi?tab=sazonalidade", icon: Calendar },
      { label: "Projeções", to: "/bi?tab=projecoes", icon: LineChart },
    ],
  },
];

type GlobalItem = {
  label: string;
  to: string;
  icon: React.ElementType;
};

const globalItems: GlobalItem[] = [
  { label: "Assistente IA", to: "/assistente-ia", icon: Sparkles },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
];

function ModuleDropdown({ module }: { module: NavModule }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(module.basePath);
  const Icon = module.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent/50",
            isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{module.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {module.label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {module.items.map((item) => {
          const ItemIcon = item.icon;
          const isItemActive = location.pathname === item.to || 
            (item.to.includes("?") && location.pathname + location.search === item.to);
          
          return (
            <DropdownMenuItem key={item.to} asChild>
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isItemActive && "bg-accent"
                )}
              >
                <ItemIcon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileModuleSection({ module, onClose }: { module: NavModule; onClose: () => void }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(module.basePath);
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = module.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{module.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-1 space-y-0.5 border-l border-border/50 pl-4">
          {module.items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = location.pathname === item.to ||
              (item.to.includes("?") && location.pathname + location.search === item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isItemActive
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <ItemIcon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        {/* Brand */}
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
            <p className="text-[11px] text-muted-foreground">Gestão Clínica</p>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            activeClassName="text-foreground bg-accent"
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </NavLink>

          {/* Module dropdowns */}
          {modules.map((module) => (
            <ModuleDropdown key={module.basePath} module={module} />
          ))}

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Global items */}
          {globalItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                activeClassName="text-foreground bg-accent"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Abrir menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-sm">Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-1">
                  {/* Home */}
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        location.pathname === "/"
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Home className="h-4 w-4" />
                      <span>Início</span>
                    </Link>
                  </SheetClose>

                  <Separator className="my-2" />

                  {/* Modules */}
                  {modules.map((module) => (
                    <MobileModuleSection
                      key={module.basePath}
                      module={module}
                      onClose={() => setMobileOpen(false)}
                    />
                  ))}

                  <Separator className="my-2" />

                  {/* Global */}
                  {globalItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;

                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between px-3">
                  <ThemeToggle />
                  <UserAuthMenu />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <div className="h-5 w-px bg-border" />
            <UserAuthMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
