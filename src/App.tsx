import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
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
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
