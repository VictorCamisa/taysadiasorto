import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDREGerencial, DREMensalData } from "@/hooks/useDREGerencial";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number, compact = false) => {
  if (compact && Math.abs(value) >= 1000) {
    return (value / 1000).toLocaleString("pt-BR", { 
      style: "currency", 
      currency: "BRL",
      maximumFractionDigits: 1 
    }).replace("R$", "R$") + "k";
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

// Componente de indicador de tendência
const TrendIndicator = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;
  
  if (Math.abs(value) < 0.1) {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  
  return isPositive ? (
    <TrendingUp className="h-3 w-3 text-emerald-500" />
  ) : (
    <TrendingDown className="h-3 w-3 text-red-500" />
  );
};

// Componente de linha da DRE
interface DRELineProps {
  label: string;
  values: number[];
  total: number;
  percent?: number[];
  totalPercent?: number;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  inverted?: boolean;
}

const DRELine = ({
  label,
  values,
  total,
  percent,
  totalPercent,
  isHeader,
  isSubtotal,
  isTotal,
  indent = 0,
  expandable,
  expanded,
  onToggle,
  inverted = false,
}: DRELineProps) => {
  const getValueColor = (val: number) => {
    if (inverted) {
      return val > 0 ? "text-red-500" : val < 0 ? "text-emerald-500" : "text-muted-foreground";
    }
    return val > 0 ? "text-emerald-500" : val < 0 ? "text-red-500" : "text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(200px,1.5fr)_repeat(12,minmax(80px,1fr))_minmax(100px,1.2fr)] gap-0 border-b border-border/50 transition-colors",
        isHeader && "bg-muted/60 font-semibold",
        isSubtotal && "bg-muted/40 font-medium",
        isTotal && "bg-primary/10 font-bold text-primary",
        !isHeader && !isSubtotal && !isTotal && "hover:bg-muted/20",
        expandable && "cursor-pointer"
      )}
      onClick={onToggle}
    >
      {/* Label */}
      <div 
        className={cn(
          "px-3 py-2.5 flex items-center gap-1.5 border-r border-border/30",
          isTotal && "text-primary"
        )}
        style={{ paddingLeft: `${12 + indent * 16}px` }}
      >
        {expandable && (
          expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
        )}
        <span className="truncate">{label}</span>
      </div>

      {/* Monthly values */}
      {values.map((val, i) => (
        <div 
          key={i} 
          className={cn(
            "px-2 py-2.5 text-right tabular-nums text-sm border-r border-border/20",
            getValueColor(val)
          )}
        >
          <div>{formatCurrency(val, true)}</div>
          {percent && percent[i] !== undefined && (
            <div className="text-[10px] text-muted-foreground">{formatPercent(percent[i])}</div>
          )}
        </div>
      ))}

      {/* Total */}
      <div 
        className={cn(
          "px-3 py-2.5 text-right tabular-nums font-semibold bg-muted/30",
          isTotal ? "text-primary" : getValueColor(total)
        )}
      >
        <div className="flex items-center justify-end gap-1">
          <TrendIndicator value={total} inverted={inverted} />
          <span>{formatCurrency(total)}</span>
        </div>
        {totalPercent !== undefined && (
          <div className="text-[10px] text-muted-foreground">{formatPercent(totalPercent)}</div>
        )}
      </div>
    </div>
  );
};

// Componente de cabeçalho da tabela
const DREHeader = ({ meses }: { meses: DREMensalData[] }) => (
  <div className="grid grid-cols-[minmax(200px,1.5fr)_repeat(12,minmax(80px,1fr))_minmax(100px,1.2fr)] gap-0 bg-card border-b-2 border-border sticky top-0 z-10">
    <div className="px-3 py-3 font-semibold text-muted-foreground border-r border-border/30">
      Descrição
    </div>
    {meses.map((m, i) => (
      <div key={i} className="px-2 py-3 text-center font-medium text-xs text-muted-foreground border-r border-border/20 uppercase">
        {m.mesLabel}
      </div>
    ))}
    <div className="px-3 py-3 text-center font-bold text-xs bg-muted/30 uppercase">
      Total Ano
    </div>
  </div>
);

// Componente de seção colapsável
interface CollapsibleSectionProps {
  label: string;
  values: number[];
  total: number;
  details: Map<string, number>[];
  totalDetails: Map<string, number>;
}

const CollapsibleSection = ({ label, values, total, details, totalDetails }: CollapsibleSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const categories = new Set<string>();
  details.forEach(d => d.forEach((_, cat) => categories.add(cat)));
  totalDetails.forEach((_, cat) => categories.add(cat));

  return (
    <>
      <DRELine
        label={label}
        values={values.map(v => -v)}
        total={-total}
        isSubtotal
        expandable
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        inverted
      />
      {expanded && Array.from(categories).sort().map(cat => (
        <DRELine
          key={cat}
          label={cat}
          values={details.map(d => -(d.get(cat) || 0))}
          total={-(totalDetails.get(cat) || 0)}
          indent={2}
          inverted
        />
      ))}
    </>
  );
};

const DRE = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data, isLoading } = useDREGerencial(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totais = data?.totais;
  const meses = data?.meses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">DRE Gerencial</h1>
            <p className="text-sm text-muted-foreground">Demonstração do Resultado - {selectedYear}</p>
          </div>
        </div>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs Compactos */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Receita Líquida</p>
            <p className="text-xl font-bold text-primary mt-1">{formatCurrency(totais?.receitaLiquida || 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Lucro Bruto</p>
            <p className="text-xl font-bold text-chart-3 mt-1">{formatCurrency(totais?.lucroBruto || 0)}</p>
            <p className="text-xs text-muted-foreground">{formatPercent(totais?.margemBruta || 0)} margem</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">EBIT</p>
            <p className={cn("text-xl font-bold mt-1", (totais?.resultadoOperacional || 0) >= 0 ? "text-blue-500" : "text-destructive")}>
              {formatCurrency(totais?.resultadoOperacional || 0)}
            </p>
            <p className="text-xs text-muted-foreground">{formatPercent(totais?.margemOperacional || 0)} margem</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Lucro Líquido</p>
            <p className={cn("text-xl font-bold mt-1", (totais?.lucroLiquido || 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
              {formatCurrency(totais?.lucroLiquido || 0)}
            </p>
            <p className="text-xs text-muted-foreground">{formatPercent(totais?.margemLiquida || 0)} margem</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela DRE */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <DREHeader meses={meses} />
            
            {/* RECEITA BRUTA */}
            <DRELine
              label="RECEITA BRUTA"
              values={meses.map(m => m.receitaBruta)}
              total={totais?.receitaBruta || 0}
              isHeader
            />
            
            {/* Deduções */}
            <DRELine
              label="(-) Impostos sobre serviços"
              values={meses.map(m => -m.deducoes)}
              total={-(totais?.deducoes || 0)}
              indent={1}
              inverted
            />
            
            {/* RECEITA LÍQUIDA */}
            <DRELine
              label="RECEITA LÍQUIDA"
              values={meses.map(m => m.receitaLiquida)}
              total={totais?.receitaLiquida || 0}
              isSubtotal
            />
            
            {/* Custos */}
            <DRELine
              label="(-) Custo dos serviços"
              values={meses.map(m => -m.custoMaterial)}
              total={-(totais?.custoMaterial || 0)}
              indent={1}
              inverted
            />
            <DRELine
              label="(-) Custos variáveis"
              values={meses.map(m => -m.custosVariaveis)}
              total={-(totais?.custosVariaveis || 0)}
              indent={1}
              inverted
            />
            
            {/* LUCRO BRUTO */}
            <DRELine
              label="LUCRO BRUTO"
              values={meses.map(m => m.lucroBruto)}
              total={totais?.lucroBruto || 0}
              percent={meses.map(m => m.margemBruta)}
              totalPercent={totais?.margemBruta}
              isSubtotal
            />
            
            {/* Despesas Operacionais com drill-down */}
            <CollapsibleSection
              label="(-) Despesas operacionais"
              values={meses.map(m => m.despesasOperacionais)}
              total={totais?.despesasOperacionais || 0}
              details={meses.map(m => m.despesasOpexDetalhe)}
              totalDetails={totais?.despesasOpexDetalhe || new Map()}
            />
            
            {/* RESULTADO OPERACIONAL */}
            <DRELine
              label="RESULTADO OPERACIONAL"
              values={meses.map(m => m.resultadoOperacional)}
              total={totais?.resultadoOperacional || 0}
              percent={meses.map(m => m.margemOperacional)}
              totalPercent={totais?.margemOperacional}
              isSubtotal
            />
            
            {/* Despesas Financeiras */}
            <DRELine
              label="(-) Despesas financeiras"
              values={meses.map(m => -m.despesasFinanceiras)}
              total={-(totais?.despesasFinanceiras || 0)}
              indent={1}
              inverted
            />
            
            {/* RESULTADO ANTES IR */}
            <DRELine
              label="RESULTADO ANTES DO IR"
              values={meses.map(m => m.resultadoAntesIR)}
              total={totais?.resultadoAntesIR || 0}
              isSubtotal
            />
            
            {/* Impostos */}
            <DRELine
              label="(-) IRPJ / CSLL"
              values={meses.map(m => -m.impostoLucro)}
              total={-(totais?.impostoLucro || 0)}
              indent={1}
              inverted
            />
            
            {/* LUCRO LÍQUIDO */}
            <DRELine
              label="LUCRO LÍQUIDO"
              values={meses.map(m => m.lucroLiquido)}
              total={totais?.lucroLiquido || 0}
              percent={meses.map(m => m.margemLiquida)}
              totalPercent={totais?.margemLiquida}
              isTotal
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DRE;
