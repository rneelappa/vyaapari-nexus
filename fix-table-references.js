// Quick fix script to replace remaining table references
import fs from 'fs';
import path from 'path';

const replacements = [
  // Original table -> backup table
  ['tally_trn_voucher', 'bkp_tally_trn_voucher'],
  ['trn_accounting', 'bkp_trn_accounting'],
  ['mst_ledger', 'bkp_mst_ledger'],
  ['mst_stock_item', 'bkp_mst_stock_item'],
  ['mst_employee', 'bkp_mst_employee'],
  ['mst_godown', 'bkp_mst_godown'],
  ['mst_vouchertype', 'bkp_mst_vouchertype'],
  ['mst_group', 'bkp_mst_group'],
  ['mst_uom', 'bkp_mst_uom'],
  ['mst_cost_centre', 'bkp_mst_cost_centre'],
  ['mst_payhead', 'bkp_mst_payhead'],
  ['mst_cost_category', 'bkp_mst_cost_category']
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(([oldTable, newTable]) => {
      const regex = new RegExp(`\\.from\\(['"\`]${oldTable}['"\`]\\)`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, `.from('${newTable}')`);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Files to fix
const filesToFix = [
  'src/pages/tally/display/DayBookVouchersPage.tsx',
  'src/pages/tally/display/FinancialStatementsPage.tsx',
  'src/pages/tally/display/ReportsPage.tsx',
  'src/pages/tally/display/StatisticsPage.tsx',
  'src/pages/tally/display/StatisticsPageEnhanced.tsx'
];

filesToFix.forEach(fixFile);
console.log('Table reference fixes complete!');