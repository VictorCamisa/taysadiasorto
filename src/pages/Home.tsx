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
  ChevronRight,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  status: "active" | "coming-soon";
  color: string;
  features: string[];
}

const modules: ModuleCardProps[] = [
  {
    title: "Financeiro",
    description: "Fluxo de caixa, DRE, contas e relatórios em um só lugar.",
    icon: DollarSign,
    href: "/financeiro",
    status: "active",
    color: "160 45% 45%",
    features: ["Dashboard", "Lançamentos", "DRE", "Orçamento"],
  },
  {
    title: "Comercial",
    description: "Pipeline, agenda e acompanhamento completo do paciente.",
    icon: Users,
    href: "/crm",
    status: "active",
    color: "200 50% 50%",
    features: ["Pipeline", "Agenda", "Ficha 360°", "Pós-venda"],
  },
  {
    title: "Administrativo",
    description: "Usuários, permissões, LGPD e auditoria com controle total.",
    icon: Building2,
    href: "/admin",
    status: "active",
    color: "250 40% 55%",
    features: ["Usuários", "Permissões", "LGPD", "Documentos"],
  },
  {
    title: "Business Intelligence",
    description: "Indicadores, LTV/CAC, marketing e análises estratégicas.",
    icon: BarChart3,
    href: "/bi",
    status: "active",
    color: "220 40% 50%",
    features: ["Dashboard BI", "LTV/CAC", "Marketing", "Relatórios"],
  },
];

function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  status,
  color,
  features,
}: ModuleCardProps) {
  const isActive = status === "active";

  return (
    <Link
      to={isActive ? href : "#"}
      className={cn(
        "group relative flex flex-col rounded-2xl p-6 h-full",
        "bg-card/60 backdrop-blur-md border border-border/50",
        "transition-all duration-300 ease-out",
        isActive
          ? "hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-1 hover:border-border"
          : "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-6 top-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${color}), transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            background: `hsl(${color} / 0.12)`,
            boxShadow: `0 4px 20px hsl(${color} / 0.1)`,
          }}
        >
          <Icon className="h-6 w-6" style={{ color: `hsl(${color})` }} />
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-foreground/5 text-muted-foreground">
              <Zap className="h-3 w-3" />
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
        {description}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {features.map((feature) => (
          <span
            key={feature}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-muted/50 text-muted-foreground"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Acessar módulo
        <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-card/40 backdrop-blur-sm border border-border/40",
        "transition-all duration-300 hover:bg-card/60 hover:border-border/60"
      )}
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center"
        style={{
          background: color ? `hsl(${color} / 0.1)` : "hsl(var(--muted))",
        }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: color ? `hsl(${color})` : "hsl(var(--muted-foreground))" }}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-base font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border border-border/50 p-8 md:p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-foreground/5 border border-border/50 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground/80">TD</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Sistema de Gestão Clínica
              </h1>
              <p className="text-muted-foreground font-medium">Taysa Dias</p>
            </div>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            Plataforma integrada para gestão completa da sua clínica — financeiro,
            comercial, administrativo e business intelligence em uma única solução.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Módulos" value="4 Ativos" color="160 45% 45%" />
        <StatCard icon={Calendar} label="Em Desenvolvimento" value="0" color="200 50% 50%" />
        <StatCard icon={Sparkles} label="Assistente" value="IA Disponível" color="250 40% 55%" />
        <StatCard icon={Shield} label="Sistema" value="Operacional" color="220 40% 50%" />
      </section>

      {/* Modules Grid */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Módulos do Sistema</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {modules.map((module, index) => (
            <div
              key={module.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ModuleCard {...module} />
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 gap-5">
        <Link
          to="/assistente-ia"
          className={cn(
            "group flex items-center justify-between p-6 rounded-2xl",
            "bg-gradient-to-r from-card/70 via-card/50 to-card/30 backdrop-blur-md",
            "border border-border/50 hover:border-border",
            "transition-all duration-300 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Assistente IA</h3>
              <p className="text-sm text-muted-foreground">
                Tire dúvidas e obtenha insights com inteligência artificial
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/configuracoes"
          className={cn(
            "group flex items-center justify-between p-6 rounded-2xl",
            "bg-card/40 backdrop-blur-sm border border-border/40",
            "transition-all duration-300 hover:bg-card/60 hover:border-border/60"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground/90">Configurações</h3>
              <p className="text-sm text-muted-foreground">
                Personalize categorias, contas e formas de pagamento
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-1 transition-all" />
        </Link>
      </section>
    </div>
  );
}
