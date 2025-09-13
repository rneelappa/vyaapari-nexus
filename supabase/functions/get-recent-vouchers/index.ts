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

    const { divisionId, days, fromDate, toDate } = requestBody;
    
    console.log('Extracted data:', { 
      divisionId, 
      days,
      fromDate,
      toDate 
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

    // Get company information from mst_company table
    console.log('Fetching company information...');
    const { data: companies, error: companyError } = await supabase
      .from('mst_company')
      .select('company_name, company_id')
      .limit(1);

    if (companyError) {
      console.error('Error fetching company:', companyError);
    }

    const companyName = companies?.[0]?.company_name || 'Unknown Company';
    console.log(`Company found: "${companyName}"`);

    // Calculate the date range
    let startDate: string;
    let endDate: string;
    
    if (fromDate && toDate) {
      // Use provided date range
      startDate = fromDate;
      endDate = toDate;
    } else {
      // Use days parameter (fallback to legacy behavior)
      const dayCount = days || 1;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayCount);
      startDate = cutoffDate.toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
    }
    
    console.log('Fetching vouchers from date range:', { startDate, endDate });

    // Get vouchers from the division within the date range
    console.log('Querying with params:', { divisionId, startDate, endDate, companyName });
    
    const { data: vouchers, error: vouchersError } = await supabase
      .from('tally_trn_voucher')
      .select('*')
      .eq('division_id', divisionId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    console.log('Query results:', { vouchersCount: vouchers?.length, error: vouchersError });

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

    // Get division info for context (including Tally connectivity)
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('name, tally_enabled, tally_url, tally_company_id')
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

    // Fallback: If no DB vouchers, try fetching from Tally DayBook using division.tally_url
    const tallyCompany = division?.tally_company_id || companyName;
    let tallyInfo: any = null;

    if ((vouchers?.length || 0) === 0 && division?.tally_url) {
      try {
        console.log('No DB vouchers found. Attempting Tally DayBook fetch...', { tallyCompany, tallyUrl: division.tally_url });
        const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n  <HEADER>\n    <VERSION>1</VERSION>\n    <TALLYREQUEST>Export</TALLYREQUEST>\n    <TYPE>Data</TYPE>\n    <ID>DayBook</ID>\n  </HEADER>\n  <BODY>\n    <DESC>\n      <STATICVARIABLES>\n        <SVFROMDATE>${startDate}</SVFROMDATE>\n        <SVTODATE>${endDate}</SVTODATE>\n        <SVCURRENTCOMPANY>${tallyCompany}</SVCURRENTCOMPANY>\n      </STATICVARIABLES>\n    </DESC>\n  </BODY>\n</ENVELOPE>`;

        const tallyResp = await fetch(division.tally_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml', 'ngrok-skip-browser-warning': 'true' },
          body: xmlPayload,
        });

        const xmlText = await tallyResp.text();
        const matches = xmlText.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/g) || [];
        tallyInfo = {
          requestedCompany: tallyCompany,
          url: division.tally_url,
          status: tallyResp.status,
          voucherCount: matches.length,
          responseLength: xmlText.length,
        };
        console.log('Tally fallback result:', tallyInfo);
      } catch (tallyError) {
        console.error('Tally fallback error:', tallyError);
        tallyInfo = { requestedCompany: tallyCompany, url: division?.tally_url, error: String(tallyError) };
      }
    }

    const responseData = {
      success: true,
      vouchers: vouchers || [],
      division: division || null,
      tally: tallyInfo,
      filters: {
        divisionId,
        days,
        fromDate,
        toDate,
        startDate,
        endDate
      },
      summary: {
        totalVouchers: vouchers?.length || 0,
        tallyVoucherCount: tallyInfo?.voucherCount || 0,
        dateRange: fromDate && toDate 
          ? `${startDate} to ${endDate}` 
          : `Last ${days || 1} day(s) from ${startDate}`
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