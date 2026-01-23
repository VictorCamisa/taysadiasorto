import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanosTratamentoListProps {
  pacienteId: string;
  pacienteNome: string;
  onNewPlano: () => void;
}

interface PlanoTratamento {
  id: string;
  created_at: string;
  itens: Array<{
    procedimento: string;
    valor: number;
    formaPagamento: string;
  }>;
  valor_total: number;
  pdf_url: string | null;
  status: string;
}

export function PlanosTratamentoList({ 
  pacienteId,
  pacienteNome,
  onNewPlano 
}: PlanosTratamentoListProps) {
  const { data: planos, isLoading } = useQuery({
    queryKey: ["planos-tratamento", pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos_tratamento")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Parse itens from JSON string if needed
      return (data || []).map(plano => ({
        ...plano,
        itens: typeof plano.itens === 'string' ? JSON.parse(plano.itens) : (plano.itens || [])
      })) as PlanoTratamento[];
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Planos de Tratamento
        </CardTitle>
        <Button size="sm" onClick={onNewPlano}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Plano
        </Button>
      </CardHeader>
      <CardContent>
        {planos && planos.length > 0 ? (
          <div className="space-y-3">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {formatDate(plano.created_at)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {Array.isArray(plano.itens) ? plano.itens.length : 0} procedimento(s)
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(plano.itens) && plano.itens.slice(0, 2).map((item, i) => (
                      <span key={i}>
                        {item.procedimento}
                        {i < Math.min(plano.itens.length - 1, 1) ? ", " : ""}
                      </span>
                    ))}
                    {Array.isArray(plano.itens) && plano.itens.length > 2 && ` +${plano.itens.length - 2} mais`}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">
                    {formatCurrency(plano.valor_total || 0)}
                  </span>
                  {plano.pdf_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(plano.pdf_url!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum plano de tratamento</p>
            <p className="text-xs mt-1">Clique em "Novo Plano" para criar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
