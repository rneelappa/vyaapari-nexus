import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('get-recent-vouchers function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { divisionId, days = 1 } = requestBody;
    
    console.log('Extracted data:', { 
      divisionId, 
      days 
    });
    
    if (!divisionId) {
      console.error('Missing required data:', { divisionId });
      return new Response(
        JSON.stringify({ success: false, error: 'Division ID is required' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: missing Supabase credentials' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized');

    // Calculate the date cutoff (last N days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('Fetching vouchers from date:', cutoffDateString);

    // Get recent vouchers from the division
    const { data: vouchers, error: vouchersError } = await supabase
      .from('tally_trn_voucher')
      .select('*')
      .eq('division_id', divisionId)
      .gte('date', cutoffDateString)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    console.log('Vouchers query result:', { vouchers: vouchers?.length, vouchersError });

    if (vouchersError) {
      console.error('Vouchers query error:', vouchersError);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${vouchersError.message}` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get division info for context
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('name, tally_enabled')
      .eq('id', divisionId)
      .maybeSingle();

    console.log('Division query result:', { division, divisionError });

    if (divisionError) {
      console.error('Division query error:', divisionError);
      return new Response(
        JSON.stringify({ success: false, error: `Division lookup error: ${divisionError.message}` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseData = {
      success: true,
      vouchers: vouchers || [],
      division: division || null,
      filters: {
        divisionId,
        days,
        cutoffDate: cutoffDateString
      },
      summary: {
        totalVouchers: vouchers?.length || 0,
        dateRange: `Last ${days} day(s) from ${cutoffDateString}`
      }
    };

    console.log('Returning response:', { 
      voucherCount: vouchers?.length, 
      divisionName: division?.name 
    });
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in get-recent-vouchers function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Internal server error: ${error.message}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})