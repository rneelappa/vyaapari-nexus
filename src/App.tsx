import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import CompanyPage from "@/pages/CompanyPage";
import DivisionPage from "@/pages/DivisionPage";
import WorkspacePage from "@/pages/WorkspacePage";
import NotFound from "@/pages/NotFound";

// Workspace modules
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceDrive } from "@/components/workspace/WorkspaceDrive";
import { WorkspaceTasks } from "@/components/workspace/WorkspaceTasks";

// Tally pages
import GroupsPage from "@/pages/tally/masters/GroupsPage";
import LedgersPage from "@/pages/tally/masters/LedgersPage";
import StockItemsPage from "@/pages/tally/masters/StockItemsPage";
import GodownsPage from "@/pages/tally/masters/GodownsPage";
import CostCentersPage from "@/pages/tally/masters/CostCentersPage";
import VoucherTypesPage from "@/pages/tally/masters/VoucherTypesPage";
import AccountingPage from "@/pages/tally/transactions/AccountingPage";
import NonAccountingPage from "@/pages/tally/transactions/NonAccountingPage";
import InventoryPage from "@/pages/tally/transactions/InventoryPage";
import DayBookPage from "@/pages/tally/display/DayBookPage";
import StatisticsPage from "@/pages/tally/display/StatisticsPage";
import FinancialStatementsPage from "@/pages/tally/display/FinancialStatementsPage";
import ReportsPage from "@/pages/tally/display/ReportsPage";
import ConfigurationPage from "@/pages/tally/utilities/ConfigurationPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <AuthGuard>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/company/:companyId" element={
                <AuthGuard>
                  <MainLayout>
                    <CompanyPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/company/:companyId/division/:divisionId" element={
                <AuthGuard>
                  <MainLayout>
                    <DivisionPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/workspace/:workspaceId" element={
                <AuthGuard>
                  <MainLayout>
                    <WorkspacePage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/workspace/:workspaceId/chat" element={
                <AuthGuard>
                  <MainLayout>
                    <WorkspaceChat />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/workspace/:workspaceId/drive" element={
                <AuthGuard>
                  <MainLayout>
                    <WorkspaceDrive />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/workspace/:workspaceId/tasks" element={
                <AuthGuard>
                  <MainLayout>
                    <WorkspaceTasks />
                  </MainLayout>
                </AuthGuard>
              } />
              
              {/* Tally routes */}
              <Route path="/tally/masters/groups" element={
                <AuthGuard>
                  <MainLayout>
                    <GroupsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/masters/ledgers" element={
                <AuthGuard>
                  <MainLayout>
                    <LedgersPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/masters/stock-items" element={
                <AuthGuard>
                  <MainLayout>
                    <StockItemsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/masters/godowns" element={
                <AuthGuard>
                  <MainLayout>
                    <GodownsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/masters/cost-centers" element={
                <AuthGuard>
                  <MainLayout>
                    <CostCentersPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/masters/voucher-types" element={
                <AuthGuard>
                  <MainLayout>
                    <VoucherTypesPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/transactions/accounting" element={
                <AuthGuard>
                  <MainLayout>
                    <AccountingPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/transactions/non-accounting" element={
                <AuthGuard>
                  <MainLayout>
                    <NonAccountingPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/transactions/inventory" element={
                <AuthGuard>
                  <MainLayout>
                    <InventoryPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/display/daybook" element={
                <AuthGuard>
                  <MainLayout>
                    <DayBookPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/display/statistics" element={
                <AuthGuard>
                  <MainLayout>
                    <StatisticsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/display/financial-statements" element={
                <AuthGuard>
                  <MainLayout>
                    <FinancialStatementsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/display/reports" element={
                <AuthGuard>
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/tally/utilities/configuration" element={
                <AuthGuard>
                  <MainLayout>
                    <ConfigurationPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;