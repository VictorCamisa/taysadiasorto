import { DollarSign, TrendingUp, TrendingDown, Package, FileText, AlertCircle, Wallet } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueByTreatmentChart } from "@/components/dashboard/RevenueByTreatmentChart";
import { RevenueByOriginChart } from "@/components/dashboard/RevenueByOriginChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { useFinanceData } from "@/hooks/useFinanceData";

const Dashboard = () => {
  const { kpis } = useFinanceData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard Financeiro</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema financeiro da clínica</p>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receitas do Mês"
          value={`R$ ${kpis.receitaMes.toFixed(2)}`}
          description="Total de receitas no mês atual"
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Despesas do Mês"
          value={`R$ ${kpis.despesaMes.toFixed(2)}`}
          description="Total de despesas no mês atual"
          icon={TrendingDown}
          variant="danger"
        />
        <KPICard
          title="Lucro Líquido"
          value={`R$ ${kpis.lucroMes.toFixed(2)}`}
          description="Resultado do mês"
          icon={DollarSign}
          variant={kpis.lucroMes >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Saldo em Contas"
          value={`R$ ${kpis.saldoTotal.toFixed(2)}`}
          description="Saldo total disponível"
          icon={Wallet}
          variant="default"
        />
      </div>

      {/* KPIs secundários */}
      <div className="grid gap-6 md:grid-cols-3">
        <KPICard
          title="Lançamentos do Mês"
          value={kpis.totalLancamentos}
          description="Total de movimentações"
          icon={FileText}
        />
        <KPICard
          title="Contas Vencidas"
          value={kpis.contasVencidas}
          description="Contas em atraso"
          icon={AlertCircle}
          variant={kpis.contasVencidas > 0 ? "warning" : "default"}
        />
        <KPICard
          title="Estoque Baixo"
          value={kpis.produtosBaixos}
          description="Produtos abaixo do mínimo"
          icon={Package}
          variant={kpis.produtosBaixos > 0 ? "warning" : "default"}
        />
      </div>

      {/* Gráfico de linha mensal */}
      <MonthlyRevenueChart />

      {/* Gráficos lado a lado */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueByTreatmentChart />
        <RevenueByOriginChart />
      </div>

      {/* Alertas e avisos */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingPayments />
        <LowStockAlert />
      </div>
    </div>
  );
};

export default Dashboard;
