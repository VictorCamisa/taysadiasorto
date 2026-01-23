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
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSignature,
  FlaskConical,
  Camera,
  Pill,
  Stethoscope,
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
  color: string;
}

const modules: NavModule[] = [
  {
    label: "Financeiro",
    icon: DollarSign,
    basePath: "/financeiro",
    color: "text-emerald-500 dark:text-emerald-400",
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
    color: "text-cyan-500 dark:text-cyan-400",
    items: [
      { label: "Pipeline", to: "/crm/pipeline", icon: Kanban },
      { label: "Agendamentos", to: "/crm/agendamentos", icon: Calendar },
      { label: "Pós-venda", to: "/crm/pos-venda", icon: Heart },
      { label: "Leads", to: "/crm/leads", icon: Users },
      { label: "Pacientes", to: "/crm/pacientes", icon: Users },
    ],
  },
  {
    label: "Administrativo",
    icon: Building2,
    basePath: "/admin",
    color: "text-violet-500 dark:text-violet-400",
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
    color: "text-amber-500 dark:text-amber-400",
    items: [
      { label: "Dashboard BI", to: "/bi", icon: BarChart3 },
      { label: "LTV / CAC", to: "/bi?tab=ltv-cac", icon: Users },
      { label: "Marketing", to: "/bi?tab=marketing", icon: Target },
      { label: "Tratamentos", to: "/bi?tab=tratamentos", icon: PieChart },
      { label: "Sazonalidade", to: "/bi?tab=sazonalidade", icon: Calendar },
      { label: "Projeções", to: "/bi?tab=projecoes", icon: LineChart },
    ],
  },
  {
    label: "Gestão Operacional",
    icon: ClipboardList,
    basePath: "/gestao",
    color: "text-rose-500 dark:text-rose-400",
    items: [
      { label: "Dashboard", to: "/gestao", icon: Home },
      { label: "Planos de Tratamento", to: "/gestao/planos-tratamento", icon: FileText },
      { label: "Contratos", to: "/gestao/contratos", icon: FileSignature },
      { label: "Anamneses", to: "/gestao/anamneses", icon: ClipboardList },
      { label: "Exames", to: "/gestao/exames", icon: FlaskConical },
      { label: "Fotos", to: "/gestao/fotos", icon: Camera },
      { label: "Receituários", to: "/gestao/receituarios", icon: Pill },
      { label: "Prontuários", to: "/gestao/prontuarios", icon: Stethoscope },
    ],
  },
];

const globalItems: NavItem[] = [
  { label: "Assistente IA", to: "/assistente-ia", icon: Sparkles },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
];

function NavModuleSection({ module }: { module: NavModule }) {
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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5",
          "text-sm font-medium transition-all duration-300",
          "group/trigger",
          isActive
            ? "bg-primary/10 dark:bg-primary/15 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            "transition-all duration-300",
            isActive 
              ? "bg-primary/20 dark:bg-primary/30" 
              : "bg-muted/60 dark:bg-muted/40 group-hover/trigger:bg-primary/10 dark:group-hover/trigger:bg-primary/20"
          )}>
            <Icon className={cn("h-4 w-4", isActive ? module.color : "")} />
          </div>
          <span>{module.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-5 mt-1.5 space-y-0.5 border-l-2 border-border/50 dark:border-border/30 pl-3">
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
                  "flex items-center gap-2.5 rounded-lg px-3 py-2",
                  "text-[13px] transition-all duration-200",
                  !isItemActive &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30"
                )}
                activeClassName="text-primary font-medium bg-primary/10 dark:bg-primary/15"
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
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Toggle Button - Visible when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-4 left-4 z-50 h-11 w-11",
            "bg-card/90 dark:bg-card/70",
            "backdrop-blur-xl",
            "border border-border/50 dark:border-border/30",
            "shadow-lg dark:shadow-2xl",
            "hover:bg-card dark:hover:bg-card/80",
            "hover:border-primary/30 dark:hover:border-primary/50",
            "transition-all duration-300"
          )}
          onClick={() => setIsOpen(true)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen flex flex-col flex-shrink-0",
          "transition-all duration-500 ease-out",
          "border-r",
          // Light mode
          "bg-card/80 border-border/40",
          // Dark mode
          "dark:bg-card/40 dark:border-border/20",
          "backdrop-blur-2xl",
          isOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between h-16 px-5",
          "border-b border-border/40 dark:border-border/20"
        )}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary to-primary/80",
              "shadow-lg shadow-primary/20 dark:shadow-primary/30",
              "group-hover:shadow-xl group-hover:shadow-primary/30 dark:group-hover:shadow-primary/40",
              "transition-all duration-300"
            )}>
              <span className="text-lg font-bold text-primary-foreground">TD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">Clínica</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sistema de Gestão</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/60 dark:hover:bg-muted/40"
            )}
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1.5 px-3">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                "text-sm font-medium transition-all duration-300",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
              )}
              activeClassName="text-foreground bg-muted dark:bg-muted/60"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/60 dark:bg-muted/40 flex items-center justify-center">
                <Home className="h-4 w-4" />
              </div>
              <span>Início</span>
            </NavLink>

            <Separator className="my-4 bg-border/40 dark:bg-border/20" />

            {/* Modules */}
            <div className="space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Módulos
              </p>
              {modules.map((module) => (
                <NavModuleSection key={module.basePath} module={module} />
              ))}
            </div>

            <Separator className="my-4 bg-border/40 dark:bg-border/20" />

            {/* Global Items */}
            <div className="space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Sistema
              </p>
              {globalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                const isAI = item.to === "/assistente-ia";

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm font-medium transition-all duration-300",
                      !isActive &&
                        "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40",
                      isAI && !isActive && "text-primary/70 hover:text-primary"
                    )}
                    activeClassName="text-primary bg-primary/10 dark:bg-primary/15 font-medium"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      isAI 
                        ? "bg-primary/10 dark:bg-primary/20" 
                        : "bg-muted/60 dark:bg-muted/40"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                    {isAI && !isActive && (
                      <span className={cn(
                        "ml-auto text-[9px] px-2 py-1 rounded-md font-semibold",
                        "bg-primary/10 dark:bg-primary/20 text-primary"
                      )}>
                        IA
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-border/40 dark:border-border/20"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            "bg-muted/40 dark:bg-muted/20",
            "border border-border/30 dark:border-border/10"
          )}>
            <p className="text-[10px] text-muted-foreground text-center">
              © 2024 TD Clínica
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
