import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  MessageCircle,
  Bell,
  Search,
  Plus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import logoImage from "@/assets/logo-dra-taysa.png";

interface QuickStats {
  agendamentosHoje: number;
  leadsNovos: number;
  receitaMes: number;
  conversao: number;
  ticketMedio: number;
}

interface QuickModuleProps {
  title: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const quickModules: QuickModuleProps[] = [
  { title: "Financeiro", icon: DollarSign, href: "/financeiro" },
  { title: "Pipeline", icon: Users, href: "/crm/pipeline" },
  { title: "Agenda", icon: Calendar, href: "/crm/agendamentos" },
  { title: "WhatsApp", icon: MessageCircle, href: "/crm/whatsapp" },
  { title: "Gestão", icon: ClipboardList, href: "/gestao" },
  { title: "BI", icon: BarChart3, href: "/bi" },
];

function QuickModuleButton({ title, icon: Icon, href, badge }: QuickModuleProps) {
  return (
    <Link
      to={href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 p-3",
        "rounded-2xl bg-card/80 backdrop-blur-sm",
        "border border-border/30",
        "active:scale-95 transition-all duration-200"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center",
        "bg-primary/10"
      )}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{title}</span>
      {badge && badge > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px] bg-destructive"
        >
          {badge > 99 ? "99+" : badge}
        </Badge>
      )}
    </Link>
  );
}

interface ActionItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  highlight?: boolean;
}

function ActionItem({ title, description, icon: Icon, href, highlight }: ActionItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl",
        "active:scale-[0.98] transition-all duration-200",
        highlight 
          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/20"
          : "bg-card/60 border border-border/30"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        highlight ? "bg-primary/20" : "bg-muted/50"
      )}>
        <Icon className={cn("h-5 w-5", highlight ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn("font-semibold", highlight ? "text-primary" : "text-foreground")}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
    </Link>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {trend !== undefined && (
        <p className={cn(
          "text-[10px] font-medium",
          trend >= 0 ? "text-primary" : "text-destructive"
        )}>
          {trend >= 0 ? "+" : ""}{trend}%
        </p>
      )}
    </div>
  );
}

export function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const todayStr = today.toISOString().split('T')[0];
        
        // Fetch agendamentos hoje
        const { count: agendamentosHoje } = await supabase
          .from("crm_agendamentos")
          .select("*", { count: "exact", head: true })
          .gte("data_agendamento", todayStr)
          .lt("data_agendamento", `${todayStr}T23:59:59`);
        
        // Fetch leads novos (últimos 7 dias)
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const { count: leadsNovos } = await supabase
          .from("crm_agendamentos")
          .select("*", { count: "exact", head: true })
          .eq("status", "lead")
          .gte("created_at", sevenDaysAgo.toISOString());
        
        // Fetch receita do mês
        const { data: receitas } = await supabase
          .from("td_fluxo_de_caixa")
          .select("valor")
          .eq("tipo", "receita")
          .gte("data_lancamento", startOfMonth.toISOString().split('T')[0]);
        
        const receitaMes = receitas?.reduce((sum, r) => sum + (r.valor || 0), 0) || 0;
        
        // Fetch taxa conversão e ticket médio
        const { data: realizados } = await supabase
          .from("crm_agendamentos")
          .select("valor_realizado")
          .eq("status", "realizado")
          .gte("created_at", startOfMonth.toISOString());
        
        const { count: perdidos } = await supabase
          .from("crm_agendamentos")
          .select("*", { count: "exact", head: true })
          .in("status", ["perdido", "cancelado"])
          .gte("created_at", startOfMonth.toISOString());
        
        const totalRealizados = realizados?.length || 0;
        const totalPerdidos = perdidos || 0;
        const conversao = totalRealizados + totalPerdidos > 0 
          ? Math.round((totalRealizados / (totalRealizados + totalPerdidos)) * 100) 
          : 0;
        
        const ticketMedio = totalRealizados > 0
          ? (realizados?.reduce((sum, r) => sum + (r.valor_realizado || 0), 0) || 0) / totalRealizados
          : 0;
        
        // Fetch unread messages
        const { data: unread } = await supabase
          .from("whatsapp_conversas")
          .select("nao_lidas");
        
        const totalUnread = unread?.reduce((sum, c) => sum + (c.nao_lidas || 0), 0) || 0;
        setUnreadMessages(totalUnread);
        
        setStats({
          agendamentosHoje: agendamentosHoje || 0,
          leadsNovos: leadsNovos || 0,
          receitaMes,
          conversao,
          ticketMedio,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const userName = user?.user_metadata?.nome?.split(' ')[0] || 'usuário';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={logoImage} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">{greeting},</p>
              <h1 className="text-base font-semibold text-foreground">{userName} 👋</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl relative"
              onClick={() => navigate("/crm/whatsapp")}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl"
              onClick={() => navigate("/configuracoes")}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-28 space-y-6 overflow-y-auto">
        {/* Summary Card */}
        <div className={cn(
          "p-4 rounded-3xl",
          "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent",
          "border border-primary/20"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Resumo do Mês</span>
          </div>
          
          {loading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1 text-center">
                  <Skeleton className="h-3 w-12 mx-auto mb-1" />
                  <Skeleton className="h-6 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex divide-x divide-border/40">
              <StatCard 
                label="Receita" 
                value={formatCurrency(stats?.receitaMes || 0).replace("R$", "R$ ")}
              />
              <StatCard 
                label="Conversão" 
                value={`${stats?.conversao || 0}%`} 
              />
              <StatCard 
                label="Ticket" 
                value={formatCurrency(stats?.ticketMedio || 0).replace("R$", "R$ ")}
              />
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/crm/agendamentos"
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl",
              "bg-card/80 border border-border/30",
              "active:scale-[0.98] transition-all"
            )}
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? <Skeleton className="h-7 w-8" /> : stats?.agendamentosHoje || 0}
              </p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </div>
          </Link>
          
          <Link
            to="/crm/pipeline"
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl",
              "bg-card/80 border border-border/30",
              "active:scale-[0.98] transition-all"
            )}
          >
            <div className="w-11 h-11 rounded-xl bg-accent/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? <Skeleton className="h-7 w-8" /> : stats?.leadsNovos || 0}
              </p>
              <p className="text-xs text-muted-foreground">Leads novos</p>
            </div>
          </Link>
        </div>

        {/* Quick Modules Grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickModules.map((module) => (
              <QuickModuleButton 
                key={module.href} 
                {...module}
                badge={module.title === "WhatsApp" ? unreadMessages : undefined}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">
            Ações Rápidas
          </h2>
          <ActionItem
            title="Assistente IA"
            description="Tire dúvidas com inteligência artificial"
            icon={Sparkles}
            href="/assistente-ia"
            highlight
          />
          <ActionItem
            title="Nova Oportunidade"
            description="Adicionar lead ao pipeline"
            icon={Plus}
            href="/crm/pipeline"
          />
        </div>
      </main>
    </div>
  );
}