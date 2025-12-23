import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import { useDREGerencial, DREMensalData } from "@/hooks/useDREGerencial";
import { cn } from "@/lib/utils";

// ========== UTILS ==========
const formatCurrency = (value: number, compact = false) => {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => 
  `${value >= 0 ? "" : ""}${value.toFixed(1)}%`;

// ========== KPI CARD ==========
interface KPICardProps {
  title: string;
  value: number;
  percent?: number;
  trend?: number;
  variant?: "default" | "success" | "warning" | "info";
}

const KPICard = ({ title, value, percent, trend, variant = "default" }: KPICardProps) => {
  const isPositive = value >= 0;
  
  const variantStyles = {
    default: "from-card to-card",
    success: "from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/5",
    warning: "from-amber-500/5 to-amber-500/10 dark:from-amber-500/10 dark:to-amber-500/5",
    info: "from-blue-500/5 to-blue-500/10 dark:from-blue-500/10 dark:to-blue-500/5",
  };

  const valueStyles = {
    default: isPositive ? "text-foreground" : "text-destructive",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all hover:shadow-lg",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className={cn("text-2xl font-bold tracking-tight", valueStyles[variant])}>
            {formatCurrency(value)}
          </p>
          {percent !== undefined && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-medium",
                  percent >= 0 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {formatPercent(percent)} margem
              </Badge>
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            trend >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
          )}>
            {trend >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ========== TABLE ROW ==========
interface DRERowProps {
  label: string;
  values: number[];
  total: number;
  percent?: number[];
  totalPercent?: number;
  type?: "header" | "item" | "subtotal" | "total";
  indent?: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  isExpense?: boolean;
}

const DRERow = ({
  label,
  values,
  total,
  percent,
  totalPercent,
  type = "item",
  indent = 0,
  expandable,
  expanded,
  onToggle,
  isExpense = false,
}: DRERowProps) => {
  const getValueColor = (val: number) => {
    if (type === "header") return "";
    if (isExpense) return val !== 0 ? "text-red-500 dark:text-red-400" : "text-muted-foreground";
    return val > 0 
      ? "text-emerald-600 dark:text-emerald-400" 
      : val < 0 
        ? "text-red-500 dark:text-red-400" 
        : "text-muted-foreground";
  };

  const rowStyles = {
    header: "bg-muted/50 font-semibold text-foreground",
    item: "hover:bg-muted/30 transition-colors",
    subtotal: "bg-muted/30 font-semibold border-t border-border/50",
    total: "bg-primary/5 font-bold text-primary border-t-2 border-primary/20",
  };

  return (
    <div
      className={cn(
        "group grid gap-0",
        "grid-cols-[minmax(220px,2fr)_repeat(12,minmax(75px,1fr))_minmax(110px,1.3fr)]",
        rowStyles[type],
        expandable && "cursor-pointer"
      )}
      onClick={onToggle}
    >
      {/* Label */}
      <div 
        className={cn(
          "flex items-center gap-2 border-r border-border/30 px-4 py-3",
          type === "total" && "text-primary"
        )}
        style={{ paddingLeft: `${16 + indent * 20}px` }}
      >
        {expandable && (
          <span className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors group-hover:bg-muted">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        )}
        <span className={cn("truncate text-sm", type === "header" && "text-xs uppercase tracking-wide")}>
          {label}
        </span>
      </div>

      {/* Monthly Values */}
      {values.map((val, i) => (
        <div 
          key={i} 
          className={cn(
            "flex flex-col items-end justify-center border-r border-border/20 px-2 py-3 text-right",
            type === "header" && "text-center items-center"
          )}
        >
          <span className={cn(
            "tabular-nums text-sm",
            getValueColor(val),
            type === "header" && "text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          )}>
            {type === "header" ? val : formatCurrency(val, true)}
          </span>
          {percent && percent[i] !== undefined && type !== "header" && (
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {formatPercent(percent[i])}
            </span>
          )}
        </div>
      ))}

      {/* Total */}
      <div className={cn(
        "flex flex-col items-end justify-center bg-muted/20 px-4 py-3",
        type === "header" && "text-center items-center"
      )}>
        <div className="flex items-center gap-1.5">
          {type !== "header" && total !== 0 && (
            <>
              {isExpense ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : total > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : total < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
            </>
          )}
          <span className={cn(
            "tabular-nums font-semibold",
            type === "total" ? "text-primary text-base" : getValueColor(total),
            type === "header" && "text-[11px] font-bold uppercase tracking-wide text-foreground"
          )}>
            {type === "header" ? "Total" : formatCurrency(total)}
          </span>
        </div>
        {totalPercent !== undefined && type !== "header" && (
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            {formatPercent(totalPercent)}
          </span>
        )}
      </div>
    </div>
  );
};

// ========== COLLAPSIBLE SECTION ==========
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
      <DRERow
        label={label}
        values={values.map(v => -v)}
        total={-total}
        type="item"
        expandable
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isExpense
      />
      {expanded && Array.from(categories).sort().map(cat => (
        <DRERow
          key={cat}
          label={cat}
          values={details.map(d => -(d.get(cat) || 0))}
          total={-(totalDetails.get(cat) || 0)}
          indent={2}
          isExpense
        />
      ))}
    </>
  );
};

// ========== MAIN COMPONENT ==========
const DRE = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data, isLoading } = useDREGerencial(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const meses = data?.meses || [];
  const totais = data?.totais;

  const monthLabels = meses.map(m => m.mesLabel);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-8 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DRE Gerencial</h1>
          <p className="mt-1 text-muted-foreground">
            Demonstração do Resultado do Exercício
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita Líquida"
          value={totais?.receitaLiquida || 0}
          trend={1}
          variant="default"
        />
        <KPICard
          title="Lucro Bruto"
          value={totais?.lucroBruto || 0}
          percent={totais?.margemBruta}
          variant="success"
        />
        <KPICard
          title="EBIT"
          value={totais?.resultadoOperacional || 0}
          percent={totais?.margemOperacional}
          variant="info"
        />
        <KPICard
          title="Lucro Líquido"
          value={totais?.lucroLiquido || 0}
          percent={totais?.margemLiquida}
          variant={(totais?.lucroLiquido || 0) >= 0 ? "success" : "warning"}
        />
      </div>

      {/* DRE Table */}
      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-lg font-semibold">
            Demonstração de Resultados — {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <DRERow
                label="Descrição"
                values={monthLabels as any}
                total={0}
                type="header"
              />

              <Separator />

              {/* RECEITA BRUTA */}
              <DRERow
                label="Receita Bruta"
                values={meses.map(m => m.receitaBruta)}
                total={totais?.receitaBruta || 0}
                type="subtotal"
              />

              {/* Deduções */}
              <DRERow
                label="(-) Impostos sobre serviços"
                values={meses.map(m => -m.deducoes)}
                total={-(totais?.deducoes || 0)}
                indent={1}
                isExpense
              />

              {/* RECEITA LÍQUIDA */}
              <DRERow
                label="= Receita Líquida"
                values={meses.map(m => m.receitaLiquida)}
                total={totais?.receitaLiquida || 0}
                type="subtotal"
              />

              <Separator className="my-0.5" />

              {/* Custos */}
              <DRERow
                label="(-) Custo dos serviços prestados"
                values={meses.map(m => -m.custoMaterial)}
                total={-(totais?.custoMaterial || 0)}
                indent={1}
                isExpense
              />
              <DRERow
                label="(-) Custos variáveis"
                values={meses.map(m => -m.custosVariaveis)}
                total={-(totais?.custosVariaveis || 0)}
                indent={1}
                isExpense
              />

              {/* LUCRO BRUTO */}
              <DRERow
                label="= Lucro Bruto"
                values={meses.map(m => m.lucroBruto)}
                total={totais?.lucroBruto || 0}
                percent={meses.map(m => m.margemBruta)}
                totalPercent={totais?.margemBruta}
                type="subtotal"
              />

              <Separator className="my-0.5" />

              {/* Despesas Operacionais */}
              <CollapsibleSection
                label="(-) Despesas operacionais"
                values={meses.map(m => m.despesasOperacionais)}
                total={totais?.despesasOperacionais || 0}
                details={meses.map(m => m.despesasOpexDetalhe)}
                totalDetails={totais?.despesasOpexDetalhe || new Map()}
              />

              {/* RESULTADO OPERACIONAL (EBIT) */}
              <DRERow
                label="= Resultado Operacional (EBIT)"
                values={meses.map(m => m.resultadoOperacional)}
                total={totais?.resultadoOperacional || 0}
                percent={meses.map(m => m.margemOperacional)}
                totalPercent={totais?.margemOperacional}
                type="subtotal"
              />

              <Separator className="my-0.5" />

              {/* Despesas Financeiras */}
              <DRERow
                label="(-) Despesas financeiras"
                values={meses.map(m => -m.despesasFinanceiras)}
                total={-(totais?.despesasFinanceiras || 0)}
                indent={1}
                isExpense
              />

              {/* RESULTADO ANTES IR */}
              <DRERow
                label="= Resultado antes do IR/CSLL"
                values={meses.map(m => m.resultadoAntesIR)}
                total={totais?.resultadoAntesIR || 0}
                type="subtotal"
              />

              {/* Impostos sobre lucro */}
              <DRERow
                label="(-) IRPJ / CSLL"
                values={meses.map(m => -m.impostoLucro)}
                total={-(totais?.impostoLucro || 0)}
                indent={1}
                isExpense
              />

              {/* LUCRO LÍQUIDO */}
              <DRERow
                label="= Lucro Líquido do Exercício"
                values={meses.map(m => m.lucroLiquido)}
                total={totais?.lucroLiquido || 0}
                percent={meses.map(m => m.margemLiquida)}
                totalPercent={totais?.margemLiquida}
                type="total"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DRE;
