import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Percent, CreditCard, Target } from "lucide-react";
import { AdvancedKPICard } from "@/components/dashboard/AdvancedKPICard";
import { TopTreatmentsChart } from "@/components/dashboard/TopTreatmentsChart";
import { RevenueOriginPieChart } from "@/components/dashboard/RevenueOriginPieChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { useDashboardData } from "@/hooks/useDashboardData";
import { startOfMonth, endOfMonth } from "date-fns";

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
    origemIds: [],
  });

  const { kpis, charts, lists } = useDashboardData(filters);

  // Meta exemplo (pode ser configurável no futuro)
  const metaReceita = 50000;
  const progressReceita = (kpis.receitaTotal / metaReceita) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard Financeiro</h1>
        <p className="text-muted-foreground mt-1">Análise completa do desempenho da clínica</p>
      </div>

      {/* Filters */}
      <DashboardFilters
        startDate={filters.startDate}
        endDate={filters.endDate}
        compareStartDate={filters.compareStartDate}
        compareEndDate={filters.compareEndDate}
        tratamentoIds={filters.tratamentoIds}
        origemIds={filters.origemIds}
        onFilterChange={setFilters}
        tratamentos={lists.tratamentos}
        origens={lists.origens}
      />

      {/* Main KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdvancedKPICard
          title="Receita Total"
          value={`R$ ${kpis.receitaTotal.toFixed(2)}`}
          description="Faturamento no período"
          icon={DollarSign}
          variant="success"
          trend={kpis.taxaCrescimentoReceita}
          trendLabel="vs período anterior"
          showProgress={true}
          progressValue={progressReceita}
          target={metaReceita}
        />
        <AdvancedKPICard
          title="Lucro Líquido"
          value={`R$ ${kpis.lucroLiquido.toFixed(2)}`}
          description="Receitas - Despesas"
          icon={TrendingUp}
          variant={kpis.lucroLiquido >= 0 ? "success" : "danger"}
          trend={kpis.taxaCrescimentoLucro}
          trendLabel="vs período anterior"
        />
        <AdvancedKPICard
          title="Ticket Médio"
          value={`R$ ${kpis.ticketMedio.toFixed(2)}`}
          description="Valor médio por atendimento"
          icon={CreditCard}
          variant="default"
        />
        <AdvancedKPICard
          title="Margem Média"
          value={`${kpis.margemMedia.toFixed(1)}%`}
          description="Margem de contribuição média"
          icon={Percent}
          variant={kpis.margemMedia >= 50 ? "success" : kpis.margemMedia >= 30 ? "warning" : "danger"}
        />
        <AdvancedKPICard
          title="Despesas Totais"
          value={`R$ ${kpis.despesaTotal.toFixed(2)}`}
          description="Total de despesas no período"
          icon={TrendingDown}
          variant="danger"
        />
        <AdvancedKPICard
          title="Saldo Disponível"
          value={`R$ ${kpis.saldoTotal.toFixed(2)}`}
          description="Saldo total em contas"
          icon={Target}
          variant="default"
        />
      </div>

      {/* Monthly Trend Chart */}
      <MonthlyRevenueChart />

      {/* Treatment Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopTreatmentsChart
          data={charts.topTratamentosReceita}
          title="Top 5 Tratamentos por Receita"
          dataKey="receita"
        />
        <TopTreatmentsChart
          data={charts.topTratamentosMargem}
          title="Top 5 Tratamentos por Margem"
          dataKey="margemPercentual"
        />
      </div>

      {/* Origin Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueOriginPieChart data={charts.receitaPorOrigem} />
        <div className="grid gap-6">
          <UpcomingPayments />
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
