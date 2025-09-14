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

    const { divisionId, days, fromDate, toDate, forceTally } = requestBody;
    
    console.log('Extracted data:', { 
      divisionId, 
      days,
      fromDate,
      toDate,
      forceTally 
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

    // Get company information linked to the current division
    console.log('Fetching company information for division:', divisionId);
    const { data: companies, error: companyError } = await supabase
      .from('mst_company')
      .select('company_name, company_id, vyaapari_division_id')
      .eq('vyaapari_division_id', divisionId)
      .limit(1);

    if (companyError) {
      console.error('Error fetching company:', companyError);
    }

    const companyName = companies?.[0]?.company_name || 'Unknown Company';
    console.log(`Company found: "${companyName}" for division: ${divisionId}`);

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

    let finalVouchers = vouchers || [];

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
    const tallyCompany = companyName || division?.tally_company_id || 'Unknown Company';
    let tallyInfo: any = null;
    let parseResults: any = null;

    if (((finalVouchers.length || 0) === 0 || forceTally) && division?.tally_url) {
      try {
        // Convert dates to YYYYMMDD format for Tally
        const tallyFromDate = startDate.replace(/-/g, '');
        const tallyToDate = endDate.replace(/-/g, '');
        
        console.log('Fetching Tally DayBook...', { 
          tallyCompany, 
          tallyUrl: division.tally_url, 
          forceTally,
          originalDateRange: `${startDate} to ${endDate}`,
          tallyDateRange: `${tallyFromDate} to ${tallyToDate}`
        });
        
        const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n  <HEADER>\n    <VERSION>1</VERSION>\n    <TALLYREQUEST>Export</TALLYREQUEST>\n    <TYPE>Data</TYPE>\n    <ID>DayBook</ID>\n  </HEADER>\n  <BODY>\n    <DESC>\n      <STATICVARIABLES>\n        <SVFROMDATE>${tallyFromDate}</SVFROMDATE>\n        <SVTODATE>${tallyToDate}</SVTODATE>\n        <SVCURRENTCOMPANY>${tallyCompany}</SVCURRENTCOMPANY>\n      </STATICVARIABLES>\n    </DESC>\n  </BODY>\n</ENVELOPE>`;

        const tallyResp = await fetch(division.tally_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml', 'ngrok-skip-browser-warning': 'true' },
          body: xmlPayload,
        });

        const xmlText = await tallyResp.text();
        
        // Parse and upsert XML data to database tables
        try {
          const parseResp = await supabase.functions.invoke('tally-xml-parser', {
            body: {
              xmlText,
              divisionId,
              companyId: companies?.[0]?.company_id
            }
          });
          
          if (parseResp.data?.success) {
            parseResults = parseResp.data;
            console.log('XML parsing results:', parseResults.summary);
          }
        } catch (parseError) {
          console.error('Error parsing XML:', parseError);
        }
        
        const voucherMatches = xmlText.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/g) || [];
        
        // Parse Tally vouchers from XML for display
        const tallyVouchers = voucherMatches.map((voucherXml, index) => {
          // Extract voucher data from XML using correct Tally field names
          const dateMatch = voucherXml.match(/<DATE>(.*?)<\/DATE>/);
          const vchNumMatch = voucherXml.match(/<VOUCHERNUMBER>(.*?)<\/VOUCHERNUMBER>/);
          const vchTypeMatch = voucherXml.match(/<VOUCHERTYPENAME>(.*?)<\/VOUCHERTYPENAME>/);
          const narrationMatch = voucherXml.match(/<NARRATION>(.*?)<\/NARRATION>/);
          const partyMatch = voucherXml.match(/<PARTYLEDGERNAME>(.*?)<\/PARTYLEDGERNAME>/);
          const guidMatch = voucherXml.match(/<GUID>(.*?)<\/GUID>/);
          
          // Convert Tally date format (YYYYMMDD) to standard date format
          let formattedDate = null;
          if (dateMatch?.[1]) {
            const dateStr = dateMatch[1];
            if (dateStr.length === 8) {
              const year = dateStr.substring(0, 4);
              const month = dateStr.substring(4, 6);
              const day = dateStr.substring(6, 8);
              formattedDate = `${year}-${month}-${day}`;
            }
          }
          
          return {
            guid: guidMatch?.[1] || `tally-temp-${Date.now()}-${index}`,
            voucher_number: vchNumMatch?.[1] || `TALLY-${index + 1}`,
            date: formattedDate,
            voucher_type: vchTypeMatch?.[1] || 'Unknown',
            narration: (narrationMatch?.[1] && narrationMatch[1].trim()) || partyMatch?.[1] || 'No description',
            created_at: new Date().toISOString(),
            company_id: null,
            division_id: divisionId
          };
        });

        // Filter vouchers by the requested date range since Tally doesn't seem to filter properly
        const filteredTallyVouchers = tallyVouchers.filter(voucher => {
          if (!voucher.date) return false;
          
          const voucherDate = voucher.date;
          const isInRange = voucherDate >= startDate && voucherDate <= endDate;
          
          if (!isInRange) {
            console.log(`Filtering out voucher ${voucher.voucher_number} with date ${voucherDate} (outside range ${startDate} to ${endDate})`);
          }
          
          return isInRange;
        });

        console.log(`Tally returned ${tallyVouchers.length} vouchers, ${filteredTallyVouchers.length} are within date range ${startDate} to ${endDate}`);

        // Calculate diagnostics
        const voucherDates = tallyVouchers.map(v => v.date).filter(Boolean);
        const minDate = voucherDates.length > 0 ? Math.min(...voucherDates.map(d => new Date(d).getTime())) : null;
        const maxDate = voucherDates.length > 0 ? Math.max(...voucherDates.map(d => new Date(d).getTime())) : null;

        tallyInfo = {
          requestedCompany: tallyCompany,
          url: division.tally_url,
          status: tallyResp.status,
          voucherCount: tallyVouchers.length,
          filteredVoucherCount: filteredTallyVouchers.length,
          responseLength: xmlText.length,
          requestXml: xmlPayload,
          responseXml: xmlText,
          diagnostics: {
            vouchersInXml: tallyVouchers.length,
            vouchersAfterFilter: filteredTallyVouchers.length,
            requestedDateRange: `${startDate} to ${endDate}`,
            tallyDateFormat: `${tallyFromDate} to ${tallyToDate}`,
            minDateInResponse: minDate ? new Date(minDate).toISOString().split('T')[0] : null,
            maxDateInResponse: maxDate ? new Date(maxDate).toISOString().split('T')[0] : null,
            sampleVoucherDates: voucherDates.slice(0, 5)
          }
        };
        
        console.log('Tally fallback result:', { ...tallyInfo, responseXml: `len=${xmlText.length}` });
        console.log('Parsed Tally vouchers:', tallyVouchers.length);
        
        // Use filtered Tally vouchers if database is empty
        if (filteredTallyVouchers.length > 0) {
          finalVouchers = filteredTallyVouchers;
        }
        
      } catch (tallyError) {
        console.error('Tally fallback error:', tallyError);
        tallyInfo = { requestedCompany: tallyCompany, url: division?.tally_url, error: String(tallyError) };
      }
    }

    const responseData = {
      success: true,
      vouchers: finalVouchers,
      division: division || null,
      tally: tallyInfo,
      parseResults: parseResults,
      filters: {
        divisionId,
        days,
        fromDate,
        toDate,
        startDate,
        endDate
      },
      summary: {
        totalVouchers: finalVouchers.length || 0,
        tallyVoucherCount: tallyInfo?.voucherCount || 0,
        dateRange: fromDate && toDate 
          ? `${startDate} to ${endDate}` 
          : `Last ${days || 1} day(s) from ${startDate}`,
        source: finalVouchers.length > 0 && (finalVouchers[0] as any).guid?.startsWith('tally-temp-') ? 'tally' : 'database'
      }
    };

    console.log('Returning response:', { 
      voucherCount: finalVouchers.length, 
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