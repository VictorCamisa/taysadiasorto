import { 
  DollarSign, 
  Users, 
  Building2, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  Shield,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  status: "active" | "coming-soon";
  features: string[];
}

const modules: ModuleCardProps[] = [
  {
    title: "Financeiro",
    description: "Gestão completa de finanças, fluxo de caixa, DRE e orçamentos",
    icon: DollarSign,
    href: "/financeiro",
    status: "active",
    features: ["Dashboard", "Lançamentos", "DRE", "Orçamento"]
  },
  {
    title: "Comercial",
    description: "Pipeline de vendas, agenda, ficha 360° do paciente e follow-up",
    icon: Users,
    href: "/crm",
    status: "active",
    features: ["Pipeline", "Agenda", "Ficha 360°", "Pós-venda"]
  },
  {
    title: "Administrativo",
    description: "Gestão de usuários, permissões, LGPD e conformidade",
    icon: Building2,
    href: "/admin",
    status: "active",
    features: ["Usuários", "Permissões", "LGPD", "Documentos"]
  },
  {
    title: "Business Intelligence",
    description: "Painel central de BI, LTV/CAC, ROAS e análises estratégicas",
    icon: BarChart3,
    href: "/bi",
    status: "coming-soon",
    features: ["Dashboard BI", "LTV/CAC", "Marketing", "Relatórios"]
  }
];

function ModuleCard({ title, description, icon: Icon, href, status, features }: ModuleCardProps) {
  const isActive = status === "active";
  
  const CardWrapper = isActive ? Link : 'div';
  const cardProps = isActive ? { to: href } : {};
  
  return (
    <CardWrapper 
      {...cardProps as any}
      className={cn(
        "group relative block rounded-2xl p-6 transition-all duration-300",
        "bg-card/50 backdrop-blur-sm border border-border/40",
        "shadow-sm hover:shadow-lg",
        isActive 
          ? "cursor-pointer hover:bg-card hover:border-border/60 hover:-translate-y-1" 
          : "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            "bg-muted/50 group-hover:bg-muted"
          )}
        >
          <Icon className="h-5 w-5 text-foreground/70" />
        </div>
        
        <span 
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full",
            isActive 
              ? "bg-foreground/5 text-foreground/60" 
              : "bg-muted text-muted-foreground"
          )}
        >
          {isActive ? "Ativo" : "Em breve"}
        </span>
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      
      {/* Features */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {features.map((feature) => (
          <span 
            key={feature}
            className="px-2 py-0.5 text-xs rounded-md bg-muted/50 text-muted-foreground"
          >
            {feature}
          </span>
        ))}
      </div>
      
      {/* Footer */}
      <div 
        className={cn(
          "flex items-center text-sm font-medium transition-all duration-300",
          isActive 
            ? "text-foreground/60 group-hover:text-foreground" 
            : "text-muted-foreground"
        )}
      >
        {isActive ? (
          <>
            Acessar módulo
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </>
        ) : (
          "Em desenvolvimento"
        )}
      </div>
    </CardWrapper>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl",
        "bg-card/30 backdrop-blur-sm border border-border/30",
        "transition-all duration-300 hover:bg-card/50 hover:border-border/50"
      )}
    >
      <div className="p-2 rounded-lg bg-muted/30">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header - Clean, minimal */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 bg-card/30 backdrop-blur-sm border border-border/30">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-xl bg-foreground/5 flex items-center justify-center border border-border/50">
              <span className="text-foreground font-semibold text-lg">TD</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                Sistema de Gestão Clínica
              </h1>
              <p className="text-muted-foreground text-sm">Taysa Dias</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Plataforma integrada para gestão completa da sua clínica: financeiro, comercial, 
            administrativo e business intelligence.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Módulos" value="3 Ativos" />
        <StatCard icon={Calendar} label="Próximos" value="1 Módulo" />
        <StatCard icon={Sparkles} label="Assistente" value="IA Ativa" />
        <StatCard icon={Shield} label="Status" value="Operacional" />
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-foreground">Módulos</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          to="/assistente-ia"
          className={cn(
            "group flex items-center justify-between p-5 rounded-xl",
            "bg-card/50 backdrop-blur-sm border border-border/40",
            "transition-all duration-300 hover:bg-card hover:border-border/60 hover:shadow-md"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
              <Sparkles className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Assistente IA</h3>
              <p className="text-xs text-muted-foreground">Tire dúvidas com inteligência artificial</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
        </Link>
        
        <Link 
          to="/configuracoes"
          className={cn(
            "group flex items-center justify-between p-5 rounded-xl",
            "bg-card/30 backdrop-blur-sm border border-border/30",
            "transition-all duration-300 hover:bg-card/50 hover:border-border/50"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground/80">Configurações</h3>
              <p className="text-xs text-muted-foreground">Personalize o sistema</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}