import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Percent, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDREGerencial } from "@/hooks/useDREGerencial";
import { DREGerencialTable } from "@/components/dre/DREGerencialTable";
import { DREGerencialCharts } from "@/components/dre/DREGerencialCharts";
import { PageHeader } from "@/components/PageHeader";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const DREGerencial = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data, isLoading } = useDREGerencial(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totais = data?.totais;

  return (
    <div className="space-y-6">
      <PageHeader
        title="DRE Gerencial"
        description="Demonstração do Resultado do Exercício - Visão anual completa"
        actions={
          <div className="flex items-center gap-2">
            <Select 
              value={String(selectedYear)} 
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* KPIs Resumidos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida Anual</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totais?.receitaLiquida || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita Bruta: {formatCurrency(totais?.receitaBruta || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <Percent className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {formatCurrency(totais?.lucroBruto || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem Bruta: {formatPercent(totais?.margemBruta || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Operacional</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totais?.resultadoOperacional || 0) >= 0 ? "text-blue-500" : "text-destructive"}`}>
              {formatCurrency(totais?.resultadoOperacional || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem Operacional: {formatPercent(totais?.margemOperacional || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totais?.lucroLiquido || 0) >= 0 ? "text-chart-2" : "text-destructive"}`}>
              {formatCurrency(totais?.lucroLiquido || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem Líquida: {formatPercent(totais?.margemLiquida || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para alternar visualizações */}
      <Tabs defaultValue="tabela" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tabela">Tabela Anual</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="tabela" className="space-y-4">
          {data && (
            <DREGerencialTable meses={data.meses} totais={data.totais} />
          )}
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          {data && (
            <DREGerencialCharts meses={data.meses} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DREGerencial;
