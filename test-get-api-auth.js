#!/usr/bin/env node

/**
 * Test GET API Authentication Methods
 * Tests different authentication approaches for v2 endpoints
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v2';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Different authentication methods to test
const AUTH_METHODS = [
  {
    name: 'apikey header only',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY
    }
  },
  {
    name: 'Authorization Bearer only',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  },
  {
    name: 'Both apikey and Authorization',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    }
  },
  {
    name: 'API key as URL parameter',
    headers: {
      'Content-Type': 'application/json'
    },
    urlSuffix: `?apikey=${API_KEY}`
  },
  {
    name: 'API key as Authorization Bearer in URL',
    headers: {
      'Content-Type': 'application/json'
    },
    urlSuffix: `?authorization=Bearer%20${encodeURIComponent(API_KEY)}`
  }
];

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: headers
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

// Test different authentication methods
async function testAuthMethods() {
  console.log('🔐 Testing Different Authentication Methods...');
  
  for (const authMethod of AUTH_METHODS) {
    try {
      console.log(`\n📡 Testing: ${authMethod.name}`);
      
      const url = `${API_BASE_URL}/tally-get-companies${authMethod.urlSuffix || ''}`;
      const response = await makeRequest(url, 'GET', authMethod.headers);
      
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

// Test if endpoints might need different parameters
async function testWithParameters() {
  console.log('\n🔍 Testing with Different Parameters...');
  
  const testCases = [
    {
      name: 'Basic companies endpoint',
      url: `${API_BASE_URL}/tally-get-companies`,
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY }
    },
    {
      name: 'Companies with company_id',
      url: `${API_BASE_URL}/tally-get-companies?company_id=${COMPANY_ID}`,
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY }
    },
    {
      name: 'Companies with both IDs',
      url: `${API_BASE_URL}/tally-get-companies?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`,
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY }
    },
    {
      name: 'Ledgers endpoint',
      url: `${API_BASE_URL}/tally-get-ledgers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`,
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing: ${testCase.name}`);
      const response = await makeRequest(testCase.url, 'GET', testCase.headers);
      
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

// Test if endpoints might be POST instead of GET
async function testPostEndpoints() {
  console.log('\n🔍 Testing if GET endpoints are actually POST...');
  
  const testCases = [
    {
      name: 'POST tally-get-companies',
      url: `${API_BASE_URL}/tally-get-companies`,
      data: { api_key: API_KEY }
    },
    {
      name: 'POST tally-get-ledgers',
      url: `${API_BASE_URL}/tally-get-ledgers`,
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
        { 
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
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

// Test if we need to use v1 endpoints instead
async function testV1Endpoints() {
  console.log('\n🔍 Testing V1 Endpoints for Comparison...');
  
  const v1BaseUrl = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
  
  try {
    const response = await makeRequest(
      `${v1BaseUrl}/tally-data-ingestion`,
      'POST',
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    );
    
    console.log(`  V1 Status: ${response.statusCode}`);
    console.log(`  V1 Response: ${JSON.stringify(response.data)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ V1 endpoints working with Authorization Bearer`);
    } else {
      console.log(`  ❌ V1 endpoints also failing`);
    }
  } catch (error) {
    console.log(`  ❌ Error with V1: ${error.message}`);
  }
}

// Main execution
async function testGetApiAuthentication() {
  console.log('🚀 Testing GET API Authentication Methods');
  console.log('==========================================');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`Base URL: ${API_BASE_URL}`);
  
  try {
    // Test different authentication methods
    const workingAuth = await testAuthMethods();
    
    if (workingAuth) {
      console.log(`\n🎉 Found working authentication method: ${workingAuth.name}`);
    } else {
      console.log('\n❌ No working authentication method found');
    }
    
    // Test with different parameters
    await testWithParameters();
    
    // Test if endpoints are POST
    await testPostEndpoints();
    
    // Test V1 for comparison
    await testV1Endpoints();
    
    console.log('\n🎉 Authentication testing completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the tests
testGetApiAuthentication().catch(console.error);
