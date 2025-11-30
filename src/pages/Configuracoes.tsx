import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Configure categorias, contas, formas de pagamento e origens</p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="formas">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="origens">Origens</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Categorias Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria Sintética</TableHead>
                    <TableHead>Categoria Analítica</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma categoria cadastrada
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contas Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Saldo Inicial</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma conta cadastrada
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formas" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Forma
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Permite Parcelamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma forma de pagamento cadastrada
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="origens" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Origem
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Origens de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhuma origem cadastrada
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
