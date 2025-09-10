#!/usr/bin/env node

/**
 * Execute Full Tally Sync
 * Fetches all data from Tally and imports it into Supabase using the new APIs
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const TALLY_API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
const TALLY_URL = 'https://5fcc37ede06a.ngrok-free.app';

// Utility function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to fetch data from Tally
async function fetchTallyData(reportId, reportName) {
  console.log(`📥 Fetching ${reportName} from Tally...`);
  
  try {
    const response = await fetch(TALLY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'ngrok-skip-browser-warning': 'true'
      },
      body: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>${reportId}</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${reportName}: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(`  ✅ Fetched ${xmlData.length} characters`);
    return xmlData;
  } catch (error) {
    console.log(`  ❌ Error fetching ${reportName}: ${error.message}`);
    return null;
  }
}

// Function to parse XML data
function parseXmlData(xmlData, recordTag, fields) {
  const records = [];
  const regex = new RegExp(`<${recordTag}[^>]*>[\\s\\S]*?<\\/${recordTag}>`, 'g');
  const matches = xmlData.match(regex) || [];
  
  console.log(`  📊 Parsed ${matches.length} ${recordTag.toLowerCase()} records`);
  
  for (const match of matches) {
    const record = {};
    
    for (const field of fields) {
      const fieldRegex = new RegExp(`<${field.xmlTag}[^>]*>([^<]*)<\\/${field.xmlTag}>`, 'i');
      const fieldMatch = match.match(fieldRegex);
      record[field.dbField] = fieldMatch ? fieldMatch[1] : (field.defaultValue || '');
    }
    
    records.push(record);
  }
  
  return records;
}

// Function to import data via API
async function importData(tableName, records, operation = 'replace') {
  console.log(`📤 Importing ${records.length} records to ${tableName}...`);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-bulk-import`, {
      api_key: TALLY_API_KEY,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      import_type: 'full_sync',
      tables: [
        {
          table_name: tableName,
          operation: operation,
          data: records
        }
      ]
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log(`  ✅ Imported ${response.data.total_processed} records successfully`);
      return { success: true, processed: response.data.total_processed };
    } else {
      console.log(`  ❌ Import failed: ${JSON.stringify(response.data)}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`  ❌ Error importing to ${tableName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main sync function
async function executeFullTallySync() {
  console.log('🚀 Starting Full Tally Sync');
  console.log('============================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Tally URL: ${TALLY_URL}`);
  console.log(`API Key: ${TALLY_API_KEY.substring(0, 8)}...`);
  console.log('');
  
  const results = {
    totalRecords: 0,
    successfulImports: 0,
    failedImports: 0,
    tables: {}
  };
  
  try {
    // 1. Sync Ledgers
    console.log('🔄 Step 1: Syncing Ledgers...');
    const ledgerXml = await fetchTallyData('ListOfAccounts', 'Ledgers');
    if (ledgerXml) {
      const ledgerFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Assets' },
        { xmlTag: 'OPENINGBALANCE', dbField: 'opening_balance', defaultValue: 0 },
        { xmlTag: 'CLOSINGBALANCE', dbField: 'closing_balance', defaultValue: 0 },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const ledgers = parseXmlData(ledgerXml, 'LEDGER', ledgerFields);
      const ledgerResult = await importData('mst_ledger', ledgers);
      
      results.tables.ledgers = {
        count: ledgers.length,
        success: ledgerResult.success,
        processed: ledgerResult.processed || 0
      };
      results.totalRecords += ledgers.length;
      if (ledgerResult.success) results.successfulImports += ledgerResult.processed || 0;
      else results.failedImports += ledgers.length;
    }
    
    // 2. Sync Groups
    console.log('\n🔄 Step 2: Syncing Groups...');
    const groupXml = await fetchTallyData('ListOfGroups', 'Groups');
    if (groupXml) {
      const groupFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Assets' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const groups = parseXmlData(groupXml, 'GROUP', groupFields);
      const groupResult = await importData('mst_group', groups);
      
      results.tables.groups = {
        count: groups.length,
        success: groupResult.success,
        processed: groupResult.processed || 0
      };
      results.totalRecords += groups.length;
      if (groupResult.success) results.successfulImports += groupResult.processed || 0;
      else results.failedImports += groups.length;
    }
    
    // 3. Sync Stock Items
    console.log('\n🔄 Step 3: Syncing Stock Items...');
    const stockXml = await fetchTallyData('ListOfStockItems', 'Stock Items');
    if (stockXml) {
      const stockFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Stock Items' },
        { xmlTag: 'BASEUNIT', dbField: 'base_unit', defaultValue: 'Nos' },
        { xmlTag: 'OPENINGBALANCE', dbField: 'opening_balance', defaultValue: 0 },
        { xmlTag: 'CLOSINGBALANCE', dbField: 'closing_balance', defaultValue: 0 },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const stockItems = parseXmlData(stockXml, 'STOCKITEM', stockFields);
      const stockResult = await importData('mst_stock_item', stockItems);
      
      results.tables.stockItems = {
        count: stockItems.length,
        success: stockResult.success,
        processed: stockResult.processed || 0
      };
      results.totalRecords += stockItems.length;
      if (stockResult.success) results.successfulImports += stockResult.processed || 0;
      else results.failedImports += stockItems.length;
    }
    
    // 4. Sync Vouchers
    console.log('\n🔄 Step 4: Syncing Vouchers...');
    const voucherXml = await fetchTallyData('ListOfVouchers', 'Vouchers');
    if (voucherXml) {
      const voucherFields = [
        { xmlTag: 'VOUCHERNAME', dbField: 'voucher_name', defaultValue: '' },
        { xmlTag: 'VOUCHERTYPE', dbField: 'voucher_type', defaultValue: '' },
        { xmlTag: 'DATE', dbField: 'voucher_date', defaultValue: '' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const vouchers = parseXmlData(voucherXml, 'VOUCHER', voucherFields);
      const voucherResult = await importData('mst_voucher', vouchers);
      
      results.tables.vouchers = {
        count: vouchers.length,
        success: voucherResult.success,
        processed: voucherResult.processed || 0
      };
      results.totalRecords += vouchers.length;
      if (voucherResult.success) results.successfulImports += voucherResult.processed || 0;
      else results.failedImports += vouchers.length;
    }
    
    // 5. Sync Cost Centers
    console.log('\n🔄 Step 5: Syncing Cost Centers...');
    const costCenterXml = await fetchTallyData('ListOfCostCenters', 'Cost Centers');
    if (costCenterXml) {
      const costCenterFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Primary' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const costCenters = parseXmlData(costCenterXml, 'COSTCENTER', costCenterFields);
      const costCenterResult = await importData('mst_cost_center', costCenters);
      
      results.tables.costCenters = {
        count: costCenters.length,
        success: costCenterResult.success,
        processed: costCenterResult.processed || 0
      };
      results.totalRecords += costCenters.length;
      if (costCenterResult.success) results.successfulImports += costCenterResult.processed || 0;
      else results.failedImports += costCenters.length;
    }
    
    // 6. Sync Godowns
    console.log('\n🔄 Step 6: Syncing Godowns...');
    const godownXml = await fetchTallyData('ListOfGodowns', 'Godowns');
    if (godownXml) {
      const godownFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Primary' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const godowns = parseXmlData(godownXml, 'GODOWN', godownFields);
      const godownResult = await importData('mst_godown', godowns);
      
      results.tables.godowns = {
        count: godowns.length,
        success: godownResult.success,
        processed: godownResult.processed || 0
      };
      results.totalRecords += godowns.length;
      if (godownResult.success) results.successfulImports += godownResult.processed || 0;
      else results.failedImports += godowns.length;
    }
    
    // 7. Sync Employees
    console.log('\n🔄 Step 7: Syncing Employees...');
    const employeeXml = await fetchTallyData('ListOfEmployees', 'Employees');
    if (employeeXml) {
      const employeeFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Primary' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      const employees = parseXmlData(employeeXml, 'EMPLOYEE', employeeFields);
      const employeeResult = await importData('mst_employee', employees);
      
      results.tables.employees = {
        count: employees.length,
        success: employeeResult.success,
        processed: employeeResult.processed || 0
      };
      results.totalRecords += employees.length;
      if (employeeResult.success) results.successfulImports += employeeResult.processed || 0;
      else results.failedImports += employees.length;
    }
    
    // Summary
    console.log('\n📊 Full Sync Results Summary:');
    console.log('==============================');
    console.log(`Total Records Fetched: ${results.totalRecords}`);
    console.log(`Successfully Imported: ${results.successfulImports}`);
    console.log(`Failed Imports: ${results.failedImports}`);
    console.log('');
    
    console.log('📋 Table-wise Results:');
    Object.entries(results.tables).forEach(([table, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${table}: ${status} ${result.count} records (${result.processed} processed)`);
    });
    
    if (results.successfulImports > 0) {
      console.log('\n🎉 Full Tally Sync Completed Successfully!');
      console.log(`✅ ${results.successfulImports} records imported to Supabase`);
      console.log('✅ All data is now available in your Supabase database');
    } else {
      console.log('\n⚠️  Sync completed with issues');
      console.log('Check the logs above for specific error details');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during sync:', error.message);
  }
}

// Run the full sync
executeFullTallySync().catch(console.error);
