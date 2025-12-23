import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface OrcamentoDREData {
  receitaOrcada: number;
  despesasOrcadasPorCategoria: Map<string, number>;
  receitasOrcadasPorTratamento: Map<string, number>;
  totalDespesasOrcadas: number;
  hasOrcamento: boolean;
}

export const useOrcamentoDRE = (selectedMonth: string) => {
  return useQuery({
    queryKey: ["orcamento_dre", selectedMonth],
    queryFn: async (): Promise<OrcamentoDREData> => {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      // Buscar orçamento ativo que cubra o período
      const { data: orcamento } = await supabase
        .from("orcamentos")
        .select("id")
        .eq("status", "ativo")
        .lte("periodo_inicio", format(startDate, "yyyy-MM-dd"))
        .gte("periodo_fim", format(endDate, "yyyy-MM-dd"))
        .maybeSingle();

      if (!orcamento) {
        return {
          receitaOrcada: 0,
          despesasOrcadasPorCategoria: new Map(),
          receitasOrcadasPorTratamento: new Map(),
          totalDespesasOrcadas: 0,
          hasOrcamento: false,
        };
      }

      // Buscar itens do orçamento
      const { data: itens } = await supabase
        .from("orcamento_itens")
        .select(`
          *,
          categoria:categorias(id, nome_sintetico, natureza_dre),
          tratamento:tratamentos(id, nome)
        `)
        .eq("orcamento_id", orcamento.id);

      const despesasOrcadasPorCategoria = new Map<string, number>();
      const receitasOrcadasPorTratamento = new Map<string, number>();
      let receitaOrcada = 0;
      let totalDespesasOrcadas = 0;

      // Calcular proporção mensal do orçamento (simplificado: dividir por meses do período)
      const { data: orcamentoCompleto } = await supabase
        .from("orcamentos")
        .select("periodo_inicio, periodo_fim")
        .eq("id", orcamento.id)
        .single();

      let proporcaoMensal = 1;
      if (orcamentoCompleto) {
        const inicio = new Date(orcamentoCompleto.periodo_inicio);
        const fim = new Date(orcamentoCompleto.periodo_fim);
        const mesesOrcamento = Math.max(1, Math.ceil(
          (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ));
        proporcaoMensal = 1 / mesesOrcamento;
      }

      itens?.forEach((item: any) => {
        const valorMensal = (item.valor_orcado || 0) * proporcaoMensal;
        
        if (item.tipo === "receita" && item.tratamento) {
          receitasOrcadasPorTratamento.set(item.tratamento.nome, valorMensal);
          receitaOrcada += valorMensal;
        } else if (item.tipo === "despesa" && item.categoria) {
          const key = item.categoria.nome_sintetico;
          const atual = despesasOrcadasPorCategoria.get(key) || 0;
          despesasOrcadasPorCategoria.set(key, atual + valorMensal);
          totalDespesasOrcadas += valorMensal;
        }
      });

      return {
        receitaOrcada,
        despesasOrcadasPorCategoria,
        receitasOrcadasPorTratamento,
        totalDespesasOrcadas,
        hasOrcamento: true,
      };
    },
  });
};

// Função helper para calcular desvio
export const calcularDesvio = (realizado: number, orcado: number): { valor: number; percentual: number; status: "positivo" | "negativo" | "neutro" } => {
  if (orcado === 0) {
    return { valor: 0, percentual: 0, status: "neutro" };
  }
  
  const valor = realizado - orcado;
  const percentual = (valor / orcado) * 100;
  
  // Para receitas: acima do orçado é positivo
  // Para despesas: abaixo do orçado é positivo (será invertido onde necessário)
  const status = percentual > 5 ? "positivo" : percentual < -5 ? "negativo" : "neutro";
  
  return { valor, percentual, status };
};
