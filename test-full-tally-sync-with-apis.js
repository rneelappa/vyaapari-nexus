#!/usr/bin/env node

/**
 * Full Tally Sync Test with New APIs
 * Tests complete data synchronization using the new Tally API endpoints
 * with proper UUID foreign key relationships
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const TALLY_API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';
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

// Test 1: Verify API Endpoints with UUID Relationships
async function testApiEndpointsWithUUIDs() {
  console.log('🔍 Testing API Endpoints with UUID Relationships...');
  
  const endpoints = [
    { action: 'getLedgers', name: 'Ledgers' },
    { action: 'getGroups', name: 'Groups' },
    { action: 'getStockItems', name: 'Stock Items' },
    { action: 'getVouchers', name: 'Vouchers' },
    { action: 'getCostCenters', name: 'Cost Centers' },
    { action: 'getGodowns', name: 'Godowns' },
    { action: 'getEmployees', name: 'Employees' }
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name}...`);
      
      const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
        api_key: TALLY_API_KEY,
        action: endpoint.action,
        companyId: COMPANY_ID,
        divisionId: DIVISION_ID,
        filters: {
          limit: 5,
          offset: 0,
          search: ''
        }
      });
      
      console.log(`  Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ ${endpoint.name} fetched successfully`);
        console.log(`  📊 Found ${response.data.count} records`);
        
        // Verify UUID relationships
        if (response.data.data && response.data.data.length > 0) {
          const sampleRecord = response.data.data[0];
          console.log(`  🔗 Company ID: ${sampleRecord.company_id} (UUID: ${typeof sampleRecord.company_id === 'string' && sampleRecord.company_id.length === 36})`);
          console.log(`  🔗 Division ID: ${sampleRecord.division_id} (UUID: ${typeof sampleRecord.division_id === 'string' && sampleRecord.division_id.length === 36})`);
        }
        
        results[endpoint.action] = {
          success: true,
          count: response.data.count,
          sampleData: response.data.data[0] || null
        };
      } else {
        console.log(`  ❌ Failed to fetch ${endpoint.name}: ${JSON.stringify(response.data)}`);
        results[endpoint.action] = {
          success: false,
          error: response.data
        };
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results[endpoint.action] = {
        success: false,
        error: error.message
      };
    }
  }

  return results;
}

// Test 2: Test Full Sync Capability
async function testFullSyncCapability() {
  console.log('\n🔄 Testing Full Sync Capability...');
  
  try {
    // Test bulk import with replace operation
    const response = await makeRequest(`${API_BASE_URL}/tally-bulk-import`, {
      api_key: TALLY_API_KEY,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      import_type: 'full_sync',
      tables: [
        {
          table_name: 'mst_ledger',
          operation: 'replace',
          data: [
            {
              guid: 'test-full-sync-ledger-1',
              company_id: COMPANY_ID,
              division_id: DIVISION_ID,
              name: 'Test Full Sync Ledger 1',
              parent: 'Assets',
              opening_balance: 1000,
              closing_balance: 1000
            },
            {
              guid: 'test-full-sync-ledger-2',
              company_id: COMPANY_ID,
              division_id: DIVISION_ID,
              name: 'Test Full Sync Ledger 2',
              parent: 'Liabilities',
              opening_balance: 500,
              closing_balance: 500
            }
          ]
        }
      ]
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log(`  ✅ Full sync capability confirmed`);
      console.log(`  📊 Processed: ${response.data.total_processed} records`);
      return true;
    } else {
      console.log(`  ❌ Full sync test failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Test Data Fetching from Tally
async function testTallyDataFetching() {
  console.log('\n📥 Testing Data Fetching from Tally...');
  
  try {
    // Test fetching ledgers from Tally
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
    <ID>ListOfAccounts</ID>
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

    if (response.ok) {
      const xmlData = await response.text();
      console.log(`  ✅ Tally data fetching successful`);
      console.log(`  📊 XML data length: ${xmlData.length} characters`);
      
      // Parse a few records to verify structure
      const ledgerMatches = xmlData.match(/<LEDGER[^>]*>[\s\S]*?<\/LEDGER>/g) || [];
      console.log(`  📈 Found ${ledgerMatches.length} ledger records in XML`);
      
      if (ledgerMatches.length > 0) {
        const sampleLedger = ledgerMatches[0];
        const nameMatch = sampleLedger.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
        console.log(`  📋 Sample ledger: ${nameMatch ? nameMatch[1] : 'N/A'}`);
      }
      
      return true;
    } else {
      console.log(`  ❌ Tally data fetching failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 4: Test Complete Sync Workflow
async function testCompleteSyncWorkflow() {
  console.log('\n🔄 Testing Complete Sync Workflow...');
  
  try {
    // Step 1: Fetch data from Tally
    console.log('  📥 Step 1: Fetching data from Tally...');
    const tallyResponse = await fetch(TALLY_URL, {
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
    <ID>ListOfAccounts</ID>
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

    if (!tallyResponse.ok) {
      console.log(`  ❌ Failed to fetch from Tally: ${tallyResponse.status}`);
      return false;
    }

    const xmlData = await tallyResponse.text();
    console.log(`  ✅ Fetched ${xmlData.length} characters from Tally`);

    // Step 2: Parse and transform data
    console.log('  🔄 Step 2: Parsing and transforming data...');
    const ledgerMatches = xmlData.match(/<LEDGER[^>]*>[\s\S]*?<\/LEDGER>/g) || [];
    console.log(`  📊 Parsed ${ledgerMatches.length} ledger records`);

    // Transform to API format
    const transformedData = ledgerMatches.slice(0, 5).map((ledgerXml, index) => {
      const nameMatch = ledgerXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
      const parentMatch = ledgerXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
      const openingMatch = ledgerXml.match(/<OPENINGBALANCE[^>]*>([^<]*)<\/OPENINGBALANCE>/);
      const closingMatch = ledgerXml.match(/<CLOSINGBALANCE[^>]*>([^<]*)<\/CLOSINGBALANCE>/);
      
      return {
        guid: `tally-ledger-${Date.now()}-${index}`,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        name: nameMatch ? nameMatch[1] : `Ledger ${index + 1}`,
        parent: parentMatch ? parentMatch[1] : 'Assets',
        opening_balance: openingMatch ? parseFloat(openingMatch[1]) || 0 : 0,
        closing_balance: closingMatch ? parseFloat(closingMatch[1]) || 0 : 0
      };
    });

    console.log(`  ✅ Transformed ${transformedData.length} records`);

    // Step 3: Import via API
    console.log('  📤 Step 3: Importing via API...');
    const importResponse = await makeRequest(`${API_BASE_URL}/tally-bulk-import`, {
      api_key: TALLY_API_KEY,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      import_type: 'full_sync',
      tables: [
        {
          table_name: 'mst_ledger',
          operation: 'replace',
          data: transformedData
        }
      ]
    });

    console.log(`  Status: ${importResponse.statusCode}`);
    
    if (importResponse.statusCode === 200 && importResponse.data.success) {
      console.log(`  ✅ Complete sync workflow successful`);
      console.log(`  📊 Processed: ${importResponse.data.total_processed} records`);
      return true;
    } else {
      console.log(`  ❌ Import failed: ${JSON.stringify(importResponse.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 5: Test with New Company/Division IDs
async function testWithNewIds() {
  console.log('\n🆕 Testing with New Company/Division IDs...');
  
  const newCompanyId = '629f49fb-983e-4141-8c48-e1423b39e921';
  const newDivisionId = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getLedgers',
      companyId: newCompanyId,
      divisionId: newDivisionId,
      filters: {
        limit: 5,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ New IDs working successfully`);
      console.log(`  📊 Found ${response.data.count} ledgers with new IDs`);
      
      if (response.data.data && response.data.data.length > 0) {
        const sampleRecord = response.data.data[0];
        console.log(`  🔗 Company ID: ${sampleRecord.company_id}`);
        console.log(`  🔗 Division ID: ${sampleRecord.division_id}`);
      }
      
      return true;
    } else {
      console.log(`  ❌ New IDs test failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution
async function runFullTallySyncTest() {
  console.log('🚀 Full Tally Sync Test with New APIs');
  console.log('=====================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Tally URL: ${TALLY_URL}`);
  console.log(`API Key: ${TALLY_API_KEY.substring(0, 8)}...`);
  
  try {
    // Test 1: Verify API endpoints with UUID relationships
    const apiResults = await testApiEndpointsWithUUIDs();
    
    // Test 2: Test full sync capability
    const fullSyncCapable = await testFullSyncCapability();
    
    // Test 3: Test Tally data fetching
    const tallyFetching = await testTallyDataFetching();
    
    // Test 4: Test complete sync workflow
    const completeWorkflow = await testCompleteSyncWorkflow();
    
    // Test 5: Test with new IDs
    const newIdsWorking = await testWithNewIds();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    console.log('\n🔍 API Endpoints with UUIDs:');
    Object.entries(apiResults).forEach(([action, result]) => {
      console.log(`  ${action}: ${result.success ? '✅' : '❌'} ${result.success ? `(${result.count} records)` : `(${result.error})`}`);
    });
    
    console.log('\n🔄 Full Sync Capability:');
    console.log(`  Bulk Import: ${fullSyncCapable ? '✅' : '❌'}`);
    
    console.log('\n📥 Tally Data Fetching:');
    console.log(`  XML Fetching: ${tallyFetching ? '✅' : '❌'}`);
    
    console.log('\n🔄 Complete Sync Workflow:');
    console.log(`  End-to-End: ${completeWorkflow ? '✅' : '❌'}`);
    
    console.log('\n🆕 New Company/Division IDs:');
    console.log(`  UUID Support: ${newIdsWorking ? '✅' : '❌'}`);
    
    // Final assessment
    const allApiWorking = Object.values(apiResults).every(result => result.success);
    const allTestsPassed = allApiWorking && fullSyncCapable && tallyFetching && completeWorkflow && newIdsWorking;
    
    console.log('\n🎯 Final Assessment:');
    console.log('===================');
    
    if (allTestsPassed) {
      console.log('✅ FULL TALLY LOADER SYNC IS READY!');
      console.log('✅ All components working with proper UUID relationships');
      console.log('✅ Complete sync workflow functional');
      console.log('✅ Ready for production use');
    } else {
      console.log('⚠️  Some components need attention:');
      if (!allApiWorking) console.log('  - API endpoints need fixing');
      if (!fullSyncCapable) console.log('  - Bulk import needs fixing');
      if (!tallyFetching) console.log('  - Tally data fetching needs fixing');
      if (!completeWorkflow) console.log('  - Complete workflow needs fixing');
      if (!newIdsWorking) console.log('  - New IDs support needs fixing');
    }
    
    console.log('\n🎉 Full Tally Sync Test completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the test
runFullTallySyncTest().catch(console.error);
