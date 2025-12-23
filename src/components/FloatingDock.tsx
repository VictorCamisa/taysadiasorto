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
      }, 250);
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
        className="fixed left-0 top-0 h-full w-4 z-[60]"
        onMouseEnter={handleMouseEnter}
      />

      {/* Visual indicator when closed - Premium animated */}
      <div
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out",
          isOpen ? "opacity-0 -translate-x-full scale-90" : "opacity-100 translate-x-0 scale-100"
        )}
        onMouseEnter={handleMouseEnter}
      >
        <div className="glass-dark rounded-r-xl py-5 px-2 shadow-xl cursor-pointer hover:px-3 transition-all duration-300 group">
          <ChevronRight className="h-5 w-5 text-sidebar-foreground/70 group-hover:text-sidebar-primary transition-colors" />
        </div>
      </div>

      {/* Backdrop overlay - Smooth blur */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm transition-all duration-300",
          isOpen && !isPinned ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Dock - Premium sidebar */}
      <nav
        ref={dockRef}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 transition-all duration-400 ease-out",
          isOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-full opacity-0"
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full w-64 bg-sidebar/95 backdrop-blur-xl shadow-xl flex flex-col border-r border-sidebar-border/30 overflow-hidden">
          {/* Header - Minimal branding */}
          <div className="p-5 border-b border-sidebar-border/30 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-foreground/5 flex items-center justify-center border border-border/30 group-hover:border-border/50 transition-all duration-300">
                <span className="text-foreground/70 font-semibold text-sm">TD</span>
              </div>
              <div>
                <span className="font-semibold text-sidebar-foreground text-sm group-hover:text-sidebar-primary transition-colors">Taysa Dias</span>
                <p className="text-[11px] text-sidebar-foreground/50">Gestão Clínica</p>
              </div>
            </NavLink>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePin}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-300",
                    isPinned 
                      ? "bg-sidebar-primary/20 text-sidebar-primary shadow-inner" 
                      : "hover:bg-sidebar-accent text-sidebar-foreground/40 hover:text-sidebar-foreground"
                  )}
                >
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {isPinned ? "Desafixar menu" : "Fixar menu aberto"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Home Link - Prominent */}
          <div className="px-3 pt-4">
            <NavLink
              to="/"
              end
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                "hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:translate-x-1"
              )}
              activeClassName="bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </NavLink>
          </div>

          {/* Navigation - Modules with premium styling */}
          <div className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            <p className="px-4 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
              Módulos
            </p>
            
            <div className="space-y-1 mt-1">
              {modules.map((module, moduleIndex) => {
                const isActive = isModuleActive(module);
                const isExpanded = expandedModule === module.title;
                const isComingSoon = module.status === "coming-soon";
                const Icon = module.icon;
                
                return (
                  <div 
                    key={module.title}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${moduleIndex * 50}ms` }}
                  >
                    {/* Module Header */}
                    {isComingSoon ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium",
                              "text-sidebar-foreground/25 cursor-not-allowed"
                            )}
                          >
                            <div 
                              className="w-1.5 h-5 rounded-full opacity-30"
                              style={{ background: `linear-gradient(180deg, hsl(var(--${module.color})), hsl(var(--${module.color}) / 0.5))` }}
                            />
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{module.title}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-sidebar-accent/50 text-sidebar-foreground/40 font-semibold">
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
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm" 
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:translate-x-1"
                        )}
                      >
                        <div 
                          className="w-1.5 h-5 rounded-full transition-all duration-300"
                          style={{ 
                            background: `linear-gradient(180deg, hsl(var(--${module.color})), hsl(var(--${module.color}) / 0.5))`,
                            boxShadow: isActive ? `0 0 12px hsl(var(--${module.color}) / 0.4)` : 'none'
                          }}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{module.title}</span>
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    )}

                    {/* Module Items - Animated expand */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        isExpanded && !isComingSoon ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="mt-1 ml-5 pl-4 border-l-2 border-sidebar-border/30 space-y-0.5">
                        {module.items.map((item, itemIndex) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location.pathname === item.url;
                          
                          return (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              end={item.url === "/financeiro"}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200",
                                !isItemActive && "hover:bg-sidebar-accent/40 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:translate-x-1"
                              )}
                              activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold border-l-2 border-sidebar-primary -ml-0.5 pl-2.5"
                              style={{ 
                                animationDelay: `${itemIndex * 30}ms`,
                              }}
                            >
                              <ItemIcon className="h-3.5 w-3.5" />
                              <span className="truncate">{item.title}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global Items - Premium section */}
            <div className="mt-6 pt-4 border-t border-sidebar-border/30">
              <p className="px-4 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
                Sistema
              </p>
              <div className="space-y-1 mt-1">
                {globalItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  const isAI = item.title === "Assistente IA";
                  
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                        !isActive && "hover:bg-sidebar-accent/50 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:translate-x-1",
                        isAI && !isActive && "hover:bg-gradient-to-r hover:from-sidebar-primary/20 hover:to-transparent"
                      )}
                      activeClassName={cn(
                        "shadow-lg",
                        isAI 
                          ? "bg-gradient-to-r from-sidebar-primary via-sidebar-primary/90 to-sidebar-primary/70 text-sidebar-primary-foreground shadow-sidebar-primary/30" 
                          : "bg-sidebar-primary text-sidebar-primary-foreground shadow-sidebar-primary/20"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Icon className={cn("h-4 w-4", isAI && !isActive && "text-sidebar-primary")} />
                      <span>{item.title}</span>
                      {isAI && !isActive && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-sidebar-primary/20 text-sidebar-primary font-semibold">
                          AI
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer - Subtle hint */}
          <div className="p-4 border-t border-sidebar-border/30 bg-sidebar-accent/10">
            <p className="text-[10px] text-sidebar-foreground/30 text-center flex items-center justify-center gap-2">
              {!isPinned ? (
                <>
                  <Pin className="h-3 w-3" />
                  <span>Clique no pin para manter aberto</span>
                </>
              ) : (
                <span className="text-sidebar-primary/60">Menu fixado</span>
              )}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
