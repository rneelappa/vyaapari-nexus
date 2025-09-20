#!/usr/bin/env node

/**
 * Test Tally GET API Endpoints with Correct Payload Format
 * Tests all available GET methods using POST with proper payload structure
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v2';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Utility function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
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
async function testGetCompanies() {
  console.log('🏢 Testing GET Companies...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-companies`, {
      api_key: API_KEY,
      action: 'getCompanies',
      filters: {}
    });
    
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
async function testGetLedgers() {
  console.log('\n📚 Testing GET Ledgers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-ledgers`, {
      api_key: API_KEY,
      action: 'getLedgers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
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
async function testGetGroups() {
  console.log('\n📁 Testing GET Groups...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-groups`, {
      api_key: API_KEY,
      action: 'getGroups',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
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
async function testGetStockItems() {
  console.log('\n📦 Testing GET Stock Items...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-stock-items`, {
      api_key: API_KEY,
      action: 'getStockItems',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
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
async function testGetVouchers() {
  console.log('\n🧾 Testing GET Vouchers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-vouchers`, {
      api_key: API_KEY,
      action: 'getVouchers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
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

// Test 6: Get Cost Centers
async function testGetCostCenters() {
  console.log('\n🏢 Testing GET Cost Centers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-cost-centers`, {
      api_key: API_KEY,
      action: 'getCostCenters',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Cost centers fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} cost centers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch cost centers`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 7: Get Godowns
async function testGetGodowns() {
  console.log('\n🏪 Testing GET Godowns...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-godowns`, {
      api_key: API_KEY,
      action: 'getGodowns',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Godowns fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} godowns`);
      }
    } else {
      console.log(`  ❌ Failed to fetch godowns`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 8: Get Employees
async function testGetEmployees() {
  console.log('\n👥 Testing GET Employees...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-employees`, {
      api_key: API_KEY,
      action: 'getEmployees',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {}
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Employees fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} employees`);
      }
    } else {
      console.log(`  ❌ Failed to fetch employees`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 9: Test with Filters
async function testWithFilters() {
  console.log('\n🔍 Testing GET with Filters...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-ledgers`, {
      api_key: API_KEY,
      action: 'getLedgers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        search: 'Cash',
        limit: 5
      }
    });
    
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

// Test 10: Test with Date Range
async function testWithDateRange() {
  console.log('\n📅 Testing with Date Range...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-vouchers`, {
      api_key: API_KEY,
      action: 'getVouchers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        limit: 10
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Date-filtered vouchers fetched successfully`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} vouchers in date range`);
      }
    } else {
      console.log(`  ❌ Failed to fetch date-filtered vouchers`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 11: Test with New Company/Division IDs
async function testWithNewIds() {
  console.log('\n🆕 Testing with New Company/Division IDs...');
  
  const newCompanyId = '629f49fb-983e-4141-8c48-e1423b39e921';
  const newDivisionId = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-ledgers`, {
      api_key: API_KEY,
      action: 'getLedgers',
      companyId: newCompanyId,
      divisionId: newDivisionId,
      filters: {}
    });
    
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
async function runGetApiTests() {
  console.log('🚀 Testing Tally GET API Endpoints with Correct Payload Format');
  console.log('================================================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`Base URL: ${API_BASE_URL}`);
  
  try {
    // Run all tests
    await testGetCompanies();
    await testGetLedgers();
    await testGetGroups();
    await testGetStockItems();
    await testGetVouchers();
    await testGetCostCenters();
    await testGetGodowns();
    await testGetEmployees();
    await testWithFilters();
    await testWithDateRange();
    await testWithNewIds();
    
    console.log('\n🎉 All GET API tests completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the tests
runGetApiTests().catch(console.error);
