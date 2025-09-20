#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import fetch from 'node-fetch';

// Configuration
const CONFIG = {
  company_id: process.env.COMPANY_ID || '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id: process.env.DIVISION_ID || '37f3cc0c-58ad-4baf-b309-360116ffc3cd',
  tally_url: process.env.TALLY_URL || 'https://e34014bc0666.ngrok-free.app',
  api_key: process.env.TALLY_API_KEY || 'RAJK22**kjar',
  batch_size: parseInt(process.env.BATCH_SIZE || '5000'),
  yamlPath: './vyaapari360-tally/tally-database-loader/tally-export-config.yaml',
  csvDir: './csv-tally-data'
};

console.log('🔄 Hybrid Tally Sync: CSV Generation + API Import');
console.log(`Company: ${CONFIG.company_id}`);
console.log(`Division: ${CONFIG.division_id}`);
console.log(`Tally URL: ${CONFIG.tally_url}`);
console.log(`Batch size: ${CONFIG.batch_size}`);

// Utility: sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Run the original tally-database-loader to generate CSV files
async function generateCSVFiles() {
  console.log('\n📁 Step 1: Generating CSV files using original tally-database-loader...');
  
  // Change to the tally-database-loader directory
  const originalCwd = process.cwd();
  process.chdir('./vyaapari360-tally/tally-database-loader');
  
  try {
    // Copy the CSV config to be the active config
    fs.copyFileSync('config-csv.json', 'config.json');
    
    // Run the original loader with CSV output
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['dist/index.mjs'], {
        stdio: 'inherit',
        env: {
          ...process.env
        }
      });
      
      child.on('close', (code) => {
        process.chdir(originalCwd);
        if (code === 0) {
          console.log('✅ CSV files generated successfully');
          resolve();
        } else {
          reject(new Error(`Tally loader exited with code ${code}`));
        }
      });
      
      child.on('error', (err) => {
        process.chdir(originalCwd);
        reject(err);
      });
    });
  } catch (err) {
    process.chdir(originalCwd);
    throw err;
  }
}

// Parse CSV file and convert to API format
function parseCSVFile(csvPath, fields) {
  console.log(`  📄 Parsing ${path.basename(csvPath)}...`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  // Skip header row
  const dataLines = lines.slice(1);
  const records = [];
  
  for (const line of dataLines) {
    const cols = line.split('\t');
    const obj = {
      company_id: CONFIG.company_id,
      division_id: CONFIG.division_id
    };
    
    // Map columns to fields based on YAML field definitions
    for (let i = 0; i < Math.min(cols.length, fields.length); i++) {
      let value = cols[i] ?? '';
      if (value === 'ñ') value = '';
      
      const fieldName = fields[i].name;
      const fieldType = fields[i].type;
      
      // Handle different field types
      if (['number', 'amount', 'quantity', 'rate'].includes(fieldType)) {
        const num = parseFloat(value);
        obj[fieldName] = Number.isNaN(num) ? 0 : num;
      } else if (fieldType === 'logical') {
        obj[fieldName] = value === '1' || value === 'true' ? 1 : 0;
      } else if (fieldType === 'date') {
        obj[fieldName] = value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value : null;
      } else {
        obj[fieldName] = value;
      }
    }
    
    // Add required fields with defaults
    if (!obj.guid) obj.guid = `gen-${Date.now().toString(36).substr(-8)}-${Math.random().toString(36).substr(2, 4)}`;
    if (!obj.name) obj.name = 'Unknown';
    
    records.push(obj);
  }
  
  return records;
}

// Import data to Supabase using our APIs
async function bulkImport(tableName, operation, data) {
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    
    try {
      const res = await fetch('https://vyaapari-nexus.supabase.co/functions/v1/tally-bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.api_key}`
        },
        body: JSON.stringify({
          company_id: CONFIG.company_id,
          division_id: CONFIG.division_id,
          tables: [{
            table_name: tableName,
            operation: operation,
            data: data
          }]
        })
      });
      
      if (res.ok) {
        const body = await res.json();
        return body;
      } else {
        const errorText = await res.text();
        console.log(`    Attempt ${attempts} failed: ${res.status} - ${errorText}`);
        if (attempts < 5) {
          await sleep(2000 * attempts);
        }
      }
    } catch (err) {
      console.log(`    Attempt ${attempts} failed: ${err.message}`);
      if (attempts < 5) {
        await sleep(2000 * attempts);
      }
    }
  }
  
  throw new Error(`Failed to import ${tableName} after 5 attempts`);
}

// Process a single table
async function processTable(tableConfig) {
  const tableName = tableConfig.name;
  const csvPath = path.join(CONFIG.csvDir, `${tableName}.data`);
  
  if (!fs.existsSync(csvPath)) {
    console.log(`  ⚠️  CSV file not found: ${csvPath}`);
    return { processed: 0 };
  }
  
  // Parse CSV file
  const records = parseCSVFile(csvPath, tableConfig.fields);
  
  if (records.length === 0) {
    console.log(`  📭 No records found in ${tableName}`);
    return { processed: 0 };
  }
  
  console.log(`  📊 Found ${records.length} records`);
  
  // Import in batches
  let totalProcessed = 0;
  for (let i = 0; i < records.length; i += CONFIG.batch_size) {
    const batch = records.slice(i, i + CONFIG.batch_size);
    console.log(`    📦 Processing batch ${Math.floor(i / CONFIG.batch_size) + 1}/${Math.ceil(records.length / CONFIG.batch_size)} (${batch.length} records)`);
    
    try {
      await bulkImport(tableName, 'replace', batch);
      totalProcessed += batch.length;
    } catch (err) {
      console.error(`    ❌ Batch failed: ${err.message}`);
      throw err;
    }
  }
  
  return { processed: totalProcessed };
}

// Main execution
async function main() {
  try {
    // Step 1: Generate CSV files using original loader
    await generateCSVFiles();
    
    // Step 2: Load YAML configuration
    console.log('\n📋 Step 2: Loading table configurations...');
    const yamlText = fs.readFileSync(CONFIG.yamlPath, 'utf-8');
    const doc = yaml.load(yamlText);
    const masters = Array.isArray(doc.master) ? doc.master : [];
    const transactions = Array.isArray(doc.transaction) ? doc.transaction : [];
    const tables = [...masters, ...transactions];
    
    console.log(`Found ${tables.length} tables to process`);
    
    // Step 3: Process each table
    console.log('\n🔄 Step 3: Importing data to Supabase...');
    const results = [];
    
    for (const tbl of tables) {
      try {
        console.log(`\n→ ${tbl.name}`);
        const r = await processTable(tbl);
        console.log(`   ✅ Processed: ${r.processed}`);
        results.push({ table: tbl.name, processed: r.processed });
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`);
        results.push({ table: tbl.name, processed: 0, error: err.message });
      }
    }
    
    // Step 4: Summary
    console.log('\n📊 Summary');
    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    console.log(`Total records processed: ${totalProcessed}`);
    
    results.forEach(r => {
      if (r.error) {
        console.log(`- ${r.table}: ❌ ${r.error}`);
      } else {
        console.log(`- ${r.table}: ✅ ${r.processed}`);
      }
    });
    
    console.log('\n🎉 Hybrid sync completed!');
    
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();
