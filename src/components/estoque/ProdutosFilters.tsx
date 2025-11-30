import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProdutosFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  categoria: string;
  setCategoria: (value: string) => void;
  fornecedorId: string;
  setFornecedorId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  somenteEstoqueCritico: boolean;
  setSomenteEstoqueCritico: (value: boolean) => void;
  categorias: string[];
  fornecedores: Array<{ id: string; nome: string }>;
}

export const ProdutosFilters = ({
  search,
  setSearch,
  categoria,
  setCategoria,
  fornecedorId,
  setFornecedorId,
  status,
  setStatus,
  somenteEstoqueCritico,
  setSomenteEstoqueCritico,
  categorias,
  fornecedores,
}: ProdutosFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Input
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <Select value={categoria} onValueChange={setCategoria}>
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas</SelectItem>
          {categorias.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={fornecedorId} onValueChange={setFornecedorId}>
        <SelectTrigger>
          <SelectValue placeholder="Fornecedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {fornecedores.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="critico"
          checked={somenteEstoqueCritico}
          onCheckedChange={(checked) => setSomenteEstoqueCritico(checked === true)}
        />
        <Label htmlFor="critico" className="text-sm cursor-pointer">
          Estoque Crítico
        </Label>
      </div>
    </div>
  );
};
