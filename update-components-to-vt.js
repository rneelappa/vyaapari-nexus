const fs = require('fs');
const path = require('path');

// File mapping from old table names to VT schema
const tableMapping = {
  'mst_cost_category': 'vt.cost_categories',
  'mst_cost_centre': 'vt.cost_centers',
  'mst_employee': 'vt.employees',
  'mst_godown': 'vt.godowns',
  'mst_group': 'vt.groups',
  'mst_ledger': 'vt.ledgers',
  'mst_payhead': 'vt.payheads',
  'mst_stock_item': 'vt.stock_items',
  'mst_uom': 'vt.units_of_measure',
  'mst_vouchertype': 'vt.voucher_types',
  'trn_voucher': 'vt.vouchers',
  'trn_accounting': 'vt.ledger_entries',
  'trn_inventory': 'vt.inventory_entries',
  'trn_address_details': 'vt.address_details',
  'bkp_mst_cost_category': 'vt.cost_categories',
  'bkp_mst_cost_centre': 'vt.cost_centers',
  'bkp_mst_employee': 'vt.employees',
  'bkp_mst_godown': 'vt.godowns',
  'bkp_mst_group': 'vt.groups',
  'bkp_mst_ledger': 'vt.ledgers',
  'bkp_mst_payhead': 'vt.payheads',
  'bkp_mst_stock_item': 'vt.stock_items',
  'bkp_mst_uom': 'vt.units_of_measure',
  'bkp_mst_vouchertype': 'vt.voucher_types',
  'bkp_tally_trn_voucher': 'vt.vouchers',
  'bkp_trn_accounting': 'vt.ledger_entries',
  'bkp_trn_inventory': 'vt.inventory_entries',
  'bkp_trn_address_details': 'vt.address_details'
};

function updateFileContent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Update table references in .from() calls
    for (const [oldTable, newTable] = Object.entries(tableMapping)) {
      const patterns = [
        new RegExp(`\\.from\\(['"\`]${oldTable}['"\`]\\)`, 'g'),
        new RegExp(`\\.from\\("${oldTable}"\\)`, 'g'),
        new RegExp(`\\.from\\('${oldTable}'\\)`, 'g'),
        new RegExp(`\\.from\\(\`${oldTable}\`\\)`, 'g')
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, `.from('${newTable}')`);
          modified = true;
        }
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        updateFileContent(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Process all tally components
console.log('Updating tally components to use VT schema...');
processDirectory('./src/pages/tally');
processDirectory('./src/components/tally');
processDirectory('./src/hooks');

console.log('Update completed!');