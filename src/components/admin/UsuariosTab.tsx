import { useState } from "react";
import { Users, Shield, Mail, Phone, Edit, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminData, ROLE_LABELS, AppRole, Profile } from "./hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

export function UsuariosTab() {
  const {
    profiles,
    userRoles,
    loadingProfiles,
    loadingRoles,
    updateProfile,
    addUserRole,
    removeUserRole,
  } = useAdminData();

  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<AppRole | "">("");

  const getUserRoles = (userId: string) => {
    return userRoles.filter((r) => r.user_id === userId);
  };

  const handleUpdateProfile = () => {
    if (!editingProfile) return;
    updateProfile.mutate(editingProfile);
    setEditingProfile(null);
  };

  const handleAddRole = () => {
    if (!selectedUserId || !newRole) return;
    addUserRole.mutate({ user_id: selectedUserId, role: newRole as AppRole });
    setNewRole("");
  };

  if (loadingProfiles || loadingRoles) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{profiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">
                  {profiles.filter((p) => p.ativo).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {userRoles.filter((r) => r.role === "admin").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Médicos</p>
                <p className="text-2xl font-bold">
                  {userRoles.filter((r) => r.role === "medico").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {profile.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {profile.telefone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{profile.cargo || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getUserRoles(profile.id).map((role) => (
                        <Badge
                          key={role.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            if (confirm("Remover este papel?")) {
                              removeUserRole.mutate(role.id);
                            }
                          }}
                        >
                          {ROLE_LABELS[role.role]}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setSelectedUserId(profile.id)}
                      >
                        + Papel
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.ativo ? "default" : "secondary"}>
                      {profile.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProfile(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para adicionar papel */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Papel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Papel</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRole} disabled={!newRole}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editingProfile.nome}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={editingProfile.telefone || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, telefone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={editingProfile.cargo || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, cargo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Especialidade</Label>
                <Input
                  value={editingProfile.especialidade || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, especialidade: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>CRM</Label>
                <Input
                  value={editingProfile.crm || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, crm: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingProfile.ativo}
                  onCheckedChange={(checked) =>
                    setEditingProfile({ ...editingProfile, ativo: checked })
                  }
                />
                <Label>Usuário ativo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProfile}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
