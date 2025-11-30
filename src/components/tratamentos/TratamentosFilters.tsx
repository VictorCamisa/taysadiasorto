import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface TratamentosFiltersProps {
  filters: {
    search: string;
    grupo: string;
    status: string;
  };
  grupos: string[];
  onFilterChange: (key: string, value: string) => void;
}

export const TratamentosFilters = ({ filters, grupos, onFilterChange }: TratamentosFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tratamento..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Grupo</Label>
        <Select value={filters.grupo} onValueChange={(value) => onFilterChange("grupo", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {grupos.map((grupo) => (
              <SelectItem key={grupo} value={grupo}>
                {grupo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
