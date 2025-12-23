import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DREMensalData {
  mes: string;
  mesLabel: string;
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custoMaterial: number;
  custosVariaveis: number;
  custoTotal: number;
  lucroBruto: number;
  margemBruta: number;
  despesasOperacionais: number;
  despesasOpexDetalhe: Map<string, number>;
  resultadoOperacional: number;
  margemOperacional: number;
  despesasFinanceiras: number;
  resultadoAntesIR: number;
  impostoLucro: number;
  lucroLiquido: number;
  margemLiquida: number;
}

export interface DREGerencialData {
  meses: DREMensalData[];
  totais: DREMensalData;
}

export const useDREGerencial = (anoBase?: number) => {
  const ano = anoBase || new Date().getFullYear();

  return useQuery({
    queryKey: ["dre-gerencial", ano],
    queryFn: async (): Promise<DREGerencialData> => {
      const mesesData: DREMensalData[] = [];

      // Buscar todos os dados de uma só vez para eficiência
      const startDate = new Date(ano, 0, 1);
      const endDate = new Date(ano, 11, 31);

      const { data: lancamentos, error } = await supabase
        .from("td_fluxo_de_caixa")
        .select(`
          *,
          categorias(nome_sintetico, natureza_dre)
        `)
        .gte("data_lancamento", format(startDate, "yyyy-MM-dd"))
        .lte("data_lancamento", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      // Processar cada mês
      for (let i = 0; i < 12; i++) {
        const mesDate = new Date(ano, i);
        const mesStart = startOfMonth(mesDate);
        const mesEnd = endOfMonth(mesDate);
        const mesKey = format(mesDate, "yyyy-MM");
        const mesLabel = format(mesDate, "MMM", { locale: ptBR }).toUpperCase();

        const lancamentosMes = lancamentos?.filter(l => {
          const dataLanc = new Date(l.data_lancamento);
          return dataLanc >= mesStart && dataLanc <= mesEnd;
        }) || [];

        // Calcular receita bruta
        const receitaBruta = lancamentosMes
          .filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0);

        // Calcular deduções (ISS, PIS, COFINS)
        const deducoes = lancamentosMes
          .filter(l => l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "deducao")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0);

        const receitaLiquida = receitaBruta - deducoes;

        // Custo material (da ficha técnica)
        const custoMaterial = lancamentosMes
          .filter(l => l.tipo === "receita")
          .reduce((sum, l) => sum + Number(l.custo_material || 0), 0);

        // Custos variáveis (natureza_dre = 'custo')
        const custosVariaveis = lancamentosMes
          .filter(l => l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "custo")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0);

        const custoTotal = custoMaterial + custosVariaveis;
        const lucroBruto = receitaLiquida - custoTotal;
        const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

        // Despesas operacionais (OPEX) com detalhe por categoria
        const despesasOpexDetalhe = new Map<string, number>();
        lancamentosMes
          .filter(l => l.tipo === "despesa" && 
            ((l.categorias as any)?.natureza_dre === "opex" || !(l.categorias as any)?.natureza_dre))
          .forEach(l => {
            const cat = (l.categorias as any)?.nome_sintetico || "Outros";
            const atual = despesasOpexDetalhe.get(cat) || 0;
            despesasOpexDetalhe.set(cat, atual + Number(l.valor || 0));
          });

        const despesasOperacionais = Array.from(despesasOpexDetalhe.values())
          .reduce((sum, v) => sum + v, 0);

        const resultadoOperacional = lucroBruto - despesasOperacionais;
        const margemOperacional = receitaLiquida > 0 ? (resultadoOperacional / receitaLiquida) * 100 : 0;

        // Despesas financeiras
        const despesasFinanceiras = lancamentosMes
          .filter(l => l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "financeiro")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0);

        const resultadoAntesIR = resultadoOperacional - despesasFinanceiras;

        // Impostos sobre lucro (IRPJ, CSLL)
        const impostoLucro = lancamentosMes
          .filter(l => l.tipo === "despesa" && (l.categorias as any)?.natureza_dre === "imposto_lucro")
          .reduce((sum, l) => sum + Number(l.valor || 0), 0);

        const lucroLiquido = resultadoAntesIR - impostoLucro;
        const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

        mesesData.push({
          mes: mesKey,
          mesLabel,
          receitaBruta,
          deducoes,
          receitaLiquida,
          custoMaterial,
          custosVariaveis,
          custoTotal,
          lucroBruto,
          margemBruta,
          despesasOperacionais,
          despesasOpexDetalhe,
          resultadoOperacional,
          margemOperacional,
          despesasFinanceiras,
          resultadoAntesIR,
          impostoLucro,
          lucroLiquido,
          margemLiquida,
        });
      }

      // Calcular totais anuais
      const totais: DREMensalData = {
        mes: `${ano}`,
        mesLabel: "TOTAL",
        receitaBruta: mesesData.reduce((s, m) => s + m.receitaBruta, 0),
        deducoes: mesesData.reduce((s, m) => s + m.deducoes, 0),
        receitaLiquida: mesesData.reduce((s, m) => s + m.receitaLiquida, 0),
        custoMaterial: mesesData.reduce((s, m) => s + m.custoMaterial, 0),
        custosVariaveis: mesesData.reduce((s, m) => s + m.custosVariaveis, 0),
        custoTotal: mesesData.reduce((s, m) => s + m.custoTotal, 0),
        lucroBruto: mesesData.reduce((s, m) => s + m.lucroBruto, 0),
        margemBruta: 0,
        despesasOperacionais: mesesData.reduce((s, m) => s + m.despesasOperacionais, 0),
        despesasOpexDetalhe: new Map(),
        resultadoOperacional: mesesData.reduce((s, m) => s + m.resultadoOperacional, 0),
        margemOperacional: 0,
        despesasFinanceiras: mesesData.reduce((s, m) => s + m.despesasFinanceiras, 0),
        resultadoAntesIR: mesesData.reduce((s, m) => s + m.resultadoAntesIR, 0),
        impostoLucro: mesesData.reduce((s, m) => s + m.impostoLucro, 0),
        lucroLiquido: mesesData.reduce((s, m) => s + m.lucroLiquido, 0),
        margemLiquida: 0,
      };

      // Calcular margens totais
      totais.margemBruta = totais.receitaLiquida > 0 
        ? (totais.lucroBruto / totais.receitaLiquida) * 100 : 0;
      totais.margemOperacional = totais.receitaLiquida > 0 
        ? (totais.resultadoOperacional / totais.receitaLiquida) * 100 : 0;
      totais.margemLiquida = totais.receitaLiquida > 0 
        ? (totais.lucroLiquido / totais.receitaLiquida) * 100 : 0;

      // Consolidar despesas por categoria para totais
      mesesData.forEach(m => {
        m.despesasOpexDetalhe.forEach((valor, cat) => {
          const atual = totais.despesasOpexDetalhe.get(cat) || 0;
          totais.despesasOpexDetalhe.set(cat, atual + valor);
        });
      });

      return { meses: mesesData, totais };
    },
  });
};
