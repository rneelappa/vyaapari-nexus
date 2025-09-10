# Tally Workspaces Components to Database Tables Mapping

This document provides a comprehensive mapping between the Tally Workspaces UI components and their corresponding database tables from the Tally Database Loader.

## Overview

The Tally Workspaces section in the sidebar has been implemented with 15 components across 4 main categories:

1. **Masters** (6 components) - Master data management
2. **Transactions** (3 components) - Transaction data views
3. **Display** (4 components) - Reports and analytics
4. **Utilities** (1 component) - System configuration

## Component to Database Table Mapping

### 1. Masters Components

#### 1.1 Groups Page (`/tally/masters/groups`)
- **Component**: `GroupsPage.tsx`
- **Primary Table**: `mst_group`
- **Key Fields**: 
  - `guid`, `name`, `parent`, `primary_group`
  - `is_revenue`, `is_deemedpositive`, `affects_gross_profit`
  - `sort_position`
- **Related Tables**: `mst_ledger` (via parent relationship)
- **Features**: Hierarchical group structure, revenue/non-revenue classification

#### 1.2 Ledgers Page (`/tally/masters/ledgers`)
- **Component**: `LedgersPage.tsx`
- **Primary Table**: `mst_ledger`
- **Key Fields**:
  - `guid`, `name`, `parent`, `alias`
  - `opening_balance`, `closing_balance`
  - `gstn`, `email`, `mailing_address`
  - `bank_account_number`, `bank_ifsc`
- **Related Tables**: `mst_group` (via parent), `trn_accounting` (transactions)
- **Features**: Chart of accounts, contact information, bank details

#### 1.3 Stock Items Page (`/tally/masters/stock-items`)
- **Component**: `StockItemsPage.tsx`
- **Primary Table**: `mst_stock_item`
- **Key Fields**:
  - `guid`, `name`, `parent`, `alias`, `part_number`
  - `uom`, `opening_balance`, `closing_balance`
  - `opening_rate`, `closing_rate`, `opening_value`, `closing_value`
  - `gst_hsn_code`, `gst_rate`, `costing_method`
- **Related Tables**: `mst_stock_group` (via parent), `mst_uom` (unit of measure)
- **Features**: Inventory items, stock levels, pricing, GST information

#### 1.4 Godowns Page (`/tally/masters/godowns`)
- **Component**: `GodownsPage.tsx`
- **Primary Table**: `mst_godown`
- **Key Fields**:
  - `guid`, `name`, `parent`, `address`
- **Related Tables**: `trn_inventory` (stock movements), `trn_batch` (batch tracking)
- **Features**: Warehouse locations, hierarchical structure

#### 1.5 Cost Centers Page (`/tally/masters/cost-centers`)
- **Component**: `CostCentersPage.tsx`
- **Primary Table**: `mst_cost_centre`
- **Key Fields**:
  - `guid`, `name`, `parent`, `category`
- **Related Tables**: `mst_cost_category` (via category), `trn_cost_centre` (allocations)
- **Features**: Cost center hierarchy, allocation tracking

#### 1.6 Voucher Types Page (`/tally/masters/voucher-types`)
- **Component**: `VoucherTypesPage.tsx`
- **Primary Table**: `mst_vouchertype`
- **Key Fields**:
  - `guid`, `name`, `parent`, `numbering_method`
  - `is_deemedpositive`, `affects_stock`
- **Related Tables**: `trn_voucher` (voucher headers)
- **Features**: Voucher configuration, numbering methods

### 2. Transactions Components

#### 2.1 Accounting Page (`/tally/transactions/accounting`)
- **Component**: `AccountingPage.tsx`
- **Primary Table**: `trn_accounting`
- **Key Fields**:
  - `guid`, `ledger`, `amount`, `amount_forex`, `currency`
- **Related Tables**: 
  - `trn_voucher` (voucher header)
  - `mst_ledger` (ledger details)
- **Features**: Double-entry accounting, debit/credit entries

#### 2.2 Non-Accounting Page (`/tally/transactions/non-accounting`)
- **Component**: `NonAccountingPage.tsx`
- **Primary Table**: `trn_voucher` (filtered for non-accounting vouchers)
- **Key Fields**:
  - `guid`, `date`, `voucher_type`, `voucher_number`
  - `narration`, `party_name`, `reference_number`, `reference_date`
  - `is_invoice`, `is_order_voucher`
- **Related Tables**: Various based on voucher type
- **Features**: Reference vouchers, memos, orders

#### 2.3 Inventory Page (`/tally/transactions/inventory`)
- **Component**: `InventoryPage.tsx`
- **Primary Table**: `trn_inventory`
- **Key Fields**:
  - `guid`, `item`, `quantity`, `rate`, `amount`
  - `godown`, `tracking_number`, `order_number`, `order_duedate`
- **Related Tables**:
  - `trn_voucher` (voucher header)
  - `mst_stock_item` (item details)
  - `mst_godown` (warehouse details)
- **Features**: Stock movements, in/out tracking, batch information

### 3. Display Components

#### 3.1 Day Book Page (`/tally/display/daybook`)
- **Component**: `DayBookPage.tsx`
- **Primary Tables**: `trn_voucher`, `trn_accounting`
- **Key Fields**: Combined view of voucher headers and accounting entries
- **Features**: Chronological transaction listing, running balance

#### 3.2 Statistics Page (`/tally/display/statistics`)
- **Component**: `StatisticsPage.tsx`
- **Primary Tables**: Multiple tables aggregated
- **Key Metrics**:
  - Sales: `trn_accounting` (credit entries to sales accounts)
  - Purchases: `trn_accounting` (debit entries to purchase accounts)
  - Stock Value: `mst_stock_item` (closing values)
- **Features**: KPIs, charts, top customers/products

#### 3.3 Financial Statements Page (`/tally/display/financial-statements`)
- **Component**: `FinancialStatementsPage.tsx`
- **Primary Tables**: `mst_ledger`, `trn_accounting`
- **Key Features**:
  - P&L: Revenue and expense accounts with balances
  - Balance Sheet: Asset, liability, and capital accounts
- **Features**: Standard financial reports, period comparison

#### 3.4 Reports Page (`/tally/display/reports`)
- **Component**: `ReportsPage.tsx`
- **Primary Tables**: All tables (configurable reports)
- **Features**: Custom report generation, scheduled reports

### 4. Utilities Components

#### 4.1 Configuration Page (`/tally/utilities/configuration`)
- **Component**: `ConfigurationPage.tsx`
- **Primary Table**: `config`
- **Key Fields**: System configuration parameters
- **Features**: Tally connection settings, sync configuration, backup settings

## Database Relationships

### Key Relationship Patterns

1. **Hierarchical Relationships**:
   - `mst_group` → `mst_group` (parent-child)
   - `mst_stock_group` → `mst_stock_item` (parent-child)
   - `mst_godown` → `mst_godown` (parent-child)

2. **Master-Detail Relationships**:
   - `mst_group` → `mst_ledger` (group to ledger)
   - `mst_vouchertype` → `trn_voucher` (voucher type to voucher)
   - `mst_stock_item` → `trn_inventory` (item to inventory transaction)

3. **Transaction Relationships**:
   - `trn_voucher` → `trn_accounting` (voucher to accounting entries)
   - `trn_voucher` → `trn_inventory` (voucher to inventory entries)
   - `trn_voucher` → `trn_batch` (voucher to batch entries)

## Implementation Notes

### Data Flow
1. **Masters**: Direct CRUD operations on master tables
2. **Transactions**: Read-only views with filtering and search
3. **Display**: Aggregated views and calculated reports
4. **Utilities**: Configuration management and system status

### Multi-Company Support
All components support multi-company data isolation through:
- `company_id` and `division_id` filtering
- Company/division context in UI
- Data segregation in queries

### Performance Considerations
- Indexed queries on `company_id`, `division_id`, and `guid`
- Pagination for large datasets
- Caching for frequently accessed master data
- Incremental sync support for real-time updates

## Future Enhancements

1. **Real-time Data Sync**: Live updates from Tally ERP
2. **Advanced Filtering**: Date ranges, custom filters
3. **Export Functionality**: PDF, Excel export for reports
4. **Custom Dashboards**: Configurable KPI widgets
5. **Audit Trail**: Change tracking and history
6. **Mobile Responsiveness**: Optimized mobile views
7. **Offline Support**: Local data caching
8. **API Integration**: RESTful APIs for external systems

## File Structure

```
src/pages/tally/
├── masters/
│   ├── GroupsPage.tsx
│   ├── LedgersPage.tsx
│   ├── StockItemsPage.tsx
│   ├── GodownsPage.tsx
│   ├── CostCentersPage.tsx
│   └── VoucherTypesPage.tsx
├── transactions/
│   ├── AccountingPage.tsx
│   ├── NonAccountingPage.tsx
│   └── InventoryPage.tsx
├── display/
│   ├── DayBookPage.tsx
│   ├── StatisticsPage.tsx
│   ├── FinancialStatementsPage.tsx
│   └── ReportsPage.tsx
└── utilities/
    └── ConfigurationPage.tsx
```

This mapping ensures that each UI component is properly connected to its corresponding database tables and provides a clear understanding of the data flow and relationships within the Tally Workspaces system.
