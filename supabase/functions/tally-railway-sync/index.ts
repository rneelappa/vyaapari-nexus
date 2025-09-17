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
  { apiTable: 'groups', supabaseTable: 'mst_group', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'ledgers', supabaseTable: 'mst_ledger', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'stock_items', supabaseTable: 'mst_stock_item', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'voucher_types', supabaseTable: 'mst_vouchertype', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'cost_centers', supabaseTable: 'mst_cost_centre', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'godowns', supabaseTable: 'mst_godown', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'uoms', supabaseTable: 'mst_uom', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'vouchers', supabaseTable: 'tally_trn_voucher', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'accounting_entries', supabaseTable: 'trn_accounting', endpoint: '/api/v1/query', keyField: 'guid' },
  { apiTable: 'inventory_entries', supabaseTable: 'trn_inventory', endpoint: '/api/v1/query', keyField: 'guid' }
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
  limit: number = 1000,
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

// Pagination support for large tables
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

// Enhanced bulk sync with better conflict handling
async function bulkSyncToSupabase(
  supabase: any,
  tableName: string,
  records: any[],
  companyId: string,
  divisionId: string,
  keyField: string = 'guid'
): Promise<{ inserted: number; updated: number; errors: number }> {
  if (!records || records.length === 0) {
    return { inserted: 0, updated: 0, errors: 0 };
  }

  try {
    // Add company_id and division_id to all records
    const enrichedRecords = records.map(record => ({
      ...record,
      company_id: companyId,
      division_id: divisionId
    }));

    // Use guid as primary conflict resolution
    const { data, error } = await supabase
      .from(tableName)
      .upsert(enrichedRecords, {
        onConflict: 'guid',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`[Bulk Sync] Error syncing to ${tableName}:`, error);
      return { inserted: 0, updated: 0, errors: records.length };
    }

    // For upsert, we assume all records were processed successfully
    return { inserted: records.length, updated: 0, errors: 0 };
    
  } catch (error) {
    console.error(`[Bulk Sync] Exception syncing to ${tableName}:`, error);
    return { inserted: 0, updated: 0, errors: records.length };
  }
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
      // Use pagination for large tables
      const isLargeTable = ['vouchers', 'accounting_entries', 'inventory_entries'].includes(tableMapping.apiTable);
      let records: any[];
      
      if (isLargeTable) {
        records = await queryWithPagination(companyId, divisionId, tableMapping.apiTable, 1000);
      } else {
        records = await queryRailwayAPI(
          tableMapping.endpoint,
          companyId,
          divisionId,
          tableMapping.apiTable
        );
      }

      console.log(`[Sync Job ${jobId}] Retrieved ${records.length} records for ${tableMapping.apiTable}`);

      if (records.length > 0) {
        const syncResult = await bulkSyncToSupabase(
          supabase,
          tableMapping.supabaseTable,
          records,
          companyId,
          divisionId,
          tableMapping.keyField
        );

        const tableResult = {
          table: tableMapping.supabaseTable,
          api_table: tableMapping.apiTable,
          records_fetched: records.length,
          records_inserted: syncResult.inserted,
          records_updated: syncResult.updated,
          errors: syncResult.errors,
          status: syncResult.errors > 0 ? 'failed' : 'success'
        };

        results.push(tableResult);
        totalRecords += records.length;
        totalInserted += syncResult.inserted;
        totalUpdated += syncResult.updated;
        totalErrors += syncResult.errors;

        console.log(`[Sync Job ${jobId}] ${tableMapping.supabaseTable} (${tableMapping.apiTable}): ${records.length} fetched, ${syncResult.inserted} inserted, ${syncResult.errors} errors`, tableResult);
      } else {
        console.log(`[Sync Job ${jobId}] ⚠️ No records found for ${tableMapping.apiTable} - API source appears empty`);
        
        const emptyResult = {
          table: tableMapping.supabaseTable,
          api_table: tableMapping.apiTable,
          records_fetched: 0,
          records_inserted: 0,
          records_updated: 0,
          errors: 0,
          status: 'success'
        };
        
        results.push(emptyResult);
      }

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