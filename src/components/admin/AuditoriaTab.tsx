import { History, User, Database, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminData, AuditLog } from "./hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ACAO_COLORS: Record<string, string> = {
  INSERT: "bg-green-500/10 text-green-700",
  UPDATE: "bg-blue-500/10 text-blue-700",
  DELETE: "bg-red-500/10 text-red-700",
};

export function AuditoriaTab() {
  const { auditLogs, loadingAuditLogs, profiles } = useAdminData();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getUserName = (userId: string | null) => {
    if (!userId) return "Sistema";
    const profile = profiles.find((p) => p.id === userId);
    return profile?.nome || "Usuário desconhecido";
  };

  if (loadingAuditLogs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const logsByAction = {
    INSERT: auditLogs.filter((l) => l.acao === "INSERT").length,
    UPDATE: auditLogs.filter((l) => l.acao === "UPDATE").length,
    DELETE: auditLogs.filter((l) => l.acao === "DELETE").length,
  };

  const uniqueTables = [...new Set(auditLogs.map((l) => l.tabela))];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inserções</p>
                <p className="text-2xl font-bold">{logsByAction.INSERT}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atualizações</p>
                <p className="text-2xl font-bold">{logsByAction.UPDATE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Database className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exclusões</p>
                <p className="text-2xl font-bold">{logsByAction.DELETE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas mais afetadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tabelas Monitoradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueTables.map((table) => (
              <Badge key={table} variant="secondary">
                {table} ({auditLogs.filter((l) => l.tabela === table).length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>
            Últimas 100 operações registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {getUserName(log.user_id)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={ACAO_COLORS[log.acao] || "bg-muted"}
                      variant="secondary"
                    >
                      {log.acao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {log.tabela}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {log.ip_address || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      disabled={!log.dados_anteriores && !log.dados_novos}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para ver detalhes */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ação</p>
                  <Badge
                    className={ACAO_COLORS[selectedLog.acao] || "bg-muted"}
                    variant="secondary"
                  >
                    {selectedLog.acao}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Tabela</p>
                  <code className="text-sm">{selectedLog.tabela}</code>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuário</p>
                  <p>{getUserName(selectedLog.user_id)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data/Hora</p>
                  <p>
                    {format(new Date(selectedLog.created_at), "dd/MM/yyyy HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {selectedLog.dados_anteriores && (
                <div>
                  <p className="text-sm font-medium mb-2">Dados Anteriores</p>
                  <ScrollArea className="h-40 rounded-md border p-3 bg-muted/50">
                    <pre className="text-xs">
                      {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedLog.dados_novos && (
                <div>
                  <p className="text-sm font-medium mb-2">Dados Novos</p>
                  <ScrollArea className="h-40 rounded-md border p-3 bg-muted/50">
                    <pre className="text-xs">
                      {JSON.stringify(selectedLog.dados_novos, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
