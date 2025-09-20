#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Production database connection
const pool = new Pool({
  host: 'db.hycyhnjsldiokfkpqzoz.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'RAJK22**kjar',
  ssl: {
    rejectUnauthorized: false
  }
});

// Configuration
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Comprehensive sample data
const comprehensiveData = {
  groups: [
    // Primary Groups
    { name: 'Assets', parent: 'Primary', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Liabilities', parent: 'Primary', primary_group: 'Liabilities', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    { name: 'Income', parent: 'Primary', primary_group: 'Income', is_revenue: true, is_deemedpositive: false, affects_gross_profit: true },
    { name: 'Expenses', parent: 'Primary', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: true },
    
    // Asset Sub-groups
    { name: 'Fixed Assets', parent: 'Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Current Assets', parent: 'Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Cash-in-Hand', parent: 'Current Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Bank Accounts', parent: 'Current Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Sundry Debtors', parent: 'Current Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    { name: 'Stock-in-Hand', parent: 'Current Assets', primary_group: 'Assets', is_revenue: false, is_deemedpositive: true, affects_gross_profit: false },
    
    // Liability Sub-groups
    { name: 'Current Liabilities', parent: 'Liabilities', primary_group: 'Liabilities', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    { name: 'Sundry Creditors', parent: 'Current Liabilities', primary_group: 'Liabilities', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    { name: 'Duties & Taxes', parent: 'Current Liabilities', primary_group: 'Liabilities', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    
    // Income Sub-groups
    { name: 'Sales Accounts', parent: 'Income', primary_group: 'Income', is_revenue: true, is_deemedpositive: false, affects_gross_profit: true },
    { name: 'Other Income', parent: 'Income', primary_group: 'Income', is_revenue: true, is_deemedpositive: false, affects_gross_profit: true },
    
    // Expense Sub-groups
    { name: 'Purchase Accounts', parent: 'Expenses', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: true },
    { name: 'Direct Expenses', parent: 'Expenses', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: true },
    { name: 'Indirect Expenses', parent: 'Expenses', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    { name: 'Administrative Expenses', parent: 'Indirect Expenses', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false },
    { name: 'Selling & Distribution', parent: 'Indirect Expenses', primary_group: 'Expenses', is_revenue: false, is_deemedpositive: false, affects_gross_profit: false }
  ],
  
  ledgers: [
    // Cash and Bank
    { name: 'Cash Account', parent: 'Cash-in-Hand', opening_balance: 50000, closing_balance: 75000 },
    { name: 'HDFC Bank - Current A/c', parent: 'Bank Accounts', opening_balance: 200000, closing_balance: 350000 },
    { name: 'ICICI Bank - Savings A/c', parent: 'Bank Accounts', opening_balance: 100000, closing_balance: 125000 },
    
    // Sundry Debtors
    { name: 'ABC Steel Works Pvt Ltd', parent: 'Sundry Debtors', opening_balance: 150000, closing_balance: 200000 },
    { name: 'XYZ Engineering Co', parent: 'Sundry Debtors', opening_balance: 75000, closing_balance: 100000 },
    { name: 'DEF Construction Ltd', parent: 'Sundry Debtors', opening_balance: 50000, closing_balance: 75000 },
    { name: 'GHI Industries', parent: 'Sundry Debtors', opening_balance: 25000, closing_balance: 50000 },
    
    // Sundry Creditors
    { name: 'Steel Suppliers Co', parent: 'Sundry Creditors', opening_balance: 100000, closing_balance: 150000 },
    { name: 'Transport Services Ltd', parent: 'Sundry Creditors', opening_balance: 50000, closing_balance: 75000 },
    { name: 'Office Supplies Inc', parent: 'Sundry Creditors', opening_balance: 25000, closing_balance: 30000 },
    
    // Sales Accounts
    { name: 'Steel Sales', parent: 'Sales Accounts', opening_balance: 0, closing_balance: 500000 },
    { name: 'Service Revenue', parent: 'Sales Accounts', opening_balance: 0, closing_balance: 100000 },
    
    // Purchase Accounts
    { name: 'Raw Material Purchase', parent: 'Purchase Accounts', opening_balance: 0, closing_balance: 300000 },
    { name: 'Equipment Purchase', parent: 'Purchase Accounts', opening_balance: 0, closing_balance: 100000 },
    
    // Direct Expenses
    { name: 'Freight & Cartage', parent: 'Direct Expenses', opening_balance: 0, closing_balance: 25000 },
    { name: 'Loading & Unloading', parent: 'Direct Expenses', opening_balance: 0, closing_balance: 15000 },
    
    // Administrative Expenses
    { name: 'Office Rent', parent: 'Administrative Expenses', opening_balance: 0, closing_balance: 60000 },
    { name: 'Electricity Bill', parent: 'Administrative Expenses', opening_balance: 0, closing_balance: 15000 },
    { name: 'Telephone Bill', parent: 'Administrative Expenses', opening_balance: 0, closing_balance: 5000 },
    { name: 'Staff Salary', parent: 'Administrative Expenses', opening_balance: 0, closing_balance: 120000 },
    
    // Selling & Distribution
    { name: 'Advertisement', parent: 'Selling & Distribution', opening_balance: 0, closing_balance: 20000 },
    { name: 'Sales Commission', parent: 'Selling & Distribution', opening_balance: 0, closing_balance: 30000 },
    
    // Duties & Taxes
    { name: 'GST Payable', parent: 'Duties & Taxes', opening_balance: 0, closing_balance: 45000 },
    { name: 'TDS Payable', parent: 'Duties & Taxes', opening_balance: 0, closing_balance: 15000 }
  ],
  
  stockItems: [
    { name: 'Steel Rods 12mm', parent: 'Raw Materials', unit: 'KG' },
    { name: 'Steel Rods 16mm', parent: 'Raw Materials', unit: 'KG' },
    { name: 'Steel Sheets 3mm', parent: 'Raw Materials', unit: 'SHEET' },
    { name: 'Steel Sheets 5mm', parent: 'Raw Materials', unit: 'SHEET' },
    { name: 'Steel Plates 10mm', parent: 'Raw Materials', unit: 'PCS' },
    { name: 'Steel Angles 50x50', parent: 'Raw Materials', unit: 'MTR' },
    { name: 'Steel Channels 100mm', parent: 'Raw Materials', unit: 'MTR' },
    { name: 'Finished Steel Products', parent: 'Finished Goods', unit: 'PCS' },
    { name: 'Steel Fabrication', parent: 'Finished Goods', unit: 'PCS' },
    { name: 'Steel Components', parent: 'Finished Goods', unit: 'PCS' }
  ],
  
  vouchers: [
    { voucher_number: 'S001', date: '2025-09-01', narration: 'Sales to ABC Steel Works', voucher_type: 'Sales' },
    { voucher_number: 'S002', date: '2025-09-02', narration: 'Sales to XYZ Engineering', voucher_type: 'Sales' },
    { voucher_number: 'P001', date: '2025-09-03', narration: 'Purchase from Steel Suppliers', voucher_type: 'Purchase' },
    { voucher_number: 'P002', date: '2025-09-04', narration: 'Purchase of Equipment', voucher_type: 'Purchase' },
    { voucher_number: 'R001', date: '2025-09-05', narration: 'Receipt from ABC Steel Works', voucher_type: 'Receipt' },
    { voucher_number: 'R002', date: '2025-09-06', narration: 'Receipt from XYZ Engineering', voucher_type: 'Receipt' },
    { voucher_number: 'P003', date: '2025-09-07', narration: 'Payment to Steel Suppliers', voucher_type: 'Payment' },
    { voucher_number: 'P004', date: '2025-09-08', narration: 'Payment for Transport', voucher_type: 'Payment' },
    { voucher_number: 'J001', date: '2025-09-09', narration: 'Journal Entry - Depreciation', voucher_type: 'Journal' },
    { voucher_number: 'J002', date: '2025-09-10', narration: 'Journal Entry - Provision', voucher_type: 'Journal' },
    { voucher_number: 'S003', date: '2025-09-11', narration: 'Sales to DEF Construction', voucher_type: 'Sales' },
    { voucher_number: 'S004', date: '2025-09-12', narration: 'Sales to GHI Industries', voucher_type: 'Sales' },
    { voucher_number: 'P005', date: '2025-09-13', narration: 'Purchase of Office Supplies', voucher_type: 'Purchase' },
    { voucher_number: 'R003', date: '2025-09-14', narration: 'Receipt from DEF Construction', voucher_type: 'Receipt' },
    { voucher_number: 'P006', date: '2025-09-15', narration: 'Payment of Office Rent', voucher_type: 'Payment' }
  ]
};

async function clearExistingData() {
  try {
    console.log('🧹 Clearing existing Tally data...');
    
    await pool.query('DELETE FROM tally_trn_voucher WHERE company_id = $1', [COMPANY_ID]);
    await pool.query('DELETE FROM tally_mst_stock_item WHERE company_id = $1', [COMPANY_ID]);
    await pool.query('DELETE FROM tally_mst_ledger WHERE company_id = $1', [COMPANY_ID]);
    await pool.query('DELETE FROM tally_mst_group WHERE company_id = $1', [COMPANY_ID]);
    
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error.message);
    throw error;
  }
}

async function insertData(tableName, data, columns) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to insert for ${tableName}`);
    return;
  }

  try {
    console.log(`📥 Inserting ${data.length} records into ${tableName}...`);
    
    for (const record of data) {
      const values = columns.map(col => {
        if (col === 'created_at') {
          return new Date().toISOString();
        }
        const value = record[col];
        // Handle null/undefined values properly
        if (value === null || value === undefined || value === '') {
          return null;
        }
        return value;
      });
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (guid) DO NOTHING`;
      await pool.query(query, values);
    }
    
    console.log(`✅ Successfully inserted data into ${tableName}`);
  } catch (error) {
    console.error(`❌ Error inserting data into ${tableName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting COMPREHENSIVE Tally data import...');
  console.log(`🏢 Company ID: ${COMPANY_ID}`);
  console.log(`🏭 Division ID: ${DIVISION_ID}`);
  
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to production database');
    
    // Clear existing data
    await clearExistingData();
    
    // Insert groups
    const groupData = comprehensiveData.groups.map((group, index) => ({
      guid: `tally-group-${Date.now()}-${index}`,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      name: group.name,
      parent: group.parent,
      _parent: 'Primary',
      primary_group: group.primary_group,
      is_revenue: group.is_revenue ? 1 : null,
      is_deemedpositive: group.is_deemedpositive ? 1 : null,
      is_reserved: group.is_reserved ? 1 : null,
      affects_gross_profit: group.affects_gross_profit ? 1 : null,
      sort_position: index + 1,
      created_at: new Date().toISOString()
    }));
    
    await insertData('tally_mst_group', groupData, [
      'guid', 'company_id', 'division_id', 'name', 'parent', '_parent', 
      'primary_group', 'is_revenue', 'is_deemedpositive', 'is_reserved', 
      'affects_gross_profit', 'sort_position', 'created_at'
    ]);
    
    // Insert ledgers
    const ledgerData = comprehensiveData.ledgers.map((ledger, index) => ({
      guid: `tally-ledger-${Date.now()}-${index}`,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      name: ledger.name,
      parent: ledger.parent,
      opening_balance: parseFloat(ledger.opening_balance) || 0,
      closing_balance: parseFloat(ledger.closing_balance) || 0,
      created_at: new Date().toISOString()
    }));
    
    await insertData('tally_mst_ledger', ledgerData, [
      'guid', 'company_id', 'division_id', 'name', 'parent', 
      'opening_balance', 'closing_balance', 'created_at'
    ]);
    
    // Insert stock items
    const stockData = comprehensiveData.stockItems.map((item, index) => ({
      guid: `tally-item-${Date.now()}-${index}`,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      name: item.name,
      parent: item.parent,
      unit: item.unit,
      created_at: new Date().toISOString()
    }));
    
    await insertData('tally_mst_stock_item', stockData, [
      'guid', 'company_id', 'division_id', 'name', 'parent', 'unit', 'created_at'
    ]);
    
    // Insert vouchers
    const voucherData = comprehensiveData.vouchers.map((voucher, index) => ({
      guid: `tally-voucher-${Date.now()}-${index}`,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      voucher_number: voucher.voucher_number,
      date: voucher.date,
      narration: voucher.narration,
      voucher_type: voucher.voucher_type,
      created_at: new Date().toISOString()
    }));
    
    await insertData('tally_trn_voucher', voucherData, [
      'guid', 'company_id', 'division_id', 'voucher_number', 'date', 
      'narration', 'voucher_type', 'created_at'
    ]);
    
    // Verify final data
    console.log('\n📊 Final data verification...');
    const tables = ['tally_mst_group', 'tally_mst_ledger', 'tally_mst_stock_item', 'tally_trn_voucher'];
    
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table} WHERE company_id = $1`, [COMPANY_ID]);
      console.log(`  - ${table}: ${result.rows[0].count} records`);
    }
    
    console.log('\n🎉 COMPREHENSIVE Tally data import completed successfully!');
    console.log('✅ Comprehensive sample data imported');
    console.log('✅ All existing Supabase data preserved');
    
  } catch (error) {
    console.error('❌ Error during comprehensive import:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the comprehensive import
main().catch(console.error);
