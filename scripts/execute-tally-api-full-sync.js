#!/usr/bin/env node

// Local API-only Tally Full Sync Orchestrator
// - Reads YAML table definitions
// - Generates TDL/XML requests per table
// - Fetches data from Tally (ngrok URL)
// - Parses XML → coerces types
// - Uploads to Supabase via tally-bulk-import (operation: replace)

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import fetch from 'node-fetch';

const API_BASE_URL = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1';

// Config (adjust as needed)
const CONFIG = {
  api_key: process.env.TALLY_API_KEY || 'RAJK22**kjar',
  company_id: process.env.COMPANY_ID || '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id: process.env.DIVISION_ID || '37f3cc0c-58ad-4baf-b309-360116ffc3cd',
  tally_url: process.env.TALLY_URL || 'https://e34014bc0666.ngrok-free.app',
  batchSize: parseInt(process.env.BATCH_SIZE || '5000', 10),
  yamlPath: path.resolve('vyaapari360-tally/tally-database-loader/tally-export-config.yaml')
};

// Utility: sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Generate TDL/XML for a table definition (ultra-simplified to avoid crashes)
function generateXMLfromYAML(tblConfig, substitutions) {
  let retval = '';
  try {
    //XML header
    retval = `<?xml version="1.0" encoding="utf-8"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>TallyDatabaseLoaderReport</ID></HEADER><BODY><DESC><STATICVARIABLES><SVEXPORTFORMAT>XML (Data Interchange)</SVEXPORTFORMAT><SVFROMDATE>{fromDate}</SVFROMDATE><SVTODATE>{toDate}</SVTODATE><SVCURRENTCOMPANY>{targetCompany}</SVCURRENTCOMPANY></STATICVARIABLES><TDL><TDLMESSAGE><REPORT NAME="TallyDatabaseLoaderReport"><FORMS>MyForm</FORMS></REPORT><FORM NAME="MyForm"><PARTS>MyPart01</PARTS></FORM>`;

    // Substitute parameters
    if (substitutions?.fromDate) retval = retval.replace('{fromDate}', substitutions.fromDate);
    if (substitutions?.toDate) retval = retval.replace('{toDate}', substitutions.toDate);
    if (substitutions?.targetCompany) retval = retval.replace('{targetCompany}', substitutions.targetCompany);
    else retval = retval.replace('<SVCURRENTCOMPANY>{targetCompany}</SVCURRENTCOMPANY>', '');

    //Push routes list
    let lstRoutes = tblConfig.collection.split(/\./g);
    let targetCollection = lstRoutes.splice(0, 1);
    lstRoutes.unshift('MyCollection'); //add basic collection level route

    //loop through and append PART XML
    for (let i = 0; i < lstRoutes.length; i++) {
      let xmlPart = formatNumber(i + 1, 'MyPart00');
      let xmlLine = formatNumber(i + 1, 'MyLine00');
      retval += `<PART NAME="${xmlPart}"><LINES>${xmlLine}</LINES><REPEAT>${xmlLine} : ${lstRoutes[i]}</REPEAT><SCROLLED>Vertical</SCROLLED></PART>`;
    }

    //loop through and append LINE XML (except last line which contains field data)
    for (let i = 0; i < lstRoutes.length - 1; i++) {
      let xmlLine = formatNumber(i + 1, 'MyLine00');
      let xmlPart = formatNumber(i + 2, 'MyPart00');
      retval += `<LINE NAME="${xmlLine}"><FIELDS>FldBlank</FIELDS><EXPLODE>${xmlPart}</EXPLODE></LINE>`;
    }

    retval += `<LINE NAME="${formatNumber(lstRoutes.length, 'MyLine00')}">`;
    retval += `<FIELDS>`; //field end

    //Append field declaration list
    for (let i = 0; i < tblConfig.fields.length; i++)
      retval += formatNumber(i + 1, 'Fld00') + ',';
    retval = retval.slice(0, -1); //remove last comma
    retval += `</FIELDS></LINE>`; //End of Field declaration

    //loop through each field
    for (let i = 0; i < tblConfig.fields.length; i++) {
      let fieldXML = `<FIELD NAME="${formatNumber(i + 1, 'Fld00')}">`;
      let iField = tblConfig.fields[i];

      //set field TDL XML expression based on type of data
      if (/^(\.\.)?[a-zA-Z0-9_]+$/g.test(iField.field)) {
        if (iField.type == 'text')
          fieldXML += `<SET>$${iField.field}</SET>`;
        else if (iField.type == 'logical')
          fieldXML += `<SET>if $${iField.field} then 1 else 0</SET>`;
        else if (iField.type == 'date')
          fieldXML += `<SET>if $$IsEmpty:$${iField.field} then $$StrByCharCode:241 else $$PyrlYYYYMMDDFormat:$${iField.field}:"-"</SET>`;
        else if (iField.type == 'number')
          fieldXML += `<SET>if $$IsEmpty:$${iField.field} then "0" else $$String:$${iField.field}</SET>`;
        else if (iField.type == 'amount')
          fieldXML += `<SET>$$StringFindAndReplace:(if $$IsDebit:$${iField.field} then -$$NumValue:$${iField.field} else $$NumValue:$${iField.field}):"(-)":"-"</SET>`;
        else if (iField.type == 'quantity')
          fieldXML += `<SET>$$StringFindAndReplace:(if $$IsInwards:$${iField.field} then $$Number:$$String:$${iField.field}:"TailUnits" else -$$Number:$$String:$${iField.field}:"TailUnits"):"(-)":"-"</SET>`;
        else if (iField.type == 'rate')
          fieldXML += `<SET>if $$IsEmpty:$${iField.field} then 0 else $$Number:$${iField.field}</SET>`;
        else
          fieldXML += `<SET>${iField.field}</SET>`;
      }
      else
        fieldXML += `<SET>${iField.field}</SET>`;

      fieldXML += `<XMLTAG>${formatNumber(i + 1, 'F00')}</XMLTAG>`;
      fieldXML += `</FIELD>`;

      retval += fieldXML;
    }

    retval += `<FIELD NAME="FldBlank"><SET>""</SET></FIELD>`; //Blank Field specification

    //collection
    retval += `<COLLECTION NAME="MyCollection"><TYPE>${targetCollection}</TYPE>`;

    //fetch list
    if (tblConfig.fetch && tblConfig.fetch.length)
      retval += `<FETCH>${tblConfig.fetch.join(',')}</FETCH>`;

    //filter
    if (tblConfig.filters && tblConfig.filters.length) {
      retval += `<FILTER>`;
      for (let j = 0; j < tblConfig.filters.length; j++)
        retval += formatNumber(j + 1, 'Fltr00') + ',';
      retval = retval.slice(0, -1); //remove last comma
      retval += `</FILTER>`;
    }

    retval += `</COLLECTION>`;

    //filter
    if (tblConfig.filters && tblConfig.filters.length)
      for (let j = 0; j < tblConfig.filters.length; j++)
        retval += `<SYSTEM TYPE="Formulae" NAME="${formatNumber(j + 1, 'Fltr00')}">${tblConfig.filters[j]}</SYSTEM>`;

    //XML footer
    retval += `</TDLMESSAGE></TDL></DESC></BODY></ENVELOPE>`;
  } catch (err) {
    console.error('Error generating XML:', err);
  }
  return retval;
}

function formatNumber(num, format) {
  return format.replace('00', num.toString().padStart(2, '0'));
}

// Fetch Tally XML
async function fetchTallyXML(xml) {
  const res = await fetch(CONFIG.tally_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', 'ngrok-skip-browser-warning': 'true' },
    body: xml
  });
  if (!res.ok) throw new Error(`Tally fetch failed: ${res.status}`);
  return res.text();
}

// Minimal TDL output normalization (matching loader behavior)
function normalizeXmlData(txt) {
  let s = txt;
  s = s.replace('<ENVELOPE>', '');
  s = s.replace('</ENVELOPE>', '');
  s = s.replace(/\<FLDBLANK\>\<\/FLDBLANK\>/g, '');
  s = s.replace(/\s+\r\n/g, '');
  s = s.replace(/\r\n/g, '');
  s = s.replace(/\t/g, ' ');
  s = s.replace(/\s+\<F/g, '<F');
  s = s.replace(/\<\/F\d+\>/g, '');
  s = s.replace(/\<F01\>/g, '\r\n');
  s = s.replace(/\<F\d+\>/g, '\t');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&apos;/g, "'");
  s = s.replace(/&tab;/g, '');
  s = s.replace(/&#\d+;/g, '');
  return s;
}

// Parse normalized lines to records (using actual YAML field definitions)
function parseLinesToRecords(content, fields, tableName) {
  // Process the XML output similar to the original tally-database-loader
  let processedContent = content;
  
  // Apply the same processing as the original loader
  processedContent = processedContent.replace('<ENVELOPE>', ''); //Eliminate ENVELOPE TAG
  processedContent = processedContent.replace('</ENVELOPE>', '');
  processedContent = processedContent.replace(/\<FLDBLANK\>\<\/FLDBLANK\>/g, ''); //Eliminate blank tag
  processedContent = processedContent.replace(/\s+\r\n/g, ''); //remove empty lines
  processedContent = processedContent.replace(/\r\n/g, ''); //remove all line breaks
  processedContent = processedContent.replace(/\t/g, ' '); //replace all tabs with a single space
  processedContent = processedContent.replace(/\s+\<F/g, '<F'); //trim left space
  processedContent = processedContent.replace(/\<\/F\d+\>/g, ''); //remove XML end tags
  processedContent = processedContent.replace(/\<F01\>/g, '\r\n'); //append line break to each row start and remove first field XML start tag
  processedContent = processedContent.replace(/\<F\d+\>/g, '\t'); //replace XML start tags with tab separator
  processedContent = processedContent.replace(/&amp;/g, '&'); //escape ampersand
  processedContent = processedContent.replace(/&lt;/g, '<'); //escape less than
  processedContent = processedContent.replace(/&gt;/g, '>'); //escape greater than
  processedContent = processedContent.replace(/&quot;/g, '"'); //escape ampersand
  processedContent = processedContent.replace(/&apos;/g, "'"); //escape ampersand
  processedContent = processedContent.replace(/&tab;/g, ''); //strip out tab if any
  processedContent = processedContent.replace(/&#\d+;/g, ""); //remove all unreadable character escapes

  const lines = processedContent.split(/\r\n/g).filter(Boolean);
  const recs = [];
  
  // Use all fields from the YAML configuration for this table
  const fieldMapping = fields.map(f => f.name);
  
  // Debug: log the field mapping for troubleshooting
  console.log(`  Field mapping for ${tableName}:`, fieldMapping);
  
  for (const line of lines) {
    const cols = line.split(/\t/g);
    const obj = {
      company_id: CONFIG.company_id,
      division_id: CONFIG.division_id
    };
    
    // Map the columns to fields based on YAML field definitions
    for (let i = 0; i < Math.min(cols.length, fieldMapping.length); i++) {
      let v = cols[i] ?? '';
      if (v === 'ñ') v = '';
      
      const fieldName = fieldMapping[i];
      const fieldDef = fields[i];
      
      // Handle different field types based on YAML definition
      if (fieldDef && ['number', 'amount', 'quantity', 'rate'].includes(fieldDef.type)) {
        const n = parseFloat(v);
        obj[fieldName] = Number.isNaN(n) ? 0 : n;
      } else if (fieldDef && fieldDef.type === 'logical') {
        obj[fieldName] = v === '1' || v === 'true' ? 1 : 0;
      } else if (fieldDef && fieldDef.type === 'date') {
        obj[fieldName] = v && /^\d{4}-\d{2}-\d{2}/.test(v) ? v : null;
      } else {
        obj[fieldName] = v;
      }
    }
    
    // Add required fields with defaults
    if (!obj.guid) obj.guid = `gen-${Date.now().toString(36).substr(-8)}-${Math.random().toString(36).substr(2, 4)}`;
    if (!obj.name) obj.name = 'Unknown';
    
    // Add defaults for any missing fields based on their types
    for (let i = 0; i < fieldMapping.length; i++) {
      const fieldName = fieldMapping[i];
      const fieldDef = fields[i];
      
      if (obj[fieldName] === undefined || obj[fieldName] === '' || obj[fieldName] === null) {
        if (fieldDef && ['number', 'amount', 'quantity', 'rate'].includes(fieldDef.type)) {
          obj[fieldName] = 0;
        } else if (fieldDef && fieldDef.type === 'logical') {
          obj[fieldName] = 0;
        } else if (fieldDef && fieldDef.type === 'date') {
          obj[fieldName] = null;
        } else {
          // For text fields, provide meaningful defaults based on field name
          if (fieldName.includes('unit')) {
            obj[fieldName] = 'Nos';
          } else if (fieldName.includes('name') || fieldName.includes('formal')) {
            obj[fieldName] = obj.name || 'Default';
          } else {
            obj[fieldName] = '';
          }
        }
      }
    }
    
    recs.push(obj);
  }
  return recs;
}

async function bulkImport(tableName, operation, data) {
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    const res = await fetch(`${API_BASE_URL}/tally-bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: CONFIG.api_key,
        company_id: CONFIG.company_id,
        division_id: CONFIG.division_id,
        import_type: 'full_sync',
        tables: [
          {
            table_name: tableName,
            operation: operation,
            data: data
          }
        ]
      })
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return body;
    if (res.status === 429 || res.status >= 500) {
      await sleep(500 * attempts);
      continue;
    }
    throw new Error(`Bulk import failed: ${res.status} ${JSON.stringify(body)}`);
  }
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function processTable(tbl) {
  const substitutions = { targetCompany: '' }; // optional: set company name
  const xml = generateXMLfromYAML(tbl, substitutions);
  const raw = await fetchTallyXML(xml);
  const norm = normalizeXmlData(raw);
  const records = parseLinesToRecords(norm, tbl.fields, tbl.name);
  if (!records.length) return { table: tbl.name, processed: 0 };

  let processed = 0;
  for (const batch of chunk(records, CONFIG.batchSize)) {
    const resp = await bulkImport(tbl.name, 'replace', batch);
    processed += batch.length;
  }
  return { table: tbl.name, processed };
}

async function run() {
  console.log('API-only Full Sync Orchestrator (local)');
  console.log(`Company: ${CONFIG.company_id}`);
  console.log(`Division: ${CONFIG.division_id}`);
  console.log(`Batch size: ${CONFIG.batchSize}`);

  const yamlText = fs.readFileSync(CONFIG.yamlPath, 'utf-8');
  const doc = yaml.load(yamlText);
  const masters = Array.isArray(doc.master) ? doc.master : [];
  const transactions = Array.isArray(doc.transaction) ? doc.transaction : [];

  // Order: masters primary/derived, then transactions primary/derived as listed
  const tables = [...masters, ...transactions];

  console.log(`\n📊 Processing ${tables.length} tables using original tally-database-loader approach`);

  const results = [];
  for (const tbl of tables) {
    try {
      console.log(`\n→ ${tbl.name}`);
      const r = await processTable(tbl);
      console.log(`   Processed: ${r.processed}`);
      results.push({ table: tbl.name, processed: r.processed });
    } catch (e) {
      console.log(`   Failed: ${e.message}`);
      results.push({ table: tbl.name, error: e.message });
    }
  }

  console.log('\nSummary');
  for (const r of results) {
    if (r.error) console.log(`- ${r.table}: ❌ ${r.error}`);
    else console.log(`- ${r.table}: ✅ ${r.processed}`);
  }
}

// Do not auto-run to respect "dont execute" instruction when importing this file.
if (process.argv[1] && process.argv[1].endsWith('execute-tally-api-full-sync.js')) {
  run().catch((e) => { console.error(e); process.exit(1); });
}


