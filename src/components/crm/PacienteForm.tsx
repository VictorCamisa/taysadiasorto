import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import type { Paciente } from "./hooks/usePacientesData";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro"];
const ESTADO_CIVIL_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];

const pacienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  telefone: z.string().trim().min(1, "Telefone é obrigatório").max(20, "Telefone muito longo"),
  cpf: z.string().trim().max(14, "CPF inválido").optional(),
  rg: z.string().trim().max(20).optional(),
  rg_orgao_expedidor: z.string().trim().max(50).optional(),
  email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  data_nascimento: z.string().optional(),
  sexo: z.string().max(20).optional(),
  estado_civil: z.string().max(30).optional(),
  nacionalidade: z.string().max(50).optional(),
  naturalidade: z.string().max(50).optional(),
  profissao: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  contato_emergencia_telefone: z.string().max(20).optional(),
  contato_emergencia_parentesco: z.string().max(50).optional(),
  endereco: z.string().trim().max(500, "Endereço muito longo").optional(),
  cidade: z.string().trim().max(100, "Cidade muito longa").optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().trim().max(10, "CEP inválido").optional(),
  endereco_profissional: z.string().max(500).optional(),
  indicado_por: z.string().max(255).optional(),
  primeiro_atendimento: z.string().optional(),
  // Responsável pelo tratamento
  responsavel_nome: z.string().max(255).optional(),
  responsavel_rg: z.string().max(20).optional(),
  responsavel_rg_orgao: z.string().max(50).optional(),
  responsavel_cpf: z.string().max(14).optional(),
  responsavel_data_nascimento: z.string().optional(),
  responsavel_sexo: z.string().max(20).optional(),
  responsavel_estado_civil: z.string().max(30).optional(),
  responsavel_nacionalidade: z.string().max(50).optional(),
  responsavel_naturalidade: z.string().max(50).optional(),
  responsavel_profissao: z.string().max(100).optional(),
  responsavel_telefone: z.string().max(20).optional(),
  responsavel_email: z.string().email().max(255).optional().or(z.literal("")),
  responsavel_endereco: z.string().max(500).optional(),
  responsavel_cep: z.string().max(10).optional(),
  responsavel_parentesco: z.string().max(50).optional(),
  observacoes: z.string().trim().max(2000, "Observações muito longas").optional(),
  ativo: z.boolean().default(true),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

interface PacienteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Paciente>) => void;
  paciente: Paciente | null;
}

export function PacienteForm({ open, onClose, onSave, paciente }: PacienteFormProps) {
  const [formData, setFormData] = useState<PacienteFormData>({
    nome: "",
    telefone: "",
    cpf: "",
    rg: "",
    rg_orgao_expedidor: "",
    email: "",
    data_nascimento: "",
    sexo: "",
    estado_civil: "",
    nacionalidade: "",
    naturalidade: "",
    profissao: "",
    instagram: "",
    contato_emergencia_telefone: "",
    contato_emergencia_parentesco: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    endereco_profissional: "",
    indicado_por: "",
    primeiro_atendimento: "",
    responsavel_nome: "",
    responsavel_rg: "",
    responsavel_rg_orgao: "",
    responsavel_cpf: "",
    responsavel_data_nascimento: "",
    responsavel_sexo: "",
    responsavel_estado_civil: "",
    responsavel_nacionalidade: "",
    responsavel_naturalidade: "",
    responsavel_profissao: "",
    responsavel_telefone: "",
    responsavel_email: "",
    responsavel_endereco: "",
    responsavel_cep: "",
    responsavel_parentesco: "",
    observacoes: "",
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || "",
        telefone: paciente.telefone || "",
        cpf: paciente.cpf || "",
        rg: (paciente as any).rg || "",
        rg_orgao_expedidor: (paciente as any).rg_orgao_expedidor || "",
        email: paciente.email || "",
        data_nascimento: paciente.data_nascimento || "",
        sexo: (paciente as any).sexo || "",
        estado_civil: (paciente as any).estado_civil || "",
        nacionalidade: (paciente as any).nacionalidade || "",
        naturalidade: (paciente as any).naturalidade || "",
        profissao: (paciente as any).profissao || "",
        instagram: (paciente as any).instagram || "",
        contato_emergencia_telefone: (paciente as any).contato_emergencia_telefone || "",
        contato_emergencia_parentesco: (paciente as any).contato_emergencia_parentesco || "",
        endereco: paciente.endereco || "",
        cidade: paciente.cidade || "",
        estado: paciente.estado || "",
        cep: paciente.cep || "",
        endereco_profissional: (paciente as any).endereco_profissional || "",
        indicado_por: (paciente as any).indicado_por || "",
        primeiro_atendimento: (paciente as any).primeiro_atendimento || "",
        responsavel_nome: (paciente as any).responsavel_nome || "",
        responsavel_rg: (paciente as any).responsavel_rg || "",
        responsavel_rg_orgao: (paciente as any).responsavel_rg_orgao || "",
        responsavel_cpf: (paciente as any).responsavel_cpf || "",
        responsavel_data_nascimento: (paciente as any).responsavel_data_nascimento || "",
        responsavel_sexo: (paciente as any).responsavel_sexo || "",
        responsavel_estado_civil: (paciente as any).responsavel_estado_civil || "",
        responsavel_nacionalidade: (paciente as any).responsavel_nacionalidade || "",
        responsavel_naturalidade: (paciente as any).responsavel_naturalidade || "",
        responsavel_profissao: (paciente as any).responsavel_profissao || "",
        responsavel_telefone: (paciente as any).responsavel_telefone || "",
        responsavel_email: (paciente as any).responsavel_email || "",
        responsavel_endereco: (paciente as any).responsavel_endereco || "",
        responsavel_cep: (paciente as any).responsavel_cep || "",
        responsavel_parentesco: (paciente as any).responsavel_parentesco || "",
        observacoes: paciente.observacoes || "",
        ativo: paciente.ativo !== false,
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        cpf: "",
        rg: "",
        rg_orgao_expedidor: "",
        email: "",
        data_nascimento: "",
        sexo: "",
        estado_civil: "",
        nacionalidade: "",
        naturalidade: "",
        profissao: "",
        instagram: "",
        contato_emergencia_telefone: "",
        contato_emergencia_parentesco: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        endereco_profissional: "",
        indicado_por: "",
        primeiro_atendimento: "",
        responsavel_nome: "",
        responsavel_rg: "",
        responsavel_rg_orgao: "",
        responsavel_cpf: "",
        responsavel_data_nascimento: "",
        responsavel_sexo: "",
        responsavel_estado_civil: "",
        responsavel_nacionalidade: "",
        responsavel_naturalidade: "",
        responsavel_profissao: "",
        responsavel_telefone: "",
        responsavel_email: "",
        responsavel_endereco: "",
        responsavel_cep: "",
        responsavel_parentesco: "",
        observacoes: "",
        ativo: true,
      });
    }
    setErrors({});
  }, [paciente, open]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 8);
    return numbers.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = pacienteSchema.parse(formData);
      const toNull = (val: string | undefined) => val?.trim() || null;
      
      onSave({
        nome: validatedData.nome,
        telefone: validatedData.telefone || null,
        cpf: toNull(validatedData.cpf),
        rg: toNull(validatedData.rg),
        rg_orgao_expedidor: toNull(validatedData.rg_orgao_expedidor),
        email: toNull(validatedData.email),
        data_nascimento: toNull(validatedData.data_nascimento),
        sexo: toNull(validatedData.sexo),
        estado_civil: toNull(validatedData.estado_civil),
        nacionalidade: toNull(validatedData.nacionalidade),
        naturalidade: toNull(validatedData.naturalidade),
        profissao: toNull(validatedData.profissao),
        instagram: toNull(validatedData.instagram),
        contato_emergencia_telefone: toNull(validatedData.contato_emergencia_telefone),
        contato_emergencia_parentesco: toNull(validatedData.contato_emergencia_parentesco),
        endereco: toNull(validatedData.endereco),
        cidade: toNull(validatedData.cidade),
        estado: toNull(validatedData.estado),
        cep: toNull(validatedData.cep),
        endereco_profissional: toNull(validatedData.endereco_profissional),
        indicado_por: toNull(validatedData.indicado_por),
        primeiro_atendimento: toNull(validatedData.primeiro_atendimento),
        responsavel_nome: toNull(validatedData.responsavel_nome),
        responsavel_rg: toNull(validatedData.responsavel_rg),
        responsavel_rg_orgao: toNull(validatedData.responsavel_rg_orgao),
        responsavel_cpf: toNull(validatedData.responsavel_cpf),
        responsavel_data_nascimento: toNull(validatedData.responsavel_data_nascimento),
        responsavel_sexo: toNull(validatedData.responsavel_sexo),
        responsavel_estado_civil: toNull(validatedData.responsavel_estado_civil),
        responsavel_nacionalidade: toNull(validatedData.responsavel_nacionalidade),
        responsavel_naturalidade: toNull(validatedData.responsavel_naturalidade),
        responsavel_profissao: toNull(validatedData.responsavel_profissao),
        responsavel_telefone: toNull(validatedData.responsavel_telefone),
        responsavel_email: toNull(validatedData.responsavel_email),
        responsavel_endereco: toNull(validatedData.responsavel_endereco),
        responsavel_cep: toNull(validatedData.responsavel_cep),
        responsavel_parentesco: toNull(validatedData.responsavel_parentesco),
        observacoes: toNull(validatedData.observacoes),
        ativo: validatedData.ativo,
      } as Partial<Paciente>);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{paciente ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="endereco">Endereços</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              {/* Dados Obrigatórios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Celular *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? "border-destructive" : ""}
                  />
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
                </div>
              </div>

              {/* Documentos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    maxLength={20}
                    placeholder="00.000.000-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg_orgao_expedidor">Órgão Expedidor</Label>
                  <Input
                    id="rg_orgao_expedidor"
                    value={formData.rg_orgao_expedidor}
                    onChange={(e) => setFormData({ ...formData, rg_orgao_expedidor: e.target.value })}
                    placeholder="SSP/SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    maxLength={14}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  />
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXO_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select
                    value={formData.estado_civil}
                    onValueChange={(value) => setFormData({ ...formData, estado_civil: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_CIVIL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidade">Nacionalidade</Label>
                  <Input
                    id="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                    placeholder="Brasileira"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <Input
                    id="naturalidade"
                    value={formData.naturalidade}
                    onChange={(e) => setFormData({ ...formData, naturalidade: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              {/* Contato e Profissão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    placeholder="Profissão"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_telefone">Contato de Emergência</Label>
                  <Input
                    id="contato_emergencia_telefone"
                    value={formData.contato_emergencia_telefone}
                    onChange={(e) => setFormData({ ...formData, contato_emergencia_telefone: formatPhone(e.target.value) })}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_parentesco">Parentesco</Label>
                  <Input
                    id="contato_emergencia_parentesco"
                    value={formData.contato_emergencia_parentesco}
                    onChange={(e) => setFormData({ ...formData, contato_emergencia_parentesco: e.target.value })}
                    placeholder="Mãe, Pai, Cônjuge..."
                  />
                </div>
              </div>

              {/* Indicação e Primeiro Atendimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="indicado_por">Indicado por</Label>
                  <Input
                    id="indicado_por"
                    value={formData.indicado_por}
                    onChange={(e) => setFormData({ ...formData, indicado_por: e.target.value })}
                    placeholder="Nome de quem indicou"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primeiro_atendimento">Primeiro Atendimento em</Label>
                  <Input
                    id="primeiro_atendimento"
                    type="date"
                    value={formData.primeiro_atendimento}
                    onChange={(e) => setFormData({ ...formData, primeiro_atendimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Paciente ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 mt-4">
              {/* Endereço Residencial */}
              <h3 className="text-sm font-medium text-muted-foreground">Endereço Residencial</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, complemento, bairro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BR.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                    maxLength={9}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Endereço Profissional */}
              <h3 className="text-sm font-medium text-muted-foreground mt-6">Endereço Profissional</h3>
              <div className="space-y-2">
                <Label htmlFor="endereco_profissional">Endereço Profissional</Label>
                <Input
                  id="endereco_profissional"
                  value={formData.endereco_profissional}
                  onChange={(e) => setFormData({ ...formData, endereco_profissional: e.target.value })}
                  placeholder="Rua, número, complemento, bairro, cidade/UF"
                />
              </div>

              {/* Observações */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações gerais sobre o paciente"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Preencha os dados do responsável pelo tratamento (para menores de idade ou quando necessário).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_nome">Nome do Responsável</Label>
                  <Input
                    id="responsavel_nome"
                    value={formData.responsavel_nome}
                    onChange={(e) => setFormData({ ...formData, responsavel_nome: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_parentesco">Parentesco/Relação</Label>
                  <Input
                    id="responsavel_parentesco"
                    value={formData.responsavel_parentesco}
                    onChange={(e) => setFormData({ ...formData, responsavel_parentesco: e.target.value })}
                    placeholder="Pai, Mãe, Tutor..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_rg">RG</Label>
                  <Input
                    id="responsavel_rg"
                    value={formData.responsavel_rg}
                    onChange={(e) => setFormData({ ...formData, responsavel_rg: e.target.value })}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_rg_orgao">Órgão Expedidor</Label>
                  <Input
                    id="responsavel_rg_orgao"
                    value={formData.responsavel_rg_orgao}
                    onChange={(e) => setFormData({ ...formData, responsavel_rg_orgao: e.target.value })}
                    placeholder="SSP/SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_cpf">CPF</Label>
                  <Input
                    id="responsavel_cpf"
                    value={formData.responsavel_cpf}
                    onChange={(e) => setFormData({ ...formData, responsavel_cpf: formatCPF(e.target.value) })}
                    maxLength={14}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_data_nascimento">Data Nascimento</Label>
                  <Input
                    id="responsavel_data_nascimento"
                    type="date"
                    value={formData.responsavel_data_nascimento}
                    onChange={(e) => setFormData({ ...formData, responsavel_data_nascimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_sexo">Sexo</Label>
                  <Select
                    value={formData.responsavel_sexo}
                    onValueChange={(value) => setFormData({ ...formData, responsavel_sexo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXO_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_estado_civil">Estado Civil</Label>
                  <Select
                    value={formData.responsavel_estado_civil}
                    onValueChange={(value) => setFormData({ ...formData, responsavel_estado_civil: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_CIVIL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_nacionalidade">Nacionalidade</Label>
                  <Input
                    id="responsavel_nacionalidade"
                    value={formData.responsavel_nacionalidade}
                    onChange={(e) => setFormData({ ...formData, responsavel_nacionalidade: e.target.value })}
                    placeholder="Brasileira"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_naturalidade">Naturalidade</Label>
                  <Input
                    id="responsavel_naturalidade"
                    value={formData.responsavel_naturalidade}
                    onChange={(e) => setFormData({ ...formData, responsavel_naturalidade: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_profissao">Profissão</Label>
                  <Input
                    id="responsavel_profissao"
                    value={formData.responsavel_profissao}
                    onChange={(e) => setFormData({ ...formData, responsavel_profissao: e.target.value })}
                    placeholder="Profissão"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_telefone">Telefone</Label>
                  <Input
                    id="responsavel_telefone"
                    value={formData.responsavel_telefone}
                    onChange={(e) => setFormData({ ...formData, responsavel_telefone: formatPhone(e.target.value) })}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_email">E-mail</Label>
                  <Input
                    id="responsavel_email"
                    type="email"
                    value={formData.responsavel_email}
                    onChange={(e) => setFormData({ ...formData, responsavel_email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_endereco">Endereço</Label>
                  <Input
                    id="responsavel_endereco"
                    value={formData.responsavel_endereco}
                    onChange={(e) => setFormData({ ...formData, responsavel_endereco: e.target.value })}
                    placeholder="Rua, número, complemento, bairro, cidade/UF"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_cep">CEP</Label>
                  <Input
                    id="responsavel_cep"
                    value={formData.responsavel_cep}
                    onChange={(e) => setFormData({ ...formData, responsavel_cep: formatCEP(e.target.value) })}
                    maxLength={9}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
