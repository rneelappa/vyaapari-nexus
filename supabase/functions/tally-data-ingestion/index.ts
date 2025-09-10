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

interface TallyDataRequest {
  api_key: string;
  data_type: 'master' | 'transaction' | 'bulk';
  table_name: string;
  operation: 'insert' | 'update' | 'upsert' | 'delete';
  company_id: string;
  division_id: string;
  data: any[] | any;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  processed_count?: number;
  failed_count?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Tally Data Ingestion request received');
    
    const requestData: TallyDataRequest = await req.json();
    
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
    if (!requestData.company_id || !requestData.division_id || !requestData.table_name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: company_id, division_id, table_name'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${requestData.operation} operation on ${requestData.table_name}`);
    
    const result = await processData(requestData);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('Error in tally-data-ingestion:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processData(request: TallyDataRequest): Promise<ApiResponse> {
  const { table_name, operation, data, company_id, division_id } = request;
  
  try {
    // Ensure data is an array for batch processing
    const dataArray = Array.isArray(data) ? data : [data];
    let processed_count = 0;
    let failed_count = 0;
    const errors: string[] = [];

    console.log(`Processing ${dataArray.length} records for table ${table_name}`);

    for (const record of dataArray) {
      try {
        // Add company_id and division_id to each record
        const enrichedRecord = {
          ...record,
          company_id,
          division_id
        };

        let result;
        
        switch (operation) {
          case 'insert':
            result = await supabase.from(table_name).insert(enrichedRecord);
            break;
            
          case 'update':
            if (!record.guid) {
              throw new Error('GUID required for update operation');
            }
            result = await supabase
              .from(table_name)
              .update(enrichedRecord)
              .eq('guid', record.guid)
              .eq('company_id', company_id)
              .eq('division_id', division_id);
            break;
            
          case 'upsert':
            result = await supabase
              .from(table_name)
              .upsert(enrichedRecord, { 
                onConflict: 'guid,company_id,division_id',
                ignoreDuplicates: false 
              });
            break;
            
          case 'delete':
            if (!record.guid) {
              throw new Error('GUID required for delete operation');
            }
            result = await supabase
              .from(table_name)
              .delete()
              .eq('guid', record.guid)
              .eq('company_id', company_id)
              .eq('division_id', division_id);
            break;
            
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }

        if (result.error) {
          console.error(`Database error for record:`, result.error);
          errors.push(`Record error: ${result.error.message}`);
          failed_count++;
        } else {
          processed_count++;
        }

      } catch (recordError) {
        console.error(`Processing error for record:`, recordError);
        errors.push(`Record processing error: ${recordError.message}`);
        failed_count++;
      }
    }

    return {
      success: failed_count === 0,
      message: `Processed ${processed_count} records successfully, ${failed_count} failed`,
      processed_count,
      failed_count,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error(`Error processing data for table ${table_name}:`, error);
    return {
      success: false,
      message: `Failed to process data: ${error.message}`,
      errors: [error.message],
      processed_count: 0,
      failed_count: 1
    };
  }
}