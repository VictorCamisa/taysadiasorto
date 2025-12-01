import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ArrowLeftRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

interface DashboardFiltersProps {
  startDate: Date;
  endDate: Date;
  compareStartDate?: Date;
  compareEndDate?: Date;
  tratamentoIds: string[];
  origemIds: string[];
  onFilterChange: (filters: {
    startDate: Date;
    endDate: Date;
    compareStartDate?: Date;
    compareEndDate?: Date;
    tratamentoIds: string[];
    origemIds: string[];
  }) => void;
  tratamentos: any[];
  origens: any[];
}

export const DashboardFilters = ({
  startDate,
  endDate,
  compareStartDate,
  compareEndDate,
  tratamentoIds,
  origemIds,
  onFilterChange,
  tratamentos,
  origens,
}: DashboardFiltersProps) => {
  const [showComparison, setShowComparison] = useState(!!compareStartDate);

  const presets = [
    { label: "Mês Atual", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { label: "Últimos 3 Meses", getValue: () => ({ start: subMonths(startOfMonth(new Date()), 2), end: endOfMonth(new Date()) }) },
    { label: "Últimos 6 Meses", getValue: () => ({ start: subMonths(startOfMonth(new Date()), 5), end: endOfMonth(new Date()) }) },
    { label: "Ano Atual", getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
  ];

  const handlePresetChange = (preset: string) => {
    const selected = presets.find(p => p.label === preset);
    if (selected) {
      const { start, end } = selected.getValue();
      onFilterChange({
        startDate: start,
        endDate: end,
        compareStartDate,
        compareEndDate,
        tratamentoIds,
        origemIds,
      });
    }
  };

  const toggleComparison = () => {
    if (showComparison) {
      onFilterChange({
        startDate,
        endDate,
        compareStartDate: undefined,
        compareEndDate: undefined,
        tratamentoIds,
        origemIds,
      });
      setShowComparison(false);
    } else {
      const monthsBetween = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const newCompareEnd = new Date(startDate);
      newCompareEnd.setDate(newCompareEnd.getDate() - 1);
      const newCompareStart = subMonths(newCompareEnd, monthsBetween);
      
      onFilterChange({
        startDate,
        endDate,
        compareStartDate: newCompareStart,
        compareEndDate: newCompareEnd,
        tratamentoIds,
        origemIds,
      });
      setShowComparison(true);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {/* Period Presets */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {presets.map(preset => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Start Date */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && onFilterChange({ startDate: date, endDate, compareStartDate, compareEndDate, tratamentoIds, origemIds })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Custom End Date */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && onFilterChange({ startDate, endDate: date, compareStartDate, compareEndDate, tratamentoIds, origemIds })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Comparison Toggle */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Comparação</label>
            <Button
              variant={showComparison ? "default" : "outline"}
              className="w-full"
              onClick={toggleComparison}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              {showComparison ? "Comparando" : "Comparar Períodos"}
            </Button>
          </div>

          {/* Treatment Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Tratamentos</label>
            <Select
              value={tratamentoIds.length > 0 ? tratamentoIds[0] : "all"}
              onValueChange={(value) => {
                onFilterChange({
                  startDate,
                  endDate,
                  compareStartDate,
                  compareEndDate,
                  tratamentoIds: value === "all" ? [] : [value],
                  origemIds,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tratamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tratamentos</SelectItem>
                {tratamentos.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origin Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Origens</label>
            <Select
              value={origemIds.length > 0 ? origemIds[0] : "all"}
              onValueChange={(value) => {
                onFilterChange({
                  startDate,
                  endDate,
                  compareStartDate,
                  compareEndDate,
                  tratamentoIds,
                  origemIds: value === "all" ? [] : [value],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                {origens.map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showComparison && compareStartDate && compareEndDate && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <strong>Comparando:</strong> {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")} 
            <span className="mx-2">vs</span>
            {format(compareStartDate, "dd/MM/yyyy")} a {format(compareEndDate, "dd/MM/yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
