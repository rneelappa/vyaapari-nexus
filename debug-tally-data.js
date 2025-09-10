#!/usr/bin/env node

/**
 * Debug Tally Data Parsing
 * Check what data is being parsed from Tally XML
 */

import https from 'https';

const TALLY_URL = 'https://5fcc37ede06a.ngrok-free.app';

// Function to fetch data from Tally
async function fetchTallyData(reportId, reportName) {
  console.log(`📥 Fetching ${reportName} from Tally...`);
  
  try {
    const response = await fetch(TALLY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'ngrok-skip-browser-warning': 'true'
      },
      body: `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>${reportId}</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${reportName}: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(`  ✅ Fetched ${xmlData.length} characters`);
    return xmlData;
  } catch (error) {
    console.log(`  ❌ Error fetching ${reportName}: ${error.message}`);
    return null;
  }
}

// Function to debug XML parsing
function debugXmlParsing(xmlData, recordTag, fields) {
  console.log(`\n🔍 Debugging ${recordTag} parsing...`);
  
  const regex = new RegExp(`<${recordTag}[^>]*>[\\s\\S]*?<\\/${recordTag}>`, 'g');
  const matches = xmlData.match(regex) || [];
  
  console.log(`  📊 Found ${matches.length} ${recordTag.toLowerCase()} records`);
  
  if (matches.length > 0) {
    // Show first 3 records for debugging
    for (let i = 0; i < Math.min(3, matches.length); i++) {
      console.log(`\n  📋 Record ${i + 1}:`);
      console.log(`  Raw XML: ${matches[i].substring(0, 200)}...`);
      
      const record = {};
      for (const field of fields) {
        const fieldRegex = new RegExp(`<${field.xmlTag}[^>]*>([^<]*)<\\/${field.xmlTag}>`, 'i');
        const fieldMatch = matches[i].match(fieldRegex);
        const value = fieldMatch ? fieldMatch[1] : (field.defaultValue || '');
        record[field.dbField] = value;
        console.log(`    ${field.dbField}: "${value}" (type: ${typeof value})`);
      }
      
      console.log(`  Parsed record:`, record);
    }
  }
  
  return matches.length;
}

async function debugTallyData() {
  console.log('🔍 Debugging Tally Data Parsing');
  console.log('================================');
  
  try {
    // Debug Ledgers
    const ledgerXml = await fetchTallyData('ListOfAccounts', 'Ledgers');
    if (ledgerXml) {
      const ledgerFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Assets' },
        { xmlTag: 'OPENINGBALANCE', dbField: 'opening_balance', defaultValue: 0 },
        { xmlTag: 'CLOSINGBALANCE', dbField: 'closing_balance', defaultValue: 0 },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      debugXmlParsing(ledgerXml, 'LEDGER', ledgerFields);
    }
    
    // Debug Groups
    const groupXml = await fetchTallyData('ListOfGroups', 'Groups');
    if (groupXml) {
      const groupFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Assets' },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      debugXmlParsing(groupXml, 'GROUP', groupFields);
    }
    
    // Debug Stock Items
    const stockXml = await fetchTallyData('ListOfStockItems', 'Stock Items');
    if (stockXml) {
      const stockFields = [
        { xmlTag: 'NAME', dbField: 'name', defaultValue: '' },
        { xmlTag: 'PARENT', dbField: 'parent', defaultValue: 'Stock Items' },
        { xmlTag: 'BASEUNIT', dbField: 'base_unit', defaultValue: 'Nos' },
        { xmlTag: 'OPENINGBALANCE', dbField: 'opening_balance', defaultValue: 0 },
        { xmlTag: 'CLOSINGBALANCE', dbField: 'closing_balance', defaultValue: 0 },
        { xmlTag: 'GUID', dbField: 'guid', defaultValue: '' }
      ];
      
      debugXmlParsing(stockXml, 'STOCKITEM', stockFields);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the debug
debugTallyData().catch(console.error);
