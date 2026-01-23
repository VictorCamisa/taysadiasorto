import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  showFilter?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onFilter,
  showFilter = false,
  className,
  autoFocus = false
}: MobileSearchBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 h-11 rounded-xl",
            "bg-muted/50 border-transparent",
            "focus:bg-background focus:border-border",
            value && "pr-10"
          )}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      {showFilter && onFilter && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilter}
          className="h-11 w-11 rounded-xl shrink-0 border-transparent bg-muted/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
