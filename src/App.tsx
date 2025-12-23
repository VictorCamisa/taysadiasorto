import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";

// Home / Landing
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

// Módulos Placeholder
import CRMPlaceholder from "./pages/crm/CRMPlaceholder";
import Pacientes from "./pages/crm/Pacientes";
import FichaPaciente from "./pages/crm/FichaPaciente";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import BIPlaceholder from "./pages/bi/BIPlaceholder";

// Global
import AssistenteIA from "./pages/AssistenteIA";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Home / Landing SGCTD */}
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
              
              {/* Módulo CRM */}
              <Route path="/crm" element={<CRMPlaceholder />} />
              <Route path="/crm/pacientes" element={<Pacientes />} />
              <Route path="/crm/pacientes/:id" element={<FichaPaciente />} />
              
              {/* Módulo Administrativo (Placeholder) */}
              <Route path="/admin" element={<AdminPlaceholder />} />
              <Route path="/admin/*" element={<AdminPlaceholder />} />
              
              {/* Módulo BI (Placeholder) */}
              <Route path="/bi" element={<BIPlaceholder />} />
              <Route path="/bi/*" element={<BIPlaceholder />} />
              
              {/* Global */}
              <Route path="/assistente-ia" element={<AssistenteIA />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
