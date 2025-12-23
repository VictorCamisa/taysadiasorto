import { 
  DollarSign, 
  Users, 
  Building2, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Shield,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    description: "Gestão completa de finanças, fluxo de caixa, DRE e orçamentos",
    icon: DollarSign,
    href: "/financeiro",
    status: "active",
    color: "module-financeiro",
    features: ["Dashboard", "Lançamentos", "DRE", "Orçamento", "Estoque"]
  },
  {
    title: "Comercial",
    description: "Pipeline de vendas, agenda, ficha 360° do paciente e follow-up",
    icon: Users,
    href: "/crm",
    status: "active",
    color: "module-crm",
    features: ["Pipeline", "Agenda", "Ficha 360°", "Pós-venda"]
  },
  {
    title: "Administrativo",
    description: "Gestão de usuários, permissões, LGPD e conformidade",
    icon: Building2,
    href: "/admin",
    status: "active",
    color: "module-admin",
    features: ["Usuários", "Permissões", "LGPD", "Documentos"]
  },
  {
    title: "Business Intelligence",
    description: "Painel central de BI, LTV/CAC, ROAS e análises estratégicas",
    icon: BarChart3,
    href: "/bi",
    status: "coming-soon",
    color: "module-bi",
    features: ["Dashboard BI", "LTV/CAC", "Marketing", "Relatórios"]
  }
];

function ModuleCard({ title, description, icon: Icon, href, status, color, features }: ModuleCardProps) {
  const isActive = status === "active";
  
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 border-2",
      isActive 
        ? "cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-primary/30" 
        : "opacity-60 border-border/50"
    )}>
      {/* Gradient overlay on hover */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isActive && "group-hover:opacity-100"
        )}
        style={{
          background: `linear-gradient(135deg, hsl(var(--${color}) / 0.08), transparent 60%)`
        }}
      />
      
      {/* Color indicator - Premium gradient bar */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-1.5 h-full transition-all duration-300",
          isActive && "group-hover:w-2"
        )}
        style={{
          background: `linear-gradient(180deg, hsl(var(--${color})), hsl(var(--${color}) / 0.5))`,
          boxShadow: isActive ? `4px 0 20px hsl(var(--${color}) / 0.3)` : 'none'
        }}
      />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div 
            className={cn(
              "p-3.5 rounded-2xl transition-all duration-300",
              isActive && "group-hover:scale-110 group-hover:shadow-lg"
            )}
            style={{
              backgroundColor: `hsl(var(--${color}) / 0.12)`,
              color: `hsl(var(--${color}))`,
              boxShadow: isActive ? `0 4px 20px hsl(var(--${color}) / 0.15)` : 'none'
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"} 
            className={cn(
              "text-xs font-semibold transition-all duration-300",
              isActive && "group-hover:bg-primary group-hover:shadow-md"
            )}
          >
            {isActive ? "Ativo" : "Em breve"}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-4 font-bold">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <div className="flex flex-wrap gap-1.5 mb-5">
          {features.map((feature, index) => (
            <span 
              key={feature}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-300",
                "bg-muted/80 text-muted-foreground",
                isActive && "group-hover:bg-muted group-hover:text-foreground"
              )}
              style={{ transitionDelay: `${index * 30}ms` }}
            >
              {feature}
            </span>
          ))}
        </div>
        
        {isActive ? (
          <Button 
            asChild 
            className="w-full group/btn relative overflow-hidden"
            size="lg"
          >
            <Link to={href}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Acessar módulo
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full" size="lg">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Em desenvolvimento
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
}

function QuickStat({ icon: Icon, label, value, color, delay }: QuickStatProps) {
  return (
    <Card 
      className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, hsl(var(--${color}) / 0.08), transparent 70%)`
        }}
      />
      <CardContent className="p-5 flex items-center gap-4 relative z-10">
        <div 
          className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `hsl(var(--${color}) / 0.12)`,
            boxShadow: `0 4px 16px hsl(var(--${color}) / 0.1)`
          }}
        >
          <Icon className="h-5 w-5" style={{ color: `hsl(var(--${color}))` }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header - Premium gradient hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-mesh p-8 md:p-12 border border-border/50 shadow-lg">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-t from-success/8 to-transparent rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-l from-info/8 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/25 transition-transform duration-300 hover:scale-105">
              <span className="text-primary-foreground font-bold text-2xl">TD</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Sistema de Gestão Clínica
              </h1>
              <p className="text-lg text-muted-foreground font-medium">Taysa Dias</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Plataforma integrada para gestão completa da sua clínica: financeiro, CRM, 
            administrativo e business intelligence em um só lugar.
          </p>
        </div>
      </div>

      {/* Quick Stats - Staggered animation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <QuickStat 
          icon={TrendingUp} 
          label="Módulos" 
          value="3 Ativos" 
          color="success"
          delay={0}
        />
        <QuickStat 
          icon={Calendar} 
          label="Próximos" 
          value="1 Módulo" 
          color="primary"
          delay={50}
        />
        <QuickStat 
          icon={Sparkles} 
          label="Assistente" 
          value="IA Ativa" 
          color="warning"
          delay={100}
        />
        <QuickStat 
          icon={Shield} 
          label="Status" 
          value="Operacional" 
          color="info"
          delay={150}
        />
      </div>

      {/* Modules Grid - Premium cards */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Módulos do Sistema</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-border to-transparent rounded-full" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>

      {/* Quick Access - Premium action cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Assistente IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Tire dúvidas e obtenha insights com inteligência artificial
                  </p>
                </div>
              </div>
              <Button asChild variant="default" size="default" className="shadow-lg shadow-primary/20">
                <Link to="/assistente-ia" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Acessar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-border transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted group-hover:bg-muted/80 group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Configurações</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize categorias, contas e formas de pagamento
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="default">
                <Link to="/configuracoes" className="flex items-center gap-2">
                  Acessar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}