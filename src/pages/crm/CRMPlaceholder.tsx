import { Users, UserCircle, FileText, ClipboardList, FileCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

const plannedFeatures = [
  {
    title: "Ficha 360° do Paciente",
    description: "Visão completa do histórico, tratamentos, financeiro e comunicações",
    icon: UserCircle,
  },
  {
    title: "Anamnese Digital",
    description: "Formulários personalizáveis para coleta de histórico médico",
    icon: ClipboardList,
  },
  {
    title: "Prontuário Eletrônico",
    description: "Registro seguro de consultas, procedimentos e evolução",
    icon: FileText,
  },
  {
    title: "Contratos e Orçamentos",
    description: "Gestão de contratos, orçamentos e aprovações do paciente",
    icon: FileCheck,
  },
];

export default function CRMPlaceholder() {
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
        title="Módulo CRM"
        description="Gestão de relacionamento com pacientes"
      />

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-2xl bg-primary/10 w-fit mb-4">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Em Desenvolvimento</CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            O módulo CRM está sendo desenvolvido para oferecer uma gestão completa 
            do relacionamento com seus pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              Previsão: Em breve
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {plannedFeatures.map((feature) => (
              <Card key={feature.title} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <feature.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
