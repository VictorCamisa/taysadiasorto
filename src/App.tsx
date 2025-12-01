import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Auth from "./pages/Auth";
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
import AssistenteIA from "./pages/AssistenteIA";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/diario-caixa" element={<DiarioCaixa />} />
                      <Route path="/lancamentos" element={<Lancamentos />} />
                      <Route path="/contas-pagar" element={<ContasPagar />} />
                      <Route path="/tratamentos" element={<Tratamentos />} />
                      <Route path="/estoque" element={<Estoque />} />
                      <Route path="/fornecedores" element={<Fornecedores />} />
                      <Route path="/dre" element={<DRE />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="/relatorios-estoque" element={<RelatoriosEstoque />} />
                      <Route path="/assistente-ia" element={<AssistenteIA />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
