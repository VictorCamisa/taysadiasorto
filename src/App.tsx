import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth
import Auth from "./pages/Auth";

// Home
import Home from "./pages/Home";

// Módulo Financeiro
import Dashboard from "./pages/Dashboard";
import DiarioCaixa from "./pages/DiarioCaixa";
import Lancamentos from "./pages/Lancamentos";
import ContasPagar from "./pages/ContasPagar";
import Tratamentos from "./pages/Tratamentos";
import Estoque from "./pages/Estoque";
import Fornecedores from "./pages/Fornecedores";
import DRE from "./pages/DRE";
import Relatorios from "./pages/Relatorios";
import RelatoriosEstoque from "./pages/RelatoriosEstoque";
import Orcamento from "./pages/Orcamento";

// Módulo CRM
import Pacientes from "./pages/crm/Pacientes";
import FichaPaciente from "./pages/crm/FichaPaciente";
import Pipeline from "./pages/crm/Pipeline";
import Agendamentos from "./pages/crm/Agendamentos";
import PosVenda from "./pages/crm/PosVenda";
import LeadsPerdidos from "./pages/crm/LeadsPerdidos";

// Módulo Admin
import Admin from "./pages/admin/Admin";
import BusinessIntelligence from "./pages/bi/BusinessIntelligence";

// Global
import AssistenteIA from "./pages/AssistenteIA";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth - página pública */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Rotas protegidas */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* Home */}
                        <Route path="/" element={<Home />} />
                        
                        {/* Módulo Financeiro */}
                        <Route path="/financeiro" element={<Dashboard />} />
                        <Route path="/financeiro/diario-caixa" element={<DiarioCaixa />} />
                        <Route path="/financeiro/lancamentos" element={<Lancamentos />} />
                        <Route path="/financeiro/contas-pagar" element={<ContasPagar />} />
                        <Route path="/financeiro/tratamentos" element={<Tratamentos />} />
                        <Route path="/financeiro/estoque" element={<Estoque />} />
                        <Route path="/financeiro/fornecedores" element={<Fornecedores />} />
                        <Route path="/financeiro/dre" element={<DRE />} />
                        <Route path="/financeiro/orcamento" element={<Orcamento />} />
                        <Route path="/financeiro/relatorios" element={<Relatorios />} />
                        <Route path="/financeiro/relatorios-estoque" element={<RelatoriosEstoque />} />
                        
                        {/* Módulo CRM / Comercial */}
                        <Route path="/crm" element={<Pipeline />} />
                        <Route path="/crm/pipeline" element={<Pipeline />} />
                        <Route path="/crm/agendamentos" element={<Agendamentos />} />
                        <Route path="/crm/pos-venda" element={<PosVenda />} />
                        <Route path="/crm/perdidos" element={<LeadsPerdidos />} />
                        <Route path="/crm/pacientes" element={<Pacientes />} />
                        <Route path="/crm/pacientes/:id" element={<FichaPaciente />} />
                        
                        {/* Módulo Administrativo */}
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/*" element={<Admin />} />
                        
                        {/* Módulo BI */}
                        <Route path="/bi" element={<BusinessIntelligence />} />
                        <Route path="/bi/*" element={<BusinessIntelligence />} />
                        
                        {/* Global */}
                        <Route path="/assistente-ia" element={<AssistenteIA />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        
                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
