import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncJobDetail {
  job_id: string;
  table_name: string;
  operation: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records_processed: number;
  records_inserted: number;
  records_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

interface TableMapping {
  apiTable: string;
  supabaseTable: string;
  endpoint: string;
  keyField: string;
  columnWhitelist?: string[];
}

const TABLE_MAPPINGS: TableMapping[] = [
  { 
    apiTable: 'groups', 
    supabaseTable: 'mst_group', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'primary_group', 'is_revenue', 'affects_gross_profit', 'is_reserved', 'is_deemedpositive', 'sort_position', 'alterid', 'company_id', 'division_id']
  },
  { 
    apiTable: 'ledgers', 
    supabaseTable: 'mst_ledger', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'alias', 'description', 'notes', 'mailing_name', 'mailing_address', 'mailing_state', 'mailing_country', 'mailing_pincode', 'email', 'it_pan', 'gstn', 'gst_registration_type', 'gst_supply_type', 'gst_duty_head', 'opening_balance', 'closing_balance', 'is_revenue', 'is_deemedpositive', 'tax_rate', 'credit_limit', 'credit_days', 'bill_credit_period', 'bill_credit_limit', 'bank_account_holder', 'bank_account_number', 'bank_ifsc', 'bank_swift', 'bank_name', 'bank_branch', 'income_tax_number', 'sales_tax_number', 'excise_registration_number', 'service_tax_number', 'buyer_type', 'buyer_category', 'ledger_contact', 'ledger_mobile', 'ledger_fax', 'ledger_website', 'company_id', 'division_id', 'alterid']
  },
  { 
    apiTable: 'stock_items', 
    supabaseTable: 'mst_stock_item', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'alias', 'description', 'notes', 'part_number', 'uom', '_uom', 'alternate_uom', '_alternate_uom', 'costing_method', 'opening_balance', 'opening_rate', 'opening_value', 'closing_balance', 'closing_rate', 'closing_value', 'reorder_level', 'minimum_level', 'maximum_level', 'conversion', 'gst_rate', 'gst_type_of_supply', 'gst_hsn_code', 'gst_hsn_description', 'gst_taxability', 'weight', 'weight_unit', 'volume', 'volume_unit', 'shelf_life_days', 'item_category', 'item_classification', 'manufacturer', 'brand', 'model', 'size', 'color', 'base_units', 'additional_units', 'company_id', 'division_id']
  },
  { 
    apiTable: 'voucher_types', 
    supabaseTable: 'mst_vouchertype', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'numbering_method', 'affects_stock', 'is_deemedpositive', 'company_id', 'division_id']
  },
  { 
    apiTable: 'cost_centers', 
    supabaseTable: 'mst_cost_centre', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'category', 'company_id', 'division_id']
  },
  { 
    apiTable: 'godowns', 
    supabaseTable: 'mst_godown', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'parent', '_parent', 'address', 'storage_type', 'capacity', 'capacity_unit', 'godown_type', 'location_code', 'manager_name', 'contact_number', 'company_id', 'division_id']
  },
  { 
    apiTable: 'uoms', 
    supabaseTable: 'mst_uom', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'name', 'formalname', 'is_simple_unit', 'base_units', 'additional_units', 'conversion', 'company_id', 'division_id']
  },
  { 
    apiTable: 'vouchers', 
    supabaseTable: 'tally_trn_voucher', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'voucher_type', 'voucher_number', 'voucher_number_prefix', 'voucher_number_suffix', 'date', 'due_date', 'narration', 'reference', 'party_ledger_name', 'basic_amount', 'discount_amount', 'tax_amount', 'net_amount', 'total_amount', 'final_amount', 'currency', 'exchange_rate', 'order_reference', 'receipt_reference', 'consignment_note', 'is_optional', 'is_cancelled', 'persistedview', 'altered_by', 'altered_on', 'alterid', 'company_id', 'division_id']
  },
  { 
    apiTable: 'accounting_entries', 
    supabaseTable: 'trn_accounting', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'ledger', '_ledger', 'amount', 'amount_forex', 'amount_cleared', 'currency', 'voucher_guid', 'voucher_type', 'voucher_number', 'voucher_date', 'cost_centre', 'cost_category', 'bill_allocations', 'is_deemed_positive', 'is_party_ledger', 'alterid', 'company_id', 'division_id']
  },
  { 
    apiTable: 'inventory_entries', 
    supabaseTable: 'trn_inventory', 
    endpoint: '/api/v1/query', 
    keyField: 'guid',
    columnWhitelist: ['guid', 'voucher_guid', 'voucher_type', 'voucher_number', 'voucher_date', 'item', '_item', 'godown', '_godown', 'quantity', 'rate', 'amount', 'actual_quantity', 'billed_quantity', 'tracking_number', 'order_reference', 'company_id', 'division_id']
  }
];

const RAILWAY_BASE_URL = 'https://tally-sync-vyaapari360-railway-production.up.railway.app';

async function validateUUID(uuid: string): Promise<boolean> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Enhanced response parsing function
function extractRecords(responseData: any, tableName: string): any[] {
  // Railway SQLite returns data directly as array
  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }
  
  // Fallback formats
  if (responseData.records) return responseData.records;
  if (responseData.data?.records) return responseData.data.records;
  if (Array.isArray(responseData)) return responseData;
  
  // Diagnostic logging for debugging
  console.log(`⚠️ Unexpected response format for ${tableName}:`, {
    keys: Object.keys(responseData),
    hasData: !!responseData.data,
    dataType: typeof responseData.data,
    isArray: Array.isArray(responseData.data),
    preview: JSON.stringify(responseData).substring(0, 200)
  });
  
  return [];
}

// Enhanced query function for Railway API
async function queryRailwayAPI(
  endpoint: string,
  companyId: string,
  divisionId: string,
  table: string,
  filters: any = {},
  limit: number = 50000,  // Increased limit to handle more records
  offset: number = 0
): Promise<any[]> {
  try {
    const railwayApiKey = Deno.env.get('RAILWAY_API_KEY');
    const queryUrl = `${RAILWAY_BASE_URL}/api/v1/query/${companyId}/${divisionId}`;
    
    console.log(`[Railway API] Querying ${table} from: ${queryUrl} (limit: ${limit}, offset: ${offset})`);

    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(railwayApiKey && { 'Authorization': `Bearer ${railwayApiKey}` })
      },
      body: JSON.stringify({
        table: table,
        filters: filters,
        limit: limit,
        offset: offset
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'API request failed');
    }

    // Railway returns data directly as array
    const records = extractRecords(responseData, table);
    console.log(`[Railway API] Retrieved ${records.length} records for ${table}`);
    
    return records;
    
  } catch (error) {
    console.error(`[Railway API] Error querying ${table}:`, error);
    throw error;
  }
}

// Batch processing for large tables to prevent memory issues
async function processBatchedSync(
  supabase: any,
  tableMapping: any,
  companyId: string,
  divisionId: string,
  jobId: string,
  batchSize: number = 1000
): Promise<any> {
  console.log(`[Job ${jobId}] Starting batched sync for ${tableMapping.supabaseTable} (${tableMapping.apiTable})`);
  
  let offset = 0;
  let totalRecords = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  let batchNumber = 1;
  
  while (true) {
    console.log(`[Job ${jobId}] Processing batch ${batchNumber} for ${tableMapping.apiTable} (offset: ${offset})`);
    
    try {
      // Fetch one batch of records
      const records = await queryRailwayAPI(
        tableMapping.endpoint,
        companyId,
        divisionId,
        tableMapping.apiTable,
        {}, // filters
        batchSize,
        offset
      );
      
      if (records.length === 0) {
        console.log(`[Job ${jobId}] No more records found for ${tableMapping.apiTable}, completed batched sync`);
        break;
      }
      
      console.log(`[Job ${jobId}] Batch ${batchNumber}: Retrieved ${records.length} records for ${tableMapping.apiTable}`);
      
      // Immediately process this batch
      const syncResult = await bulkSyncToSupabase(
        supabase,
        tableMapping.supabaseTable,
        records,
        companyId,
        divisionId,
        tableMapping.keyField,
        tableMapping.columnWhitelist
      );
      
      // Accumulate results
      totalRecords += records.length;
      totalInserted += syncResult.inserted;
      totalUpdated += syncResult.updated;
      totalErrors += syncResult.errors;
      
      console.log(`[Job ${jobId}] Batch ${batchNumber} completed: ${records.length} fetched, ${syncResult.inserted} inserted, ${syncResult.updated} updated, ${syncResult.errors} errors`);
      
      // Move to next batch
      offset += records.length;
      batchNumber++;
      
      // Break if we got fewer records than batch size (last page)
      if (records.length < batchSize) {
        console.log(`[Job ${jobId}] Last batch processed for ${tableMapping.apiTable} (${records.length} < ${batchSize})`);
        break;
      }
      
    } catch (error) {
      console.error(`[Job ${jobId}] Error processing batch ${batchNumber} for ${tableMapping.apiTable}:`, error);
      totalErrors++;
      break;
    }
  }
  
  console.log(`[Job ${jobId}] Batched sync completed for ${tableMapping.supabaseTable}: ${totalRecords} total records, ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);
  
  return {
    table: tableMapping.supabaseTable,
    api_table: tableMapping.apiTable,
    records_fetched: totalRecords,
    records_inserted: totalInserted,
    records_updated: totalUpdated,
    errors: totalErrors,
    status: totalErrors > 0 ? 'failed' : 'success',
    batches_processed: batchNumber - 1
  };
}

// Legacy pagination support for compatibility (deprecated - use processBatchedSync instead)
async function queryWithPagination(
  companyId: string,
  divisionId: string,
  table: string,
  batchSize: number = 1000
): Promise<any[]> {
  let allRecords: any[] = [];
  let offset = 0;
  
  while (true) {
    const records = await queryRailwayAPI(
      '/api/v1/query',
      companyId,
      divisionId,
      table,
      {}, // filters
      batchSize,
      offset
    );
    
    if (records.length === 0) break;
    
    allRecords.push(...records);
    offset += records.length;
    
    console.log(`[Railway API] Fetched ${records.length} ${table} records (total: ${allRecords.length})`);
    
    if (records.length < batchSize) break; // Last page
  }
  
  return allRecords;
}

function normalizeRecord(record: any, tableName: string): any {
  const normalized = { ...record };

  // General string field cleanup
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      // Trim whitespace and remove control characters
      normalized[key] = normalized[key].trim().replace(/[\x00-\x1F\x7F]/g, '');
    }
  });

  // Table-specific normalization
  if (tableName === 'mst_uom') {
    // Handle UOM-specific fields
    normalized.base_units = normalized.base_units || normalized.name || 'Nos';
    normalized.additional_units = normalized.additional_units || '';
    normalized.formalname = normalized.formalname || normalized.name || '';
    
    // Ensure conversion is an integer
    if (normalized.conversion !== undefined) {
      const conversionNum = parseInt(String(normalized.conversion).replace(/[^\d]/g, ''), 10);
      normalized.conversion = isNaN(conversionNum) ? 1 : conversionNum;
    } else {
      normalized.conversion = 1;
    }
    
    // Ensure is_simple_unit is a smallint (0 or 1)
    if (normalized.is_simple_unit !== undefined) {
      normalized.is_simple_unit = normalized.is_simple_unit === true || normalized.is_simple_unit === 1 || normalized.is_simple_unit === '1' ? 1 : 0;
    } else {
      normalized.is_simple_unit = 1;
    }
  }

  if (tableName === 'mst_group') {
    // Handle group-specific null constraints
    normalized.parent = normalized.parent || '';
    normalized._parent = normalized._parent || '';
    normalized.primary_group = normalized.primary_group || '';
  }

  if (tableName === 'mst_ledger') {
    // Handle ledger-specific null constraints
    normalized.alias = normalized.alias || '';
    normalized.description = normalized.description || '';
    normalized.notes = normalized.notes || '';
    normalized.mailing_name = normalized.mailing_name || normalized.name || '';
    normalized.mailing_address = normalized.mailing_address || '';
    normalized.mailing_state = normalized.mailing_state || '';
    normalized.mailing_country = normalized.mailing_country || '';
    normalized.mailing_pincode = normalized.mailing_pincode || '';
    normalized.email = normalized.email || '';
    normalized.it_pan = normalized.it_pan || '';
    normalized.gstn = normalized.gstn || '';
    normalized.gst_registration_type = normalized.gst_registration_type || '';
    normalized.gst_supply_type = normalized.gst_supply_type || '';
    normalized.gst_duty_head = normalized.gst_duty_head || '';
    normalized.bank_account_holder = normalized.bank_account_holder || '';
    normalized.bank_account_number = normalized.bank_account_number || '';
    normalized.bank_ifsc = normalized.bank_ifsc || '';
    normalized.bank_swift = normalized.bank_swift || '';
    normalized.bank_name = normalized.bank_name || '';
    normalized.bank_branch = normalized.bank_branch || '';
    normalized.income_tax_number = normalized.income_tax_number || '';
    normalized.sales_tax_number = normalized.sales_tax_number || '';
    normalized.excise_registration_number = normalized.excise_registration_number || '';
    normalized.service_tax_number = normalized.service_tax_number || '';
    normalized.buyer_type = normalized.buyer_type || '';
    normalized.buyer_category = normalized.buyer_category || '';
    normalized.ledger_contact = normalized.ledger_contact || '';
    normalized.ledger_mobile = normalized.ledger_mobile || '';
    normalized.ledger_fax = normalized.ledger_fax || '';
    normalized.ledger_website = normalized.ledger_website || '';
    normalized.parent = normalized.parent || '';
    normalized._parent = normalized._parent || '';
  }

  if (tableName === 'mst_godown') {
    // Handle godown-specific null constraints
    normalized.address = normalized.address || '';
    normalized.parent = normalized.parent || '';
    normalized._parent = normalized._parent || '';
    normalized.storage_type = normalized.storage_type || '';
    normalized.capacity_unit = normalized.capacity_unit || '';
    normalized.godown_type = normalized.godown_type || '';
    normalized.location_code = normalized.location_code || '';
    normalized.manager_name = normalized.manager_name || '';
    normalized.contact_number = normalized.contact_number || '';
  }

  return normalized;
}

// Enhanced bulk sync with better conflict handling and column whitelisting
async function bulkSyncToSupabase(
  supabase: any,
  tableName: string,
  records: any[],
  companyId: string,
  divisionId: string,
  keyField: string = 'guid',
  columnWhitelist?: string[]
): Promise<{ inserted: number; updated: number; errors: number; errorMessage?: string }> {
  if (!records || records.length === 0) {
    return { inserted: 0, updated: 0, errors: 0 };
  }

  try {
    // Filter records to only include whitelisted columns and normalize
    const filteredRecords = records.map(record => {
      // First normalize the record
      const normalized = normalizeRecord(record, tableName);
      
      // Remove problematic fields that don't exist in Railway schema
      delete normalized.additional_allocation_type;
      delete normalized.sync_timestamp;
      delete normalized.source;
      
      let filteredRecord: any = {
        company_id: companyId,
        division_id: divisionId
      };

      if (columnWhitelist) {
        // Only include columns that are in the whitelist
        for (const column of columnWhitelist) {
          if (normalized.hasOwnProperty(column)) {
            filteredRecord[column] = normalized[column];
          }
        }
      } else {
        // No whitelist - include all columns except problematic ones
        filteredRecord = {
          ...normalized,
          company_id: companyId,
          division_id: divisionId
        };
      }

      return filteredRecord;
    });

    console.log(`[Bulk Sync] Sample prepared record for ${tableName}:`, JSON.stringify(filteredRecords[0], null, 2));

    // Check existing records to determine inserts vs updates
    let existingCount = 0;
    let newCount = 0;
    
    if (filteredRecords.length > 0) {
      const guids = filteredRecords.map(r => r[keyField]).filter(Boolean);
      if (guids.length > 0) {
        const { count: existingRecords } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .in(keyField, guids)
          .eq('company_id', companyId)
          .eq('division_id', divisionId);
        
        existingCount = existingRecords || 0;
        newCount = filteredRecords.length - existingCount;
        
        console.log(`[Bulk Sync] ${tableName}: ${existingCount} existing, ${newCount} new records to process`);
      }
    }

    // Use composite unique constraint for conflict resolution
    const { data, error } = await supabase
      .from(tableName)
      .upsert(filteredRecords, {
        onConflict: 'guid,company_id,division_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`[Bulk Sync] Error syncing to ${tableName}:`, error);
      const errorMessage = `${error.code}: ${error.message}${error.hint ? ` (Hint: ${error.hint})` : ''}`;
      return { inserted: 0, updated: 0, errors: records.length, errorMessage };
    }

    // Return accurate counts based on existing vs new records
    return { 
      inserted: newCount, 
      updated: existingCount, 
      errors: 0 
    };
    
  } catch (error) {
    console.error(`[Bulk Sync] Exception syncing to ${tableName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { inserted: 0, updated: 0, errors: records.length, errorMessage };
  }
}

// Function to link voucher entries after sync
async function linkVoucherEntries(
  supabase: any,
  companyId: string,
  divisionId: string,
  jobId: string
): Promise<any> {
  console.log(`[Job ${jobId}] Starting voucher relationship repair...`);
  
  const results = {
    accounting: { total: 0, fixed: 0 },
    inventory: { total: 0, fixed: 0 },
    diagnostics: {}
  };

  // Fix trn_accounting relationships (batched)
  console.log(`[Job ${jobId}] Processing trn_accounting relationships...`);
  let accOffset = 0;
  const accBatchSize = 1000;
  while (true) {
    const { data: accountingRows, error: accError } = await supabase
      .from('trn_accounting')
      .select('guid, voucher_number, voucher_guid')
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .not('voucher_number', 'is', null)
      .neq('voucher_number', '')
      .order('guid', { ascending: true })
      .range(accOffset, accOffset + accBatchSize - 1);

    if (accError) {
      console.error(`[Job ${jobId}] Error fetching accounting rows:`, accError);
      break;
    }

    const batch = accountingRows || [];
    if (accOffset === 0) {
      console.log(`[Job ${jobId}] Found ${batch.length} accounting entries to process`);
    }
    results.accounting.total += batch.length;

    if (batch.length === 0) break;

    for (const row of batch) {
      try {
        // Find the corresponding voucher
        const { data: voucher, error: vError } = await supabase
          .from('tally_trn_voucher')
          .select('guid')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .eq('voucher_number', row.voucher_number)
          .maybeSingle();

        if (vError || !voucher) {
          continue;
        }

        // Update if voucher_guid is different or empty
        if (!row.voucher_guid || row.voucher_guid !== voucher.guid) {
          const { error: updateError } = await supabase
            .from('trn_accounting')
            .update({ voucher_guid: voucher.guid })
            .eq('guid', row.guid);

          if (!updateError) {
            results.accounting.fixed++;
          }
        }
      } catch (e) {
        console.error(`[Job ${jobId}] Error processing accounting row ${row.guid}:`, e);
      }
    }

    accOffset += batch.length;
    if (batch.length < accBatchSize) break; // last page
  }

  // Fix trn_inventory relationships (handle missing voucher_number gracefully)
  console.log(`[Job ${jobId}] Processing trn_inventory relationships...`);
  const invBatchSize = 1000;

  // First probe to detect if voucher_number column exists
  let probe = await supabase
    .from('trn_inventory')
    .select('guid, voucher_number, voucher_guid')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .order('guid', { ascending: true })
    .range(0, invBatchSize - 1);

  if (probe.error && probe.error.code === '42703') {
    // Fallback path: derive voucher_guid from inventory guid prefix
    console.warn(`[Job ${jobId}] trn_inventory.voucher_number column missing. Using GUID-derivation strategy.`);
    let invOffset = 0;
    while (true) {
      const { data: invRows, error: invErr } = await supabase
        .from('trn_inventory')
        .select('guid, voucher_guid')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('guid', { ascending: true })
        .range(invOffset, invOffset + invBatchSize - 1);

      if (invErr) {
        console.error(`[Job ${jobId}] Error fetching inventory rows (fallback):`, invErr);
        break;
      }

      const batch = invRows || [];
      results.inventory.total += batch.length;
      if (batch.length === 0) break;

      for (const row of batch) {
        try {
          const derivedGuid = row.guid?.split('-inventory-')[0] || '';
          if (derivedGuid && row.voucher_guid !== derivedGuid) {
            const { error: updErr } = await supabase
              .from('trn_inventory')
              .update({ voucher_guid: derivedGuid })
              .eq('guid', row.guid);
            if (!updErr) results.inventory.fixed++;
          }
        } catch (e) {
          console.error(`[Job ${jobId}] Error processing inventory row ${row.guid} (fallback):`, e);
        }
      }

      invOffset += batch.length;
      if (batch.length < invBatchSize) break;
    }
  } else {
    // Standard path using voucher_number
    if (probe.error) {
      console.error(`[Job ${jobId}] Error probing inventory rows:`, probe.error);
    }

    let invOffset = 0;
    while (true) {
      const { data: inventoryRows, error: invError } = await supabase
        .from('trn_inventory')
        .select('guid, voucher_number, voucher_guid')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .not('voucher_number', 'is', null)
        .neq('voucher_number', '')
        .order('guid', { ascending: true })
        .range(invOffset, invOffset + invBatchSize - 1);

      if (invError) {
        console.error(`[Job ${jobId}] Error fetching inventory rows:`, invError);
        break;
      }

      const batch = inventoryRows || [];
      results.inventory.total += batch.length;
      if (invOffset === 0) {
        console.log(`[Job ${jobId}] Found ${batch.length} inventory entries to process`);
      }
      if (batch.length === 0) break;

      for (const row of batch) {
        try {
          // Find the corresponding voucher
          const { data: voucher, error: vError } = await supabase
            .from('tally_trn_voucher')
            .select('guid')
            .eq('company_id', companyId)
            .eq('division_id', divisionId)
            .eq('voucher_number', row.voucher_number)
            .maybeSingle();

          if (vError || !voucher) continue;

          // Update if voucher_guid is different or empty
          if (!row.voucher_guid || row.voucher_guid !== voucher.guid) {
            const { error: updateError } = await supabase
              .from('trn_inventory')
              .update({ voucher_guid: voucher.guid })
              .eq('guid', row.guid);

            if (!updateError) {
              results.inventory.fixed++;
            }
          }
        } catch (e) {
          console.error(`[Job ${jobId}] Error processing inventory row ${row.guid}:`, e);
        }
      }

      invOffset += batch.length;
      if (batch.length < invBatchSize) break; // last page
    }
  }

  // Diagnostic check for a specific voucher
  const targetVoucher = '2800240/25-26';
  console.log(`[Job ${jobId}] Checking diagnostic for voucher: ${targetVoucher}`);
  
  const { data: voucherData } = await supabase
    .from('tally_trn_voucher')
    .select('guid')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .eq('voucher_number', targetVoucher)
    .maybeSingle();

  if (voucherData?.guid) {
    const { count: accCount } = await supabase
      .from('trn_accounting')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .eq('voucher_guid', voucherData.guid);

    const { count: invCount } = await supabase
      .from('trn_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .eq('voucher_guid', voucherData.guid);

    results.diagnostics[targetVoucher] = {
      voucher_guid: voucherData.guid,
      accounting_entries: accCount || 0,
      inventory_entries: invCount || 0
    };
  } else {
    results.diagnostics[targetVoucher] = {
      error: 'Voucher not found'
    };
  }

  console.log(`[Job ${jobId}] Relationship linking completed: accounting fixed ${results.accounting.fixed}/${results.accounting.total}, inventory fixed ${results.inventory.fixed}/${results.inventory.total}`);
  
  return results;
}

// Function to recalculate voucher totals after sync
async function recalculateVoucherTotals(
  supabase: any,
  companyId: string,
  divisionId: string,
  jobId: string
): Promise<any> {
  console.log(`[Job ${jobId}] Starting voucher amount calculations...`);
  
  const results = {
    vouchers_processed: 0,
    vouchers_updated: 0
  };

  // Get vouchers that need amount calculation (limit to recent ones to avoid processing all)
  const { data: vouchers, error: vError } = await supabase
    .from('tally_trn_voucher')
    .select('guid, voucher_number, total_amount, final_amount')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .limit(5000)
    .order('created_at', { ascending: false });

  if (vError || !vouchers) {
    console.error(`[Job ${jobId}] Error fetching vouchers:`, vError);
    return results;
  }

  results.vouchers_processed = vouchers.length;
  console.log(`[Job ${jobId}] Found ${vouchers.length} vouchers to process for amount calculation`);

  for (const voucher of vouchers) {
    try {
      // Calculate total from accounting entries (only positive amounts for total)
      const { data: accEntries } = await supabase
        .from('trn_accounting')
        .select('amount')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .eq('voucher_guid', voucher.guid)
        .gt('amount', 0);

      if (accEntries && accEntries.length > 0) {
        const calculatedTotal = accEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Update if amounts are different or zero
        if (voucher.total_amount !== calculatedTotal || voucher.final_amount !== calculatedTotal) {
          const { error: updateError } = await supabase
            .from('tally_trn_voucher')
            .update({ 
              total_amount: calculatedTotal,
              final_amount: calculatedTotal 
            })
            .eq('guid', voucher.guid);

          if (!updateError) {
            results.vouchers_updated++;
          }
        }
      }
    } catch (e) {
      console.error(`[Job ${jobId}] Error calculating amounts for voucher ${voucher.guid}:`, e);
    }
  }

  console.log(`[Job ${jobId}] Amount calculation completed: ${results.vouchers_updated}/${results.vouchers_processed} vouchers updated`);
  
  return results;
}

// Main sync function
async function performRailwaySync(
  supabase: any,
  companyId: string,
  divisionId: string,
  tables?: string[]
): Promise<any> {
  const jobId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`[Sync Job ${jobId}] Starting Railway API sync`);
  console.log(`[Sync Job ${jobId}] Company: ${companyId}, Division: ${divisionId}`);
  console.log(`[Sync Job ${jobId}] Tables filter: ${tables?.join(', ') || 'undefined'}`);

  // Test Railway connection first
  try {
    const healthResponse = await fetch(`${RAILWAY_BASE_URL}/api/v1/health`);
    const healthData = await healthResponse.json();
    console.log(`[Sync Job ${jobId}] ✅ Railway health check passed:`, healthData.message);
  } catch (error) {
    throw new Error(`Railway connection failed: ${error.message}`);
  }

  // Test POST /api/v1/query endpoint specifically
  try {
    const railwayApiKey = Deno.env.get('RAILWAY_API_KEY');
    const testQuery = await fetch(`${RAILWAY_BASE_URL}/api/v1/query/${companyId}/${divisionId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(railwayApiKey && { 'Authorization': `Bearer ${railwayApiKey}` })
      },
      body: JSON.stringify({
        table: 'groups',
        limit: 1
      })
    });
    
    if (!testQuery.ok) {
      throw new Error(`Query endpoint test failed: ${testQuery.status} ${testQuery.statusText}`);
    }
    
    const testData = await testQuery.json();
    console.log(`[Sync Job ${jobId}] ✅ POST /api/v1/query endpoint working:`, testData.success);
  } catch (error) {
    throw new Error(`Query endpoint test failed: ${error.message}`);
  }

  // Filter tables if specified
  let tablesToSync = TABLE_MAPPINGS;
  if (tables && tables.length > 0) {
    tablesToSync = TABLE_MAPPINGS.filter(mapping => 
      tables.includes(mapping.apiTable) || tables.includes(mapping.supabaseTable)
    );
  }

  console.log(`[Sync Job ${jobId}] Processing ${tablesToSync.length} tables`);

  const results: any[] = [];
  let totalRecords = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  // Create sync job record
  const { data: jobData, error: jobError } = await supabase
    .from('tally_sync_jobs')
    .insert({
      id: jobId,
      company_id: companyId,
      division_id: divisionId,
      status: 'processing',
      job_type: 'railway_sync'
    })
    .select()
    .single();

  if (jobError) {
    console.error(`[Sync Job ${jobId}] Failed to create job record:`, jobError);
  }

  for (const tableMapping of tablesToSync) {
    console.log(`[Sync Job ${jobId}] Processing table: ${tableMapping.supabaseTable} (API: ${tableMapping.apiTable})`);
    
    try {
      // Use batch processing for large tables to prevent memory issues
      const isLargeTable = ['vouchers', 'accounting_entries', 'inventory_entries'].includes(tableMapping.apiTable);
      
      let tableResult: any;
      
      if (isLargeTable) {
        // Use batched sync for large tables
        console.log(`[Sync Job ${jobId}] Using batched processing for large table: ${tableMapping.apiTable}`);
        tableResult = await processBatchedSync(
          supabase,
          tableMapping,
          companyId,
          divisionId,
          jobId,
          1000 // batch size
        );
      } else {
        // Use traditional approach for smaller tables
        console.log(`[Sync Job ${jobId}] Using traditional sync for table: ${tableMapping.apiTable}`);
        const records = await queryRailwayAPI(
          tableMapping.endpoint,
          companyId,
          divisionId,
          tableMapping.apiTable
        );

        console.log(`[Sync Job ${jobId}] Retrieved ${records.length} records for ${tableMapping.apiTable}`);

        if (records.length > 0) {
          const syncResult = await bulkSyncToSupabase(
            supabase,
            tableMapping.supabaseTable,
            records,
            companyId,
            divisionId,
            tableMapping.keyField,
            tableMapping.columnWhitelist
          );

          tableResult = {
            table: tableMapping.supabaseTable,
            api_table: tableMapping.apiTable,
            records_fetched: records.length,
            records_inserted: syncResult.inserted,
            records_updated: syncResult.updated,
            errors: syncResult.errors,
            status: syncResult.errors > 0 ? 'failed' : 'success',
            ...(syncResult.errorMessage && { error: syncResult.errorMessage })
          };
        } else {
          console.log(`[Sync Job ${jobId}] ⚠️ No records found for ${tableMapping.apiTable} - API source appears empty`);
          
          tableResult = {
            table: tableMapping.supabaseTable,
            api_table: tableMapping.apiTable,
            records_fetched: 0,
            records_inserted: 0,
            records_updated: 0,
            errors: 0,
            status: 'success'
          };
        }
      }

      // Add results to totals
      results.push(tableResult);
      totalRecords += tableResult.records_fetched;
      totalInserted += tableResult.records_inserted;
      totalUpdated += tableResult.records_updated;
      totalErrors += tableResult.errors;

      console.log(`[Sync Job ${jobId}] ${tableMapping.supabaseTable} completed:`, tableResult);

    } catch (error) {
      console.error(`[Sync Job ${jobId}] Error processing ${tableMapping.supabaseTable}:`, error);
      
      const errorResult = {
        table: tableMapping.supabaseTable,
        api_table: tableMapping.apiTable,
        records_fetched: 0,
        records_inserted: 0,
        records_updated: 0,
        errors: 1,
        status: 'failed',
        error: error.message
      };
      
      results.push(errorResult);
      totalErrors += 1;
    }
  }

  // Link voucher relationships after main sync is complete
  console.log(`[Sync Job ${jobId}] Starting voucher relationship linking...`);
  try {
    const linkResults = await linkVoucherEntries(supabase, companyId, divisionId, jobId);
    console.log(`[Sync Job ${jobId}] ✅ Relationship linking completed:`, linkResults);
  } catch (linkError) {
    console.error(`[Sync Job ${jobId}] ⚠️ Relationship linking failed:`, linkError);
    // Don't fail the entire sync for this, but log it
  }

  // Calculate voucher amounts after relationships are linked
  console.log(`[Sync Job ${jobId}] Starting voucher amount calculations...`);
  try {
    const amountResults = await recalculateVoucherTotals(supabase, companyId, divisionId, jobId);
    console.log(`[Sync Job ${jobId}] ✅ Amount calculation completed:`, amountResults);
  } catch (amountError) {
    console.error(`[Sync Job ${jobId}] ⚠️ Amount calculation failed:`, amountError);
    // Don't fail the entire sync for this, but log it
  }

  const duration = Date.now() - startTime;
  
  // Update sync job status
  await supabase
    .from('tally_sync_jobs')
    .update({
      status: totalErrors > 0 ? 'failed' : 'completed',
      completed_at: new Date().toISOString(),
      records_processed: totalRecords
    })
    .eq('id', jobId);

  if (totalRecords === 0) {
    console.warn(`[Sync Job ${jobId}] ⚠️ Sync completed with no records - API source appears empty`);
    console.warn(`[Sync Job ${jobId}] ⚠️ API returned no records to sync - API source appears to be empty`);
  }

  console.log(`[Sync Job ${jobId}] Summary: ${totalRecords} records, ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);
  console.log(`[Sync Job ${jobId}] Completed in ${duration}ms`);

  return {
    success: totalErrors === 0,
    jobId,
    tablesProcessed: results.length,
    totalRecords,
    totalInserted,
    totalUpdated,
    totalErrors,
    duration,
    results
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, divisionId, tables, action } = await req.json();

    // Validate required parameters
    if (!companyId || !divisionId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: companyId and divisionId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate UUIDs
    if (!await validateUUID(companyId) || !await validateUUID(divisionId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid UUID format for companyId or divisionId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result: any;

    // Handle different actions
    switch (action) {
      case 'health_check':
        try {
          const healthUrl = `${RAILWAY_BASE_URL}/api/v1/health`;
          const railwayApiKey = Deno.env.get('RAILWAY_API_KEY');
          const healthResponse = await fetch(healthUrl, {
            headers: railwayApiKey ? {
              'Authorization': `Bearer ${railwayApiKey}`
            } : {}
          });
          const healthData = await healthResponse.json();
          
          // Test Supabase connection
          const { data: divisionData, error: divisionError } = await supabase
            .from('divisions')
            .select('id')
            .eq('id', divisionId)
            .single();

          result = {
            api_health: healthData,
            supabase_connection: !divisionError,
            division_found: !!divisionData,
            api_key_configured: !!railwayApiKey
          };
        } catch (error) {
          result = {
            api_health: { success: false, error: error.message },
            supabase_connection: false,
            division_found: false,
            api_key_configured: !!Deno.env.get('RAILWAY_API_KEY')
          };
        }
        break;

      case 'metadata':
        try {
          const metadataResponse = await fetch(`${RAILWAY_BASE_URL}/api/v1/metadata/${companyId}/${divisionId}`);
          const metadataData = await metadataResponse.json();
          
          result = {
            api_health: "Railway API integration",
            metadata: metadataData.success ? metadataData.data : null,
            tables_available: TABLE_MAPPINGS.map(m => ({
              api_table: m.apiTable,
              supabase_table: m.supabaseTable,
              endpoint: m.endpoint
            })),
            company_id: companyId,
            division_id: divisionId
          };
        } catch (error) {
          result = {
            api_health: "Railway API integration",
            metadata_error: error.message,
            tables_available: TABLE_MAPPINGS.map(m => ({
              api_table: m.apiTable,
              supabase_table: m.supabaseTable,
              endpoint: m.endpoint
            })),
            company_id: companyId,
            division_id: divisionId
          };
        }
        break;

      case 'verify_voucher':
        try {
          const voucherNumber = '2800237/25-26';
          const voucherUrl = `${RAILWAY_BASE_URL}/api/v1/voucher/${companyId}/${divisionId}/${encodeURIComponent(voucherNumber)}`;
          
          const voucherResponse = await fetch(voucherUrl);
          const voucherData = await voucherResponse.json();
          
          if (voucherData.success) {
            result = {
              voucher_found: true,
              voucher_details: voucherData.data.voucher,
              accounting_entries: voucherData.data.accounting_entries?.length || 0,
              inventory_entries: voucherData.data.inventory_entries?.length || 0,
              party_found: !!voucherData.data.party_details,
              verification_status: 'complete'
            };
          } else {
            result = {
              voucher_found: false,
              error: voucherData.error,
              verification_status: 'failed'
            };
          }
        } catch (error) {
          result = {
            voucher_found: false,
            error: error.message,
            verification_status: 'error'
          };
        }
        break;

      default:
        // Default action: full_sync
        result = await performRailwaySync(supabase, companyId, divisionId, tables);
        break;
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Railway sync function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});