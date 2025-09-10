#!/usr/bin/env node

/**
 * Test Available Tally API Endpoints
 * Discovers what endpoints are actually available
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test known endpoints
async function testKnownEndpoints() {
  console.log('🔍 Testing Known Endpoints...');
  
  const endpoints = [
    'tally-data-ingestion',
    'tally-webhook-handler', 
    'tally-bulk-import',
    'tally-loader',
    'tally-loader-api'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      
      // Test GET
      const getResponse = await makeRequest(`${API_BASE_URL}/${endpoint}`);
      console.log(`  GET: ${getResponse.statusCode} - ${JSON.stringify(getResponse.data)}`);
      
      // Test POST with minimal data
      const postResponse = await makeRequest(`${API_BASE_URL}/${endpoint}`, 'POST', {
        api_key: API_KEY
      });
      console.log(`  POST: ${postResponse.statusCode} - ${JSON.stringify(postResponse.data)}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

// Test if we can create a simple GET endpoint by testing different patterns
async function testGetPatterns() {
  console.log('\n🔍 Testing GET Patterns...');
  
  const patterns = [
    'tally-get-companies',
    'tally-get-ledgers',
    'tally-get-groups',
    'tally-get-stock-items',
    'tally-get-vouchers',
    'tally-get-cost-centers',
    'tally-get-godowns',
    'tally-get-employees',
    'tally-companies',
    'tally-ledgers',
    'tally-groups',
    'tally-stock-items',
    'tally-vouchers',
    'tally-cost-centers',
    'tally-godowns',
    'tally-employees'
  ];

  for (const pattern of patterns) {
    try {
      const response = await makeRequest(`${API_BASE_URL}/${pattern}`);
      if (response.statusCode !== 404) {
        console.log(`  ✅ Found: ${pattern} - ${response.statusCode}`);
        console.log(`    Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      // Ignore errors for 404s
    }
  }
}

// Test if existing endpoints support GET operations
async function testExistingEndpointsWithGet() {
  console.log('\n🔍 Testing Existing Endpoints with GET...');
  
  const companyId = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
  const divisionId = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';
  
  const testCases = [
    {
      endpoint: 'tally-data-ingestion',
      params: `?company_id=${companyId}&division_id=${divisionId}&table_name=mst_ledger&operation=select`
    },
    {
      endpoint: 'tally-bulk-import',
      params: `?company_id=${companyId}&division_id=${divisionId}&table_name=mst_ledger&operation=select`
    },
    {
      endpoint: 'tally-loader',
      params: `?company_id=${companyId}&division_id=${divisionId}&sync_type=incremental`
    },
    {
      endpoint: 'tally-loader-api',
      params: `?company_id=${companyId}&division_id=${divisionId}&sync_type=incremental`
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing ${testCase.endpoint} with GET...`);
      const response = await makeRequest(`${API_BASE_URL}/${testCase.endpoint}${testCase.params}`);
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ GET operation supported!`);
      } else if (response.statusCode === 404) {
        console.log(`  ❌ Endpoint not found`);
      } else {
        console.log(`  ⚠️  Endpoint exists but GET not supported or error occurred`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

// Main execution
async function discoverEndpoints() {
  console.log('🚀 Discovering Available Tally API Endpoints');
  console.log('=============================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    await testKnownEndpoints();
    await testGetPatterns();
    await testExistingEndpointsWithGet();
    
    console.log('\n🎉 Endpoint discovery completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the discovery
discoverEndpoints().catch(console.error);
