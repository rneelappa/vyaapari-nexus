#!/usr/bin/env node

/**
 * Full Tally Database Loader with New Company/Division IDs
 * First creates company/division records, then imports Tally data
 */

import https from 'https';

// Configuration
const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';
const API_KEY = 'RAJK22**kjar';
const COMPANY_ID = '629f49fb-983e-4141-8c48-e1423b39e921';
const DIVISION_ID = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
const TALLY_URL = 'https://5fcc37ede06a.ngrok-free.app';

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

// Step 1: Create company record in the correct table
async function createCompanyRecord() {
  console.log('🏢 Creating company record...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-data-ingestion`,
      {
        api_key: API_KEY,
        data_type: 'master',
        table_name: 'companies',
        operation: 'upsert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          id: COMPANY_ID,
          name: 'SKM Steels',
          created_at: new Date().toISOString()
        }
      }
    );
    
    console.log(`Company creation: ${response.statusCode} - ${JSON.stringify(response.data)}`);
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Company creation error: ${error.message}`);
    return false;
  }
}

// Step 2: Create division record in the correct table
async function createDivisionRecord() {
  console.log('🏢 Creating division record...');
  
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/tally-data-ingestion`,
      {
        api_key: API_KEY,
        data_type: 'master',
        table_name: 'divisions',
        operation: 'upsert',
        company_id: COMPANY_ID,
        division_id: DIVISION_ID,
        data: {
          id: DIVISION_ID,
          name: 'SKM Impex Chennai',
          company_id: COMPANY_ID,
          created_at: new Date().toISOString()
        }
      }
    );
    
    console.log(`Division creation: ${response.statusCode} - ${JSON.stringify(response.data)}`);
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Division creation error: ${error.message}`);
    return false;
  }
}

// Step 3: Fetch data from Tally
async function fetchTallyData(tallyUrl, syncType, fromDate, toDate) {
  console.log('🔄 Fetching data from Tally...');
  console.log(`Tally URL: ${tallyUrl}`);
  console.log(`Sync Type: ${syncType}`);
  
  const requests = {
    ledgers: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>ListOfAccounts</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`
  };

  const results = {
    ledgers: []
  };

  // Fetch ledgers from Tally
  try {
    console.log('  📥 Fetching ledgers...');
    
    const response = await fetch(tallyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'ngrok-skip-browser-warning': 'true'
      },
      body: requests.ledgers
    });

    if (response.ok) {
      const xmlData = await response.text()
      const parsedData = parseXmlData(xmlData, 'ledgers')
      results.ledgers = parsedData
      console.log(`  ✅ ledgers: ${parsedData.length} records fetched`);
    } else {
      console.warn(`  ❌ Failed to fetch ledgers from Tally: ${response.status}`);
    }
  } catch (error) {
    console.warn(`  ❌ Error fetching ledgers from Tally: ${error.message}`);
  }

  return results;
}

// Parse XML data from Tally
function parseXmlData(xmlData, dataType) {
  const data = [];
  
  try {
    if (dataType === 'ledgers') {
      const ledgerMatches = xmlData.match(/<LEDGER[^>]*>[\s\S]*?<\/LEDGER>/g) || [];
      ledgerMatches.forEach((ledgerXml, index) => {
        const nameMatch = ledgerXml.match(/<NAME[^>]*>([^<]*)<\/NAME>/);
        const parentMatch = ledgerXml.match(/<PARENT[^>]*>([^<]*)<\/PARENT>/);
        const openingMatch = ledgerXml.match(/<OPENINGBALANCE[^>]*>([^<]*)<\/OPENINGBALANCE>/);
        const closingMatch = ledgerXml.match(/<CLOSINGBALANCE[^>]*>([^<]*)<\/CLOSINGBALANCE>/);
        
        if (nameMatch) {
          data.push({
            guid: `tally-ledger-${Date.now()}-${index}`,
            name: nameMatch[1] || '',
            parent: parentMatch ? parentMatch[1] : '',
            opening_balance: openingMatch ? parseFloat(openingMatch[1]) || 0 : 0,
            closing_balance: closingMatch ? parseFloat(closingMatch[1]) || 0 : 0
          });
        }
      });
    }
  } catch (error) {
    console.error(`Error parsing ${dataType} data:`, error);
  }

  return data;
}

// Step 4: Import data using API endpoints
async function importTallyDataViaAPI(tallyData, companyId, divisionId, apiKey) {
  console.log('🔄 Importing data via API endpoints...');
  
  const results = {
    ledgers: 0,
    errors: []
  };

  // Import ledgers
  if (tallyData.ledgers.length > 0) {
    try {
      console.log('  📤 Importing ledgers...');
      
      const response = await makeRequest(
        `${API_BASE_URL}/tally-bulk-import`,
        {
          api_key: apiKey,
          company_id: companyId,
          division_id: divisionId,
          import_type: 'full_sync',
          tables: [
            {
              table_name: 'mst_ledger',
              operation: 'replace',
              data: tallyData.ledgers
            }
          ]
        }
      );

      if (response.statusCode === 200 && response.data.success) {
        results.ledgers = response.data.total_processed || 0;
        console.log(`  ✅ Ledgers imported: ${response.data.total_processed} records`);
      } else {
        results.errors.push(`Ledgers import failed: ${response.data.message}`);
        console.log(`  ❌ Ledgers import failed: ${response.data.message}`);
      }
    } catch (error) {
      results.errors.push(`Ledgers import error: ${error.message}`);
      console.log(`  ❌ Ledgers import error: ${error.message}`);
    }
  }

  return results;
}

// Main execution
async function runFullTallyLoaderWithNewIds() {
  console.log('🚀 Starting Full Tally Database Loader with New Company/Division IDs');
  console.log('==================================================================');
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Division ID: ${DIVISION_ID}`);
  console.log(`Tally URL: ${TALLY_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    // Step 1: Create company and division records
    console.log('\n📋 Step 1: Creating company and division records...');
    const companyCreated = await createCompanyRecord();
    const divisionCreated = await createDivisionRecord();
    
    if (!companyCreated || !divisionCreated) {
      console.log('❌ Failed to create company/division records. Proceeding anyway...');
    }
    
    // Step 2: Fetch data from Tally
    console.log('\n📋 Step 2: Fetching data from Tally...');
    const tallyData = await fetchTallyData(TALLY_URL, 'full', null, null);
    
    console.log('\n📊 Data Summary:');
    console.log(`  Ledgers: ${tallyData.ledgers.length}`);
    
    // Step 3: Import data via API
    console.log('\n📋 Step 3: Importing data via API...');
    const importResults = await importTallyDataViaAPI(
      tallyData, 
      COMPANY_ID, 
      DIVISION_ID, 
      API_KEY
    );
    
    // Step 4: Summary
    console.log('\n📈 Import Results:');
    console.log(`  Ledgers: ${importResults.ledgers} imported`);
    
    if (importResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      importResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const totalImported = importResults.ledgers;
    console.log(`\n🎉 Total records imported: ${totalImported}`);
    
    if (importResults.errors.length === 0) {
      console.log('✅ Full Tally database loader completed successfully!');
    } else {
      console.log('⚠️  Full Tally database loader completed with some errors.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the full tally loader
runFullTallyLoaderWithNewIds().catch(console.error);
