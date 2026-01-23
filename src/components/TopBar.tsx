import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Home,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Target,
  FileBarChart,
  Kanban,
  CalendarDays,
  Calendar,
  Heart,
  XCircle,
  Building2,
  Lock,
  History,
  PieChart,
  LineChart,
  Sparkles,
  Settings,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavModule {
  label: string;
  icon: LucideIcon;
  basePath: string;
  items: NavItem[];
}

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
      { label: "Budget", to: "/financeiro/orcamento", icon: Target },
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

const globalItems: NavItem[] = [
  { label: "Assistente IA", to: "/assistente-ia", icon: Sparkles },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
];

function MobileNavModule({ module, onClose }: { module: NavModule; onClose: () => void }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(module.basePath);
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = module.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5",
          "text-sm font-medium transition-colors",
          isActive
            ? "text-foreground bg-muted/50"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{module.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-1 space-y-0.5 border-l border-border/50 pl-3">
          {module.items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive =
              location.pathname === item.to ||
              (item.to.includes("?") &&
                location.pathname + location.search === item.to);

            return (
              <SheetClose asChild key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2",
                    "text-sm transition-colors",
                    isItemActive
                      ? "text-primary font-medium bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <ItemIcon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TopBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm lg:hidden">
      <div className="flex h-full items-center justify-between px-4">
        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="border-b border-border/50 p-4">
              <SheetTitle className="text-left">
                <span className="text-lg font-bold">TD</span>
                <span className="ml-2 text-sm text-muted-foreground">Clínica</span>
              </SheetTitle>
            </SheetHeader>

            <div className="p-3 space-y-1">
              {/* Home */}
              <SheetClose asChild>
                <Link
                  to="/"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-sm font-medium transition-colors",
                    location.pathname === "/"
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Link>
              </SheetClose>

              <Separator className="my-2" />

              {/* Modules */}
              {modules.map((module) => (
                <MobileNavModule
                  key={module.basePath}
                  module={module}
                  onClose={() => setMobileOpen(false)}
                />
              ))}

              <Separator className="my-2" />

              {/* Global Items */}
              {globalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5",
                        "text-sm font-medium transition-colors",
                        isActive
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <UserAuthMenu />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">TD</span>
          <span className="text-sm text-muted-foreground">Clínica</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAuthMenu />
        </div>
      </div>
    </header>
  );
}
