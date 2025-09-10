import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import WorkspacePage from "./pages/WorkspacePage";
import CompanyPage from "./pages/CompanyPage";
import DivisionPage from "./pages/DivisionPage";
import NotFound from "./pages/NotFound";
import TallyMasterPage from "./pages/TallyMasterPage";
import TallyTransactionPage from "./pages/TallyTransactionPage";
import TallyDisplayPage from "./pages/TallyDisplayPage";
import TallyUtilityPage from "./pages/TallyUtilityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/company/:companyId" element={<CompanyPage />} />
            <Route path="/company/:companyId/division/:divisionId" element={<DivisionPage />} />
            <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
            <Route path="/workspace/:workspaceId/:module" element={<WorkspacePage />} />
            {/* Tally Routes */}
            <Route path="/workspace/:workspaceId/masters/:module" element={<TallyMasterPage />} />
            <Route path="/workspace/:workspaceId/transactions/:module" element={<TallyTransactionPage />} />
            <Route path="/workspace/:workspaceId/display/:module" element={<TallyDisplayPage />} />
            <Route path="/workspace/:workspaceId/utilities/:module" element={<TallyUtilityPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
