import { Home, DollarSign, Package, Users, CreditCard, TrendingUp, FileText, Settings, BarChart3, FileBarChart, Sparkles, Target } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4 border-b border-border">
          {state !== "collapsed" && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Financeiro</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
