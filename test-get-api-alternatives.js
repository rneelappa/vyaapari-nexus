#!/usr/bin/env node

/**
 * Test Alternative GET API Endpoint Patterns
 * Tests various naming conventions and base URLs
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Alternative base URLs to test
const ALTERNATIVE_BASE_URLS = [
  'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v2',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/functions',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/api/v1',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/api',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/tally-api/v1',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/tally-api'
];

// Alternative endpoint patterns to test
const ENDPOINT_PATTERNS = [
  'tally-get-companies',
  'tally-companies',
  'companies',
  'get-companies',
  'tally-get-ledgers',
  'tally-ledgers',
  'ledgers',
  'get-ledgers',
  'tally-get-groups',
  'tally-groups',
  'groups',
  'get-groups',
  'tally-get-stock-items',
  'tally-stock-items',
  'stock-items',
  'get-stock-items',
  'tally-get-vouchers',
  'tally-vouchers',
  'vouchers',
  'get-vouchers'
];

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'ngrok-skip-browser-warning': 'true'
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

// Test alternative base URLs
async function testAlternativeBaseUrls() {
  console.log('🔍 Testing Alternative Base URLs...');
  
  for (const baseUrl of ALTERNATIVE_BASE_URLS) {
    try {
      console.log(`\n📡 Testing base URL: ${baseUrl}`);
      
      // Test a simple endpoint
      const response = await makeRequest(`${baseUrl}/tally-get-companies`);
      
      if (response.statusCode !== 404) {
        console.log(`  ✅ Found working base URL: ${baseUrl}`);
        console.log(`  Status: ${response.statusCode}`);
        console.log(`  Response: ${JSON.stringify(response.data)}`);
        return baseUrl;
      } else {
        console.log(`  ❌ Not found: ${baseUrl}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${baseUrl}: ${error.message}`);
    }
  }
  
  return null;
}

// Test alternative endpoint patterns
async function testEndpointPatterns(baseUrl) {
  console.log(`\n🔍 Testing Endpoint Patterns with ${baseUrl}...`);
  
  const workingEndpoints = [];
  
  for (const pattern of ENDPOINT_PATTERNS) {
    try {
      const response = await makeRequest(`${baseUrl}/${pattern}`);
      
      if (response.statusCode !== 404) {
        console.log(`  ✅ Found working endpoint: ${pattern}`);
        console.log(`    Status: ${response.statusCode}`);
        console.log(`    Response: ${JSON.stringify(response.data)}`);
        workingEndpoints.push(pattern);
      }
    } catch (error) {
      // Ignore errors for 404s
    }
  }
  
  return workingEndpoints;
}

// Test if GET endpoints might be POST endpoints with different parameters
async function testPostAsGet() {
  console.log('\n🔍 Testing if GET endpoints are actually POST endpoints...');
  
  const testCases = [
    {
      endpoint: 'tally-get-companies',
      data: { api_key: API_KEY }
    },
    {
      endpoint: 'tally-get-ledgers',
      data: { 
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID
      }
    },
    {
      endpoint: 'tally-get-groups',
      data: { 
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID
      }
    },
    {
      endpoint: 'tally-get-stock-items',
      data: { 
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID
      }
    },
    {
      endpoint: 'tally-get-vouchers',
      data: { 
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing POST ${testCase.endpoint}...`);
      const response = await makeRequest(
        `${API_BASE_URL}/${testCase.endpoint}`,
        'POST',
        testCase.data
      );
      
      if (response.statusCode !== 404) {
        console.log(`  ✅ Found working POST endpoint: ${testCase.endpoint}`);
        console.log(`  Status: ${response.statusCode}`);
        console.log(`  Response: ${JSON.stringify(response.data)}`);
      } else {
        console.log(`  ❌ Not found: ${testCase.endpoint}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${testCase.endpoint}: ${error.message}`);
    }
  }
}

// Test if there are any other working endpoints
async function testKnownWorkingEndpoints() {
  console.log('\n🔍 Testing Known Working Endpoints...');
  
  const knownEndpoints = [
    'tally-data-ingestion',
    'tally-webhook-handler',
    'tally-bulk-import'
  ];

  for (const endpoint of knownEndpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      
      // Test GET
      const getResponse = await makeRequest(`${API_BASE_URL}/${endpoint}`);
      console.log(`  GET: ${getResponse.statusCode} - ${JSON.stringify(getResponse.data)}`);
      
      // Test POST with minimal data
      const postResponse = await makeRequest(
        `${API_BASE_URL}/${endpoint}`,
        'POST',
        { api_key: API_KEY }
      );
      console.log(`  POST: ${postResponse.statusCode} - ${JSON.stringify(postResponse.data)}`);
      
    } catch (error) {
      console.log(`  ❌ Error with ${endpoint}: ${error.message}`);
    }
  }
}

// Main execution
async function discoverGetApiEndpoints() {
  console.log('🚀 Discovering GET API Endpoints');
  console.log('==================================');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    // Test alternative base URLs
    const workingBaseUrl = await testAlternativeBaseUrls();
    
    if (workingBaseUrl) {
      // Test endpoint patterns with working base URL
      const workingEndpoints = await testEndpointPatterns(workingBaseUrl);
      console.log(`\n✅ Found ${workingEndpoints.length} working endpoints`);
    } else {
      console.log('\n❌ No alternative base URLs found');
    }
    
    // Test if GET endpoints are actually POST endpoints
    await testPostAsGet();
    
    // Test known working endpoints
    await testKnownWorkingEndpoints();
    
    console.log('\n🎉 Endpoint discovery completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the discovery
discoverGetApiEndpoints().catch(console.error);
