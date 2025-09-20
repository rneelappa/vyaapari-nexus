#!/usr/bin/env node

/**
 * Test Tally GET API Endpoints - V2 Production
 * Tests all available GET methods for companies, ledgers, groups, etc.
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v2';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1'; // Using working ID
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4'; // Using working ID

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
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

// Test 1: Get Companies
async function testGetCompanies() {
  console.log('🏢 Testing GET Companies...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-get-companies`);
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Companies fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} companies`);
      }
    } else {
      console.log(`  ❌ Failed to fetch companies: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 2: Get Ledgers
async function testGetLedgers() {
  console.log('\n📚 Testing GET Ledgers...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-ledgers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Ledgers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} ledgers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch ledgers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 3: Get Groups
async function testGetGroups() {
  console.log('\n📁 Testing GET Groups...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-groups?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Groups fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} groups`);
      }
    } else {
      console.log(`  ❌ Failed to fetch groups: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 4: Get Stock Items
async function testGetStockItems() {
  console.log('\n📦 Testing GET Stock Items...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-stock-items?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Stock items fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} stock items`);
      }
    } else {
      console.log(`  ❌ Failed to fetch stock items: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 5: Get Vouchers
async function testGetVouchers() {
  console.log('\n🧾 Testing GET Vouchers...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-vouchers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Vouchers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} vouchers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch vouchers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 6: Get Cost Centers
async function testGetCostCenters() {
  console.log('\n🏢 Testing GET Cost Centers...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-cost-centers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Cost centers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} cost centers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch cost centers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 7: Get Godowns
async function testGetGodowns() {
  console.log('\n🏪 Testing GET Godowns...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-godowns?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Godowns fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} godowns`);
      }
    } else {
      console.log(`  ❌ Failed to fetch godowns: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 8: Get Employees
async function testGetEmployees() {
  console.log('\n👥 Testing GET Employees...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-employees?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Employees fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} employees`);
      }
    } else {
      console.log(`  ❌ Failed to fetch employees: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 9: Test with Filters
async function testWithFilters() {
  console.log('\n🔍 Testing GET with Filters...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-ledgers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}&search=Cash&limit=5`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Filtered ledgers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} filtered ledgers`);
      }
    } else {
      console.log(`  ❌ Failed to fetch filtered ledgers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 10: Test Pagination
async function testPagination() {
  console.log('\n📄 Testing Pagination...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-ledgers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}&limit=10&offset=0`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Paginated ledgers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} ledgers (page 1)`);
      }
    } else {
      console.log(`  ❌ Failed to fetch paginated ledgers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 11: Test with Date Range
async function testWithDateRange() {
  console.log('\n📅 Testing with Date Range...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-get-vouchers?company_id=${COMPANY_ID}&division_id=${DIVISION_ID}&dateFrom=2024-01-01&dateTo=2024-12-31&limit=10`
    );
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Date-filtered vouchers fetched successfully`);
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  📈 Found ${response.data.data.length} vouchers in date range`);
      }
    } else {
      console.log(`  ❌ Failed to fetch date-filtered vouchers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Main execution
async function runGetApiTests() {
  console.log('🚀 Testing Tally GET API Endpoints - V2 Production');
  console.log('===================================================');
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
    await testPagination();
    await testWithDateRange();
    
    console.log('\n🎉 All GET API tests completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the tests
runGetApiTests().catch(console.error);
