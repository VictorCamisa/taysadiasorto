import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InformacoesPessoaisTabProps {
  paciente: {
    id: string;
    nome: string;
    cpf: string | null;
    data_nascimento: string | null;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    observacoes: string | null;
    created_at: string | null;
  };
  onEdit?: () => void;
}

export function InformacoesPessoaisTab({ paciente, onEdit }: InformacoesPessoaisTabProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(paciente.data_nascimento);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Pessoais
        </CardTitle>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Nome Completo</div>
              <p className="text-sm font-medium">{paciente.nome}</p>
            </div>
            {paciente.cpf && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">CPF</div>
                <p className="text-sm">{paciente.cpf}</p>
              </div>
            )}
            {paciente.data_nascimento && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Data de Nascimento</div>
                <p className="text-sm">{formatDate(paciente.data_nascimento)} {idade && `(${idade} anos)`}</p>
              </div>
            )}
            {paciente.telefone && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Telefone</div>
                <p className="text-sm">{paciente.telefone}</p>
              </div>
            )}
            {paciente.email && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">E-mail</div>
                <p className="text-sm">{paciente.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {paciente.endereco && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Endereço</div>
                <p className="text-sm">{paciente.endereco}</p>
              </div>
            )}
            {(paciente.cidade || paciente.estado) && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Cidade/Estado</div>
                <p className="text-sm">
                  {paciente.cidade && paciente.estado
                    ? `${paciente.cidade}/${paciente.estado}`
                    : paciente.cidade || paciente.estado}
                </p>
              </div>
            )}
            {paciente.cep && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">CEP</div>
                <p className="text-sm">{paciente.cep}</p>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Cadastrado em</div>
              <p className="text-sm">{formatDate(paciente.created_at)}</p>
            </div>
          </div>
        </div>

        {paciente.observacoes && (
          <div className="mt-6 pt-6 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-1">Observações</div>
            <p className="text-sm whitespace-pre-wrap">{paciente.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
