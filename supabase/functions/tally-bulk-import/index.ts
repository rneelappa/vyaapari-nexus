import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const tallyApiKey = Deno.env.get('TALLY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BulkImportRequest {
  api_key: string;
  company_id: string;
  division_id: string;
  import_type: 'full_sync' | 'incremental' | 'master_only' | 'transaction_only';
  batch_size?: number;
  tables: {
    table_name: string;
    operation: 'replace' | 'upsert' | 'append';
    data: any[];
  }[];
}

const BATCH_SIZE = 100; // Default batch size for processing

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Tally bulk import request received');
    
    const requestData: BulkImportRequest = await req.json();
    
    // Validate API key
    if (requestData.api_key !== tallyApiKey) {
      console.error('Invalid API key provided');
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid API key'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!requestData.company_id || !requestData.division_id || !requestData.tables?.length) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: company_id, division_id, tables'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing bulk import for ${requestData.tables.length} tables`);
    
    const result = await processBulkImport(requestData);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('Error in tally-bulk-import:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Bulk import failed',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processBulkImport(request: BulkImportRequest) {
  const { company_id, division_id, tables, batch_size = BATCH_SIZE } = request;
  
  const results = [];
  let totalProcessed = 0;
  let totalFailed = 0;
  
  try {
    console.log(`Starting bulk import for company: ${company_id}, division: ${division_id}`);

    for (const tableConfig of tables) {
      const { table_name, operation, data } = tableConfig;
      
      console.log(`Processing table: ${table_name} with ${data.length} records`);
      
      const tableResult = await processTable(
        table_name, 
        operation, 
        data, 
        company_id, 
        division_id, 
        batch_size
      );
      
      results.push({
        table_name,
        ...tableResult
      });
      
      totalProcessed += tableResult.processed_count || 0;
      totalFailed += tableResult.failed_count || 0;
    }

    return {
      success: totalFailed === 0,
      message: `Bulk import completed. Processed: ${totalProcessed}, Failed: ${totalFailed}`,
      total_processed: totalProcessed,
      total_failed: totalFailed,
      table_results: results
    };

  } catch (error) {
    console.error('Error in bulk import:', error);
    return {
      success: false,
      message: `Bulk import failed: ${error.message}`,
      total_processed: totalProcessed,
      total_failed: totalFailed,
      table_results: results
    };
  }
}

async function processTable(
  tableName: string, 
  operation: string, 
  data: any[], 
  companyId: string, 
  divisionId: string, 
  batchSize: number
) {
  let processed_count = 0;
  let failed_count = 0;
  const errors: string[] = [];

  try {
    // Handle replace operation - clear existing data first
    if (operation === 'replace') {
      console.log(`Clearing existing data for ${tableName}`);
      const deleteResult = await supabase
        .from(tableName)
        .delete()
        .eq('company_id', companyId)
        .eq('division_id', divisionId);
        
      if (deleteResult.error) {
        console.error(`Failed to clear table ${tableName}:`, deleteResult.error);
        errors.push(`Failed to clear table: ${deleteResult.error.message}`);
      }
    }

    // Process data in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // Enrich each record with company_id and division_id
      const enrichedBatch = batch.map(record => ({
        ...record,
        company_id: companyId,
        division_id: divisionId
      }));

      try {
        let result;
        
        switch (operation) {
          case 'replace':
          case 'append':
            result = await supabase.from(tableName).insert(enrichedBatch);
            break;
            
          case 'upsert':
            // For upsert, try insert first, if conflicts occur, handle individually
            result = await supabase.from(tableName).insert(enrichedBatch);
            if (result.error && result.error.code === '23505') {
              // Handle conflicts by updating individual records
              for (const record of enrichedBatch) {
                const { company_id: _, division_id: __, ...updateData } = record;
                await supabase
                  .from(tableName)
                  .update(updateData)
                  .eq('guid', record.guid)
                  .eq('company_id', companyId)
                  .eq('division_id', divisionId);
              }
              result = { error: null }; // Reset error since we handled it
            }
            break;
            
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }

        if (result.error) {
          console.error(`Batch error for ${tableName}:`, result.error);
          errors.push(`Batch ${i / batchSize + 1}: ${result.error.message}`);
          failed_count += batch.length;
        } else {
          processed_count += batch.length;
          console.log(`Processed batch ${i / batchSize + 1} for ${tableName}: ${batch.length} records`);
        }

      } catch (batchError) {
        console.error(`Batch processing error:`, batchError);
        errors.push(`Batch ${i / batchSize + 1}: ${batchError.message}`);
        failed_count += batch.length;
      }
    }

    return {
      success: failed_count === 0,
      processed_count,
      failed_count,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error(`Error processing table ${tableName}:`, error);
    return {
      success: false,
      processed_count,
      failed_count: data.length,
      errors: [error.message]
    };
  }
}