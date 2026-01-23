import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
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
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

function NavModuleSection({
  module,
  isCollapsed,
}: {
  module: NavModule;
  isCollapsed: boolean;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === module.basePath ||
    location.pathname.startsWith(module.basePath + "/") ||
    module.items.some(
      (item) =>
        location.pathname === item.to ||
        (item.to.includes("?") &&
          location.pathname + location.search === item.to)
    );

  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = module.icon;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={module.items[0]?.to || module.basePath}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-lg mx-auto",
              "transition-colors duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {module.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2",
          "text-sm font-medium transition-colors duration-200",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
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
                location.pathname + location.search === item.to) ||
              (item.to === "/financeiro" && location.pathname === "/");

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/financeiro"}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5",
                  "text-[13px] transition-colors duration-200",
                  !isItemActive &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                activeClassName="text-primary font-medium bg-primary/5"
              >
                <ItemIcon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col flex-shrink-0",
        "bg-card/50 backdrop-blur-sm border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-border/50",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">TD</span>
            <span className="text-sm text-muted-foreground">Clínica</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
          {/* Home */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg mx-auto",
                    "transition-colors duration-200",
                    location.pathname === "/"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Home className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Início
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/"
              end
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2",
                "text-sm font-medium transition-colors duration-200",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              activeClassName="text-foreground bg-muted"
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </NavLink>
          )}

          <Separator className="my-3" />

          {/* Modules */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Módulos
              </p>
            )}
            {modules.map((module) => (
              <NavModuleSection
                key={module.basePath}
                module={module}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          <Separator className="my-3" />

          {/* Global Items */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Sistema
              </p>
            )}
            {globalItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              const isAI = item.to === "/assistente-ia";

              if (isCollapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-lg mx-auto",
                          "transition-colors duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          isAI && !isActive && "text-primary/70"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2",
                    "text-sm font-medium transition-colors duration-200",
                    !isActive &&
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isAI && !isActive && "text-primary/70 hover:text-primary"
                  )}
                  activeClassName="text-primary bg-primary/5 font-medium"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isAI && !isActive && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                      IA
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}
