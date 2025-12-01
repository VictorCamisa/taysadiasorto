import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { LogIn, UserPlus } from "lucide-react";
const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa")
});
const signupSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
  confirmPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  username: z.string().trim().min(3, "Nome de usuário deve ter no mínimo 3 caracteres").max(50, "Nome muito longo").optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});
const Auth = () => {
  const {
    user,
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: ""
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setIsLoadingLogin(true);
    try {
      const validatedData = loginSchema.parse(loginData);
      const {
        error
      } = await signIn(validatedData.email, validatedData.password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro ao entrar",
            description: "E-mail ou senha incorretos",
            variant: "destructive"
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "E-mail não confirmado",
            description: "Por favor, confirme seu e-mail antes de fazer login",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao entrar",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setLoginErrors(newErrors);
      }
    } finally {
      setIsLoadingLogin(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    setIsLoadingSignup(true);
    try {
      const validatedData = signupSchema.parse(signupData);
      const {
        error
      } = await signUp(validatedData.email, validatedData.password, validatedData.username);
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Erro ao cadastrar",
            description: "Este e-mail já está cadastrado",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao cadastrar",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar o cadastro"
        });
        setSignupData({
          email: "",
          password: "",
          confirmPassword: "",
          username: ""
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setSignupErrors(newErrors);
      }
    } finally {
      setIsLoadingSignup(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo/Brand area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-signature text-foreground mb-2">
            Dra. Taysa Dias
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão Financeira Inteligente
          </p>
        </div>

        {/* Auth Card */}
        <Card className="backdrop-blur-xl bg-card/80 border border-border/50 shadow-2xl">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              {/* Minimalist Tab Selector */}
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/30 p-1 h-12">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                      E-mail
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        loginErrors.email ? "border-destructive" : ""
                      }`}
                    />
                    {loginErrors.email && (
                      <p className="text-xs text-destructive mt-1">{loginErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-foreground">
                      Senha
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        loginErrors.password ? "border-destructive" : ""
                      }`}
                    />
                    {loginErrors.password && (
                      <p className="text-xs text-destructive mt-1">{loginErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 mt-6 font-medium text-base shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoadingLogin}
                  >
                    {isLoadingLogin ? (
                      "Entrando..."
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="space-y-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                      E-mail
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        signupErrors.email ? "border-destructive" : ""
                      }`}
                    />
                    {signupErrors.email && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-medium text-foreground">
                      Nome de Usuário (Opcional)
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="seu_usuario"
                      value={signupData.username}
                      onChange={(e) =>
                        setSignupData({ ...signupData, username: e.target.value })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        signupErrors.username ? "border-destructive" : ""
                      }`}
                    />
                    {signupErrors.username && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                      Senha
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        signupErrors.password ? "border-destructive" : ""
                      }`}
                    />
                    {signupErrors.password && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`h-12 bg-background border-border/50 focus:border-primary transition-colors ${
                        signupErrors.confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                    {signupErrors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        {signupErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 mt-6 font-medium text-base shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoadingSignup}
                  >
                    {isLoadingSignup ? (
                      "Cadastrando..."
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 Dra. Taysa Dias. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
export default Auth;