#!/usr/bin/env node

/**
 * Tally API RLS Test Script
 * Tests the production Supabase Edge Functions with RLS considerations
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '550e8400-e29b-41d4-a716-446655440000';
const DIVISION_ID = '550e8400-e29b-41d4-a716-446655440001';

// Test with different authentication approaches
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'apikey': API_KEY
};

// Utility function to make HTTP requests with proper headers
function makeRequest(url, data, headers = AUTH_HEADERS) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        ...headers,
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

// Test with minimal data structure
async function testMinimalData() {
  console.log('\n🧪 Testing with Minimal Data Structure...');
  console.log('==========================================');
  
  const testData = {
    api_key: API_KEY,
    data_type: 'master',
    table_name: 'mst_ledger',
    operation: 'insert',
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    data: {
      guid: `test-${Date.now()}`,
      name: 'Test Ledger'
    }
  };
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-data-ingestion`,
      testData
    );
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.statusCode === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test with different table structures
async function testTableStructures() {
  console.log('\n🧪 Testing Different Table Structures...');
  console.log('========================================');
  
  const tableTests = [
    {
      name: 'mst_ledger - minimal',
      data: {
        api_key: API_KEY,
        data_type: 'master',
        table_name: 'mst_ledger',
        operation: 'insert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          guid: `test-ledger-${Date.now()}`,
          name: 'Test Ledger'
        }
      }
    },
    {
      name: 'mst_ledger - with parent',
      data: {
        api_key: API_KEY,
        data_type: 'master',
        table_name: 'mst_ledger',
        operation: 'insert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          guid: `test-ledger-parent-${Date.now()}`,
          name: 'Test Ledger with Parent',
          parent: 'Assets'
        }
      }
    },
    {
      name: 'mst_group - minimal',
      data: {
        api_key: API_KEY,
        data_type: 'master',
        table_name: 'mst_group',
        operation: 'insert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          guid: `test-group-${Date.now()}`,
          name: 'Test Group'
        }
      }
    },
    {
      name: 'trn_voucher - minimal',
      data: {
        api_key: API_KEY,
        data_type: 'transaction',
        table_name: 'trn_voucher',
        operation: 'insert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          guid: `test-voucher-${Date.now()}`,
          voucher_number: 'TEST-001',
          date: new Date().toISOString().split('T')[0]
        }
      }
    }
  ];
  
  const results = [];
  
  for (const test of tableTests) {
    console.log(`\n--- Testing: ${test.name} ---`);
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-data-ingestion`,
        test.data
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        name: test.name,
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        statusCode: 'ERROR',
        message: error.message
      });
    }
  }
  
  return results;
}

// Test webhook with proper data structure
async function testWebhookWithData() {
  console.log('\n🧪 Testing Webhook with Proper Data Structure...');
  console.log('================================================');
  
  const webhookTests = [
    {
      name: 'ledger_created with proper data',
      data: {
        api_key: API_KEY,
        event_type: 'ledger_created',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        entity_type: 'ledger',
        data: {
          guid: `webhook-ledger-${Date.now()}`,
          name: 'Webhook Test Ledger',
          parent: 'Assets',
          opening_balance: 1000
        }
      }
    },
    {
      name: 'voucher_created with proper data',
      data: {
        api_key: API_KEY,
        event_type: 'voucher_created',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        entity_type: 'voucher',
        data: {
          guid: `webhook-voucher-${Date.now()}`,
          voucher_number: 'WEBHOOK-001',
          date: new Date().toISOString().split('T')[0],
          narration: 'Webhook test voucher'
        }
      }
    }
  ];
  
  const results = [];
  
  for (const test of webhookTests) {
    console.log(`\n--- Testing: ${test.name} ---`);
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-webhook-handler`,
        test.data
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        name: test.name,
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        statusCode: 'ERROR',
        message: error.message
      });
    }
  }
  
  return results;
}

// Test bulk import with proper structure
async function testBulkImportProper() {
  console.log('\n🧪 Testing Bulk Import with Proper Structure...');
  console.log('===============================================');
  
  const bulkTests = [
    {
      name: 'Bulk insert with proper data',
      data: {
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        import_type: 'full_sync',
        tables: [
          {
            table_name: 'mst_ledger',
            operation: 'insert',
            data: [
              {
                guid: `bulk-ledger-1-${Date.now()}`,
                name: 'Bulk Test Ledger 1',
                parent: 'Assets'
              },
              {
                guid: `bulk-ledger-2-${Date.now()}`,
                name: 'Bulk Test Ledger 2',
                parent: 'Liabilities'
              }
            ]
          }
        ]
      }
    },
    {
      name: 'Bulk upsert with proper data',
      data: {
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        import_type: 'incremental',
        tables: [
          {
            table_name: 'mst_group',
            operation: 'upsert',
            data: [
              {
                guid: `bulk-group-1-${Date.now()}`,
                name: 'Bulk Test Group 1',
                parent: 'Primary'
              }
            ]
          }
        ]
      }
    }
  ];
  
  const results = [];
  
  for (const test of bulkTests) {
    console.log(`\n--- Testing: ${test.name} ---`);
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-bulk-import`,
        test.data
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        name: test.name,
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        statusCode: 'ERROR',
        message: error.message
      });
    }
  }
  
  return results;
}

// Main test runner
async function runRLSTests() {
  console.log('🚀 Starting Tally API RLS Test Suite');
  console.log('====================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = {
    minimal: false,
    tables: [],
    webhooks: [],
    bulk: []
  };
  
  // Run all tests
  results.minimal = await testMinimalData();
  results.tables = await testTableStructures();
  results.webhooks = await testWebhookWithData();
  results.bulk = await testBulkImportProper();
  
  // Summary
  console.log('\n📊 RLS Test Results Summary');
  console.log('============================');
  
  console.log(`\n🔧 Minimal Data Test: ${results.minimal ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n📋 Table Structure Tests:');
  results.tables.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result.name}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  console.log('\n🔔 Webhook Tests:');
  results.webhooks.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result.name}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  console.log('\n📦 Bulk Import Tests:');
  results.bulk.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result.name}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  // Overall summary
  const totalTests = 1 + results.tables.length + results.webhooks.length + results.bulk.length;
  const passedTests = (results.minimal ? 1 : 0) + 
                     results.tables.filter(r => r.success).length + 
                     results.webhooks.filter(r => r.success).length + 
                     results.bulk.filter(r => r.success).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The API is working perfectly with RLS.');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed! The API is partially working - check failed tests above.');
  } else {
    console.log('❌ All tests failed. There may still be permission or configuration issues.');
  }
}

// Run the tests
runRLSTests().catch(console.error);
