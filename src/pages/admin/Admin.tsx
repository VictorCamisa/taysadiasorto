import { Building2, Users, Lock, FileText, History, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuariosTab } from "@/components/admin/UsuariosTab";
import { LgpdTab } from "@/components/admin/LgpdTab";
import { DocumentosTab } from "@/components/admin/DocumentosTab";
import { AuditoriaTab } from "@/components/admin/AuditoriaTab";

export default function Admin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Módulo Administrativo"
        description="Gestão de usuários, permissões, LGPD e documentos legais"
      />

      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="lgpd" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">LGPD</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <UsuariosTab />
        </TabsContent>

        <TabsContent value="lgpd">
          <LgpdTab />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosTab />
        </TabsContent>

        <TabsContent value="auditoria">
          <AuditoriaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
