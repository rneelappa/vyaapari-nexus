#!/usr/bin/env node

/**
 * Full Tally Database Loader Test
 * Uses actual Tally data from ngrok URL with new company/division IDs
 * Replaces all data using API endpoints
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
const TALLY_URL = 'https://5fcc37ede06a.ngrok-free.app'; // Replace with actual ngrok URL

// Utility function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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

// Fetch data from Tally
async function fetchTallyData(tallyUrl, syncType, fromDate, toDate) {
  console.log('🔄 Fetching data from Tally...');
  console.log(`Tally URL: ${tallyUrl}`);
  console.log(`Sync Type: ${syncType}`);
  
  const requests = {
    groups: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>ListOfGroups</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`,
    
    ledgers: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>ListOfAccounts</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`,
    
    stockItems: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>ListOfStockItems</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`,
    
    vouchers: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>ListOfVouchers</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        ${fromDate ? `<SVFROMDATE>${fromDate}</SVFROMDATE>` : ''}
        ${toDate ? `<SVTODATE>${toDate}</SVTODATE>` : ''}
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`
  };

  const results = {
    groups: [],
    ledgers: [],
    stockItems: [],
    vouchers: []
  };

  // Fetch each data type from Tally
  for (const [dataType, xmlRequest] of Object.entries(requests)) {
    try {
      console.log(`  📥 Fetching ${dataType}...`);
      
      const response = await fetch(tallyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'ngrok-skip-browser-warning': 'true'
        },
        body: xmlRequest
      });

      if (response.ok) {
        const xmlData = await response.text()
        const parsedData = parseXmlData(xmlData, dataType)
        results[dataType] = parsedData
        console.log(`  ✅ ${dataType}: ${parsedData.length} records fetched`);
      } else {
        console.warn(`  ❌ Failed to fetch ${dataType} from Tally: ${response.status}`);
      }
    } catch (error) {
      console.warn(`  ❌ Error fetching ${dataType} from Tally: ${error.message}`);
    }
  }

  return results;
}

// Parse XML data from Tally
function parseXmlData(xmlData, dataType) {
  const data = [];
  
  try {
    if (dataType === 'groups') {
      const groupMatches = xmlData.match(/<GROUP[^>]*>[\s\S]*?<\/GROUP>/g) || [];
      groupMatches.forEach((groupXml, index) => {
        const nameMatch = groupXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
        const parentMatch = groupXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
        
        if (nameMatch) {
          data.push({
            guid: `tally-group-${Date.now()}-${index}`,
            name: nameMatch[1] || '',
            parent: parentMatch ? parentMatch[1] : 'Primary',
            _parent: 'Primary',
            primary_group: '',
            is_revenue: 0,
            is_deemedpositive: 1,
            is_reserved: 0,
            affects_gross_profit: 0,
            sort_position: index + 1
          });
        }
      });
    } else if (dataType === 'ledgers') {
      const ledgerMatches = xmlData.match(/<LEDGER[^>]*>[\s\S]*?<\/LEDGER>/g) || [];
      ledgerMatches.forEach((ledgerXml, index) => {
        const nameMatch = ledgerXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
        const parentMatch = ledgerXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
        const openingMatch = ledgerXml.match(/<OPENINGBALANCE[^>]*>([^<]*)<\/OPENINGBALANCE>/);
        const closingMatch = ledgerXml.match(/<CLOSINGBALANCE[^>]*>([^<]*)<\/CLOSINGBALANCE>/);
        
        if (nameMatch) {
          data.push({
            guid: `tally-ledger-${Date.now()}-${index}`,
            name: nameMatch[1] || '',
            parent: parentMatch ? parentMatch[1] : '',
            opening_balance: openingMatch ? parseFloat(openingMatch[1]) || 0 : 0,
            closing_balance: closingMatch ? parseFloat(closingMatch[1]) || 0 : 0
          });
        }
      });
    } else if (dataType === 'stockItems') {
      const itemMatches = xmlData.match(/<STOCKITEM[^>]*>[\s\S]*?<\/STOCKITEM>/g) || [];
      itemMatches.forEach((itemXml, index) => {
        const nameMatch = itemXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
        const parentMatch = itemXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
        
        if (nameMatch) {
          data.push({
            guid: `tally-item-${Date.now()}-${index}`,
            name: nameMatch[1] || '',
            parent: parentMatch ? parentMatch[1] : ''
          });
        }
      });
    } else if (dataType === 'vouchers') {
      const voucherMatches = xmlData.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/g) || [];
      voucherMatches.forEach((voucherXml, index) => {
        const numberMatch = voucherXml.match(/<VOUCHERNUMBER[^>]*>([^<]*)<\/VOUCHERNUMBER>/);
        const dateMatch = voucherXml.match(/<DATE[^>]*>([^<]*)<\/DATE>/);
        const narrationMatch = voucherXml.match(/<NARRATION[^>]*>([^<]*)<\/NARRATION>/);
        const typeMatch = voucherXml.match(/<VOUCHERTYPENAME[^>]*>([^<]*)<\/VOUCHERTYPENAME>/);
        
        if (numberMatch) {
          data.push({
            guid: `tally-voucher-${Date.now()}-${index}`,
            voucher_number: numberMatch[1] || '',
            date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
            narration: narrationMatch ? narrationMatch[1] : '',
            voucher_type: typeMatch ? typeMatch[1] : 'Journal'
          });
        }
      });
    }
  } catch (error) {
    console.error(`Error parsing ${dataType} data:`, error);
  }

  return data;
}

// Import data using API endpoints
async function importTallyDataViaAPI(tallyData, companyId, divisionId, apiKey) {
  console.log('🔄 Importing data via API endpoints...');
  
  const results = {
    groups: 0,
    ledgers: 0,
    stockItems: 0,
    vouchers: 0,
    errors: []
  };

  // Import master data first
  const masterTables = [];
  
  if (tallyData.groups.length > 0) {
    masterTables.push({
      table_name: 'mst_group',
      operation: 'replace',
      data: tallyData.groups
    });
  }
  
  if (tallyData.ledgers.length > 0) {
    masterTables.push({
      table_name: 'mst_ledger',
      operation: 'replace',
      data: tallyData.ledgers
    });
  }
  
  if (tallyData.stockItems.length > 0) {
    masterTables.push({
      table_name: 'mst_stock_item',
      operation: 'replace',
      data: tallyData.stockItems
    });
  }

  // Import master data
  if (masterTables.length > 0) {
    try {
      console.log('  📤 Importing master data...');
      
      const response = await makeRequest(
        `${API_BASE_URL}/tally-bulk-import`,
        {
          api_key: apiKey,
          company_id: companyId,
          division_id: divisionId,
          import_type: 'full_sync',
          tables: masterTables
        }
      );

      if (response.statusCode === 200 && response.data.success) {
        results.groups = response.data.table_results?.find(t => t.table_name === 'mst_group')?.processed_count || 0;
        results.ledgers = response.data.table_results?.find(t => t.table_name === 'mst_ledger')?.processed_count || 0;
        results.stockItems = response.data.table_results?.find(t => t.table_name === 'mst_stock_item')?.processed_count || 0;
        console.log(`  ✅ Master data imported: ${response.data.total_processed} records`);
      } else {
        results.errors.push(`Master data import failed: ${response.data.message}`);
        console.log(`  ❌ Master data import failed: ${response.data.message}`);
      }
    } catch (error) {
      results.errors.push(`Master data import error: ${error.message}`);
      console.log(`  ❌ Master data import error: ${error.message}`);
    }
  }

  // Import transaction data
  if (tallyData.vouchers.length > 0) {
    try {
      console.log('  📤 Importing transaction data...');
      
      const response = await makeRequest(
        `${API_BASE_URL}/tally-bulk-import`,
        {
          api_key: apiKey,
          company_id: companyId,
          division_id: divisionId,
          import_type: 'full_sync',
          tables: [
            {
              table_name: 'trn_voucher',
              operation: 'replace',
              data: tallyData.vouchers
            }
          ]
        }
      );

      if (response.statusCode === 200 && response.data.success) {
        results.vouchers = response.data.total_processed || 0;
        console.log(`  ✅ Transaction data imported: ${response.data.total_processed} records`);
      } else {
        results.errors.push(`Transaction data import failed: ${response.data.message}`);
        console.log(`  ❌ Transaction data import failed: ${response.data.message}`);
      }
    } catch (error) {
      results.errors.push(`Transaction data import error: ${error.message}`);
      console.log(`  ❌ Transaction data import error: ${error.message}`);
    }
  }

  return results;
}

// Main execution
async function runFullTallyLoader() {
  console.log('🚀 Starting Full Tally Database Loader');
  console.log('=====================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Tally URL: ${TALLY_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    // Step 1: Fetch data from Tally
    const tallyData = await fetchTallyData(TALLY_URL, 'full', null, null);
    
    console.log('\n📊 Data Summary:');
    console.log(`  Groups: ${tallyData.groups.length}`);
    console.log(`  Ledgers: ${tallyData.ledgers.length}`);
    console.log(`  Stock Items: ${tallyData.stockItems.length}`);
    console.log(`  Vouchers: ${tallyData.vouchers.length}`);
    
    // Step 2: Import data via API
    const importResults = await importTallyDataViaAPI(
      tallyData, 
      COMPANY_ID, 
      DIVISION_ID, 
      API_KEY
    );
    
    // Step 3: Summary
    console.log('\n📈 Import Results:');
    console.log(`  Groups: ${importResults.groups} imported`);
    console.log(`  Ledgers: ${importResults.ledgers} imported`);
    console.log(`  Stock Items: ${importResults.stockItems} imported`);
    console.log(`  Vouchers: ${importResults.vouchers} imported`);
    
    if (importResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      importResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const totalImported = importResults.groups + importResults.ledgers + importResults.stockItems + importResults.vouchers;
    console.log(`\n🎉 Total records imported: ${totalImported}`);
    
    if (importResults.errors.length === 0) {
      console.log('✅ Full Tally database loader completed successfully!');
    } else {
      console.log('⚠️  Full Tally database loader completed with some errors.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the full tally loader
runFullTallyLoader().catch(console.error);
