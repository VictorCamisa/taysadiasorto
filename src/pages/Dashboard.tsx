import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, LayoutDashboard, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopTreatmentsChart } from "@/components/dashboard/TopTreatmentsChart";
import { RevenueOriginPieChart } from "@/components/dashboard/RevenueOriginPieChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { PageHeader } from "@/components/PageHeader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ElementType;
  variant?: "default" | "success" | "danger";
}

function KPICard({ title, value, subtitle, trend, icon: Icon, variant = "default" }: KPICardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-[hsl(145,60%,45%)]",
    danger: "text-destructive",
  };

  return (
    <Card className="border-border/50">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={cn("p-2 rounded-lg bg-muted/50", variantStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1.5">
            {trend !== undefined && (
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                trend >= 0 ? "text-[hsl(145,60%,45%)]" : "text-destructive"
              )}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatNumber(Math.abs(trend), 1)}%
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
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
  
  const [filters] = useState({
    startDate: start,
    endDate: end,
    tratamentoIds: [] as string[],
    origemIds: [] as string[],
  });

  const { kpis, charts } = useDashboardData({
    ...filters,
    startDate: start,
    endDate: end,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard Financeiro"
          description="Visão geral do desempenho"
          icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
          className="mb-0"
        />
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <CalendarIcon className="h-4 w-4 mr-2" />
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

      {/* Main KPIs - 2x2 Grid on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={formatCurrency(kpis.receitaTotal)}
          trend={kpis.taxaCrescimentoReceita}
          subtitle="vs período anterior"
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Despesas"
          value={formatCurrency(kpis.despesaTotal)}
          icon={TrendingDown}
          variant="danger"
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(kpis.lucroLiquido)}
          trend={kpis.taxaCrescimentoLucro}
          icon={TrendingUp}
          variant={kpis.lucroLiquido >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(kpis.ticketMedio)}
          icon={CreditCard}
        />
      </div>

      {/* Revenue Chart */}
      <MonthlyRevenueChart />

      {/* Treatment Performance */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TopTreatmentsChart
          data={charts.topTratamentosReceita}
          title="Top 5 Tratamentos por Receita"
          dataKey="receita"
        />
        <RevenueOriginPieChart data={charts.receitaPorOrigem} />
      </div>

      {/* Alerts and Payments */}
      <div className="grid lg:grid-cols-2 gap-4">
        <UpcomingPayments />
        <LowStockAlert />
      </div>
    </div>
  );
};

export default Dashboard;
