import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileKPICard } from "@/components/mobile/MobileKPICard";
import {
  DollarSign,
  Users,
  BarChart3,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Settings,
  Calendar,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface QuickModuleProps {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

const quickModules: QuickModuleProps[] = [
  {
    title: "Financeiro",
    icon: DollarSign,
    href: "/financeiro",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "CRM",
    icon: Users,
    href: "/crm/pipeline",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Gestão",
    icon: ClipboardList,
    href: "/gestao",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "BI",
    icon: BarChart3,
    href: "/bi",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

function QuickModule({ title, icon: Icon, href, color, bgColor }: QuickModuleProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl",
        "bg-card border border-border/40",
        "active:scale-95 transition-all duration-200"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        bgColor
      )}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </Link>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: "default" | "primary";
}

function ActionCard({ title, description, icon: Icon, href, variant = "default" }: ActionCardProps) {
  const isPrimary = variant === "primary";
  
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl",
        "active:scale-[0.98] transition-all duration-200",
        isPrimary 
          ? "bg-primary/10 border border-primary/20"
          : "bg-card border border-border/40"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
        isPrimary ? "bg-primary/20" : "bg-muted/60"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          isPrimary ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold truncate",
          isPrimary ? "text-primary" : "text-foreground"
        )}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
    </Link>
  );
}

export function MobileHome() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <MobileHeader />
      
      {/* Content */}
      <div className="flex-1 px-4 py-5 pb-24 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá! 👋</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu painel</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MobileKPICard
            title="Agendamentos Hoje"
            value="5"
            icon={Calendar}
            compact
          />
          <MobileKPICard
            title="Leads Novos"
            value="12"
            icon={Users}
            trend={15}
            compact
          />
        </div>

        {/* Quick Modules */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {quickModules.map((module) => (
              <QuickModule key={module.href} {...module} />
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className={cn(
          "p-4 rounded-2xl",
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "border border-primary/20"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Seu Resumo</h3>
              <p className="text-sm text-muted-foreground">Atualizado agora</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Receita Mês</p>
              <p className="font-bold text-foreground">R$ 45.2k</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversão</p>
              <p className="font-bold text-primary">68%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket</p>
              <p className="font-bold text-foreground">R$ 890</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Ações Rápidas
          </h2>
          <ActionCard
            title="Assistente IA"
            description="Tire dúvidas com inteligência artificial"
            icon={Sparkles}
            href="/assistente-ia"
            variant="primary"
          />
          <ActionCard
            title="Configurações"
            description="Categorias, contas e pagamentos"
            icon={Settings}
            href="/configuracoes"
          />
        </div>
      </div>
    </div>
  );
}
