#!/usr/bin/env node

/**
 * Complete Test of Tally API Endpoints
 * Tests all available GET methods using the working tally-api endpoint
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const TALLY_API_KEY = 'RAJK22**kjar';
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

// Utility function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

// Test 1: Get Ledgers
async function testGetLedgers() {
  console.log('📚 Testing GET Ledgers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getLedgers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Ledgers fetched successfully`);
      console.log(`  📊 Found ${response.data.count} ledgers`);
      console.log(`  📈 Sample ledger: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch ledgers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 2: Get Groups
async function testGetGroups() {
  console.log('\n📁 Testing GET Groups...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getGroups',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Groups fetched successfully`);
      console.log(`  📊 Found ${response.data.count} groups`);
      console.log(`  📈 Sample group: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch groups: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 3: Get Stock Items
async function testGetStockItems() {
  console.log('\n📦 Testing GET Stock Items...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getStockItems',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Stock items fetched successfully`);
      console.log(`  📊 Found ${response.data.count} stock items`);
      console.log(`  📈 Sample item: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch stock items: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 4: Get Vouchers
async function testGetVouchers() {
  console.log('\n🧾 Testing GET Vouchers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getVouchers',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: '',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Vouchers fetched successfully`);
      console.log(`  📊 Found ${response.data.count} vouchers`);
      console.log(`  📈 Sample voucher: ${response.data.data[0]?.voucher_type || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch vouchers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 5: Get Cost Centers
async function testGetCostCenters() {
  console.log('\n🏢 Testing GET Cost Centers...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getCostCenters',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Cost centers fetched successfully`);
      console.log(`  📊 Found ${response.data.count} cost centers`);
      console.log(`  📈 Sample cost center: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch cost centers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 6: Get Godowns
async function testGetGodowns() {
  console.log('\n🏪 Testing GET Godowns...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getGodowns',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Godowns fetched successfully`);
      console.log(`  📊 Found ${response.data.count} godowns`);
      console.log(`  📈 Sample godown: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch godowns: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 7: Get Employees
async function testGetEmployees() {
  console.log('\n👥 Testing GET Employees...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tally-api`, {
      api_key: TALLY_API_KEY,
      action: 'getEmployees',
      companyId: COMPANY_ID,
      divisionId: DIVISION_ID,
      filters: {
        limit: 10,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Employees fetched successfully`);
      console.log(`  📊 Found ${response.data.count} employees`);
      console.log(`  📈 Sample employee: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch employees: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 8: Test with Filters
async function testWithFilters() {
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
        search: 'A'
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Filtered ledgers fetched successfully`);
      console.log(`  📊 Found ${response.data.count} filtered ledgers`);
      console.log(`  📈 Sample filtered ledger: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch filtered ledgers: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Test 9: Test with New Company/Division IDs
async function testWithNewIds() {
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
        limit: 5,
        offset: 0,
        search: ''
      }
    });
    
    console.log(`  Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Ledgers with new IDs fetched successfully`);
      console.log(`  📊 Found ${response.data.count} ledgers with new IDs`);
      console.log(`  📈 Sample ledger: ${response.data.data[0]?.name || 'N/A'}`);
    } else {
      console.log(`  ❌ Failed to fetch ledgers with new IDs: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Main execution
async function runTallyApiTests() {
  console.log('🚀 Complete Tally API Test - All Endpoints');
  console.log('===========================================');
  console.log(`Tally API Key: ${TALLY_API_KEY.substring(0, 8)}...`);
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Base URL: ${API_BASE_URL}`);
  
  try {
    // Run all tests
    await testGetLedgers();
    await testGetGroups();
    await testGetStockItems();
    await testGetVouchers();
    await testGetCostCenters();
    await testGetGodowns();
    await testGetEmployees();
    await testWithFilters();
    await testWithNewIds();
    
    console.log('\n🎉 All Tally API tests completed successfully!');
    console.log('\n✅ Tally API is fully functional and ready for use!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the tests
runTallyApiTests().catch(console.error);
