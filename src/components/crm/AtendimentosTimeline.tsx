import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ClipboardList, 
  Stethoscope, 
  Calendar,
  ChevronRight,
  Image
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Anamnese, Prontuario } from "@/components/crm/hooks/useFichaPacienteData";

type TimelineItem = {
  id: string;
  type: "anamnese" | "prontuario";
  date: string;
  data: Anamnese | Prontuario;
};

interface AtendimentosTimelineProps {
  anamneses: Anamnese[];
  prontuarios: Prontuario[];
  onSelectAnamnese?: (anamnese: Anamnese) => void;
  onSelectProntuario?: (prontuario: Prontuario) => void;
}

export function AtendimentosTimeline({
  anamneses,
  prontuarios,
  onSelectAnamnese,
  onSelectProntuario,
}: AtendimentosTimelineProps) {
  // Combine and sort by date (most recent first)
  const timelineItems: TimelineItem[] = [
    ...anamneses.map((a) => ({
      id: a.id,
      type: "anamnese" as const,
      date: a.data_anamnese,
      data: a,
    })),
    ...prontuarios.map((p) => ({
      id: p.id,
      type: "prontuario" as const,
      date: p.data_atendimento,
      data: p,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  if (timelineItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum registro encontrado
        </CardContent>
      </Card>
    );
  }

  // Group items by month/year
  const groupedItems = timelineItems.reduce((acc, item) => {
    const monthYear = format(new Date(item.date), "MMMM yyyy", { locale: ptBR });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([monthYear, items]) => (
        <div key={monthYear} className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {monthYear}
            </h3>
          </div>
          
          <div className="relative pl-6 border-l-2 border-border space-y-4">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-background ${
                    item.type === "anamnese"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                  }`}
                />

                {/* Card */}
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    if (item.type === "anamnese" && onSelectAnamnese) {
                      onSelectAnamnese(item.data as Anamnese);
                    } else if (item.type === "prontuario" && onSelectProntuario) {
                      onSelectProntuario(item.data as Prontuario);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${
                            item.type === "anamnese"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          }`}
                        >
                          {item.type === "anamnese" ? (
                            <ClipboardList className="h-5 w-5" />
                          ) : (
                            <Stethoscope className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={
                                item.type === "anamnese"
                                  ? "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                                  : "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                              }
                            >
                              {item.type === "anamnese" ? "Anamnese" : "Prontuário"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.date)}
                            </span>
                          </div>

                          {item.type === "anamnese" ? (
                            <AnamnesePreview anamnese={item.data as Anamnese} />
                          ) : (
                            <ProntuarioPreview prontuario={item.data as Prontuario} />
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnamnesePreview({ anamnese }: { anamnese: Anamnese }) {
  return (
    <div className="space-y-1">
      {anamnese.queixa_principal && (
        <p className="text-sm font-medium">{anamnese.queixa_principal}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {anamnese.alergias && (
          <span className="text-destructive">Alergias: {anamnese.alergias}</span>
        )}
        {anamnese.medicamentos_uso && (
          <span>Medicamentos: {anamnese.medicamentos_uso}</span>
        )}
      </div>
    </div>
  );
}

function ProntuarioPreview({ prontuario }: { prontuario: Prontuario }) {
  const hasPhotos =
    (prontuario.fotos_antes && prontuario.fotos_antes.length > 0) ||
    (prontuario.fotos_depois && prontuario.fotos_depois.length > 0);

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        {prontuario.tratamento?.nome || "Atendimento geral"}
      </p>
      {prontuario.evolucao && (
        <p className="text-xs text-muted-foreground line-clamp-2">{prontuario.evolucao}</p>
      )}
      {hasPhotos && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Image className="h-3 w-3" />
          <span>Contém fotos</span>
        </div>
      )}
    </div>
  );
}
