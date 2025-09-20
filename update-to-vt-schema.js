#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Table mapping from backup tables to VT schema
const tableMapping = {
  // Master tables
  'bkp_mst_attendance_type': 'vt.mst_attendance_type',
  'bkp_mst_company': 'vt.companies',
  'bkp_mst_cost_category': 'vt.cost_categories',
  'bkp_mst_cost_centre': 'vt.cost_centres',
  'bkp_mst_division': 'vt.divisions',
  'bkp_mst_employee': 'vt.employees',
  'bkp_mst_godown': 'vt.godowns',
  'bkp_mst_group': 'vt.groups',
  'bkp_mst_ledger': 'vt.ledgers',
  'bkp_mst_payhead': 'vt.payheads',
  'bkp_mst_stock_item': 'vt.stock_items',
  'bkp_mst_uom': 'vt.units_of_measure',
  'bkp_mst_vouchertype': 'vt.voucher_types',
  'bkp_mst_gst_effective_rate': 'vt.gst_effective_rates',
  'bkp_mst_opening_batch_allocation': 'vt.opening_batch_allocations',
  'bkp_mst_opening_bill_allocation': 'vt.opening_bill_allocations',
  'bkp_mst_stock_group': 'vt.stock_groups',
  'bkp_mst_stockitem_standard_cost': 'vt.stockitem_standard_costs',
  'bkp_mst_stockitem_standard_price': 'vt.stockitem_standard_prices',
  
  // Transaction tables
  'bkp_tally_trn_voucher': 'vt.vouchers',
  'bkp_trn_accounting': 'vt.ledger_entries',
  'bkp_trn_address_details': 'vt.address_details',
  'bkp_trn_attendance': 'vt.attendance_entries',
  'bkp_trn_bank': 'vt.bank_entries',
  'bkp_trn_batch': 'vt.inventory_entries',
  'bkp_trn_bill': 'vt.bill_entries',
  'bkp_trn_category_allocation': 'vt.category_allocations',
  'bkp_trn_closingstock_ledger': 'vt.closing_stock_ledger',
  
  // Legacy master table references (without bkp_ prefix)
  'mst_cost_category': 'vt.cost_categories',
  'mst_cost_centre': 'vt.cost_centres',
  'mst_employee': 'vt.employees',
  'mst_godown': 'vt.godowns',
  'mst_group': 'vt.groups',
  'mst_ledger': 'vt.ledgers',
  'mst_payhead': 'vt.payheads',
  'mst_stock_item': 'vt.stock_items',
  'mst_uom': 'vt.units_of_measure',
  'mst_vouchertype': 'vt.voucher_types',
  
  // Legacy transaction table references (without bkp_ prefix)
  'tally_trn_voucher': 'vt.vouchers',
  'trn_accounting': 'vt.ledger_entries',
  'trn_address_details': 'vt.address_details',
  'trn_batch': 'vt.inventory_entries'
};

function updateFileReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace .from('table_name') patterns
    for (const [oldTable, newTable] of Object.entries(tableMapping)) {
      const fromPattern = new RegExp(`\\.from\\((['"])${oldTable}\\1\\)`, 'g');
      if (fromPattern.test(content)) {
        content = content.replace(fromPattern, `.from('${newTable}')`);
        modified = true;
        console.log(`  Replaced .from('${oldTable}') with .from('${newTable}')`);
      }
    }
    
    // Replace direct table name references in strings
    for (const [oldTable, newTable] of Object.entries(tableMapping)) {
      const stringPattern = new RegExp(`(['"])${oldTable}\\1`, 'g');
      if (stringPattern.test(content)) {
        content = content.replace(stringPattern, `'${newTable}'`);
        modified = true;
        console.log(`  Replaced string '${oldTable}' with '${newTable}'`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let updatedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        updatedCount += processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      if (updateFileReferences(fullPath)) {
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

console.log('🚀 Starting VT schema migration...');
console.log('📋 Table mappings:');
Object.entries(tableMapping).forEach(([old, vt]) => {
  console.log(`  ${old} -> ${vt}`);
});
console.log('');

const updatedFiles = processDirectory('./src');

console.log(`\n✨ Migration complete! Updated ${updatedFiles} files.`);
console.log('🔍 Please review the changes and test thoroughly.');