import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Eye, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

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

  // Fetch PDF as blob when URL is selected
  useEffect(() => {
    if (!selectedPdfUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    const fetchPdf = async () => {
      setLoadingPdf(true);
      try {
        const response = await fetch(selectedPdfUrl);
        if (!response.ok) throw new Error("Erro ao carregar PDF");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (error) {
        console.error("Erro ao carregar PDF:", error);
        toast.error("Erro ao carregar o PDF");
        setSelectedPdfUrl(null);
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchPdf();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [selectedPdfUrl]);

  const handleCloseModal = () => {
    setSelectedPdfUrl(null);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  };

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
    <>
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
                        onClick={() => setSelectedPdfUrl(plano.pdf_url)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
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

      {/* Modal de visualização do PDF */}
      <Dialog open={!!selectedPdfUrl} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plano de Tratamento
              </DialogTitle>
              <div className="flex items-center gap-2 mr-6">
                {blobUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = "plano-tratamento.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 p-4 min-h-0">
            {loadingPdf ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : blobUrl ? (
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full rounded-lg border"
              >
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-lg">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Seu navegador não suporta visualização de PDF inline.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = blobUrl!;
                      link.download = "plano-tratamento.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar PDF
                  </Button>
                </div>
              </object>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
