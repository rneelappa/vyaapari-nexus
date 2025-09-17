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
}

const TABLE_MAPPINGS: TableMapping[] = [
  {
    apiTable: 'groups',
    supabaseTable: 'mst_group',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'ledgers',
    supabaseTable: 'mst_ledger',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'stock_items',
    supabaseTable: 'mst_stock_item',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'voucher_types',
    supabaseTable: 'mst_vouchertype',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'vouchers',
    supabaseTable: 'tally_trn_voucher',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'accounting_entries',
    supabaseTable: 'trn_accounting',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  },
  {
    apiTable: 'inventory_entries',
    supabaseTable: 'trn_inventory',
    endpoint: '/api/v1/query',
    keyField: 'guid'
  }
];

const RAILWAY_BASE_URL = 'https://tally-sync-vyaapari360-railway-production.up.railway.app';

async function validateUUID(uuid: string): Promise<boolean> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function queryRailwayAPI(
  endpoint: string,
  companyId: string,
  divisionId: string,
  table: string,
  limit = 1000,
  offset = 0
): Promise<any> {
  const url = `${RAILWAY_BASE_URL}${endpoint}`;
  
  console.log(`[Railway API] Querying ${table} from: ${url} (limit: ${limit}, offset: ${offset})`);
  
  const apiKey = Deno.env.get('RAILWAY_API_KEY');
  if (!apiKey) {
    throw new Error('RAILWAY_API_KEY environment variable not set');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        table: table,
        company_id: companyId,
        division_id: divisionId,
        limit: limit,
        offset: offset
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const raw = await response.json();
    console.log(`[Railway API] Raw response structure:`, {
      isArray: Array.isArray(raw),
      hasData: !!raw?.data,
      hasRecords: !!raw?.records,
      hasSuccess: !!raw?.success,
      dataIsArray: Array.isArray(raw?.data),
      recordsIsArray: Array.isArray(raw?.records)
    });

    let records: any[] = [];
    
    // Try multiple parsing strategies
    if (Array.isArray(raw)) {
      records = raw;
    } else if (raw?.success && Array.isArray(raw?.data)) {
      records = raw.data;
    } else if (raw?.success && Array.isArray(raw?.data?.records)) {
      records = raw.data.records;
    } else if (Array.isArray(raw?.data)) {
      records = raw.data;
    } else if (Array.isArray(raw?.records)) {
      records = raw.records;
    } else if (raw?.data && typeof raw.data === 'object') {
      // Check if data object contains array values
      const dataKeys = Object.keys(raw.data);
      for (const key of dataKeys) {
        if (Array.isArray(raw.data[key])) {
          records = raw.data[key];
          break;
        }
      }
    }

    console.log(`[Railway API] ${table}: Parsed ${records.length} records`);
    return records;
  } catch (error) {
    console.error(`[Railway API] Error querying ${table}:`, error);
    throw error;
  }
}

async function bulkSyncToSupabase(
  supabase: any,
  table: string,
  data: any[],
  companyId: string,
  divisionId: string,
  keyField: string
): Promise<{ inserted: number; updated: number; errors: number }> {
  if (!data || data.length === 0) {
    console.log(`[Supabase] No data to sync for table: ${table}`);
    return { inserted: 0, updated: 0, errors: 0 };
  }

  console.log(`[Supabase] Starting bulk sync for ${table}: ${data.length} records`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Add company_id and division_id to each record
    const enrichedBatch = batch.map(record => ({
      ...record,
      company_id: companyId,
      division_id: divisionId,
      updated_at: new Date().toISOString()
    }));

    try {
      // Use appropriate conflict resolution based on table
      let onConflictColumns = keyField;
      if (table.includes('trn_')) {
        onConflictColumns = `${keyField}`;
      } else if (table.includes('mst_')) {
        onConflictColumns = `${keyField}`;
      }

      const { data: result, error } = await supabase
        .from(table)
        .upsert(enrichedBatch, {
          onConflict: onConflictColumns,
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`[Supabase] Batch error for ${table}:`, error);
        errors += batch.length;
      } else {
        // Since upsert doesn't return info about insert vs update, count as inserted
        inserted += batch.length;
        console.log(`[Supabase] Successfully synced batch for ${table}: ${batch.length} records`);
      }
    } catch (err) {
      console.error(`[Supabase] Batch sync error for ${table}:`, err);
      errors += batch.length;
    }
  }

  console.log(`[Supabase] Completed bulk sync for ${table}: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return { inserted, updated, errors };
}

async function performRailwaySync(
  supabase: any,
  companyId: string,
  divisionId: string,
  tablesFilter?: string[]
): Promise<any> {
  const startTime = new Date();
  const jobId = crypto.randomUUID();

  console.log(`[Sync Job ${jobId}] Starting Railway API sync`);
  console.log(`[Sync Job ${jobId}] Company: ${companyId}, Division: ${divisionId}`);
  console.log(`[Sync Job ${jobId}] Tables filter:`, tablesFilter);

  // Create sync job record
  const { error: jobError } = await supabase
    .from('tally_sync_jobs')
    .insert({
      id: jobId,
      company_id: companyId,
      division_id: divisionId,
      status: 'running',
      job_type: 'full_sync',
      started_at: startTime.toISOString()
    });

  if (jobError) {
    console.error(`[Sync Job ${jobId}] Failed to create job record:`, jobError);
  }

  let totalRecords = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  let tablesProcessed = 0;
  const results: any[] = [];

  // Filter tables if specified
  const tablesToProcess = tablesFilter 
    ? TABLE_MAPPINGS.filter(mapping => tablesFilter.includes(mapping.supabaseTable))
    : TABLE_MAPPINGS;

  console.log(`[Sync Job ${jobId}] Processing ${tablesToProcess.length} tables`);

  for (const mapping of tablesToProcess) {
    const tableStartTime = new Date();
    console.log(`[Sync Job ${jobId}] Processing table: ${mapping.supabaseTable} (API: ${mapping.apiTable})`);

    // Skipping job detail creation to match current schema


    try {
      // Fetch data from Railway API with pagination
      let allData: any[] = [];
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const batchData = await queryRailwayAPI(
          mapping.endpoint,
          companyId,
          divisionId,
          mapping.apiTable,
          limit,
          offset
        );

        allData = [...allData, ...batchData];
        
        // Check if we got fewer records than limit (indicating last batch)
        hasMore = batchData.length === limit;
        offset += limit;

        // Safety check to prevent infinite loops
        if (offset > 100000) {
          console.warn(`[Railway API] Pagination safety limit reached for ${mapping.apiTable}`);
          break;
        }
      }

      console.log(`[Sync Job ${jobId}] Fetched ${allData.length} records for ${mapping.apiTable}`);

      // Sync to Supabase
      const syncResult = await bulkSyncToSupabase(
        supabase,
        mapping.supabaseTable,
        allData,
        companyId,
        divisionId,
        mapping.keyField
      );

      // Update totals
      totalRecords += allData.length;
      totalInserted += syncResult.inserted;
      totalUpdated += syncResult.updated;
      totalErrors += syncResult.errors;
      tablesProcessed++;

      // Skipped job detail update to match current schema


      results.push({
        table: mapping.supabaseTable,
        api_table: mapping.apiTable,
        records_fetched: allData.length,
        records_inserted: syncResult.inserted,
        records_updated: syncResult.updated,
        errors: syncResult.errors,
        status: 'success'
      });

      console.log(`[Sync Job ${jobId}] Completed ${mapping.supabaseTable}: ${allData.length} fetched, ${syncResult.inserted} inserted, ${syncResult.errors} errors`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Sync Job ${jobId}] Error processing ${mapping.supabaseTable}:`, errorMessage);
      
      totalErrors++;
      tablesProcessed++;

      // Skipped job detail error update to match current schema


      results.push({
        table: mapping.supabaseTable,
        api_table: mapping.apiTable,
        records_fetched: 0,
        records_inserted: 0,
        records_updated: 0,
        errors: 1,
        status: 'failed',
        error: errorMessage
      });
    }
  }

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  await supabase
    .from('tally_sync_jobs')
    .update({
      status: totalErrors > 0 ? 'completed_with_errors' : 'completed',
      records_processed: totalRecords,
      completed_at: endTime.toISOString()
    })
    .eq('id', jobId);

  console.log(`[Sync Job ${jobId}] Completed in ${duration}ms`);
  console.log(`[Sync Job ${jobId}] Summary: ${totalRecords} records, ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);

  return {
    success: totalErrors === 0,
    jobId,
    tablesProcessed,
    totalRecords,
    totalInserted,
    totalUpdated,
    totalErrors,
    duration: duration,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
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

    // Handle different actions
    if (action === 'health_check') {
      try {
        const healthUrl = `${RAILWAY_BASE_URL}/api/v1/health`;
        const apiKey = Deno.env.get('RAILWAY_API_KEY');
        const response = await fetch(healthUrl, {
          headers: apiKey ? {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey
          } : {}
        });
        const healthData = await response.json();
        
        return new Response(
          JSON.stringify({
            success: true,
            railway_api: healthData,
            endpoints_available: TABLE_MAPPINGS.length,
            api_key_configured: !!apiKey
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Railway API health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    if (action === 'metadata') {
      return new Response(
        JSON.stringify({
          success: true,
          railway_base_url: RAILWAY_BASE_URL,
          available_tables: TABLE_MAPPINGS.map(m => ({
            api_table: m.apiTable,
            supabase_table: m.supabaseTable,
            endpoint: m.endpoint
          }))
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'verify_voucher') {
      const { voucherGuid } = await req.json();
      if (!voucherGuid) {
        return new Response(
          JSON.stringify({ success: false, error: 'voucherGuid required for verification' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Check voucher in database
        const { data: voucher, error } = await supabase
          .from('tally_trn_voucher')
          .select('*')
          .eq('guid', voucherGuid)
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Check accounting entries
        const { data: accountingEntries, error: accError } = await supabase
          .from('trn_accounting')
          .select('*')
          .eq('voucher_guid', voucherGuid)
          .eq('company_id', companyId)
          .eq('division_id', divisionId);

        if (accError) {
          throw accError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            voucher_found: !!voucher,
            voucher_data: voucher,
            accounting_entries_count: accountingEntries?.length || 0,
            accounting_entries: accountingEntries
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Voucher verification failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Default action: full_sync
    const result = await performRailwaySync(supabase, companyId, divisionId, tables);

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