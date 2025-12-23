import { useState, useRef, useEffect } from "react";
import { 
  Home, 
  DollarSign, 
  Package, 
  Users, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Settings, 
  BarChart3, 
  FileBarChart, 
  Sparkles,
  Target,
  Pin,
  PinOff,
  ChevronRight,
  ChevronDown,
  Building2,
  UserCircle,
  CalendarDays,
  Kanban,
  Calendar,
  Heart,
  XCircle,
  Lock,
  History,
  PieChart,
  LineChart,
  type LucideIcon
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
}

interface ModuleGroup {
  title: string;
  icon: LucideIcon;
  color: string;
  status: "active" | "coming-soon";
  basePath: string;
  items: MenuItem[];
}

const modules: ModuleGroup[] = [
  {
    title: "Financeiro",
    icon: DollarSign,
    color: "module-financeiro",
    status: "active",
    basePath: "/financeiro",
    items: [
      { title: "Dashboard", url: "/financeiro", icon: Home },
      { title: "Diário de Caixa", url: "/financeiro/diario-caixa", icon: FileText },
      { title: "Lançamentos", url: "/financeiro/lancamentos", icon: DollarSign },
      { title: "Contas a Pagar", url: "/financeiro/contas-pagar", icon: CreditCard },
      { title: "Tratamentos", url: "/financeiro/tratamentos", icon: TrendingUp },
      { title: "Estoque", url: "/financeiro/estoque", icon: Package },
      { title: "Fornecedores", url: "/financeiro/fornecedores", icon: Users },
      { title: "DRE", url: "/financeiro/dre", icon: BarChart3 },
      { title: "Orçamento", url: "/financeiro/orcamento", icon: Target },
      { title: "Relatórios", url: "/financeiro/relatorios", icon: FileBarChart },
    ]
  },
  {
    title: "Comercial",
    icon: UserCircle,
    color: "module-crm",
    status: "active",
    basePath: "/crm",
    items: [
      { title: "Pipeline de Vendas", url: "/crm/pipeline", icon: Kanban },
      { title: "Agenda", url: "/crm/agenda", icon: CalendarDays },
      { title: "Agendamentos", url: "/crm/agendamentos", icon: Calendar },
      { title: "Pós-venda", url: "/crm/pos-venda", icon: Heart },
      { title: "Leads Perdidos", url: "/crm/perdidos", icon: XCircle },
      { title: "Pacientes", url: "/crm/pacientes", icon: Users },
    ]
  },
  {
    title: "Administrativo",
    icon: Building2,
    color: "module-admin",
    status: "active",
    basePath: "/admin",
    items: [
      { title: "Usuários", url: "/admin?tab=usuarios", icon: Users },
      { title: "LGPD", url: "/admin?tab=lgpd", icon: Lock },
      { title: "Documentos", url: "/admin?tab=documentos", icon: FileText },
      { title: "Auditoria", url: "/admin?tab=auditoria", icon: History },
    ]
  },
  {
    title: "Business Intelligence",
    icon: BarChart3,
    color: "module-bi",
    status: "active",
    basePath: "/bi",
    items: [
      { title: "Dashboard BI", url: "/bi", icon: BarChart3 },
      { title: "LTV / CAC", url: "/bi?tab=ltv-cac", icon: Users },
      { title: "Marketing", url: "/bi?tab=marketing", icon: Target },
      { title: "Tratamentos", url: "/bi?tab=tratamentos", icon: PieChart },
      { title: "Sazonalidade", url: "/bi?tab=sazonalidade", icon: Calendar },
      { title: "Projeções", url: "/bi?tab=projecoes", icon: LineChart },
    ]
  }
];

const globalItems: MenuItem[] = [
  { title: "Assistente IA", url: "/assistente-ia", icon: Sparkles },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function FloatingDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("dock-pinned");
    return saved === "true";
  });
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Auto-expand module based on current route
  useEffect(() => {
    const currentModule = modules.find(m => 
      location.pathname.startsWith(m.basePath) || 
      m.items.some(item => item.url === location.pathname)
    );
    if (currentModule) {
      setExpandedModule(currentModule.title);
    }
  }, [location.pathname]);

  // Persist pin state
  useEffect(() => {
    localStorage.setItem("dock-pinned", isPinned.toString());
    window.dispatchEvent(new CustomEvent("dock-pin-change", { detail: isPinned }));
  }, [isPinned]);

  // Keep open if pinned
  useEffect(() => {
    if (isPinned) {
      setIsOpen(true);
    }
  }, [isPinned]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 200);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const toggleModule = (title: string) => {
    setExpandedModule(expandedModule === title ? null : title);
  };

  const isModuleActive = (module: ModuleGroup) => {
    return location.pathname.startsWith(module.basePath) || 
           module.items.some(item => item.url === location.pathname);
  };

  return (
    <>
      {/* Trigger zone */}
      <div
        className="fixed left-0 top-0 h-full w-3 z-[60]"
        onMouseEnter={handleMouseEnter}
      />

      {/* Visual indicator when closed */}
      <div
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out",
          isOpen ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0"
        )}
        onMouseEnter={handleMouseEnter}
      >
        <div className="bg-sidebar rounded-r-lg py-4 px-1.5 shadow-lg cursor-pointer hover:bg-sidebar/90 transition-colors border-r border-t border-b border-sidebar-border">
          <ChevronRight className="h-4 w-4 text-sidebar-foreground/70" />
        </div>
      </div>

      {/* Backdrop overlay */}
      {isOpen && !isPinned && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Dock */}
      <nav
        ref={dockRef}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-out",
          isOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-full opacity-0"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full w-60 bg-sidebar shadow-xl flex flex-col border-r border-sidebar-border">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TD</span>
              </div>
              <div>
                <span className="font-semibold text-sidebar-foreground text-sm">Taysa Dias</span>
                <p className="text-[11px] text-sidebar-foreground/60">Gestão Clínica</p>
              </div>
            </NavLink>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePin}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    isPinned 
                      ? "bg-sidebar-accent text-sidebar-primary" 
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  )}
                >
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPinned ? "Desafixar menu" : "Fixar menu aberto"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Home Link */}
          <div className="px-3 pt-3">
            <NavLink
              to="/"
              end
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
              activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </NavLink>
          </div>

          {/* Navigation - Modules */}
          <div className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
            <p className="px-3 py-2 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Módulos
            </p>
            
            <div className="space-y-0.5">
              {modules.map((module) => {
                const isActive = isModuleActive(module);
                const isExpanded = expandedModule === module.title;
                const isComingSoon = module.status === "coming-soon";
                const Icon = module.icon;
                
                return (
                  <div key={module.title}>
                    {/* Module Header */}
                    {isComingSoon ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                              "text-sidebar-foreground/30 cursor-not-allowed"
                            )}
                          >
                            <div 
                              className="w-1 h-4 rounded-full opacity-30"
                              style={{ backgroundColor: `hsl(var(--${module.color}))` }}
                            />
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{module.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50">
                              Em breve
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Módulo em desenvolvimento
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <button
                        onClick={() => toggleModule(module.title)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-foreground" 
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        )}
                      >
                        <div 
                          className="w-1 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(var(--${module.color}))` }}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{module.title}</span>
                        <ChevronDown 
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    )}

                    {/* Module Items */}
                    {isExpanded && !isComingSoon && (
                      <div className="mt-1 ml-4 pl-3 border-l border-sidebar-border/50 space-y-0.5">
                        {module.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location.pathname === item.url;
                          
                          return (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              end={item.url === "/financeiro"}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                                !isItemActive && "hover:bg-sidebar-accent/30 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                              )}
                              activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                              onMouseEnter={() => setHoveredIndex(item.url)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              <ItemIcon className="h-3.5 w-3.5" />
                              <span className="truncate">{item.title}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Global Items */}
            <div className="mt-4 pt-4 border-t border-sidebar-border/50">
              <p className="px-3 py-2 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Sistema
              </p>
              <div className="space-y-0.5">
                {globalItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        !isActive && "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      )}
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            {!isPinned ? (
              <p className="text-[10px] text-sidebar-foreground/40 text-center flex items-center justify-center gap-1.5">
                <Pin className="h-3 w-3" />
                Clique para manter aberto
              </p>
            ) : (
              <p className="text-[10px] text-sidebar-foreground/40 text-center">
                Menu fixado
              </p>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
