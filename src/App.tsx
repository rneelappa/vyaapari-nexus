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

// Tally Masters Pages
import GroupsPage from "./pages/tally/masters/GroupsPage";
import LedgersPage from "./pages/tally/masters/LedgersPage";
import StockItemsPage from "./pages/tally/masters/StockItemsPage";
import GodownsPage from "./pages/tally/masters/GodownsPage";
import CostCentersPage from "./pages/tally/masters/CostCentersPage";
import VoucherTypesPage from "./pages/tally/masters/VoucherTypesPage";

// Tally Transactions Pages
import AccountingPage from "./pages/tally/transactions/AccountingPage";
import NonAccountingPage from "./pages/tally/transactions/NonAccountingPage";
import InventoryPage from "./pages/tally/transactions/InventoryPage";

// Tally Display Pages
import DayBookPage from "./pages/tally/display/DayBookPage";
import StatisticsPage from "./pages/tally/display/StatisticsPage";
import FinancialStatementsPage from "./pages/tally/display/FinancialStatementsPage";
import ReportsPage from "./pages/tally/display/ReportsPage";

// Tally Utilities Pages
import ConfigurationPage from "./pages/tally/utilities/ConfigurationPage";

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
            
            {/* Tally Masters Routes */}
            <Route path="/tally/masters/groups" element={<GroupsPage />} />
            <Route path="/tally/masters/ledgers" element={<LedgersPage />} />
            <Route path="/tally/masters/stock-items" element={<StockItemsPage />} />
            <Route path="/tally/masters/godowns" element={<GodownsPage />} />
            <Route path="/tally/masters/cost-centers" element={<CostCentersPage />} />
            <Route path="/tally/masters/voucher-types" element={<VoucherTypesPage />} />
            
            {/* Tally Transactions Routes */}
            <Route path="/tally/transactions/accounting" element={<AccountingPage />} />
            <Route path="/tally/transactions/non-accounting" element={<NonAccountingPage />} />
            <Route path="/tally/transactions/inventory" element={<InventoryPage />} />
            
            {/* Tally Display Routes */}
            <Route path="/tally/display/daybook" element={<DayBookPage />} />
            <Route path="/tally/display/statistics" element={<StatisticsPage />} />
            <Route path="/tally/display/financial-statements" element={<FinancialStatementsPage />} />
            <Route path="/tally/display/reports" element={<ReportsPage />} />
            
            {/* Tally Utilities Routes */}
            <Route path="/tally/utilities/configuration" element={<ConfigurationPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
