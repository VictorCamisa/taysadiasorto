import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, DollarSign, TrendingUp, Package } from "lucide-react";

const Relatorios = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análises e relatórios detalhados</p>
        </div>
      </div>

      <Tabs defaultValue="receitas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="margens">Margens</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Relatório de Receitas
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Relatório detalhado de todas as receitas do período selecionado, 
                incluindo receitas por tratamento, origem e forma de pagamento.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">• Receita total por período</div>
                <div className="text-sm text-muted-foreground">• Receita por tratamento</div>
                <div className="text-sm text-muted-foreground">• Receita por origem</div>
                <div className="text-sm text-muted-foreground">• Formas de pagamento utilizadas</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório de Despesas
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Análise completa de todas as despesas, organizadas por categoria 
                sintética e analítica, incluindo contas pagas e a pagar.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">• Despesas por categoria</div>
                <div className="text-sm text-muted-foreground">• Despesas por fornecedor</div>
                <div className="text-sm text-muted-foreground">• Contas pagas vs. a pagar</div>
                <div className="text-sm text-muted-foreground">• Análise de vencimentos</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margens" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatório de Margens
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Análise de rentabilidade dos tratamentos, incluindo margem bruta, 
                margem de contribuição e custo por procedimento.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">• Margem bruta por tratamento</div>
                <div className="text-sm text-muted-foreground">• Margem de contribuição</div>
                <div className="text-sm text-muted-foreground">• Custo vs. Preço de venda</div>
                <div className="text-sm text-muted-foreground">• Tratamentos mais rentáveis</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Relatório de Estoque
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visão completa do estoque, incluindo produtos em estoque, 
                movimentações, produtos críticos e histórico de compras.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">• Produtos em estoque</div>
                <div className="text-sm text-muted-foreground">• Produtos abaixo do mínimo</div>
                <div className="text-sm text-muted-foreground">• Histórico de compras</div>
                <div className="text-sm text-muted-foreground">• Custo médio por produto</div>
                <div className="text-sm text-muted-foreground">• Validade e lotes</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Fluxo de Caixa
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Análise do fluxo de caixa por período, mostrando entradas, 
                saídas e saldo disponível em cada conta financeira.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">• Entradas por período</div>
                <div className="text-sm text-muted-foreground">• Saídas por período</div>
                <div className="text-sm text-muted-foreground">• Saldo por conta</div>
                <div className="text-sm text-muted-foreground">• Projeção de caixa</div>
                <div className="text-sm text-muted-foreground">• Transferências entre contas</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
