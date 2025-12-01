import { Home, DollarSign, Package, Users, CreditCard, TrendingUp, FileText, Settings, BarChart3, FileBarChart, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Caixa", url: "/diario-caixa", icon: FileText },
  { title: "Lançamentos", url: "/lancamentos", icon: DollarSign },
  { title: "Contas a Pagar", url: "/contas-pagar", icon: CreditCard },
  { title: "Tratamentos", url: "/tratamentos", icon: TrendingUp },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Fornecedores", url: "/fornecedores", icon: Users },
  { title: "DRE", url: "/dre", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart },
  { title: "IA", url: "/assistente-ia", icon: Sparkles },
  { title: "Config", url: "/configuracoes", icon: Settings },
];

export function TopNav() {
  return (
    <nav className="flex items-center gap-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          end
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-accent/80"
          activeClassName="bg-accent text-accent-foreground shadow-sm"
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="hidden lg:inline">{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
