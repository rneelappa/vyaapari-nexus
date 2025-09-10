#!/usr/bin/env node

/**
 * Detailed Tally API Endpoints Test Script
 * Tests the production Supabase Edge Functions with proper table names and error handling
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '550e8400-e29b-41d4-a716-446655440000';
const DIVISION_ID = '550e8400-e29b-41d4-a716-446655440001';

// Test different table names that might exist
const TEST_TABLES = [
  'mst_ledger',
  'tally_mst_ledger', 
  'mst_group',
  'tally_mst_group',
  'mst_stock_item',
  'tally_mst_stock_item',
  'trn_voucher',
  'tally_trn_voucher'
];

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

// Test single record with different table names
async function testTableNames() {
  console.log('\n🧪 Testing Different Table Names...');
  console.log('=====================================');
  
  const results = [];
  
  for (const tableName of TEST_TABLES) {
    console.log(`\n--- Testing table: ${tableName} ---`);
    
    const testData = {
      api_key: API_KEY,
      data_type: 'master',
      table_name: tableName,
      operation: 'insert',
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      data: {
        guid: `test-${Date.now()}`,
        name: `Test ${tableName}`,
        parent: 'Test Group'
      }
    };
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-data-ingestion`,
        testData
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        tableName,
        statusCode: response.statusCode,
        success: response.statusCode === 200,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${tableName}:`, error.message);
      results.push({
        tableName,
        statusCode: 'ERROR',
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
}

// Test webhook handler with different event types
async function testWebhookEvents() {
  console.log('\n🧪 Testing Webhook Handler with Different Event Types...');
  console.log('========================================================');
  
  const eventTypes = [
    'ledger_updated',
    'ledger_created', 
    'voucher_created',
    'group_updated',
    'stock_item_created'
  ];
  
  const results = [];
  
  for (const eventType of eventTypes) {
    console.log(`\n--- Testing event type: ${eventType} ---`);
    
    const testData = {
      api_key: API_KEY,
      event_type: eventType,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      data: {
        guid: `webhook-test-${Date.now()}`,
        name: `Webhook Test ${eventType}`,
        value: 1000
      }
    };
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-webhook-handler`,
        testData
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        eventType,
        statusCode: response.statusCode,
        success: response.statusCode === 200,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${eventType}:`, error.message);
      results.push({
        eventType,
        statusCode: 'ERROR',
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
}

// Test bulk import with different operations
async function testBulkOperations() {
  console.log('\n🧪 Testing Bulk Import with Different Operations...');
  console.log('==================================================');
  
  const operations = ['insert', 'upsert', 'replace'];
  const results = [];
  
  for (const operation of operations) {
    console.log(`\n--- Testing bulk operation: ${operation} ---`);
    
    const testData = {
      api_key: API_KEY,
      company_id: COMPANY_ID,
      division_id: DIVISION_ID,
      import_type: 'full_sync',
      tables: [
        {
          table_name: 'mst_ledger',
          operation: operation,
          data: [
            { 
              guid: `bulk-${operation}-1-${Date.now()}`, 
              name: `Bulk Test ${operation} 1`, 
              parent: 'Test Group' 
            },
            { 
              guid: `bulk-${operation}-2-${Date.now()}`, 
              name: `Bulk Test ${operation} 2`, 
              parent: 'Test Group' 
            }
          ]
        }
      ]
    };
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/tally-bulk-import`,
        testData
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        operation,
        statusCode: response.statusCode,
        success: response.statusCode === 200,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${operation}:`, error.message);
      results.push({
        operation,
        statusCode: 'ERROR',
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
}

// Test API endpoint availability
async function testEndpointAvailability() {
  console.log('\n🧪 Testing API Endpoint Availability...');
  console.log('=======================================');
  
  const endpoints = [
    'tally-data-ingestion',
    'tally-webhook-handler', 
    'tally-bulk-import'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing endpoint: ${endpoint} ---`);
    
    // Test with minimal data to check if endpoint exists
    const testData = {
      api_key: API_KEY,
      test: true
    };
    
    try {
      const response = await makeRequest(
        `${API_BASE_URL}/${endpoint}`,
        testData
      );
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        endpoint,
        statusCode: response.statusCode,
        available: response.statusCode !== 404,
        message: response.data.message || 'No message'
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
      results.push({
        endpoint,
        statusCode: 'ERROR',
        available: false,
        message: error.message
      });
    }
  }
  
  return results;
}

// Main test runner
async function runDetailedTests() {
  console.log('🚀 Starting Detailed Tally API Test Suite');
  console.log('==========================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = {
    endpoints: [],
    tables: [],
    webhooks: [],
    bulk: []
  };
  
  // Run all tests
  results.endpoints = await testEndpointAvailability();
  results.tables = await testTableNames();
  results.webhooks = await testWebhookEvents();
  results.bulk = await testBulkOperations();
  
  // Summary
  console.log('\n📊 Detailed Test Results Summary');
  console.log('=================================');
  
  console.log('\n🔗 Endpoint Availability:');
  results.endpoints.forEach(result => {
    const status = result.available ? '✅ AVAILABLE' : '❌ NOT AVAILABLE';
    console.log(`  ${result.endpoint}: ${status} (${result.statusCode})`);
  });
  
  console.log('\n📋 Table Access:');
  results.tables.forEach(result => {
    const status = result.success ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    console.log(`  ${result.tableName}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  console.log('\n🔔 Webhook Events:');
  results.webhooks.forEach(result => {
    const status = result.success ? '✅ WORKING' : '❌ NOT WORKING';
    console.log(`  ${result.eventType}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  console.log('\n📦 Bulk Operations:');
  results.bulk.forEach(result => {
    const status = result.success ? '✅ WORKING' : '❌ NOT WORKING';
    console.log(`  ${result.operation}: ${status} (${result.statusCode}) - ${result.message}`);
  });
  
  // Overall summary
  const totalTests = results.endpoints.length + results.tables.length + results.webhooks.length + results.bulk.length;
  const passedTests = results.endpoints.filter(r => r.available).length + 
                     results.tables.filter(r => r.success).length + 
                     results.webhooks.filter(r => r.success).length + 
                     results.bulk.filter(r => r.success).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The API endpoints are working perfectly.');
  } else {
    console.log('⚠️  Some tests failed. This is expected for a new API - check the detailed results above.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('===================');
  
  const workingTables = results.tables.filter(r => r.success);
  if (workingTables.length > 0) {
    console.log(`✅ Use these working tables: ${workingTables.map(r => r.tableName).join(', ')}`);
  } else {
    console.log('❌ No tables are accessible - check database permissions');
  }
  
  const workingWebhooks = results.webhooks.filter(r => r.success);
  if (workingWebhooks.length > 0) {
    console.log(`✅ Use these working webhook events: ${workingWebhooks.map(r => r.eventType).join(', ')}`);
  } else {
    console.log('❌ No webhook events are working - check webhook handler implementation');
  }
  
  const workingBulk = results.bulk.filter(r => r.success);
  if (workingBulk.length > 0) {
    console.log(`✅ Use these working bulk operations: ${workingBulk.map(r => r.operation).join(', ')}`);
  } else {
    console.log('❌ No bulk operations are working - check bulk import implementation');
  }
}

// Run the tests
runDetailedTests().catch(console.error);
