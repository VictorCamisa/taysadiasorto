import { Input } from "@/components/ui/input";
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

export const TratamentosFilters = ({ filters, onFilterChange }: TratamentosFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-1">
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
    </div>
  );
};