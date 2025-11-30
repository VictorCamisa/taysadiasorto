import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FornecedoresFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export const FornecedoresFilters = ({
  search,
  setSearch,
  status,
  setStatus,
}: FornecedoresFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        placeholder="Buscar por nome ou CNPJ/CPF..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="ativo">Ativo</SelectItem>
          <SelectItem value="inativo">Inativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
