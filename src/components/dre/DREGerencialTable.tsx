import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DREMensalData } from "@/hooks/useDREGerencial";
import { cn } from "@/lib/utils";

interface DREGerencialTableProps {
  meses: DREMensalData[];
  totais: DREMensalData;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

interface DRERowProps {
  label: string;
  getValue: (m: DREMensalData) => number;
  meses: DREMensalData[];
  totais: DREMensalData;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: number;
  showPercent?: boolean;
  getPercent?: (m: DREMensalData) => number;
  invertColor?: boolean;
}

const DRERow = ({ 
  label, 
  getValue, 
  meses, 
  totais, 
  isTotal, 
  isSubtotal,
  indent = 0,
  showPercent,
  getPercent,
  invertColor = false,
}: DRERowProps) => {
  const getColorClass = (value: number) => {
    if (invertColor) {
      return value > 0 ? "text-destructive" : value < 0 ? "text-chart-2" : "";
    }
    return value > 0 ? "text-chart-2" : value < 0 ? "text-destructive" : "";
  };

  return (
    <TableRow className={cn(
      isTotal && "bg-muted/50 font-bold",
      isSubtotal && "font-semibold bg-muted/30"
    )}>
      <TableCell 
        className={cn(
          "sticky left-0 bg-card z-10 min-w-[200px]",
          isTotal && "bg-muted/50",
          isSubtotal && "bg-muted/30"
        )}
        style={{ paddingLeft: `${12 + indent * 16}px` }}
      >
        {label}
      </TableCell>
      {meses.map((m, i) => {
        const value = getValue(m);
        const percent = getPercent ? getPercent(m) : null;
        return (
          <TableCell key={i} className={cn("text-right whitespace-nowrap", getColorClass(value))}>
            <div>{formatCurrency(value)}</div>
            {showPercent && percent !== null && (
              <div className="text-xs text-muted-foreground">{formatPercent(percent)}</div>
            )}
          </TableCell>
        );
      })}
      <TableCell className={cn(
        "text-right font-bold whitespace-nowrap bg-muted/20",
        getColorClass(getValue(totais))
      )}>
        <div>{formatCurrency(getValue(totais))}</div>
        {showPercent && getPercent && (
          <div className="text-xs text-muted-foreground">{formatPercent(getPercent(totais))}</div>
        )}
      </TableCell>
    </TableRow>
  );
};

interface CollapsibleDRERowProps {
  label: string;
  getValue: (m: DREMensalData) => number;
  meses: DREMensalData[];
  totais: DREMensalData;
  getDetalhe: (m: DREMensalData) => Map<string, number>;
  invertColor?: boolean;
}

const CollapsibleDRERow = ({ 
  label, 
  getValue, 
  meses, 
  totais, 
  getDetalhe,
  invertColor = true,
}: CollapsibleDRERowProps) => {
  const [open, setOpen] = useState(false);
  
  // Consolidar todas as categorias
  const todasCategorias = new Set<string>();
  meses.forEach(m => getDetalhe(m).forEach((_, cat) => todasCategorias.add(cat)));
  getDetalhe(totais).forEach((_, cat) => todasCategorias.add(cat));

  const getColorClass = (value: number) => {
    if (invertColor) {
      return value > 0 ? "text-destructive" : value < 0 ? "text-chart-2" : "";
    }
    return value > 0 ? "text-chart-2" : value < 0 ? "text-destructive" : "";
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TableRow className="font-semibold bg-muted/30 cursor-pointer hover:bg-muted/40">
        <TableCell className="sticky left-0 bg-muted/30 z-10 min-w-[200px]">
          <CollapsibleTrigger className="flex items-center gap-1 w-full">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {label}
          </CollapsibleTrigger>
        </TableCell>
        {meses.map((m, i) => (
          <TableCell key={i} className={cn("text-right whitespace-nowrap", getColorClass(getValue(m)))}>
            {formatCurrency(getValue(m))}
          </TableCell>
        ))}
        <TableCell className={cn("text-right font-bold whitespace-nowrap bg-muted/20", getColorClass(getValue(totais)))}>
          {formatCurrency(getValue(totais))}
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <>
          {Array.from(todasCategorias).sort().map(cat => (
            <TableRow key={cat} className="text-sm">
              <TableCell 
                className="sticky left-0 bg-card z-10 min-w-[200px] text-muted-foreground"
                style={{ paddingLeft: "28px" }}
              >
                {cat}
              </TableCell>
              {meses.map((m, i) => {
                const value = getDetalhe(m).get(cat) || 0;
                return (
                  <TableCell key={i} className={cn("text-right whitespace-nowrap", getColorClass(value))}>
                    {value > 0 ? formatCurrency(value) : "-"}
                  </TableCell>
                );
              })}
              <TableCell className={cn("text-right whitespace-nowrap bg-muted/20", getColorClass(getDetalhe(totais).get(cat) || 0))}>
                {formatCurrency(getDetalhe(totais).get(cat) || 0)}
              </TableCell>
            </TableRow>
          ))}
        </>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const DREGerencialTable = ({ meses, totais }: DREGerencialTableProps) => {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-card z-20 min-w-[200px]">Descrição</TableHead>
            {meses.map((m, i) => (
              <TableHead key={i} className="text-right min-w-[100px]">{m.mesLabel}</TableHead>
            ))}
            <TableHead className="text-right min-w-[120px] bg-muted/20 font-bold">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* RECEITA BRUTA */}
          <DRERow 
            label="RECEITA BRUTA" 
            getValue={m => m.receitaBruta} 
            meses={meses} 
            totais={totais}
            isTotal
          />
          
          {/* Deduções */}
          <DRERow 
            label="(-) Deduções (ISS/PIS/COFINS)" 
            getValue={m => -m.deducoes} 
            meses={meses} 
            totais={totais}
            indent={1}
            invertColor
          />
          
          {/* RECEITA LÍQUIDA */}
          <DRERow 
            label="RECEITA LÍQUIDA" 
            getValue={m => m.receitaLiquida} 
            meses={meses} 
            totais={totais}
            isSubtotal
          />
          
          {/* Custo Material */}
          <DRERow 
            label="(-) Custo Material (Ficha Técnica)" 
            getValue={m => -m.custoMaterial} 
            meses={meses} 
            totais={totais}
            indent={1}
            invertColor
          />
          
          {/* Custos Variáveis */}
          <DRERow 
            label="(-) Custos Variáveis" 
            getValue={m => -m.custosVariaveis} 
            meses={meses} 
            totais={totais}
            indent={1}
            invertColor
          />
          
          {/* LUCRO BRUTO */}
          <DRERow 
            label="LUCRO BRUTO" 
            getValue={m => m.lucroBruto} 
            meses={meses} 
            totais={totais}
            isSubtotal
            showPercent
            getPercent={m => m.margemBruta}
          />
          
          {/* Despesas Operacionais (com drill-down) */}
          <CollapsibleDRERow
            label="(-) Despesas Operacionais"
            getValue={m => m.despesasOperacionais}
            meses={meses}
            totais={totais}
            getDetalhe={m => m.despesasOpexDetalhe}
          />
          
          {/* RESULTADO OPERACIONAL */}
          <DRERow 
            label="RESULTADO OPERACIONAL (EBIT)" 
            getValue={m => m.resultadoOperacional} 
            meses={meses} 
            totais={totais}
            isSubtotal
            showPercent
            getPercent={m => m.margemOperacional}
          />
          
          {/* Despesas Financeiras */}
          <DRERow 
            label="(-) Despesas Financeiras Líquidas" 
            getValue={m => -m.despesasFinanceiras} 
            meses={meses} 
            totais={totais}
            indent={1}
            invertColor
          />
          
          {/* RESULTADO ANTES IR */}
          <DRERow 
            label="RESULTADO ANTES DO IR" 
            getValue={m => m.resultadoAntesIR} 
            meses={meses} 
            totais={totais}
            isSubtotal
          />
          
          {/* Impostos sobre Lucro */}
          <DRERow 
            label="(-) IRPJ/CSLL" 
            getValue={m => -m.impostoLucro} 
            meses={meses} 
            totais={totais}
            indent={1}
            invertColor
          />
          
          {/* LUCRO LÍQUIDO */}
          <DRERow 
            label="LUCRO LÍQUIDO" 
            getValue={m => m.lucroLiquido} 
            meses={meses} 
            totais={totais}
            isTotal
            showPercent
            getPercent={m => m.margemLiquida}
          />
        </TableBody>
      </Table>
    </div>
  );
};
