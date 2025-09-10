#!/usr/bin/env node

/**
 * Tally Loader API Test Script
 * Tests the new API-based tally loader function
 */

import https from 'https';

// Configuration
const TALLY_LOADER_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-loader-api';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

// Test data
const testRequests = [
  {
    name: 'Full Sync Test',
    data: {
      tallyUrl: 'https://5fcc37ede06a.ngrok-free.app', // Replace with actual Tally URL
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      syncType: 'full',
      apiKey: API_KEY
    }
  },
  {
    name: 'Incremental Sync Test',
    data: {
      tallyUrl: 'https://5fcc37ede06a.ngrok-free.app', // Replace with actual Tally URL
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      syncType: 'incremental',
      fromDate: '2025-01-01',
      toDate: '2025-12-31',
      apiKey: API_KEY
    }
  }
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

// Test the tally loader API
async function testTallyLoaderAPI() {
  console.log('🚀 Starting Tally Loader API Test Suite');
  console.log('=======================================');
  console.log(`Tally Loader URL: ${TALLY_LOADER_URL}`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = [];
  
  for (const test of testRequests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log('========================');
    
    try {
      const response = await makeRequest(TALLY_LOADER_URL, test.data);
      
      console.log(`Status Code: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      results.push({
        name: test.name,
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        message: response.data.message || 'No message',
        data: response.data.data || null
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        statusCode: 'ERROR',
        message: error.message,
        data: null
      });
    }
  }
  
  return results;
}

// Test with mock data (if Tally server is not available)
async function testWithMockData() {
  console.log('\n🧪 Testing with Mock Data');
  console.log('==========================');
  
  const mockData = {
    tallyUrl: 'https://mock-tally-server.com',
    companyId: COMPANY_ID,
    divisionId: DIVISION_ID,
    syncType: 'full',
    apiKey: API_KEY
  };
  
  try {
    const response = await makeRequest(TALLY_LOADER_URL, mockData);
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Mock Data Test',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: response.data.data || null
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Mock Data Test',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Test API endpoint availability
async function testEndpointAvailability() {
  console.log('\n🧪 Testing Endpoint Availability');
  console.log('=================================');
  
  try {
    const response = await makeRequest(TALLY_LOADER_URL, { test: true });
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      name: 'Endpoint Availability',
      success: response.statusCode !== 404,
      statusCode: response.statusCode,
      message: response.data.message || 'No message',
      data: null
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      name: 'Endpoint Availability',
      success: false,
      statusCode: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

// Main test runner
async function runTests() {
  const results = [];
  
  // Test endpoint availability
  results.push(await testEndpointAvailability());
  
  // Test with mock data
  results.push(await testWithMockData());
  
  // Test with real Tally data (if available)
  results.push(...(await testTallyLoaderAPI()));
  
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
    console.log('🎉 All tests passed! The Tally Loader API is working perfectly.');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed! The Tally Loader API is partially working.');
  } else {
    console.log('❌ All tests failed. There may be configuration issues.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('===================');
  
  if (results.some(r => r.name === 'Endpoint Availability' && r.success)) {
    console.log('✅ Tally Loader API endpoint is available');
  } else {
    console.log('❌ Tally Loader API endpoint is not available - check deployment');
  }
  
  if (results.some(r => r.name.includes('Mock Data') && r.success)) {
    console.log('✅ API can handle requests even without Tally server');
  } else {
    console.log('⚠️  API may require a running Tally server');
  }
  
  console.log('\n🔧 To test with real Tally data:');
  console.log('1. Ensure Tally Prime is running with XML server enabled');
  console.log('2. Update the tallyUrl in the test script');
  console.log('3. Run the test again');
}

// Run the tests
runTests().catch(console.error);
