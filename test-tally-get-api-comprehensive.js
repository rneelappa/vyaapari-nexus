#!/usr/bin/env node

/**
 * Comprehensive Test of Tally GET API Endpoints
 * Tests various authentication methods and configurations
 */

import https from 'https';

// Configuration
const API_KEY = '9d9fa8ee96a0af96fa29ae1a004a68d2ae62c9d9e0195ac86f647190eb5d9c64';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Different base URLs to test
const BASE_URLS = [
  'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v2',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/api/v1',
  'https://hycyhnjsldiokfkpqzoz.supabase.co/api/v2'
];

// Different authentication methods to test
const AUTH_METHODS = [
  {
    name: 'apikey header only',
    headers: { 'apikey': API_KEY }
  },
  {
    name: 'Authorization Bearer only',
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  },
  {
    name: 'Both apikey and Authorization',
    headers: { 
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    }
  },
  {
    name: 'X-API-Key header',
    headers: { 'X-API-Key': API_KEY }
  },
  {
    name: 'All headers combined',
    headers: { 
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'X-API-Key': API_KEY
    }
  }
];

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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

    req.end();
  });
}

// Test different base URLs
async function testBaseUrls() {
  console.log('🔍 Testing Different Base URLs...');
  
  for (const baseUrl of BASE_URLS) {
    try {
      console.log(`\n📡 Testing base URL: ${baseUrl}`);
      
      // Test a simple endpoint
      const response = await makeRequest(`${baseUrl}/tally-get-companies`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ SUCCESS with ${baseUrl}!`);
        console.log(`  Response: ${JSON.stringify(response.data)}`);
        return baseUrl;
      } else if (response.statusCode === 401) {
        console.log(`  ❌ Authentication failed with ${baseUrl}`);
      } else if (response.statusCode === 404) {
        console.log(`  ❌ Not found: ${baseUrl}`);
      } else {
        console.log(`  ⚠️  Unexpected response: ${response.statusCode} - ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${baseUrl}: ${error.message}`);
    }
  }
  
  return null;
}

// Test different authentication methods
async function testAuthMethods(baseUrl) {
  console.log(`\n🔐 Testing Authentication Methods with ${baseUrl}...`);
  
  for (const authMethod of AUTH_METHODS) {
    try {
      console.log(`\n📡 Testing: ${authMethod.name}`);
      
      const response = await makeRequest(
        `${baseUrl}/tally-get-companies`,
        'GET',
        authMethod.headers
      );
      
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ SUCCESS with ${authMethod.name}!`);
        return authMethod;
      } else if (response.statusCode === 401) {
        console.log(`  ❌ Authentication failed with ${authMethod.name}`);
      } else {
        console.log(`  ⚠️  Unexpected response with ${authMethod.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${authMethod.name}: ${error.message}`);
    }
  }
  
  return null;
}

// Test different endpoint patterns
async function testEndpointPatterns(baseUrl, authMethod) {
  console.log(`\n🔍 Testing Endpoint Patterns with ${baseUrl}...`);
  
  const endpoints = [
    'tally-get-companies',
    'tally-companies',
    'companies',
    'tally-get-ledgers',
    'tally-ledgers',
    'ledgers'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      const response = await makeRequest(
        `${baseUrl}/${endpoint}`,
        'GET',
        authMethod.headers
      );
      
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ SUCCESS with ${endpoint}!`);
      } else if (response.statusCode === 401) {
        console.log(`  ❌ Authentication failed with ${endpoint}`);
      } else if (response.statusCode === 404) {
        console.log(`  ❌ Not found: ${endpoint}`);
      } else {
        console.log(`  ⚠️  Unexpected response with ${endpoint}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${endpoint}: ${error.message}`);
    }
  }
}

// Test with parameters
async function testWithParameters(baseUrl, authMethod) {
  console.log(`\n🔍 Testing with Parameters...`);
  
  const testCases = [
    {
      name: 'Companies endpoint',
      url: `${baseUrl}/tally-get-companies`
    },
    {
      name: 'Companies with company_id',
      url: `${baseUrl}/tally-get-companies?company_id=${COMPANY_ID}`
    },
    {
      name: 'Companies with both IDs',
      url: `${baseUrl}/tally-get-companies?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    },
    {
      name: 'Ledgers endpoint',
      url: `${baseUrl}/tally-get-ledgers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing: ${testCase.name}`);
      
      const response = await makeRequest(
        testCase.url,
        'GET',
        authMethod.headers
      );
      
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ SUCCESS with ${testCase.name}!`);
      } else if (response.statusCode === 401) {
        console.log(`  ❌ Authentication failed with ${testCase.name}`);
      } else {
        console.log(`  ⚠️  Unexpected response with ${testCase.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${testCase.name}: ${error.message}`);
    }
  }
}

// Test if endpoints are POST instead of GET
async function testPostEndpoints(baseUrl, authMethod) {
  console.log(`\n🔍 Testing if endpoints are POST...`);
  
  const testCases = [
    {
      name: 'POST tally-get-companies',
      url: `${baseUrl}/tally-get-companies`,
      data: { api_key: API_KEY }
    },
    {
      name: 'POST tally-get-ledgers',
      url: `${baseUrl}/tally-get-ledgers`,
      data: { 
        api_key: API_KEY,
        company_id: COMPANY_ID,
        division_id: DIVISION_ID
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing: ${testCase.name}`);
      
      const response = await makeRequest(
        testCase.url,
        'POST',
        authMethod.headers
      );
      
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ SUCCESS with ${testCase.name}!`);
      } else if (response.statusCode === 401) {
        console.log(`  ❌ Authentication failed with ${testCase.name}`);
      } else {
        console.log(`  ⚠️  Unexpected response with ${testCase.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Error with ${testCase.name}: ${error.message}`);
    }
  }
}

// Main execution
async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Tally GET API Test');
  console.log('====================================');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    // Test different base URLs
    const workingBaseUrl = await testBaseUrls();
    
    if (workingBaseUrl) {
      // Test different authentication methods
      const workingAuth = await testAuthMethods(workingBaseUrl);
      
      if (workingAuth) {
        // Test different endpoint patterns
        await testEndpointPatterns(workingBaseUrl, workingAuth);
        
        // Test with parameters
        await testWithParameters(workingBaseUrl, workingAuth);
        
        // Test if endpoints are POST
        await testPostEndpoints(workingBaseUrl, workingAuth);
        
        console.log(`\n🎉 Found working configuration!`);
        console.log(`  Base URL: ${workingBaseUrl}`);
        console.log(`  Auth Method: ${workingAuth.name}`);
      } else {
        console.log(`\n❌ No working authentication method found`);
      }
    } else {
      console.log(`\n❌ No working base URL found`);
    }
    
    console.log('\n🎉 Comprehensive testing completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
