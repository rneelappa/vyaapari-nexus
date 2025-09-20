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

interface WebhookPayload {
  api_key: string;
  event_type: 'master_data_changed' | 'transaction_created' | 'voucher_updated' | 'ledger_updated';
  company_id: string;
  division_id: string;
  entity_type: string;
  entity_guid: string;
  entity_data: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Tally webhook received');
    
    const payload: WebhookPayload = await req.json();
    
    // Validate API key
    if (payload.api_key !== tallyApiKey) {
      console.error('Invalid API key in webhook');
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid API key'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing webhook event: ${payload.event_type} for ${payload.entity_type}`);
    
    const result = await processWebhookEvent(payload);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in tally-webhook-handler:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processWebhookEvent(payload: WebhookPayload) {
  const { event_type, entity_type, entity_guid, entity_data, company_id, division_id } = payload;
  
  try {
    // Map entity types to table names
    const tableMapping: { [key: string]: string } = {
      'ledger': 'mst_ledger',
      'group': 'mst_group',
      'stock_item': 'mst_stock_item',
      'voucher': 'trn_voucher',
      'cost_centre': 'mst_cost_centre',
      'godown': 'mst_godown',
      'company': 'mst_company',
      'division': 'mst_division'
    };

    const tableName = tableMapping[entity_type];
    if (!tableName) {
      throw new Error(`Unknown entity type: ${entity_type}`);
    }

    // Enrich entity data with required fields
    const enrichedData = {
      ...entity_data,
      guid: entity_guid,
      company_id,
      division_id
    };

    let result;
    
    switch (event_type) {
      case 'master_data_changed':
      case 'ledger_updated':
        // Upsert the master data
        result = await supabase
          .from(tableName)
          .upsert(enrichedData, { 
            onConflict: 'guid,company_id,division_id',
            ignoreDuplicates: false 
          });
        break;
        
      case 'transaction_created':
      case 'voucher_updated':
        // For transactions, try insert first, then update if it exists
        result = await supabase
          .from(tableName)
          .upsert(enrichedData, { 
            onConflict: 'guid,company_id,division_id',
            ignoreDuplicates: false 
          });
        break;
        
      default:
        throw new Error(`Unsupported event type: ${event_type}`);
    }

    if (result.error) {
      console.error('Database operation failed:', result.error);
      throw new Error(`Database error: ${result.error.message}`);
    }

    console.log(`Successfully processed ${event_type} for ${entity_type} with GUID: ${entity_guid}`);

    return {
      success: true,
      message: `Webhook processed successfully`,
      event_type,
      entity_type,
      entity_guid
    };

  } catch (error) {
    console.error('Error processing webhook event:', error);
    return {
      success: false,
      message: `Failed to process webhook: ${error.message}`,
      event_type,
      entity_type: payload.entity_type,
      entity_guid: payload.entity_guid
    };
  }
}