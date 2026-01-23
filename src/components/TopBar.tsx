import { Menu, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAuthMenu } from "@/components/UserAuthMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import logoTaysa from "@/assets/logo-dra-taysa.png";
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
  ClipboardList,
  FileSignature,
  FlaskConical,
  Camera,
  Pill,
  Stethoscope,
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
  color: string;
}

const modules: NavModule[] = [
  {
    label: "Financeiro",
    icon: DollarSign,
    basePath: "/financeiro",
    color: "text-emerald-500",
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
    color: "text-cyan-500",
    items: [
      { label: "Pipeline", to: "/crm/pipeline", icon: Kanban },
      { label: "Agendamentos", to: "/crm/agendamentos", icon: Calendar },
      { label: "WhatsApp", to: "/crm/whatsapp", icon: MessageCircle },
      { label: "Pós-venda", to: "/crm/pos-venda", icon: Heart },
      { label: "Leads Perdidos", to: "/crm/perdidos", icon: XCircle },
      { label: "Pacientes", to: "/crm/pacientes", icon: Users },
    ],
  },
  {
    label: "Administrativo",
    icon: Building2,
    basePath: "/admin",
    color: "text-violet-500",
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
    color: "text-amber-500",
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
    color: "text-rose-500",
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

function MobileNavModule({ module, onClose }: { module: NavModule; onClose: () => void }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(module.basePath);
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = module.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3",
          "text-sm font-medium transition-all duration-300",
          isActive
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center",
            isActive ? "bg-primary/20" : "bg-muted/60"
          )}>
            <Icon className={cn("h-4 w-4", isActive && module.color)} />
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
        <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-border/50 pl-3">
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
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5",
                    "text-sm transition-all duration-200",
                    isItemActive
                      ? "text-primary font-medium bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
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
    <header className={cn(
      "sticky top-0 z-40 h-16 lg:hidden",
      "border-b transition-all duration-300",
      "bg-background/80 dark:bg-background/60",
      "backdrop-blur-xl",
      "border-border/40 dark:border-border/20"
    )}>
      <div className="flex h-full items-center justify-between px-4">
        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-10 w-10 rounded-xl",
                "hover:bg-muted/60"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={cn(
            "w-[300px] p-0",
            "bg-background/95 dark:bg-background/90",
            "backdrop-blur-2xl"
          )}>
            <SheetHeader className="border-b border-border/40 p-5">
              <SheetTitle className="text-left">
                <div className={cn(
                  "inline-block p-2 rounded-xl",
                  "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
                  "dark:from-primary/20 dark:via-transparent dark:to-accent/20"
                )}>
                  <img 
                    src={logoTaysa} 
                    alt="Dra. Taysa Dias" 
                    className="h-12 w-auto drop-shadow-sm dark:brightness-125 dark:contrast-110 dark:saturate-110"
                  />
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
              {/* Home */}
              <SheetClose asChild>
                <Link
                  to="/"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3",
                    "text-sm font-medium transition-all duration-300",
                    location.pathname === "/"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center">
                    <Home className="h-4 w-4" />
                  </div>
                  <span>Início</span>
                </Link>
              </SheetClose>

              <Separator className="my-3 bg-border/40" />

              {/* Modules */}
              {modules.map((module) => (
                <MobileNavModule
                  key={module.basePath}
                  module={module}
                  onClose={() => setMobileOpen(false)}
                />
              ))}

              <Separator className="my-3 bg-border/40" />

              {/* Global Items */}
              {globalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                const isAI = item.to === "/assistente-ia";

                return (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3",
                        "text-sm font-medium transition-all duration-300",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        isAI && !isActive && "text-primary/70 hover:text-primary"
                      )}
                    >
                      <div className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center",
                        isAI ? "bg-primary/10" : "bg-muted/60"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                      {isAI && !isActive && (
                        <span className="ml-auto text-[9px] px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                          IA
                        </span>
                      )}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 p-4 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <UserAuthMenu />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className={cn(
            "p-1.5 rounded-lg transition-all duration-300",
            "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
            "dark:from-primary/20 dark:via-transparent dark:to-accent/20",
            "group-hover:from-primary/15 group-hover:to-accent/15"
          )}>
            <img 
              src={logoTaysa} 
              alt="Dra. Taysa Dias" 
              className={cn(
                "h-10 w-auto transition-all duration-300",
                "drop-shadow-sm",
                "dark:brightness-125 dark:contrast-110 dark:saturate-110",
                "group-hover:scale-[1.02]"
              )}
            />
          </div>
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
