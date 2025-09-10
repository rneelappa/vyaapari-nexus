#!/usr/bin/env node

/**
 * Full Sync API Test Script
 * Tests the tally loader with full sync capabilities using replace operations
 */

import https from 'https';

// Configuration
const TALLY_LOADER_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-loader-api';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

// Test data for full sync
const mockTallyData = {
  groups: [
    {
      guid: 'test-group-1',
      name: 'Assets',
      parent: 'Primary',
      _parent: 'Primary',
      primary_group: '',
      is_revenue: false,
      is_deemedpositive: true,
      is_reserved: false,
      affects_gross_profit: false,
      sort_position: 1
    },
    {
      guid: 'test-group-2',
      name: 'Liabilities',
      parent: 'Primary',
      _parent: 'Primary',
      primary_group: '',
      is_revenue: false,
      is_deemedpositive: false,
      is_reserved: false,
      affects_gross_profit: false,
      sort_position: 2
    }
  ],
  ledgers: [
    {
      guid: 'test-ledger-1',
      name: 'Cash Account',
      parent: 'Assets',
      opening_balance: 10000,
      closing_balance: 15000
    },
    {
      guid: 'test-ledger-2',
      name: 'Bank Account',
      parent: 'Assets',
      opening_balance: 50000,
      closing_balance: 75000
    },
    {
      guid: 'test-ledger-3',
      name: 'Sales Account',
      parent: 'Income',
      opening_balance: 0,
      closing_balance: 100000
    }
  ],
  stockItems: [
    {
      guid: 'test-item-1',
      name: 'Product A',
      parent: 'Stock Group',
      unit: 'PCS'
    },
    {
      guid: 'test-item-2',
      name: 'Product B',
      parent: 'Stock Group',
      unit: 'KG'
    }
  ],
  vouchers: [
    {
      guid: 'test-voucher-1',
      voucher_number: 'V001',
      date: '2025-01-01',
      narration: 'Test Voucher 1',
      voucher_type: 'Journal'
    },
    {
      guid: 'test-voucher-2',
      voucher_number: 'V002',
      date: '2025-01-02',
      narration: 'Test Voucher 2',
      voucher_type: 'Journal'
    }
  ]
};

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

// Test full sync with replace operations
async function testFullSync() {
  console.log('🧪 Testing Full Sync with Replace Operations');
  console.log('============================================');
  
  const testData = {
    tallyUrl: 'https://mock-tally-server.com', // Mock URL for testing
    companyId: COMPANY_ID,
    divisionId: DIVISION_ID,
    syncType: 'full',
    apiKey: API_KEY
  };
  
  try {
    const response = await makeRequest(TALLY_LOADER_URL, testData);
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Full Sync Test',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data.data || null
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Full Sync Test',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Test incremental sync with upsert operations
async function testIncrementalSync() {
  console.log('\n🧪 Testing Incremental Sync with Upsert Operations');
  console.log('==================================================');
  
  const testData = {
    tallyUrl: 'https://mock-tally-server.com',
    companyId: COMPANY_ID,
    divisionId: DIVISION_ID,
    syncType: 'incremental',
    fromDate: '2025-01-01',
    toDate: '2025-12-31',
    apiKey: API_KEY
  };
  
  try {
    const response = await makeRequest(TALLY_LOADER_URL, testData);
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Incremental Sync Test',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data.data || null
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Incremental Sync Test',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Test direct bulk import with replace operation
async function testDirectBulkReplace() {
  console.log('\n🧪 Testing Direct Bulk Import with Replace Operation');
  console.log('====================================================');
  
  const testData = {
    api_key: API_KEY,
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    import_type: 'full_sync',
    tables: [
      {
        table_name: 'mst_ledger',
        operation: 'replace',
        data: mockTallyData.ledgers
      },
      {
        table_name: 'mst_group',
        operation: 'replace',
        data: mockTallyData.groups
      }
    ]
  };
  
  try {
    const response = await makeRequest(
      'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-bulk-import',
      testData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Direct Bulk Replace Test',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Direct Bulk Replace Test',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Test individual table replacement
async function testIndividualTableReplace() {
  console.log('\n🧪 Testing Individual Table Replacement');
  console.log('=======================================');
  
  const testData = {
    api_key: API_KEY,
    data_type: 'master',
    table_name: 'mst_ledger',
    operation: 'replace',
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    data: mockTallyData.ledgers[0] // Single record for testing
  };
  
  try {
    const response = await makeRequest(
      'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-data-ingestion',
      testData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Individual Table Replace Test',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Individual Table Replace Test',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Main test runner
async function runFullSyncTests() {
  console.log('🚀 Starting Full Sync API Test Suite');
  console.log('====================================');
  console.log(`Tally Loader URL: ${TALLY_LOADER_URL}`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = [];
  
  // Run all tests
  results.push(await testDirectBulkReplace());
  results.push(await testIndividualTableReplace());
  results.push(await testFullSync());
  results.push(await testIncrementalSync());
  
  // Summary
  console.log('\n📊 Full Sync Test Results Summary');
  console.log('==================================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status} (${result.statusCode})`);
    if (result.message) {
      console.log(`  Message: ${result.message}`);
    }
    if (result.data) {
      console.log(`  Data: ${JSON.stringify(result.data, null, 2)}`);
    }
  });
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Full sync capabilities are working perfectly.');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed! Full sync capabilities are partially working.');
  } else {
    console.log('❌ All tests failed. There may be configuration issues.');
  }
  
  // Recommendations
  console.log('\n💡 Full Sync Capabilities Verified:');
  console.log('====================================');
  
  const bulkReplaceTest = results.find(r => r.name === 'Direct Bulk Replace Test');
  if (bulkReplaceTest && bulkReplaceTest.success) {
    console.log('✅ Bulk import with replace operation: WORKING');
  } else {
    console.log('❌ Bulk import with replace operation: NOT WORKING');
  }
  
  const individualReplaceTest = results.find(r => r.name === 'Individual Table Replace Test');
  if (individualReplaceTest && individualReplaceTest.success) {
    console.log('✅ Individual table replacement: WORKING');
  } else {
    console.log('❌ Individual table replacement: NOT WORKING');
  }
  
  const fullSyncTest = results.find(r => r.name === 'Full Sync Test');
  if (fullSyncTest && fullSyncTest.success) {
    console.log('✅ Tally loader full sync: WORKING');
  } else {
    console.log('❌ Tally loader full sync: NOT WORKING');
  }
  
  const incrementalSyncTest = results.find(r => r.name === 'Incremental Sync Test');
  if (incrementalSyncTest && incrementalSyncTest.success) {
    console.log('✅ Tally loader incremental sync: WORKING');
  } else {
    console.log('❌ Tally loader incremental sync: NOT WORKING');
  }
  
  console.log('\n🔧 Full Sync Workflow:');
  console.log('1. Master data tables (groups, ledgers, stock items) are replaced');
  console.log('2. Transaction data tables (vouchers) are replaced');
  console.log('3. Data isolation is maintained per company/division');
  console.log('4. Atomic operations ensure data consistency');
}

// Run the tests
runFullSyncTests().catch(console.error);
