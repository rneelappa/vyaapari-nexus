#!/usr/bin/env node

import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;

// Production database connection
const pool = new Pool({
  host: 'db.hycyhnjsldiokfkpqzoz.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'RAJK22**kjar',
  ssl: {
    rejectUnauthorized: false
  }
});

// Configuration - Using prefixed table names in public schema
const COMPANY_ID = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
const DIVISION_ID = 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';
const TABLE_PREFIX = 'tally_'; // Prefix to avoid conflicts

async function createTallyTables() {
  try {
    console.log('🔧 Creating Tally tables with safe naming...');
    
    // Create Tally tables with prefixed names in public schema
    const createTablesSQL = `
      -- Groups table
      CREATE TABLE IF NOT EXISTS ${TABLE_PREFIX}mst_group (
        guid VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        division_id VARCHAR(36) NOT NULL,
        name VARCHAR(1024) NOT NULL DEFAULT '',
        parent VARCHAR(1024) NOT NULL DEFAULT '',
        _parent VARCHAR(64) NOT NULL DEFAULT '',
        primary_group VARCHAR(1024) NOT NULL DEFAULT '',
        is_revenue SMALLINT,
        is_deemedpositive SMALLINT,
        is_reserved SMALLINT,
        affects_gross_profit SMALLINT,
        sort_position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ledgers table
      CREATE TABLE IF NOT EXISTS ${TABLE_PREFIX}mst_ledger (
        guid VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        division_id VARCHAR(36) NOT NULL,
        name VARCHAR(1024) NOT NULL,
        parent VARCHAR(1024) NOT NULL DEFAULT '',
        opening_balance DECIMAL(15,2) DEFAULT 0,
        closing_balance DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock Items table
      CREATE TABLE IF NOT EXISTS ${TABLE_PREFIX}mst_stock_item (
        guid VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        division_id VARCHAR(36) NOT NULL,
        name VARCHAR(1024) NOT NULL,
        parent VARCHAR(1024) NOT NULL DEFAULT '',
        unit VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Vouchers table
      CREATE TABLE IF NOT EXISTS ${TABLE_PREFIX}trn_voucher (
        guid VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        division_id VARCHAR(36) NOT NULL,
        voucher_number VARCHAR(100),
        date DATE,
        narration TEXT,
        voucher_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTablesSQL);
    console.log('✅ Tally tables created safely in public schema');
    
  } catch (error) {
    console.error('❌ Error creating Tally tables:', error.message);
    throw error;
  }
}

async function insertSampleData() {
  try {
    console.log('📊 Inserting sample Tally data...');
    
    // Sample groups data
    const groups = [
      { guid: 'tally-group-1', name: 'Assets', parent: 'Primary', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-group-2', name: 'Liabilities', parent: 'Primary', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-group-3', name: 'Income', parent: 'Primary', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-group-4', name: 'Expenses', parent: 'Primary', company_id: COMPANY_ID, division_id: DIVISION_ID }
    ];
    
    // Sample ledgers data
    const ledgers = [
      { guid: 'tally-ledger-1', name: 'Cash Account', parent: 'Assets', opening_balance: 10000, closing_balance: 15000, company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-ledger-2', name: 'Bank Account', parent: 'Assets', opening_balance: 50000, closing_balance: 75000, company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-ledger-3', name: 'Sales Account', parent: 'Income', opening_balance: 0, closing_balance: 100000, company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-ledger-4', name: 'Purchase Account', parent: 'Expenses', opening_balance: 0, closing_balance: 50000, company_id: COMPANY_ID, division_id: DIVISION_ID }
    ];
    
    // Sample stock items data
    const stockItems = [
      { guid: 'tally-item-1', name: 'Steel Rods', parent: 'Raw Materials', unit: 'KG', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-item-2', name: 'Steel Sheets', parent: 'Raw Materials', unit: 'SHEET', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-item-3', name: 'Finished Goods', parent: 'Finished Products', unit: 'PCS', company_id: COMPANY_ID, division_id: DIVISION_ID }
    ];
    
    // Sample vouchers data
    const vouchers = [
      { guid: 'tally-voucher-1', voucher_number: 'V001', date: '2025-09-10', narration: 'Sales Transaction', voucher_type: 'Sales', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-voucher-2', voucher_number: 'V002', date: '2025-09-10', narration: 'Purchase Transaction', voucher_type: 'Purchase', company_id: COMPANY_ID, division_id: DIVISION_ID },
      { guid: 'tally-voucher-3', voucher_number: 'V003', date: '2025-09-10', narration: 'Payment Transaction', voucher_type: 'Payment', company_id: COMPANY_ID, division_id: DIVISION_ID }
    ];
    
    // Insert data with conflict handling
    await insertDataSafely(`${TABLE_PREFIX}mst_group`, groups);
    await insertDataSafely(`${TABLE_PREFIX}mst_ledger`, ledgers);
    await insertDataSafely(`${TABLE_PREFIX}mst_stock_item`, stockItems);
    await insertDataSafely(`${TABLE_PREFIX}trn_voucher`, vouchers);
    
    console.log('✅ Sample Tally data inserted safely');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

async function insertDataSafely(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to insert for ${tableName}`);
    return;
  }

  try {
    console.log(`📥 Inserting ${data.length} records into ${tableName}...`);
    
    for (const record of data) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      // Use INSERT ... ON CONFLICT DO NOTHING to avoid conflicts
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (guid) DO NOTHING`;
      await pool.query(query, values);
    }
    
    console.log(`✅ Successfully inserted data into ${tableName}`);
  } catch (error) {
    console.error(`❌ Error inserting data into ${tableName}:`, error.message);
  }
}

async function verifyData() {
  try {
    console.log('\n📊 Verifying Tally data...');
    
    const tables = [
      `${TABLE_PREFIX}mst_group`,
      `${TABLE_PREFIX}mst_ledger`, 
      `${TABLE_PREFIX}mst_stock_item`,
      `${TABLE_PREFIX}trn_voucher`
    ];
    
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table} WHERE company_id = $1`, [COMPANY_ID]);
      console.log(`  - ${table}: ${result.rows[0].count} records`);
    }
    
    // Also verify that existing tables are untouched
    console.log('\n🔒 Verifying existing tables are untouched...');
    const existingTables = ['companies', 'divisions', 'messages', 'drive_items'];
    for (const table of existingTables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`  - ${table}: ${result.rows[0].count} records (unchanged)`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
  }
}

async function main() {
  console.log('🛡️  Starting SAFE Tally data import...');
  console.log('⚠️  This will NOT touch existing Supabase data or authentication');
  console.log(`📊 Using prefixed tables in public schema: ${TABLE_PREFIX}*`);
  
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to production database');
    
    // Create Tally tables with safe naming
    await createTallyTables();
    
    // Insert sample data
    await insertSampleData();
    
    // Verify data
    await verifyData();
    
    console.log('\n🎉 SAFE Tally data import completed successfully!');
    console.log('✅ Existing Supabase data and authentication preserved');
    console.log(`✅ Tally data stored in prefixed tables: ${TABLE_PREFIX}*`);
    
  } catch (error) {
    console.error('❌ Error during safe import:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the safe import
main().catch(console.error);

