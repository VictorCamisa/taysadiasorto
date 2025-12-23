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

const menuItems: MenuItem[] = [
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

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
        setHoveredIndex(null);
      }, 200);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  return (
    <>
      {/* Trigger zone - invisible area on the left edge */}
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
        <div className="glass rounded-r-xl py-4 px-1.5 shadow-lg cursor-pointer hover:bg-card/90 transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Backdrop overlay when open and not pinned */}
      {isOpen && !isPinned && (
        <div 
          className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Dock */}
      <nav
        ref={dockRef}
        className={cn(
          "fixed left-3 top-3 bottom-3 z-50 transition-all duration-300 ease-out",
          isOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-[calc(100%+12px)] opacity-0"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full w-60 glass rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">TD</span>
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">Taysa Dias</span>
                <p className="text-xs text-muted-foreground">Sistema Financeiro</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePin}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 active-scale",
                    isPinned 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                {isPinned ? "Desafixar menu" : "Fixar menu aberto"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-2 overflow-y-auto scrollbar-thin">
            <div className="space-y-0.5">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.url;
                const isHovered = hoveredIndex === index;
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    end
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      "relative group active-scale",
                      !isActive && "hover:bg-muted/80 text-foreground/80 hover:text-foreground"
                    )}
                    activeClassName="bg-primary text-primary-foreground shadow-sm"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Icon with scale animation */}
                    <div className={cn(
                      "transition-transform duration-200",
                      isHovered && !isActive && "scale-110"
                    )}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    
                    {/* Label */}
                    <span className="flex-1 truncate">{item.title}</span>
                    
                    {/* Badge if exists */}
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                        isActive 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-destructive text-destructive-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-5 bg-primary-foreground/60 rounded-full" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/30">
            {!isPinned ? (
              <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <Pin className="h-3 w-3" />
                Clique para manter aberto
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center">
                Menu fixado
              </p>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
