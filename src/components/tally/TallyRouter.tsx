import { Routes, Route, useParams } from "react-router-dom";

// Masters
import GroupsPage from "@/pages/tally/masters/GroupsPage";
import LedgersPage from "@/pages/tally/masters/LedgersPage";
import CostCategoriesPage from "@/pages/tally/masters/CostCategoriesPage";
import CostCentersPage from "@/pages/tally/masters/CostCentersPage";
import EmployeesPage from "@/pages/tally/masters/EmployeesPage";
import GodownsPage from "@/pages/tally/masters/GodownsPage";
import PayheadsPage from "@/pages/tally/masters/PayheadsPage";
import StockItemsPage from "@/pages/tally/masters/StockItemsPage";
import UOMPage from "@/pages/tally/masters/UOMPage";
import VoucherTypesPage from "@/pages/tally/masters/VoucherTypesPage";

// Transactions
import AccountingPage from "@/pages/tally/transactions/AccountingPage";
import InventoryPage from "@/pages/tally/transactions/InventoryPage";
import NonAccountingPage from "@/pages/tally/transactions/NonAccountingPage";
import TallySyncPage from "@/pages/tally/transactions/TallySyncPage";
import TallySyncPageEnhanced from "@/pages/tally/transactions/TallySyncPageEnhanced";
import PaymentCreate from "@/pages/tally/transactions/PaymentCreate";
import ContraVoucherCreate from "@/pages/tally/transactions/ContraVoucherCreate";
import SalesVoucherCreate from "@/pages/tally/transactions/SalesVoucherCreate";
import SalesVoucherEdit from "@/pages/tally/transactions/SalesVoucherEdit";
import VoucherManagement from "@/pages/tally/transactions/VoucherManagement";

// Display & Reports
import DayBookPage from "@/pages/tally/display/DayBookPage";
import DayBookVouchersPage from "@/pages/tally/display/DayBookVouchersPage";
import FinancialStatementsPage from "@/pages/tally/display/FinancialStatementsPage";
import ReportsPage from "@/pages/tally/display/ReportsPage";
import StatisticsPage from "@/pages/tally/display/StatisticsPage";
import AnalyticsDashboard from "@/pages/tally/analytics/AnalyticsDashboard";

// Utilities
import ConfigurationPage from "@/pages/tally/utilities/ConfigurationPage";
import { VoucherViewsPage } from "@/pages/tally/utilities/VoucherViewsPage";
import SyncJobsManagement from "@/pages/tally/utilities/SyncJobsManagement";
import TallySyncLogs from "@/pages/tally/utilities/TallySyncLogs";
import { VoucherViewBuilder } from "@/pages/tally/utilities/VoucherViewBuilder";
import { VoucherViewsManager } from "@/pages/tally/utilities/VoucherViewsManager";

// Data Management
import DataManagementPage from "@/pages/tally/data/DataManagementPage";

// Test
import TestApiPage from "@/pages/tally/TestApiPage";

export function TallyRouter() {
  const { companyId, divisionId } = useParams<{
    companyId: string;
    divisionId: string;
  }>();

  return (
    <Routes>
      {/* Masters */}
      <Route path="masters/groups" element={<GroupsPage />} />
      <Route path="masters/ledgers" element={<LedgersPage />} />
      <Route path="masters/cost-categories" element={<CostCategoriesPage />} />
      <Route path="masters/cost-centers" element={<CostCentersPage />} />
      <Route path="masters/employees" element={<EmployeesPage />} />
      <Route path="masters/godowns" element={<GodownsPage />} />
      <Route path="masters/payheads" element={<PayheadsPage />} />
      <Route path="masters/stock-items" element={<StockItemsPage />} />
      <Route path="masters/uom" element={<UOMPage />} />
      <Route path="masters/voucher-types" element={<VoucherTypesPage />} />

      {/* Transactions */}
      <Route path="transactions/accounting" element={<AccountingPage />} />
      <Route path="transactions/inventory" element={<InventoryPage />} />
      <Route path="transactions/non-accounting" element={<NonAccountingPage />} />
      <Route path="transactions/sync" element={<TallySyncPage />} />
      <Route path="transactions/payment/create" element={<PaymentCreate />} />
      <Route path="transactions/contra/create" element={<ContraVoucherCreate />} />
      <Route path="transactions/sales/create" element={<SalesVoucherCreate />} />
      <Route path="transactions/sales/edit/:voucherId" element={<SalesVoucherEdit />} />
      <Route path="transactions/voucher-management" element={<VoucherManagement />} />

      {/* Display & Reports */}
      <Route path="display/day-book" element={<DayBookPage />} />
      <Route path="display/day-book-vouchers" element={<DayBookVouchersPage />} />
      <Route path="display/financial-statements" element={<FinancialStatementsPage />} />
      <Route path="display/reports" element={<ReportsPage />} />
      <Route path="display/statistics" element={<StatisticsPage />} />
      <Route path="analytics/*" element={<AnalyticsDashboard />} />

      {/* Utilities */}
      <Route path="utilities/configuration" element={<ConfigurationPage />} />
      <Route path="utilities/voucher-views" element={<VoucherViewsPage />} />
      <Route path="utilities/sync-jobs" element={<SyncJobsManagement />} />
      <Route path="utilities/sync-logs" element={<TallySyncLogs />} />
      <Route path="utilities/voucher-view-builder" element={
        <VoucherViewBuilder 
          companyId={companyId!} 
          divisionId={divisionId!}
          voucherTypes={[]}
          onSave={() => {}}
          onCancel={() => {}}
        />
      } />
      <Route path="utilities/voucher-views-manager" element={
        <VoucherViewsManager 
          companyId={companyId!} 
          divisionId={divisionId!}
        />
      } />
      <Route path="utilities/sync" element={<TallySyncPageEnhanced />} />

      {/* Data Management */}
      <Route path="data/*" element={<DataManagementPage />} />

      {/* Test */}
      <Route path="test-api" element={<TestApiPage />} />
    </Routes>
  );
}