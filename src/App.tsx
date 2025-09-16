import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { TallyProvider } from "@/contexts/TallyContext";

// Pages
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import CompanyPage from "@/pages/CompanyPage";
import DivisionPage from "@/pages/DivisionPage";
import WorkspaceListPage from "@/pages/WorkspaceListPage";
import WorkspacePage from "@/pages/WorkspacePage";
import NotFound from "@/pages/NotFound";

// Workspace modules
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceDrive } from "@/components/workspace/WorkspaceDrive";
import { WorkspaceTasks } from "@/components/workspace/WorkspaceTasks";

// Enhanced Tally Components
import SalesVoucherCreateEnhanced from "@/pages/tally/transactions/SalesVoucherCreateEnhanced";
import GroupsPageEnhanced from "@/pages/tally/masters/GroupsPageEnhanced";
import LedgersPage from "@/pages/tally/masters/LedgersPage"; // Already migrated
import StockItemsPageEnhanced from "@/pages/tally/masters/StockItemsPageEnhanced";
import GodownsPageEnhanced from "@/pages/tally/masters/GodownsPageEnhanced";
import CostCentersPageEnhanced from "@/pages/tally/masters/CostCentersPageEnhanced";
import VoucherTypesPageEnhanced from "@/pages/tally/masters/VoucherTypesPageEnhanced";
import EmployeesPageEnhanced from "@/pages/tally/masters/EmployeesPageEnhanced";
import UOMPageEnhanced from "@/pages/tally/masters/UOMPageEnhanced";
import PayheadsPageEnhanced from "@/pages/tally/masters/PayheadsPageEnhanced";
import AccountingPageEnhanced from "@/pages/tally/transactions/AccountingPageEnhanced";
import InventoryPageEnhanced from "@/pages/tally/transactions/InventoryPageEnhanced";
import StatisticsPageEnhanced from "@/pages/tally/display/StatisticsPageEnhanced";
import FinancialReportsEnhanced from "@/pages/tally/reports/FinancialReportsEnhanced";
import TallySyncPageEnhanced from "@/pages/tally/transactions/TallySyncPageEnhanced";
import VoucherManagementEnhanced from "@/pages/tally/transactions/VoucherManagementEnhanced";

// Enhanced Business Intelligence Components
import { BusinessIntelligenceDashboard } from "@/components/tally/BusinessIntelligenceDashboard";
import { MonthlyAnalysisDashboard } from "@/components/tally/MonthlyAnalysisDashboard";
import { EntityRelationshipExplorer } from "@/components/tally/EntityRelationshipExplorer";

// Legacy components for backward compatibility
import CostCategoriesPage from "@/pages/tally/masters/CostCategoriesPage";
import NonAccountingPage from "@/pages/tally/transactions/NonAccountingPage";
import DayBookPage from "@/pages/tally/display/DayBookPage";
import ReportsPage from "@/pages/tally/display/ReportsPage";
import ConfigurationPage from "@/pages/tally/utilities/ConfigurationPage";
import TestApiPage from "@/pages/tally/TestApiPage";
import DataManagementPage from "@/pages/tally/data/DataManagementPage";
import TallySyncLogs from "@/pages/tally/utilities/TallySyncLogs";
import SyncJobsManagement from "@/pages/tally/utilities/SyncJobsManagement";
import { VoucherViewsPage } from "@/pages/tally/utilities/VoucherViewsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TallyProvider>
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
              
              {/* Backward compatibility route for division */}
              <Route path="/division/:divisionId" element={
                <AuthGuard>
                  <MainLayout>
                    <DivisionPage />
                  </MainLayout>
                </AuthGuard>
              } />
              
              <Route path="/workspaces" element={
                <AuthGuard>
                  <MainLayout>
                    <WorkspaceListPage />
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
              
              {/* Tally routes - Legacy paths for backward compatibility */}
              <Route path="/tally/masters/groups" element={
                <AuthGuard>
                  <MainLayout>
                    <GroupsPageEnhanced />
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
                    <StockItemsPageEnhanced />
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
               
               <Route path="/tally/masters/employees" element={
                 <AuthGuard>
                   <MainLayout>
                     <EmployeesPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/tally/masters/uom" element={
                 <AuthGuard>
                   <MainLayout>
                     <UOMPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/tally/masters/cost-categories" element={
                 <AuthGuard>
                   <MainLayout>
                     <CostCategoriesPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/tally/masters/payheads" element={
                 <AuthGuard>
                   <MainLayout>
                     <PayheadsPage />
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
              
              <Route path="/tally/transactions/sales/create" element={
                <AuthGuard>
                  <MainLayout>
                    <SalesVoucherCreate />
                  </MainLayout>
                </AuthGuard>
                } />
                
                {/* Redirect old sync path to new utilities location */}
                <Route path="/tally/transactions/sync" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncLogs />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/tally/display/day-book" element={
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
              
                <Route path="/tally/utilities/sync" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncPageEnhanced />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/tally/utilities/sync-jobs" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncLogs />
                    </MainLayout>
                  </AuthGuard>
                } />
               
               {/* Division-aware Tally routes */}
               <Route path="/company/:companyId/division/:divisionId/tally/masters/groups" element={
                 <AuthGuard>
                   <MainLayout>
                     <GroupsPageEnhanced />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/ledgers" element={
                 <AuthGuard>
                   <MainLayout>
                     <LedgersPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/stock-items" element={
                 <AuthGuard>
                   <MainLayout>
                     <StockItemsPageEnhanced />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/godowns" element={
                 <AuthGuard>
                   <MainLayout>
                     <GodownsPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/cost-centers" element={
                 <AuthGuard>
                   <MainLayout>
                     <CostCentersPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/cost-categories" element={
                 <AuthGuard>
                   <MainLayout>
                     <CostCategoriesPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/voucher-types" element={
                 <AuthGuard>
                   <MainLayout>
                     <VoucherTypesPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/employees" element={
                 <AuthGuard>
                   <MainLayout>
                     <EmployeesPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/uom" element={
                 <AuthGuard>
                   <MainLayout>
                     <UOMPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/masters/payheads" element={
                 <AuthGuard>
                   <MainLayout>
                     <PayheadsPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
                <Route path="/company/:companyId/division/:divisionId/tally/transactions/voucher-management" element={
                  <AuthGuard>
                    <MainLayout>
                      <VoucherManagementEnhanced />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/company/:companyId/division/:divisionId/tally/transactions/accounting" element={
                  <AuthGuard>
                    <MainLayout>
                      <AccountingPage />
                    </MainLayout>
                  </AuthGuard>
                } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/transactions/sales/create" element={
                 <AuthGuard>
                   <MainLayout>
                     <SalesVoucherCreate />
                   </MainLayout>
                 </AuthGuard>
                } />
                
                {/* Redirect old sync path to new utilities location */}
                <Route path="/company/:companyId/division/:divisionId/tally/transactions/sync" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncLogs />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/company/:companyId/division/:divisionId/tally/transactions/inventory" element={
                 <AuthGuard>
                   <MainLayout>
                     <InventoryPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/transactions/non-accounting" element={
                 <AuthGuard>
                   <MainLayout>
                     <NonAccountingPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/display/statistics" element={
                 <AuthGuard>
                   <MainLayout>
                     <StatisticsPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/display/day-book" element={
                 <AuthGuard>
                   <MainLayout>
                     <DayBookPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/display/reports" element={
                 <AuthGuard>
                   <MainLayout>
                     <ReportsPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/company/:companyId/division/:divisionId/tally/display/financial-statements" element={
                 <AuthGuard>
                   <MainLayout>
                     <FinancialStatementsPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
                <Route path="/company/:companyId/division/:divisionId/tally/utilities/sync" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncPageEnhanced />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/company/:companyId/division/:divisionId/tally/utilities/sync-jobs" element={
                  <AuthGuard>
                    <MainLayout>
                      <TallySyncLogs />
                    </MainLayout>
                  </AuthGuard>
                } />
                
                <Route path="/company/:companyId/division/:divisionId/tally/utilities/voucher-views" element={
                  <AuthGuard>
                    <MainLayout>
                      <VoucherViewsPage />
                    </MainLayout>
                  </AuthGuard>
                } />
               
               <Route path="/tally/test-api" element={
                 <AuthGuard>
                   <MainLayout>
                     <TestApiPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               
               <Route path="/tally/data/management" element={
                 <AuthGuard>
                   <MainLayout>
                     <DataManagementPage />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="/tally/analytics/dashboard" element={
                 <AuthGuard>
                   <MainLayout>
                     <BusinessIntelligenceDashboard companyId="629f49fb-983e-4141-8c48-e1423b39e921" divisionId="37f3cc0c-58ad-4baf-b309-360116ffc3cd" />
                   </MainLayout>
                 </AuthGuard>
               } />
               
               <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </TallyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;