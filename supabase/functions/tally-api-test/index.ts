import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const tallyApiKey = Deno.env.get('TALLY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing tally-api endpoint with correct authentication');
    
    // Test different API endpoints to verify authentication works
    const testCases = [
      { action: 'getCompanies', description: 'Get Companies' },
      { action: 'getLedgers', description: 'Get Ledgers' },
      { action: 'getGroups', description: 'Get Groups' },
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`Testing ${testCase.description}...`);
        
        // Call the tally-api function with proper authentication
        const response = await supabase.functions.invoke('tally-api', {
          body: {
            api_key: tallyApiKey, // This is the critical part - include the API key
            action: testCase.action,
            filters: {
              limit: 5
            }
          }
        });

        if (response.error) {
          console.error(`Error calling ${testCase.action}:`, response.error);
          results.push({
            test: testCase.description,
            success: false,
            error: response.error.message
          });
        } else {
          console.log(`Success calling ${testCase.action}, got ${response.data?.count || 0} records`);
          results.push({
            test: testCase.description,
            success: true,
            count: response.data?.count || 0,
            data: response.data?.data?.slice(0, 2) // Show first 2 records as sample
          });
        }
      } catch (error) {
        console.error(`Exception in ${testCase.description}:`, error);
        results.push({
          test: testCase.description,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      message: 'Tally API authentication test completed',
      api_key_configured: !!tallyApiKey,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in tally-api-test:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Test failed',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});