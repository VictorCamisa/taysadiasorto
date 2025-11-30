import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Tratamentos = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tratamentos</h1>
          <p className="text-muted-foreground">Gerencie os tratamentos e suas margens</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Tratamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Preço Venda</TableHead>
                <TableHead className="text-right">Margem Bruta</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum tratamento cadastrado
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tratamentos;
