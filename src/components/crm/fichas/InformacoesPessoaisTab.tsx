import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil, Phone, Mail, MapPin, Instagram, Briefcase, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

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
    // Novos campos
    rg?: string | null;
    rg_orgao_expedidor?: string | null;
    sexo?: string | null;
    estado_civil?: string | null;
    nacionalidade?: string | null;
    naturalidade?: string | null;
    profissao?: string | null;
    instagram?: string | null;
    contato_emergencia_telefone?: string | null;
    contato_emergencia_parentesco?: string | null;
    endereco_profissional?: string | null;
    indicado_por?: string | null;
    primeiro_atendimento?: string | null;
    responsavel_nome?: string | null;
    responsavel_rg?: string | null;
    responsavel_rg_orgao?: string | null;
    responsavel_cpf?: string | null;
    responsavel_data_nascimento?: string | null;
    responsavel_sexo?: string | null;
    responsavel_estado_civil?: string | null;
    responsavel_nacionalidade?: string | null;
    responsavel_naturalidade?: string | null;
    responsavel_profissao?: string | null;
    responsavel_telefone?: string | null;
    responsavel_email?: string | null;
    responsavel_endereco?: string | null;
    responsavel_cep?: string | null;
    responsavel_parentesco?: string | null;
  };
  onEdit?: () => void;
}

export function InformacoesPessoaisTab({ paciente, onEdit }: InformacoesPessoaisTabProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const calcularIdade = (dataNascimento: string | null | undefined) => {
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
  const hasResponsavel = paciente.responsavel_nome;

  const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
        <p className="text-sm">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Nome Completo</div>
              <p className="text-sm font-medium">{paciente.nome}</p>
            </div>
            <InfoItem label="RG" value={paciente.rg && paciente.rg_orgao_expedidor ? `${paciente.rg} - ${paciente.rg_orgao_expedidor}` : paciente.rg} />
            <InfoItem label="CPF" value={paciente.cpf} />
            {paciente.data_nascimento && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Data de Nascimento</div>
                <p className="text-sm">{formatDate(paciente.data_nascimento)} {idade && `(${idade} anos)`}</p>
              </div>
            )}
            <InfoItem label="Sexo" value={paciente.sexo} />
            <InfoItem label="Estado Civil" value={paciente.estado_civil} />
            <InfoItem label="Nacionalidade" value={paciente.nacionalidade} />
            <InfoItem label="Naturalidade" value={paciente.naturalidade} />
          </div>
        </CardContent>
      </Card>

      {/* Contato e Profissão */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contato & Profissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <InfoItem label="Telefone Celular" value={paciente.telefone} />
            <InfoItem label="E-mail" value={paciente.email} />
            <InfoItem label="Instagram" value={paciente.instagram} />
            <InfoItem label="Profissão" value={paciente.profissao} />
          </div>

          {(paciente.contato_emergencia_telefone || paciente.contato_emergencia_parentesco) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Contato de Emergência" value={paciente.contato_emergencia_telefone} />
                <InfoItem label="Parentesco" value={paciente.contato_emergencia_parentesco} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Endereços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(paciente.endereco || paciente.cidade || paciente.cep) && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Endereço Residencial</div>
                <p className="text-sm">
                  {[
                    paciente.endereco,
                    paciente.cidade && paciente.estado ? `${paciente.cidade}/${paciente.estado}` : paciente.cidade,
                    paciente.cep && `CEP: ${paciente.cep}`
                  ].filter(Boolean).join(" - ")}
                </p>
              </div>
            )}
            <InfoItem label="Endereço Profissional" value={paciente.endereco_profissional} />
          </div>
        </CardContent>
      </Card>

      {/* Indicação e Atendimento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Indicação & Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Indicado por" value={paciente.indicado_por} />
            <InfoItem label="Primeiro Atendimento" value={formatDate(paciente.primeiro_atendimento)} />
            <InfoItem label="Cadastrado em" value={formatDate(paciente.created_at)} />
          </div>
        </CardContent>
      </Card>

      {/* Responsável pelo Tratamento */}
      {hasResponsavel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Responsável pelo Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InfoItem label="Nome" value={paciente.responsavel_nome} />
              <InfoItem label="Parentesco/Relação" value={paciente.responsavel_parentesco} />
              <InfoItem label="RG" value={paciente.responsavel_rg && paciente.responsavel_rg_orgao ? `${paciente.responsavel_rg} - ${paciente.responsavel_rg_orgao}` : paciente.responsavel_rg} />
              <InfoItem label="CPF" value={paciente.responsavel_cpf} />
              {paciente.responsavel_data_nascimento && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Data Nascimento</div>
                  <p className="text-sm">{formatDate(paciente.responsavel_data_nascimento)}</p>
                </div>
              )}
              <InfoItem label="Sexo" value={paciente.responsavel_sexo} />
              <InfoItem label="Estado Civil" value={paciente.responsavel_estado_civil} />
              <InfoItem label="Nacionalidade" value={paciente.responsavel_nacionalidade} />
              <InfoItem label="Naturalidade" value={paciente.responsavel_naturalidade} />
              <InfoItem label="Profissão" value={paciente.responsavel_profissao} />
              <InfoItem label="Telefone" value={paciente.responsavel_telefone} />
              <InfoItem label="E-mail" value={paciente.responsavel_email} />
            </div>
            {(paciente.responsavel_endereco || paciente.responsavel_cep) && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Endereço" value={paciente.responsavel_endereco} />
                  <InfoItem label="CEP" value={paciente.responsavel_cep} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {paciente.observacoes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{paciente.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
