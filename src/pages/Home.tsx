import { 
  DollarSign, 
  Users, 
  Building2, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Shield
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
      "group relative overflow-hidden transition-all duration-300 hover-lift",
      isActive ? "cursor-pointer" : "opacity-75"
    )}>
      {/* Color indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        `module-indicator-${color.replace('module-', '')}`
      )} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-xl transition-colors",
            isActive 
              ? `bg-${color}/10 text-${color}` 
              : "bg-muted text-muted-foreground"
          )}
          style={{
            backgroundColor: isActive ? `hsl(var(--${color}) / 0.1)` : undefined,
            color: isActive ? `hsl(var(--${color}))` : undefined
          }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            {isActive ? "Ativo" : "Em breve"}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-3">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {features.map((feature) => (
            <span 
              key={feature}
              className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
        
        {isActive ? (
          <Button asChild className="w-full group-hover:bg-primary/90">
            <Link to={href}>
              Acessar módulo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full">
            Em desenvolvimento
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-wellness p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">TD</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Sistema de Gestão Clínica
              </h1>
              <p className="text-lg text-muted-foreground">Taysa Dias</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Plataforma integrada para gestão completa da sua clínica: financeiro, CRM, 
            administrativo e business intelligence em um só lugar.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-t from-success/5 to-transparent rounded-full translate-y-1/2" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Módulos</p>
              <p className="text-lg font-semibold">3 Ativos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Próximos</p>
              <p className="text-lg font-semibold">1 Módulo</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Sparkles className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assistente</p>
              <p className="text-lg font-semibold">IA Ativa</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Shield className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">Operacional</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Módulos do Sistema</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-wellness">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Assistente IA</h3>
                <p className="text-sm text-muted-foreground">
                  Tire dúvidas e obtenha insights com inteligência artificial
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/assistente-ia">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Acessar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Configurações</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize categorias, contas e formas de pagamento
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/configuracoes">
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
