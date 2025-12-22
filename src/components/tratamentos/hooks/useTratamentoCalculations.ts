import { useCallback } from "react";

export interface FichaTecnicaItem {
  produto_id: string;
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
}

export interface TratamentoCalculations {
  custo_total: number;
  lucro_sessao: number;
  margem_bruta: number;
  margem_contribuicao: number;
}

export const useTratamentoCalculations = () => {
  const calcularCustos = useCallback((
    preco: number,
    custo_base: number,
    fichaTecnicaItems: FichaTecnicaItem[]
  ): TratamentoCalculations => {
    const custoFichaTecnica = fichaTecnicaItems.reduce(
      (sum, item) => sum + Number(item.custo_total || 0),
      0
    );

    const custo_total = Number(custo_base || 0) + custoFichaTecnica;
    const margem_bruta = Number(preco || 0) - custo_total;
    const lucro_sessao = margem_bruta;
    const margem_contribuicao = preco > 0 ? (margem_bruta / preco) * 100 : 0;

    return {
      custo_total,
      lucro_sessao,
      margem_bruta,
      margem_contribuicao,
    };
  }, []);

  const getMargemColor = useCallback((margem: number) => {
    if (margem >= 50) return "text-green-600";
    if (margem >= 30) return "text-yellow-600";
    return "text-red-600";
  }, []);

  return {
    calcularCustos,
    getMargemColor,
  };
};
