import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileModuleNav } from "@/components/mobile/MobileModuleNav";
import { MobileKPICard, MobileKPIGrid } from "@/components/mobile/MobileKPICard";
import { MobileCard, MobileCardHeader, MobileCardContent, MobileListItem } from "@/components/mobile/MobileCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Package,
  Users,
  BarChart3,
  Target,
  FileBarChart,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { formatCurrency, formatNumber } from "@/lib/utils";

const financeiroNavItems = [
  { label: "Dashboard", to: "/financeiro" },
  { label: "Diário", to: "/financeiro/diario-caixa", icon: FileText },
  { label: "Lançamentos", to: "/financeiro/lancamentos", icon: DollarSign },
  { label: "Contas", to: "/financeiro/contas-pagar", icon: CreditCard },
  { label: "Estoque", to: "/financeiro/estoque", icon: Package },
  { label: "DRE", to: "/financeiro/dre", icon: BarChart3 },
];

export function MobileDashboard() {
  const [period, setPeriod] = useState("month");
  
  const getPeriodDates = (p: string) => {
    const now = new Date();
    switch (p) {
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter":
        return { start: subMonths(startOfMonth(now), 2), end: endOfMonth(now) };
      case "semester":
        return { start: subMonths(startOfMonth(now), 5), end: endOfMonth(now) };
      case "year":
        return { start: startOfYear(now), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getPeriodDates(period);
  
  const { kpis, charts } = useDashboardData({
    startDate: start,
    endDate: end,
    tratamentoIds: [],
    origemIds: [],
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <MobileHeader 
        title="Dashboard"
        showBack
        backTo="/"
      />

      {/* Module Nav */}
      <MobileModuleNav items={financeiroNavItems} />

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-24 space-y-5 overflow-y-auto">
        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês Atual</SelectItem>
              <SelectItem value="quarter">Últimos 3 Meses</SelectItem>
              <SelectItem value="semester">Últimos 6 Meses</SelectItem>
              <SelectItem value="year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main KPIs */}
        <MobileKPIGrid>
          <MobileKPICard
            title="Receita"
            value={formatCurrency(kpis.receitaTotal)}
            icon={TrendingUp}
            variant="success"
          />
          <MobileKPICard
            title="Despesas"
            value={formatCurrency(kpis.despesaTotal)}
            icon={TrendingDown}
            variant="danger"
          />
          <MobileKPICard
            title="Lucro"
            value={formatCurrency(kpis.lucroLiquido)}
            icon={DollarSign}
            variant={kpis.lucroLiquido >= 0 ? "success" : "danger"}
          />
          <MobileKPICard
            title="Ticket Médio"
            value={formatCurrency(kpis.ticketMedio)}
            icon={Target}
          />
        </MobileKPIGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Novo Lançamento", icon: DollarSign, to: "/financeiro/lancamentos" },
            { label: "Ver DRE", icon: BarChart3, to: "/financeiro/dre" },
            { label: "Relatórios", icon: FileBarChart, to: "/financeiro/relatorios" },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl",
                "bg-card border border-border/40",
                "active:scale-95 transition-all"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-center text-muted-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Top Tratamentos */}
        <MobileCard>
          <MobileCardHeader
            title="Top Tratamentos"
            subtitle="Mais vendidos no período"
            icon={TrendingUp}
          />
          <MobileCardContent noPadding>
            {charts.topTratamentosReceita.slice(0, 5).map((item: any) => (
              <MobileListItem
                key={item.nome}
                title={item.nome}
                subtitle={`${item.quantidade || 0} vendas`}
                value={formatCurrency(item.valor || 0)}
                showChevron={false}
              />
            ))}
            {charts.topTratamentosReceita.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhum tratamento no período
              </div>
            )}
          </MobileCardContent>
        </MobileCard>

        {/* Revenue by Origin */}
        <MobileCard>
          <MobileCardHeader
            title="Receita por Origem"
            subtitle="Distribuição do período"
            icon={Users}
          />
          <MobileCardContent noPadding>
            {Object.entries(charts.receitaPorOrigem || {}).slice(0, 5).map(([nome, valor]: [string, any]) => (
              <MobileListItem
                key={nome}
                title={nome}
                value={formatCurrency(valor || 0)}
                showChevron={false}
              />
            ))}
            {Object.keys(charts.receitaPorOrigem || {}).length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma origem no período
              </div>
            )}
          </MobileCardContent>
        </MobileCard>
      </div>
    </div>
  );
}
