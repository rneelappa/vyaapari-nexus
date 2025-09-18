import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncJobDetail {
  table_name: string;
  action: string;
  record_guid: string;
  record_details?: any;
  error_message?: string;
  voucher_number?: string;
}

interface TableMapping {
  apiTable: string;
  supabaseTable: string;
  endpoint: string;
  keyField: string;
}

const TABLE_MAPPINGS: TableMapping[] = [
  // Master data tables (sync first for referential integrity)
  { apiTable: 'groups', supabaseTable: 'mst_group', endpoint: '/masters/groups', keyField: 'guid' },
  { apiTable: 'ledgers', supabaseTable: 'mst_ledger', endpoint: '/masters/ledgers', keyField: 'guid' },
  { apiTable: 'stock_items', supabaseTable: 'mst_stock_item', endpoint: '/masters/stock-items', keyField: 'guid' },
  { apiTable: 'voucher_types', supabaseTable: 'mst_vouchertype', endpoint: '/masters/voucher-types', keyField: 'guid' },
  { apiTable: 'cost_centers', supabaseTable: 'mst_cost_centre', endpoint: '/masters/cost-centers', keyField: 'guid' },
  { apiTable: 'godowns', supabaseTable: 'mst_godown', endpoint: '/masters/godowns', keyField: 'guid' },
  { apiTable: 'employees', supabaseTable: 'mst_employee', endpoint: '/masters/employees', keyField: 'guid' },
  { apiTable: 'uoms', supabaseTable: 'mst_uom', endpoint: '/masters/uoms', keyField: 'guid' },
  { apiTable: 'cost_categories', supabaseTable: 'mst_cost_category', endpoint: '/masters/cost-categories', keyField: 'guid' },
  { apiTable: 'payheads', supabaseTable: 'mst_payhead', endpoint: '/masters/payheads', keyField: 'guid' },
  
  // Transaction tables (sync after master data)
  { apiTable: 'vouchers', supabaseTable: 'tally_trn_voucher', endpoint: '/vouchers', keyField: 'guid' },
  { apiTable: 'accounting', supabaseTable: 'trn_accounting', endpoint: '/accounting', keyField: 'guid' },
  { apiTable: 'inventory', supabaseTable: 'trn_inventory', endpoint: '/inventory', keyField: 'guid' }
];

async function validateUUID(uuid: string): Promise<boolean> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function queryNewAPI(
  endpoint: string, 
  companyId: string, 
  divisionId: string, 
  table: string, 
  filters: any = {}, 
  limit = 50000,  // Increased limit to handle more records
  offset = 0
): Promise<any> {
  try {
    const apiUrl = 'https://tally-sync-vyaapari360-railway-production.up.railway.app';
    const queryUrl = `${apiUrl}/api/v1/query/${companyId}/${divisionId}`;
    
    console.log(`Querying API: ${queryUrl} for table: ${table}`);
    
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        filters,
        limit,
        offset
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'API request failed');
    }

    return responseData.data;
  } catch (error) {
    console.error(`Error querying API for ${table}:`, error);
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
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const record of data) {
    try {
      // Add company_id and division_id to each record
      const recordWithIds = {
        ...record,
        company_id: companyId,
        division_id: divisionId
      };

      // Try to upsert the record
      const { error } = await supabase
        .from(table)
        .upsert(recordWithIds, { 
          onConflict: keyField,
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error upserting record in ${table}:`, error);
        errors++;
      } else {
        // For simplicity, count all as updated (upsert doesn't differentiate)
        updated++;
      }
    } catch (error) {
      console.error(`Error processing record in ${table}:`, error);
      errors++;
    }
  }

  return { inserted, updated, errors };
}

// Post-processing function to link voucher relationships
async function linkVoucherRelationships(supabase: any, companyId: string, divisionId: string): Promise<void> {
  try {
    console.log('Linking trn_accounting and trn_inventory to tally_trn_voucher via voucher_number...');

    // Helper to link a table's rows to vouchers
    const linkTable = async (tableName: string) => {
      // Fetch rows missing voucher_guid but having voucher_number
      const { data: rows, error } = await supabase
        .from(tableName)
        .select('guid, voucher_number')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .not('voucher_number', 'is', null)
        .neq('voucher_number', '')
        .or('voucher_guid.is.null,voucher_guid.eq.')
        .limit(5000);

      if (error) {
        console.error(`Error fetching ${tableName} rows to link:`, error);
        return { linked: 0, total: 0 };
      }

      if (!rows || rows.length === 0) {
        console.log(`No ${tableName} rows need linking`);
        return { linked: 0, total: 0 };
      }

      let linked = 0;
      for (const row of rows) {
        try {
          const { data: voucher, error: vErr } = await supabase
            .from('tally_trn_voucher')
            .select('guid')
            .eq('company_id', companyId)
            .eq('division_id', divisionId)
            .eq('voucher_number', row.voucher_number)
            .maybeSingle();

          if (vErr || !voucher) continue;

          const { error: uErr } = await supabase
            .from(tableName)
            .update({ voucher_guid: voucher.guid })
            .eq('guid', row.guid);

          if (!uErr) linked++;
        } catch (e) {
          // continue
        }
      }

      console.log(`Linked ${linked}/${rows.length} rows for ${tableName}`);
      return { linked, total: rows.length };
    };

    const accRes = await linkTable('trn_accounting');
    const invRes = await linkTable('trn_inventory');

    // Targeted diagnostics for the reported voucher
    const targetVoucherNo = '2800240/25-26';
    const { data: vTarget } = await supabase
      .from('tally_trn_voucher')
      .select('guid')
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .eq('voucher_number', targetVoucherNo)
      .maybeSingle();

    if (vTarget?.guid) {
      const { count: accCount } = await supabase
        .from('trn_accounting')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .eq('voucher_guid', vTarget.guid);

      const { count: invCount } = await supabase
        .from('trn_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .eq('voucher_guid', vTarget.guid);

      console.log(`Voucher ${targetVoucherNo} linkage: accounting=${accCount || 0}, inventory=${invCount || 0}`);
    } else {
      console.log(`Voucher ${targetVoucherNo} not found during linking step.`);
    }
  } catch (error) {
    console.error('Error in linkVoucherRelationships:', error);
  }
}

// Post-processing function to calculate missing voucher amounts
async function calculateMissingVoucherAmounts(supabase: any, companyId: string, divisionId: string): Promise<void> {
  try {
    console.log('Calculating missing voucher amounts from accounting entries...');
    
    // Get vouchers with zero or missing amounts
    const { data: vouchersToUpdate, error: vouchersError } = await supabase
      .from('tally_trn_voucher')
      .select('guid, voucher_number, total_amount, final_amount')
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .or('total_amount.is.null,total_amount.eq.0,final_amount.is.null,final_amount.eq.0');

    if (vouchersError) {
      console.error('Error fetching vouchers to update:', vouchersError);
      return;
    }

    if (!vouchersToUpdate || vouchersToUpdate.length === 0) {
      console.log('No vouchers need amount calculation');
      return;
    }

    console.log(`Found ${vouchersToUpdate.length} vouchers needing amount calculation`);

    // Process each voucher
    for (const voucher of vouchersToUpdate) {
      try {
        // Get accounting entries for this voucher
        const { data: accountingEntries, error: accountingError } = await supabase
          .from('trn_accounting')
          .select('amount, is_deemed_positive')
          .eq('voucher_guid', voucher.guid)
          .eq('company_id', companyId)
          .eq('division_id', divisionId);

        if (accountingError) {
          console.error(`Error fetching accounting entries for voucher ${voucher.voucher_number}:`, accountingError);
          continue;
        }

        if (!accountingEntries || accountingEntries.length === 0) {
          console.log(`No accounting entries found for voucher ${voucher.voucher_number}`);
          continue;
        }

        // Calculate amounts
        let totalAmount = 0;
        let finalAmount = 0;

        for (const entry of accountingEntries) {
          const amount = Math.abs(parseFloat(entry.amount || 0));
          totalAmount += amount;

          // Calculate net amount (considering debits/credits)
          if (entry.is_deemed_positive === 1) {
            finalAmount += parseFloat(entry.amount || 0);
          } else {
            finalAmount -= amount;
          }
        }

        // Update voucher with calculated amounts
        const { error: updateError } = await supabase
          .from('tally_trn_voucher')
          .update({
            total_amount: totalAmount,
            basic_amount: totalAmount,
            net_amount: Math.abs(finalAmount),
            final_amount: finalAmount
          })
          .eq('guid', voucher.guid);

        if (updateError) {
          console.error(`Error updating amounts for voucher ${voucher.voucher_number}:`, updateError);
        } else {
          console.log(`Updated amounts for voucher ${voucher.voucher_number}: total=${totalAmount}, final=${finalAmount}`);
        }

      } catch (error) {
        console.error(`Exception processing voucher ${voucher.voucher_number}:`, error);
      }
    }

    console.log('Completed voucher amount calculations');

  } catch (error) {
    console.error('Error in calculateMissingVoucherAmounts:', error);
  }
}

async function performFullSync(
  supabase: any,
  companyId: string,
  divisionId: string,
  tablesFilter?: string[]
): Promise<any> {
  console.log(`Starting full sync for company: ${companyId}, division: ${divisionId}`);
  
  // Create sync job record
  const { data: syncJob, error: jobError } = await supabase
    .from('tally_sync_jobs')
    .insert({
      company_id: companyId,
      division_id: divisionId,
      status: 'running',
      job_type: 'full_sync',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (jobError) {
    throw new Error(`Failed to create sync job: ${jobError.message}`);
  }

  const jobId = syncJob.id;
  const syncResults: any = {
    jobId,
    tablesProcessed: {},
    totalRecords: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalErrors: 0,
    startTime: new Date().toISOString()
  };

  try {
    // Filter tables if specified
    const tablesToSync = tablesFilter 
      ? TABLE_MAPPINGS.filter(tm => tablesFilter.includes(tm.apiTable))
      : TABLE_MAPPINGS;

    console.log(`Syncing ${tablesToSync.length} tables`);

    for (const tableMapping of tablesToSync) {
      console.log(`Processing table: ${tableMapping.apiTable} -> ${tableMapping.supabaseTable}`);
      
      try {
        // Query data from new API
        const apiData = await queryNewAPI(
          tableMapping.endpoint,
          companyId,
          divisionId,
          tableMapping.apiTable
        );

        const records = apiData.records || [];
        console.log(`Retrieved ${records.length} records for ${tableMapping.apiTable}`);

        if (records.length > 0) {
          // Bulk sync to Supabase
          const syncStats = await bulkSyncToSupabase(
            supabase,
            tableMapping.supabaseTable,
            records,
            companyId,
            divisionId,
            tableMapping.keyField
          );

          syncResults.tablesProcessed[tableMapping.apiTable] = {
            records: records.length,
            inserted: syncStats.inserted,
            updated: syncStats.updated,
            errors: syncStats.errors
          };

          syncResults.totalRecords += records.length;
          syncResults.totalInserted += syncStats.inserted;
          syncResults.totalUpdated += syncStats.updated;
          syncResults.totalErrors += syncStats.errors;

          // Log sync job details
          for (let i = 0; i < Math.min(records.length, 10); i++) {
            const record = records[i];
            await supabase
              .from('tally_sync_job_details')
              .insert({
                job_id: jobId,
                table_name: tableMapping.supabaseTable,
                action: 'upserted',
                record_guid: record[tableMapping.keyField] || `record_${i}`,
                record_details: record,
                voucher_number: record.voucher_number || null
              });
          }
        }

        console.log(`Completed processing ${tableMapping.apiTable}`);
        
      } catch (tableError) {
        console.error(`Error processing table ${tableMapping.apiTable}:`, tableError);
        
        syncResults.tablesProcessed[tableMapping.apiTable] = {
          records: 0,
          inserted: 0,
          updated: 0,
          errors: 1,
          error: tableError.message
        };
        
        syncResults.totalErrors++;

        // Log error details
        await supabase
          .from('tally_sync_job_details')
          .insert({
            job_id: jobId,
            table_name: tableMapping.supabaseTable,
            action: 'error',
            record_guid: 'table_sync',
            error_message: tableError.message
          });
      }
    }

    // Post-processing: Link relationships based on voucher_number -> voucher_guid
    console.log('Starting post-processing: linking voucher relationships...');
    await linkVoucherRelationships(supabase, companyId, divisionId);

    // Post-processing: Calculate voucher amounts from accounting entries
    console.log('Starting post-processing: calculating voucher amounts...');
    await calculateMissingVoucherAmounts(supabase, companyId, divisionId);

    // Update sync job as completed
    syncResults.endTime = new Date().toISOString();
    
    await supabase
      .from('tally_sync_jobs')
      .update({
        status: 'completed',
        records_processed: syncResults.totalRecords,
        completed_at: syncResults.endTime
      })
      .eq('id', jobId);

    console.log('Full sync completed successfully');
    return syncResults;

  } catch (error) {
    console.error('Full sync failed:', error);
    
    // Update sync job as failed
    await supabase
      .from('tally_sync_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      companyId, 
      divisionId, 
      tables = null, // Optional array of specific tables to sync
      action = 'full_sync' // 'full_sync' | 'health_check' | 'metadata'
    } = await req.json();

    console.log(`Processing ${action} request for company: ${companyId}, division: ${divisionId}`);

    // Validate UUIDs
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify company and division exist
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('id, name, company_id')
      .eq('id', divisionId)
      .eq('company_id', companyId)
      .single();

    if (divisionError || !division) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Company or division not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let result;

    switch (action) {
      case 'full_sync':
        result = await performFullSync(supabase, companyId, divisionId, tables);
        break;
        
      case 'health_check':
        // Check API health
        const apiUrl = 'https://tally-sync-vyaapari360-railway-production.up.railway.app';
        const healthResponse = await fetch(`${apiUrl}/api/v1/health`);
        const healthData = await healthResponse.json();
        
        result = {
          api_health: healthData,
          supabase_connection: true,
          division_found: true
        };
        break;
        
      case 'metadata':
        // Get metadata from API
        const metadataUrl = 'https://tally-sync-vyaapari360-railway-production.up.railway.app';
        const metadataResponse = await fetch(`${metadataUrl}/api/v1/metadata/${companyId}/${divisionId}`);
        const metadataData = await metadataResponse.json();
        
        result = metadataData;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Full sync function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});