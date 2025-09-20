#!/usr/bin/env node

/**
 * Tally Loader Test with New Company/Division IDs
 * Tests the API with the specified company and division IDs
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

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

// Test 1: Create company record first
async function testCreateCompany() {
  console.log('🧪 Testing Company Creation');
  console.log('===========================');
  
  const testData = {
    api_key: API_KEY,
    data_type: 'master',
    table_name: 'mst_company',
    operation: 'insert',
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    data: {
      guid: COMPANY_ID,
      name: 'Test Company for Tally Loader',
      address: 'Test Address',
      phone: '1234567890',
      email: 'test@company.com'
    }
  };
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-data-ingestion`,
      testData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Company Creation',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message'
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Company Creation',
      success: false,
      statusCode: 'ERROR',
      message: error.message
    };
  }
}

// Test 2: Create division record
async function testCreateDivision() {
  console.log('\n🧪 Testing Division Creation');
  console.log('============================');
  
  const testData = {
    api_key: API_KEY,
    data_type: 'master',
    table_name: 'mst_division',
    operation: 'insert',
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    data: {
      guid: DIVISION_ID,
      name: 'Test Division for Tally Loader',
      company_id: COMPANY_ID,
      address: 'Test Division Address'
    }
  };
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-data-ingestion`,
      testData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Division Creation',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message'
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Division Creation',
      success: false,
      statusCode: 'ERROR',
      message: error.message
    };
  }
}

// Test 3: Test bulk import with new company/division
async function testBulkImportWithNewCompany() {
  console.log('\n🧪 Testing Bulk Import with New Company/Division');
  console.log('================================================');
  
  const testData = {
    api_key: API_KEY,
    company_id: COMPANY_ID,
    division_id: DIVISION_ID,
    import_type: 'full_sync',
    tables: [
      {
        table_name: 'mst_group',
        operation: 'replace',
        data: [
          {
            guid: 'test-group-new-company-1',
            name: 'Assets - New Company',
            parent: 'Primary',
            _parent: 'Primary',
            primary_group: '',
            is_revenue: 0,
            is_deemedpositive: 1,
            is_reserved: 0,
            affects_gross_profit: 0,
            sort_position: 1
          }
        ]
      },
      {
        table_name: 'mst_ledger',
        operation: 'replace',
        data: [
          {
            guid: 'test-ledger-new-company-1',
            name: 'Cash Account - New Company',
            parent: 'Assets - New Company',
            opening_balance: 1000,
            closing_balance: 1500
          },
          {
            guid: 'test-ledger-new-company-2',
            name: 'Bank Account - New Company',
            parent: 'Assets - New Company',
            opening_balance: 5000,
            closing_balance: 7500
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
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Bulk Import with New Company',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Bulk Import with New Company',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Test 4: Test tally loader API (if it exists)
async function testTallyLoaderAPI() {
  console.log('\n🧪 Testing Tally Loader API');
  console.log('============================');
  
  const testData = {
    tallyUrl: 'https://mock-tally-server.com',
    companyId: COMPANY_ID,
    divisionId: DIVISION_ID,
    syncType: 'full',
    apiKey: API_KEY
  };
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-loader-api`,
      testData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Tally Loader API',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Tally Loader API',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Tally Loader Test with New Company/Division');
  console.log('=======================================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = [];
  
  // Run all tests
  results.push(await testCreateCompany());
  results.push(await testCreateDivision());
  results.push(await testBulkImportWithNewCompany());
  results.push(await testTallyLoaderAPI());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
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
    console.log('🎉 All tests passed! Tally loader is working with new company/division.');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed! Tally loader is partially working.');
  } else {
    console.log('❌ All tests failed. There may be configuration issues.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('===================');
  
  const companyTest = results.find(r => r.name === 'Company Creation');
  if (companyTest && companyTest.success) {
    console.log('✅ Company record created successfully');
  } else {
    console.log('❌ Company record creation failed - check company table schema');
  }
  
  const divisionTest = results.find(r => r.name === 'Division Creation');
  if (divisionTest && divisionTest.success) {
    console.log('✅ Division record created successfully');
  } else {
    console.log('❌ Division record creation failed - check division table schema');
  }
  
  const bulkTest = results.find(r => r.name === 'Bulk Import with New Company');
  if (bulkTest && bulkTest.success) {
    console.log('✅ Bulk import working with new company/division');
  } else {
    console.log('❌ Bulk import failed - check foreign key constraints');
  }
  
  const loaderTest = results.find(r => r.name === 'Tally Loader API');
  if (loaderTest && loaderTest.success) {
    console.log('✅ Tally Loader API working');
  } else {
    console.log('❌ Tally Loader API not available - needs deployment');
  }
}

// Run the tests
runTests().catch(console.error);
