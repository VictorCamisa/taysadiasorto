import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Loader2, User, FileText, MapPin, Phone, Users, Heart } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = "https://ynstyufdfrctktsgwxwv.supabase.co";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro"];
const ESTADO_CIVIL_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];

interface FormData {
  nome: string;
  telefone: string;
  cpf: string;
  rg: string;
  rg_orgao_expedidor: string;
  email: string;
  data_nascimento: string;
  sexo: string;
  estado_civil: string;
  nacionalidade: string;
  naturalidade: string;
  profissao: string;
  instagram: string;
  contato_emergencia_telefone: string;
  contato_emergencia_parentesco: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  endereco_profissional: string;
  indicado_por: string;
  responsavel_nome: string;
  responsavel_rg: string;
  responsavel_rg_orgao: string;
  responsavel_cpf: string;
  responsavel_data_nascimento: string;
  responsavel_sexo: string;
  responsavel_estado_civil: string;
  responsavel_nacionalidade: string;
  responsavel_naturalidade: string;
  responsavel_profissao: string;
  responsavel_telefone: string;
  responsavel_email: string;
  responsavel_endereco: string;
  responsavel_cep: string;
  responsavel_parentesco: string;
}

const STEPS = [
  { id: "identificacao", title: "Identificação", icon: User, fields: ["nome", "telefone", "email", "instagram"] },
  { id: "documentos", title: "Documentos", icon: FileText, fields: ["cpf", "rg", "rg_orgao_expedidor", "data_nascimento"] },
  { id: "pessoais", title: "Dados Pessoais", icon: Heart, fields: ["sexo", "estado_civil", "nacionalidade", "naturalidade", "profissao"] },
  { id: "endereco", title: "Endereço", icon: MapPin, fields: ["endereco", "cidade", "estado", "cep", "endereco_profissional"] },
  { id: "emergencia", title: "Emergência", icon: Phone, fields: ["contato_emergencia_telefone", "contato_emergencia_parentesco", "indicado_por"] },
  { id: "responsavel", title: "Responsável", icon: Users, fields: ["responsavel_nome", "responsavel_parentesco", "responsavel_cpf", "responsavel_telefone"] },
];

export default function FormularioPaciente() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
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
  });

  useEffect(() => {
    if (token) {
      loadPatientData();
    }
  }, [token]);

  const loadPatientData = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/formulario-paciente?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Link inválido");
        return;
      }

      setFormData({
        nome: data.nome || "",
        telefone: data.telefone || "",
        cpf: data.cpf || "",
        rg: data.rg || "",
        rg_orgao_expedidor: data.rg_orgao_expedidor || "",
        email: data.email || "",
        data_nascimento: data.data_nascimento || "",
        sexo: data.sexo || "",
        estado_civil: data.estado_civil || "",
        nacionalidade: data.nacionalidade || "",
        naturalidade: data.naturalidade || "",
        profissao: data.profissao || "",
        instagram: data.instagram || "",
        contato_emergencia_telefone: data.contato_emergencia_telefone || "",
        contato_emergencia_parentesco: data.contato_emergencia_parentesco || "",
        endereco: data.endereco || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        cep: data.cep || "",
        endereco_profissional: data.endereco_profissional || "",
        indicado_por: data.indicado_por || "",
        responsavel_nome: data.responsavel_nome || "",
        responsavel_rg: data.responsavel_rg || "",
        responsavel_rg_orgao: data.responsavel_rg_orgao || "",
        responsavel_cpf: data.responsavel_cpf || "",
        responsavel_data_nascimento: data.responsavel_data_nascimento || "",
        responsavel_sexo: data.responsavel_sexo || "",
        responsavel_estado_civil: data.responsavel_estado_civil || "",
        responsavel_nacionalidade: data.responsavel_nacionalidade || "",
        responsavel_naturalidade: data.responsavel_naturalidade || "",
        responsavel_profissao: data.responsavel_profissao || "",
        responsavel_telefone: data.responsavel_telefone || "",
        responsavel_email: data.responsavel_email || "",
        responsavel_endereco: data.responsavel_endereco || "",
        responsavel_cep: data.responsavel_cep || "",
        responsavel_parentesco: data.responsavel_parentesco || "",
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar formulário");
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === "cpf" || field === "responsavel_cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "telefone" || field === "contato_emergencia_telefone" || field === "responsavel_telefone") {
      formattedValue = formatPhone(value);
    } else if (field === "cep" || field === "responsavel_cep") {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.telefone.trim()) {
      toast.error("Nome e telefone são obrigatórios");
      setCurrentStep(0);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/formulario-paciente?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao salvar");
        return;
      }

      setCompleted(true);
      toast.success("Dados salvos com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😕</span>
            </div>
            <h1 className="text-xl font-bold mb-2">Link Inválido</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-500/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Obrigado!</h1>
            <p className="text-muted-foreground">Suas informações foram salvas com sucesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Etapa {currentStep + 1} de {STEPS.length}</p>
              <h1 className="text-lg font-semibold truncate">{currentStepData.title}</h1>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className="p-4 pb-32">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Step 1: Identificação */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base">Nome completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-base">Telefone celular *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-base">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder="@seuusuario"
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Documentos */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-base">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="rg" className="text-base">RG</Label>
                      <Input
                        id="rg"
                        value={formData.rg}
                        onChange={(e) => handleInputChange("rg", e.target.value)}
                        placeholder="00.000.000-0"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg_orgao" className="text-base">Órgão</Label>
                      <Input
                        id="rg_orgao"
                        value={formData.rg_orgao_expedidor}
                        onChange={(e) => handleInputChange("rg_orgao_expedidor", e.target.value)}
                        placeholder="SSP/SP"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento" className="text-base">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Dados Pessoais */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(v) => handleInputChange("sexo", v)}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEXO_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Estado Civil</Label>
                    <Select value={formData.estado_civil} onValueChange={(v) => handleInputChange("estado_civil", v)}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADO_CIVIL_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="nacionalidade" className="text-base">Nacionalidade</Label>
                      <Input
                        id="nacionalidade"
                        value={formData.nacionalidade}
                        onChange={(e) => handleInputChange("nacionalidade", e.target.value)}
                        placeholder="Brasileira"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="naturalidade" className="text-base">Naturalidade</Label>
                      <Input
                        id="naturalidade"
                        value={formData.naturalidade}
                        onChange={(e) => handleInputChange("naturalidade", e.target.value)}
                        placeholder="São Paulo"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profissao" className="text-base">Profissão</Label>
                    <Input
                      id="profissao"
                      value={formData.profissao}
                      onChange={(e) => handleInputChange("profissao", e.target.value)}
                      placeholder="Sua profissão"
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Endereço */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-base">Endereço residencial</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Rua, número, complemento, bairro"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-base">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange("cidade", e.target.value)}
                        placeholder="Cidade"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base">Estado</Label>
                      <Select value={formData.estado} onValueChange={(v) => handleInputChange("estado", v)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BR.map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="text-base">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco_profissional" className="text-base">Endereço profissional</Label>
                    <Input
                      id="endereco_profissional"
                      value={formData.endereco_profissional}
                      onChange={(e) => handleInputChange("endereco_profissional", e.target.value)}
                      placeholder="Endereço do trabalho (opcional)"
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Contato de Emergência */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contato_emergencia_telefone" className="text-base">Telefone de emergência</Label>
                    <Input
                      id="contato_emergencia_telefone"
                      value={formData.contato_emergencia_telefone}
                      onChange={(e) => handleInputChange("contato_emergencia_telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contato_emergencia_parentesco" className="text-base">Parentesco</Label>
                    <Input
                      id="contato_emergencia_parentesco"
                      value={formData.contato_emergencia_parentesco}
                      onChange={(e) => handleInputChange("contato_emergencia_parentesco", e.target.value)}
                      placeholder="Ex: Mãe, Pai, Cônjuge..."
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indicado_por" className="text-base">Indicado por</Label>
                    <Input
                      id="indicado_por"
                      value={formData.indicado_por}
                      onChange={(e) => handleInputChange("indicado_por", e.target.value)}
                      placeholder="Quem indicou você?"
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Responsável */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center px-4">
                Preencha apenas se houver um responsável pelo tratamento (menor de idade, etc.)
              </p>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel_nome" className="text-base">Nome do responsável</Label>
                    <Input
                      id="responsavel_nome"
                      value={formData.responsavel_nome}
                      onChange={(e) => handleInputChange("responsavel_nome", e.target.value)}
                      placeholder="Nome completo"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel_parentesco" className="text-base">Parentesco/Relação</Label>
                    <Input
                      id="responsavel_parentesco"
                      value={formData.responsavel_parentesco}
                      onChange={(e) => handleInputChange("responsavel_parentesco", e.target.value)}
                      placeholder="Ex: Pai, Mãe, Tutor..."
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel_cpf" className="text-base">CPF do responsável</Label>
                    <Input
                      id="responsavel_cpf"
                      value={formData.responsavel_cpf}
                      onChange={(e) => handleInputChange("responsavel_cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel_telefone" className="text-base">Telefone do responsável</Label>
                    <Input
                      id="responsavel_telefone"
                      value={formData.responsavel_telefone}
                      onChange={(e) => handleInputChange("responsavel_telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer fixo com navegação */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 h-12"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar
          </Button>
          <Button
            onClick={nextStep}
            disabled={saving}
            className="flex-1 h-12"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Check className="h-5 w-5 mr-1" />
                Concluir
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
