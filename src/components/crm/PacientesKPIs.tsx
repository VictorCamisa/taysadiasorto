import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

interface PacientesKPIsProps {
  totalPacientes: number;
  pacientesAtivos: number;
  pacientesInativos: number;
  novosEsteMes: number;
}

export function PacientesKPIs({
  totalPacientes,
  pacientesAtivos,
  pacientesInativos,
  novosEsteMes,
}: PacientesKPIsProps) {
  const kpis = [
    {
      label: "Total de Pacientes",
      value: totalPacientes,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pacientes Ativos",
      value: pacientesAtivos,
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Pacientes Inativos",
      value: pacientesInativos,
      icon: UserX,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
    {
      label: "Novos Este Mês",
      value: novosEsteMes,
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
