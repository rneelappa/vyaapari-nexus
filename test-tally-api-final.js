#!/usr/bin/env node

/**
 * Test Tally API Endpoints - Final Test
 * Tests all available GET methods using the correct tally-api endpoint format
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const TALLY_API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Different Supabase anon keys to test
const SUPABASE_ANON_KEYS = [
  'RAJK22**kjar',
  '9d9fa8ee96a0af96fa29ae1a004a68d2ae62c9d9e0195ac86f647190eb5d9c64'
];

// Utility function to make HTTP requests
function makeRequest(url, data, supabaseAnonKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
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

// Test 1: Get Companies
async function testGetCompanies(supabaseAnonKey) {
  console.log('🏢 Testing GET Companies...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getCompanies',
      filters: {}
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Companies fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} companies`);
      }
    } else {
      console.log(`  ❌ Failed to fetch companies`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 2: Get Ledgers
async function testGetLedgers(supabaseAnonKey) {
  console.log('\n📚 Testing GET Ledgers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getLedgers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 100,
        offset: 0,
        search: ''
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Ledgers fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} ledgers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch ledgers`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 3: Get Groups
async function testGetGroups(supabaseAnonKey) {
  console.log('\n📁 Testing GET Groups...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getGroups',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 100,
        offset: 0,
        search: ''
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Groups fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} groups`);
      }
    } else {
      console.log(`  ❌ Failed to fetch groups`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 4: Get Stock Items
async function testGetStockItems(supabaseAnonKey) {
  console.log('\n📦 Testing GET Stock Items...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getStockItems',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 100,
        offset: 0,
        search: ''
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Stock items fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} stock items`);
      }
    } else {
      console.log(`  ❌ Failed to fetch stock items`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 5: Get Vouchers
async function testGetVouchers(supabaseAnonKey) {
  console.log('\n🧾 Testing GET Vouchers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getVouchers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 100,
        offset: 0,
        search: '',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Vouchers fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} vouchers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch vouchers`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 6: Test with Filters
async function testWithFilters(supabaseAnonKey) {
  console.log('\n🔍 Testing GET with Filters...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getLedgers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 5,
        offset: 0,
        search: 'Cash'
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Filtered ledgers fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} filtered ledgers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch filtered ledgers`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 7: Test with New Company/Division IDs
async function testWithNewIds(supabaseAnonKey) {
  console.log('\n🆕 Testing with New Company/Division IDs...');
  
  const newCompanyId = '629f49fb-983e-4141-8c48-e1423b39e921';
  const newDivisionId = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getLedgers',
      companyId: newCompanyId,
      divisionId: newDivisionId,
      filters: {
        limit: 100,
        offset: 0,
        search: ''
      }
    }, supabaseAnonKey);
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Ledgers with new IDs fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} ledgers with new IDs`);
      }
    } else {
      console.log(`  ❌ Failed to fetch ledgers with new IDs`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Main execution
async function runTallyApiTests() {
  console.log('🚀 Testing Tally API Endpoints - Final Test');
  console.log('===========================================');
  console.log(`Tally API Key: ${TALLY_API_KEY.substring(0, 8)}...`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Base URL: ${API_BASE_URL}`);
  
  for (const supabaseAnonKey of SUPABASE_ANON_KEYS) {
    console.log(`\n🔑 Testing with Supabase Anon Key: ${supabaseAnonKey.substring(0, 8)}...`);
    
    try {
      // Run all tests with this Supabase anon key
      await testGetCompanies(supabaseAnonKey);
      await testGetLedgers(supabaseAnonKey);
      await testGetGroups(supabaseAnonKey);
      await testGetStockItems(supabaseAnonKey);
      await testGetVouchers(supabaseAnonKey);
      await testWithFilters(supabaseAnonKey);
      await testWithNewIds(supabaseAnonKey);
      
      console.log(`\n✅ Completed testing with Supabase anon key: ${supabaseAnonKey.substring(0, 8)}...`);
      
    } catch (error) {
      console.error(`❌ Error testing with Supabase anon key ${supabaseAnonKey.substring(0, 8)}...:`, error.message);
    }
  }
  
  console.log('\n🎉 All Tally API tests completed!');
}

// Run the tests
runTallyApiTests().catch(console.error);
