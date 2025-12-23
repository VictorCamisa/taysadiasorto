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
  ChevronRight
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Diário de Caixa", url: "/diario-caixa", icon: FileText },
  { title: "Lançamentos", url: "/lancamentos", icon: DollarSign },
  { title: "Contas a Pagar", url: "/contas-pagar", icon: CreditCard },
  { title: "Tratamentos", url: "/tratamentos", icon: TrendingUp },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Fornecedores", url: "/fornecedores", icon: Users },
  { title: "DRE", url: "/dre", icon: BarChart3 },
  { title: "Orçamento", url: "/orcamento", icon: Target },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart },
  { title: "Assistente IA", url: "/assistente-ia", icon: Sparkles },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function FloatingDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("dock-pinned");
    return saved === "true";
  });
  const dockRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Persist pin state
  useEffect(() => {
    localStorage.setItem("dock-pinned", isPinned.toString());
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
      }, 300);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  return (
    <>
      {/* Trigger zone - invisible area on the left edge */}
      <div
        ref={triggerRef}
        className="fixed left-0 top-0 h-full w-4 z-50"
        onMouseEnter={handleMouseEnter}
      />

      {/* Visual indicator when closed */}
      <div
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300",
          isOpen ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0"
        )}
        onMouseEnter={handleMouseEnter}
      >
        <div className="bg-sidebar/80 backdrop-blur-sm border border-sidebar-border rounded-r-lg py-3 px-1.5 shadow-lg">
          <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
        </div>
      </div>

      {/* Floating Dock */}
      <div
        ref={dockRef}
        className={cn(
          "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full w-56 bg-sidebar/95 backdrop-blur-lg border-r border-sidebar-border shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">TD</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Taysa Dias</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePin}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    isPinned 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60"
                  )}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPinned ? "Desafixar menu" : "Fixar menu"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "group relative"
                  )}
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                    "group-hover:scale-110"
                  )} />
                  <span className="truncate">{item.title}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer hint */}
          {!isPinned && (
            <div className="p-3 border-t border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/50 text-center">
                Clique em <Pin className="inline h-3 w-3" /> para fixar
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
