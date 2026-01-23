import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogIn, UserPlus, Loader2, Clock, CheckCircle } from "lucide-react";
import logoTaysa from "@/assets/logo-dra-taysa.png";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerNome, setRegisterNome] = useState("");
  const [registerTelefone, setRegisterTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);

  const from = (location.state as { from?: string })?.from || "/financeiro";

  // Redirecionar se já estiver logado
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Sua conta ainda não foi aprovada pelo administrador");
      } else {
        toast.error("Erro ao fazer login: " + error.message);
      }
    } else {
      toast.success("Login realizado com sucesso!");
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se o email já existe
      const { data: emailExists } = await supabase.rpc("check_email_exists", {
        check_email: registerEmail,
      });

      if (emailExists) {
        toast.error("Este email já está cadastrado ou aguardando aprovação");
        setLoading(false);
        return;
      }

      // Criar solicitação de acesso
      const { error } = await supabase.from("solicitacoes_acesso").insert({
        nome: registerNome,
        email: registerEmail,
        senha_hash: registerPassword, // Será usada para criar o usuário quando aprovado
        telefone: registerTelefone || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este email já está cadastrado ou aguardando aprovação");
        } else {
          toast.error("Erro ao enviar solicitação: " + error.message);
        }
      } else {
        setSolicitacaoEnviada(true);
        toast.success("Solicitação enviada com sucesso!");
      }
    } catch (err) {
      toast.error("Erro ao enviar solicitação");
    }

    setLoading(false);
  };

  if (solicitacaoEnviada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Solicitação Enviada!</CardTitle>
            <CardDescription className="text-base">
              Sua solicitação de acesso foi enviada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Aguardando Aprovação</p>
                  <p className="text-sm text-muted-foreground">
                    Um administrador irá revisar sua solicitação e aprovar seu acesso ao sistema.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Você receberá acesso assim que um administrador aprovar sua solicitação.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSolicitacaoEnviada(false);
                setRegisterNome("");
                setRegisterEmail("");
                setRegisterPassword("");
                setRegisterTelefone("");
              }}
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <div className="p-6 border border-border">
                <img 
                  src={logoTaysa} 
                  alt="Dra. Taysa Dias" 
                  className="h-32 w-auto"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Solicitar Acesso
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nome">Nome Completo</Label>
                    <Input
                      id="register-nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={registerNome}
                      onChange={(e) => setRegisterNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-telefone">Telefone (opcional)</Label>
                    <Input
                      id="register-telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={registerTelefone}
                      onChange={(e) => setRegisterTelefone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Solicitar Acesso"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Sua solicitação será analisada por um administrador antes de liberar o acesso.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
