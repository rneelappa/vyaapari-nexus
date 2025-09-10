#!/usr/bin/env node

/**
 * Full Tally Sync Test with New Company/Division IDs
 * Tests complete data synchronization using the new Tally API endpoints
 * with the correct company/division IDs that have proper foreign key relationships
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

// Test 1: Verify API Endpoints with New IDs
async function testApiEndpointsWithNewIds() {
  console.log('🔍 Testing API Endpoints with New Company/Division IDs...');
  
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
          console.log(`  🔗 Company ID: ${sampleRecord.company_id}`);
          console.log(`  🔗 Division ID: ${sampleRecord.division_id}`);
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

// Test 2: Test Full Sync Capability with New IDs
async function testFullSyncCapabilityWithNewIds() {
  console.log('\n🔄 Testing Full Sync Capability with New IDs...');
  
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
              guid: 'test-new-ids-sync-1',
              name: 'Test New IDs Sync Ledger 1',
              parent: 'Assets',
              opening_balance: 1000,
              closing_balance: 1000
            },
            {
              guid: 'test-new-ids-sync-2',
              name: 'Test New IDs Sync Ledger 2',
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
      console.log(`  ✅ Full sync capability confirmed with new IDs`);
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

// Test 3: Test Complete Sync Workflow with Real Tally Data
async function testCompleteSyncWorkflowWithRealData() {
  console.log('\n🔄 Testing Complete Sync Workflow with Real Tally Data...');
  
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

    // Transform to API format (limit to 10 records for testing)
    const transformedData = ledgerMatches.slice(0, 10).map((ledgerXml, index) => {
      const nameMatch = ledgerXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
      const parentMatch = ledgerXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
      const openingMatch = ledgerXml.match(/<OPENINGBALANCE[^>]*>([^<]*)<\/OPENINGBALANCE>/);
      const closingMatch = ledgerXml.match(/<CLOSINGBALANCE[^>]*>([^<]*)<\/CLOSINGBALANCE>/);
      
      return {
        guid: `tally-real-data-${Date.now()}-${index}`,
        name: nameMatch ? nameMatch[1] : `Real Ledger ${index + 1}`,
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
      console.log(`  ✅ Complete sync workflow successful with real data`);
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

// Test 4: Test Multiple Table Sync
async function testMultipleTableSync() {
  console.log('\n🔄 Testing Multiple Table Sync...');
  
  try {
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
              guid: 'multi-table-ledger-1',
              name: 'Multi Table Ledger 1',
              parent: 'Assets',
              opening_balance: 1000,
              closing_balance: 1000
            }
          ]
        },
        {
          table_name: 'mst_group',
          operation: 'replace',
          data: [
            {
              guid: 'multi-table-group-1',
              name: 'Multi Table Group 1',
              parent: 'Assets'
            }
          ]
        }
      ]
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log(`  ✅ Multiple table sync successful`);
      console.log(`  📊 Processed: ${response.data.total_processed} records`);
      return true;
    } else {
      console.log(`  ❌ Multiple table sync failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution
async function runFullTallySyncTestWithNewIds() {
  console.log('🚀 Full Tally Sync Test with New Company/Division IDs');
  console.log('====================================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Tally URL: ${TALLY_URL}`);
  console.log(`API Key: ${TALLY_API_KEY.substring(0, 8)}...`);
  
  try {
    // Test 1: Verify API endpoints with new IDs
    const apiResults = await testApiEndpointsWithNewIds();
    
    // Test 2: Test full sync capability with new IDs
    const fullSyncCapable = await testFullSyncCapabilityWithNewIds();
    
    // Test 3: Test complete sync workflow with real data
    const completeWorkflow = await testCompleteSyncWorkflowWithRealData();
    
    // Test 4: Test multiple table sync
    const multipleTableSync = await testMultipleTableSync();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    console.log('\n🔍 API Endpoints with New IDs:');
    Object.entries(apiResults).forEach(([action, result]) => {
      console.log(`  ${action}: ${result.success ? '✅' : '❌'} ${result.success ? `(${result.count} records)` : `(${result.error})`}`);
    });
    
    console.log('\n🔄 Full Sync Capability:');
    console.log(`  Bulk Import: ${fullSyncCapable ? '✅' : '❌'}`);
    
    console.log('\n🔄 Complete Sync Workflow:');
    console.log(`  End-to-End: ${completeWorkflow ? '✅' : '❌'}`);
    
    console.log('\n🔄 Multiple Table Sync:');
    console.log(`  Multi-Table: ${multipleTableSync ? '✅' : '❌'}`);
    
    // Final assessment
    const allApiWorking = Object.values(apiResults).every(result => result.success);
    const allTestsPassed = allApiWorking && fullSyncCapable && completeWorkflow && multipleTableSync;
    
    console.log('\n🎯 Final Assessment:');
    console.log('===================');
    
    if (allTestsPassed) {
      console.log('✅ FULL TALLY LOADER SYNC IS READY!');
      console.log('✅ All components working with new company/division IDs');
      console.log('✅ Complete sync workflow functional');
      console.log('✅ Multiple table sync working');
      console.log('✅ Ready for production use');
    } else {
      console.log('⚠️  Some components need attention:');
      if (!allApiWorking) console.log('  - API endpoints need fixing');
      if (!fullSyncCapable) console.log('  - Bulk import needs fixing');
      if (!completeWorkflow) console.log('  - Complete workflow needs fixing');
      if (!multipleTableSync) console.log('  - Multiple table sync needs fixing');
    }
    
    console.log('\n🎉 Full Tally Sync Test completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the test
runFullTallySyncTestWithNewIds().catch(console.error);
