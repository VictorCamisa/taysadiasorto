import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Percent, CreditCard, Target, LayoutDashboard } from "lucide-react";
import { AdvancedKPICard } from "@/components/dashboard/AdvancedKPICard";
import { TopTreatmentsChart } from "@/components/dashboard/TopTreatmentsChart";
import { RevenueOriginPieChart } from "@/components/dashboard/RevenueOriginPieChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { PageHeader } from "@/components/PageHeader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency, formatNumber } from "@/lib/utils";
const Dashboard = () => {
  const [filters, setFilters] = useState<{
    startDate: Date;
    endDate: Date;
    compareStartDate?: Date;
    compareEndDate?: Date;
    tratamentoIds: string[];
    origemIds: string[];
  }>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    tratamentoIds: [],
    origemIds: []
  });
  const {
    kpis,
    charts,
    lists
  } = useDashboardData(filters);

  // Meta exemplo (pode ser configurável no futuro)
  const metaReceita = 50000;
  const progressReceita = kpis.receitaTotal / metaReceita * 100;
  return <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader title="Dashboard" description="Visão geral do desempenho financeiro" icon={<LayoutDashboard className="h-6 w-6 text-primary" />} />

      {/* Filters */}
      <DashboardFilters startDate={filters.startDate} endDate={filters.endDate} compareStartDate={filters.compareStartDate} compareEndDate={filters.compareEndDate} tratamentoIds={filters.tratamentoIds} origemIds={filters.origemIds} onFilterChange={setFilters} tratamentos={lists.tratamentos} origens={lists.origens} />

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdvancedKPICard title="Receita Total" value={formatCurrency(kpis.receitaTotal)} description="Faturamento no período" icon={DollarSign} variant="success" trend={kpis.taxaCrescimentoReceita} trendLabel="vs período anterior" showProgress={true} progressValue={progressReceita} target={metaReceita} />
        <AdvancedKPICard title="Lucro Líquido" value={formatCurrency(kpis.lucroLiquido)} description="Receitas - Despesas" icon={TrendingUp} variant={kpis.lucroLiquido >= 0 ? "success" : "danger"} trend={kpis.taxaCrescimentoLucro} trendLabel="vs período anterior" />
        <AdvancedKPICard title="Ticket Médio" value={formatCurrency(kpis.ticketMedio)} description="Valor médio por atendimento" icon={CreditCard} variant="default" />
        <AdvancedKPICard title="Margem Média" value={`${formatNumber(kpis.margemMedia, 1)}%`} description="Margem de contribuição média" icon={Percent} variant={kpis.margemMedia >= 50 ? "success" : kpis.margemMedia >= 30 ? "warning" : "danger"} />
        <AdvancedKPICard title="Despesas Totais" value={formatCurrency(kpis.despesaTotal)} description="Total de despesas no período" icon={TrendingDown} variant="danger" />
        <AdvancedKPICard title="Saldo Disponível" value={formatCurrency(kpis.saldoTotal)} description="Saldo total em contas" icon={Target} variant="default" />
      </div>

      {/* Monthly Trend Chart */}
      <MonthlyRevenueChart />

      {/* Treatment Performance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopTreatmentsChart data={charts.topTratamentosReceita} title="Top 5 Tratamentos por Receita" dataKey="receita" />
        <TopTreatmentsChart data={charts.topTratamentosMargem} title="Top 5 Tratamentos por Margem" dataKey="margemPercentual" />
      </div>

      {/* Origin Analysis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueOriginPieChart data={charts.receitaPorOrigem} />
        <div className="grid gap-4">
          <UpcomingPayments />
          <LowStockAlert />
        </div>
      </div>
    </div>;
};
export default Dashboard;