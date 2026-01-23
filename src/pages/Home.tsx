import {
  DollarSign,
  Users,
  Building2,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  features: string[];
}

const modules: ModuleCardProps[] = [
  {
    title: "Financeiro",
    description: "Fluxo de caixa, DRE e lançamentos",
    icon: DollarSign,
    href: "/financeiro",
    features: ["Dashboard", "Lançamentos", "DRE"],
  },
  {
    title: "Comercial",
    description: "Pipeline e gestão de pacientes",
    icon: Users,
    href: "/crm",
    features: ["Pipeline", "Agenda", "Pacientes"],
  },
  {
    title: "Administrativo",
    description: "Usuários e configurações",
    icon: Building2,
    href: "/admin",
    features: ["Usuários", "LGPD", "Auditoria"],
  },
  {
    title: "Business Intelligence",
    description: "Análises e indicadores",
    icon: BarChart3,
    href: "/bi",
    features: ["LTV/CAC", "Marketing", "Projeções"],
  },
];

function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  features,
}: ModuleCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex flex-col rounded-xl p-5 h-full",
        "bg-card border border-border/50",
        "transition-all duration-200",
        "hover:border-border hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>

      <div className="flex flex-wrap gap-1">
        {features.map((feature) => (
          <span
            key={feature}
            className="px-2 py-0.5 text-xs rounded bg-muted/50 text-muted-foreground"
          >
            {feature}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo ao Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Selecione um módulo para começar
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/assistente-ia"
          className={cn(
            "group flex items-center gap-4 p-5 rounded-xl",
            "bg-primary/5 border border-primary/20",
            "transition-all duration-200",
            "hover:bg-primary/10 hover:border-primary/30"
          )}
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Assistente IA</h3>
            <p className="text-sm text-muted-foreground">
              Tire dúvidas com inteligência artificial
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/configuracoes"
          className={cn(
            "group flex items-center gap-4 p-5 rounded-xl",
            "bg-card border border-border/50",
            "transition-all duration-200",
            "hover:border-border hover:shadow-sm"
          )}
        >
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Configurações</h3>
            <p className="text-sm text-muted-foreground">
              Categorias, contas e formas de pagamento
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
