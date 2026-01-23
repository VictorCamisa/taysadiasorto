import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanoTratamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  pacienteNome: string;
  onSuccess?: () => void;
}

interface ItemPlano {
  procedimento: string;
  valor: number;
  formaPagamento: string;
}

export function PlanoTratamentoForm({
  open,
  onOpenChange,
  pacienteId,
  pacienteNome,
  onSuccess,
}: PlanoTratamentoFormProps) {
  const [itens, setItens] = useState<ItemPlano[]>([]);
  const [novoProcedimento, setNovoProcedimento] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novaFormaPagamento, setNovaFormaPagamento] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Buscar tratamentos disponíveis
  const { data: tratamentos } = useQuery({
    queryKey: ["tratamentos-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("id, nome, preco_padrao")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  // Buscar formas de pagamento
  const { data: formasPagamento } = useQuery({
    queryKey: ["formas-pagamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formas_pagamento")
        .select("id, nome")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const adicionarItem = () => {
    if (!novoProcedimento || !novoValor || !novaFormaPagamento) {
      toast.error("Preencha todos os campos");
      return;
    }

    setItens([
      ...itens,
      {
        procedimento: novoProcedimento,
        valor: parseFloat(novoValor),
        formaPagamento: novaFormaPagamento,
      },
    ]);

    // Limpar campos
    setNovoProcedimento("");
    setNovoValor("");
    setNovaFormaPagamento("");
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const gerarPDF = async () => {
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um procedimento");
      return;
    }

    setIsLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });

      // Header - Logo/Nome da clínica
      doc.setFont("times", "italic");
      doc.setFontSize(24);
      doc.text("Dra. Taysa Dias", pageWidth / 2, 30, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("HARMONIZAÇÃO OROFACIAL", pageWidth / 2, 36, { align: "center" });

      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PLANO DE TRATAMENTO", pageWidth / 2, 50, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(60, 52, pageWidth - 60, 52);

      // Nome do paciente
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("NOME DO PACIENTE:", 20, 65);
      doc.setFont("helvetica", "normal");
      doc.text(pacienteNome, 70, 65);

      // Tabela de procedimentos
      const startY = 80;
      const cellPadding = 3;
      const colWidths = [80, 35, 55];
      const rowHeight = 10;

      // Header da tabela
      doc.setFillColor(240, 240, 240);
      doc.rect(20, startY, colWidths[0], rowHeight, "FD");
      doc.rect(20 + colWidths[0], startY, colWidths[1], rowHeight, "FD");
      doc.rect(20 + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Procedimento", 20 + cellPadding, startY + 7);
      doc.text("Valor", 20 + colWidths[0] + cellPadding, startY + 7);
      doc.text("Forma de Pagamento", 20 + colWidths[0] + colWidths[1] + cellPadding, startY + 7);

      // Linhas da tabela
      doc.setFont("helvetica", "normal");
      itens.forEach((item, index) => {
        const y = startY + rowHeight + (index * rowHeight);
        
        doc.rect(20, y, colWidths[0], rowHeight);
        doc.rect(20 + colWidths[0], y, colWidths[1], rowHeight);
        doc.rect(20 + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight);

        doc.text(item.procedimento.substring(0, 35), 20 + cellPadding, y + 7);
        doc.text(formatCurrency(item.valor), 20 + colWidths[0] + cellPadding, y + 7);
        doc.text(item.formaPagamento.substring(0, 25), 20 + colWidths[0] + colWidths[1] + cellPadding, y + 7);
      });

      // Linha vazia para total
      const totalY = startY + rowHeight + (itens.length * rowHeight);
      doc.setFont("helvetica", "bold");
      doc.rect(20, totalY, colWidths[0], rowHeight);
      doc.rect(20 + colWidths[0], totalY, colWidths[1], rowHeight);
      doc.rect(20 + colWidths[0] + colWidths[1], totalY, colWidths[2], rowHeight);
      doc.text("TOTAL", 20 + cellPadding, totalY + 7);
      doc.text(formatCurrency(valorTotal), 20 + colWidths[0] + cellPadding, totalY + 7);

      // Declaração
      const declaracaoY = totalY + 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const declaracao = "Declaro, que após ter sido devidamente esclarecido sobre os propósitos, riscos, custos e alternativas de tratamento, conforme acima apresentados, aceito e autorizo a execução do tratamento, comprometendo-me a cumprir as orientações do profissional assistente e arcar com os custos estipulados no orçamento apresentado.";
      
      const splitDeclaracao = doc.splitTextToSize(declaracao, pageWidth - 40);
      doc.text(splitDeclaracao, 20, declaracaoY);

      // Data
      doc.text(`___/___/______`, pageWidth / 2, declaracaoY + 30, { align: "center" });

      // Assinatura
      doc.setLineWidth(0.3);
      doc.line(40, declaracaoY + 55, pageWidth - 40, declaracaoY + 55);
      doc.setFont("helvetica", "bold");
      doc.text("ASSINATURA DO(A) PACIENTE OU SEU REPRESENTANTE LEGAL", pageWidth / 2, declaracaoY + 62, { align: "center" });

      // Gerar blob do PDF
      const pdfBlob = doc.output("blob");
      const fileName = `plano-tratamento-${pacienteId}-${Date.now()}.pdf`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("planos-tratamento")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("planos-tratamento")
        .getPublicUrl(fileName);

      // Salvar no banco
      const { error: dbError } = await supabase
        .from("planos_tratamento")
        .insert([{
          paciente_id: pacienteId,
          itens: JSON.stringify(itens),
          valor_total: valorTotal,
          pdf_url: urlData.publicUrl,
        }]);

      if (dbError) throw dbError;

      toast.success("Plano de tratamento gerado com sucesso!");
      
      // Abrir PDF em nova aba
      window.open(urlData.publicUrl, "_blank");

      // Limpar e fechar
      setItens([]);
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      toast.error("Erro ao gerar plano de tratamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Novo Plano de Tratamento
          </DialogTitle>
          <DialogDescription>
            Crie um plano de tratamento para {pacienteNome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulário para adicionar item */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="md:col-span-2">
              <Label>Procedimento</Label>
              <Select value={novoProcedimento} onValueChange={(value) => {
                setNovoProcedimento(value);
                // Auto-preencher valor se existir
                const tratamento = tratamentos?.find(t => t.nome === value);
                if (tratamento?.preco_padrao) {
                  setNovoValor(tratamento.preco_padrao.toString());
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {tratamentos?.map((t) => (
                    <SelectItem key={t.id} value={t.nome}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
              />
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={novaFormaPagamento} onValueChange={setNovaFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento?.map((fp) => (
                    <SelectItem key={fp.id} value={fp.nome}>
                      {fp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <Button type="button" onClick={adicionarItem} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Tabela de itens */}
          {itens.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.procedimento}</TableCell>
                      <TableCell>{formatCurrency(item.valor)}</TableCell>
                      <TableCell>{item.formaPagamento}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(valorTotal)}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {itens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum procedimento adicionado. Adicione pelo menos um procedimento acima.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={gerarPDF} disabled={isLoading || itens.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
