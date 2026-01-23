import { Building2, Users, Lock, FileText, History, ChevronRight, Home, CheckSquare } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuariosTab } from "@/components/admin/UsuariosTab";
import { LgpdTab } from "@/components/admin/LgpdTab";
import { DocumentosTab } from "@/components/admin/DocumentosTab";
import { AuditoriaTab } from "@/components/admin/AuditoriaTab";
import { ChecklistsTab } from "@/components/admin/ChecklistsTab";
import { AdminRoute } from "@/components/admin/AdminRoute";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function AdminContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "usuarios";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Administrativo
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Módulo Administrativo"
        description="Gestão de usuários, permissões, LGPD e documentos legais"
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Checklists</span>
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

        <TabsContent value="checklists">
          <ChecklistsTab />
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

export default function Admin() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}
