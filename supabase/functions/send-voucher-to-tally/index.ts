import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function normalizeEducationModeDate(inputIso?: string): string {
  // Education Mode allowed: 1st, 2nd, or last day of month
  try {
    let d: Date;
    if (inputIso) {
      if (inputIso.length === 10 && inputIso.includes('-')) d = new Date(inputIso + 'T00:00:00Z');
      else if (/^\d{8}$/.test(inputIso)) return inputIso; // YYYYMMDD already
      else d = new Date();
    } else d = new Date();
    
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const chosen = day === 1 ? 1 : (day === 2 ? 2 : last);
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(chosen).padStart(2, '0');
    return `${y}${mm}${dd}`;
  } catch { 
    return new Date().toISOString().slice(0,10).replace(/-/g, ''); 
  }
}

function generateVoucherXML(voucherData: any, companyName: string): string {
  const { 
    date, 
    voucherNumber, 
    partyLedger, 
    salesLedger, 
    totalAmount, 
    narration = '',
    lines = []
  } = voucherData;

  const tallyDate = normalizeEducationModeDate(date);

  // Build ledger entries
  let ledgerEntries = `
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${partyLedger.name}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>${totalAmount.toFixed(2)}</AMOUNT>
      <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
      <NARRATION></NARRATION>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${salesLedger.name}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>${(-totalAmount).toFixed(2)}</AMOUNT>
      <ISPARTYLEDGER>No</ISPARTYLEDGER>
      <NARRATION></NARRATION>
    </ALLLEDGERENTRIES.LIST>`;

  // Add additional ledger entries (taxes, charges, etc.)
  lines.forEach((line: any) => {
    if (line.type === 'ledger' && line.ledger && (line.debit || line.credit)) {
      const amount = line.debit || -(line.credit || 0);
      const isDeemedPositive = amount < 0 ? "Yes" : "No";
      
      ledgerEntries += `
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${line.ledger.name}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>${isDeemedPositive}</ISDEEMEDPOSITIVE>
      <AMOUNT>${amount.toFixed(2)}</AMOUNT>
      <ISPARTYLEDGER>No</ISPARTYLEDGER>
      <NARRATION></NARRATION>
    </ALLLEDGERENTRIES.LIST>`;
    }
  });

  // Build inventory entries
  let inventoryEntries = '';
  lines.forEach((line: any) => {
    if (line.type === 'inventory' && line.stockItem) {
      let stockItemName = '';
      if (typeof line.stockItem === 'string') {
        stockItemName = `Stock Item ${line.stockItem.slice(-6)}`;
      } else if (line.stockItem && line.stockItem.name) {
        stockItemName = line.stockItem.name;
      } else {
        stockItemName = 'Unknown Stock Item';
      }

      inventoryEntries += `
    <ALLINVENTORYENTRIES.LIST>
      <STOCKITEMNAME>${stockItemName}</STOCKITEMNAME>
      <RATE>${line.rate ? line.rate.toFixed(2) : '0.00'}</RATE>
      <ACTUALQTY>${line.quantity || 0}</ACTUALQTY>
      <BILLEDQTY>${line.quantity || 0}</BILLEDQTY>
      <AMOUNT>${line.amount.toFixed(2)}</AMOUNT>
      ${line.godown ? `<GODOWNNAME>Main Godown</GODOWNNAME>` : ''}
    </ALLINVENTORYENTRIES.LIST>`;
    }
  });

  return `<?xml version="1.0"?>
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
                <IMPORTDUPS>@@DUPCOMBINE</IMPORTDUPS>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="SALES" ACTION="Create" OBJVIEW="Accounting Voucher View">
                    <DATE>${tallyDate}</DATE>
                    <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>
                    <VCHSTATUSDATE>${tallyDate}</VCHSTATUSDATE>
                    <VOUCHERTYPENAME>SALES</VOUCHERTYPENAME>
                    <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                    <REFERENCE>${narration || 'Sales voucher from Vyaapari360'}</REFERENCE>
                    <NARRATION>${narration || 'Sales voucher from Vyaapari360'}</NARRATION>
                    <PARTYLEDGERNAME>${partyLedger.name}</PARTYLEDGERNAME>
                    ${ledgerEntries}
                    ${inventoryEntries}
                </VOUCHER>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>`;
}

serve(async (req) => {
  console.log('send-voucher-to-tally function called');
  
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

    const { voucherData, divisionId, companyName = 'Default Company' } = requestBody;
    
    console.log('Extracted data:', { 
      hasVoucherData: !!voucherData, 
      divisionId, 
      companyName 
    });
    
    if (!voucherData || !divisionId) {
      console.error('Missing required data:', { voucherData: !!voucherData, divisionId });
      return new Response(
        JSON.stringify({ success: false, error: 'Voucher data and division ID are required' }),
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

    // Get division and its Tally URL
    console.log('Fetching division data for ID:', divisionId);
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('tally_url, tally_enabled, name')
      .eq('id', divisionId)
      .maybeSingle();

    console.log('Division query result:', { division, divisionError });

    if (divisionError) {
      console.error('Division query error:', divisionError);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${divisionError.message}` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!division) {
      console.error('Division not found for ID:', divisionId);
      return new Response(
        JSON.stringify({ success: false, error: 'Division not found', divisionId }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Division found:', { 
      name: division.name, 
      tally_enabled: division.tally_enabled, 
      hasUrl: !!division.tally_url 
    });

    if (!division.tally_enabled || !division.tally_url) {
      console.error('Tally not configured:', { 
        tally_enabled: division.tally_enabled, 
        tally_url: !!division.tally_url 
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Tally integration not enabled or URL not configured for this division', tallyUrl: division.tally_url ?? null }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate XML from voucher data
    const xmlContent = generateVoucherXML(voucherData, companyName);
    console.log('Generated XML:', xmlContent);
    console.log('Sending to Tally URL:', division.tally_url);

    // Send XML directly to Tally
    console.log('Sending XML to Tally...');
    let response, responseText;
    try {
      response = await fetch(division.tally_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Content-Length': xmlContent.length.toString()
        },
        body: xmlContent
      });
      console.log('Tally response status:', response.status, response.statusText);
      
      responseText = await response.text();
      console.log('Tally response body:', responseText);
    } catch (fetchError) {
      console.error('Error sending to Tally:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to connect to Tally: ${fetchError.message}`,
          tallyUrl: division.tally_url,
          divisionName: division.name
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse Tally XML response for success indicators
    const hasStatusSuccess = responseText.includes('<STATUS>1</STATUS>');
    const hasCreated = /CREATED>(\d+)<\/CREATED/.test(responseText);
    const hasErrors = responseText.includes('<ERRORS>0</ERRORS>');
    const success = response.ok && hasStatusSuccess && hasErrors;
    
    console.log('Tally response analysis:', { 
      httpOk: response.ok,
      hasStatusSuccess, 
      hasCreated, 
      hasErrors,
      finalSuccess: success 
    });
    
    return new Response(JSON.stringify({
      success,
      message: success ? 'Voucher sent to Tally successfully' : 'Failed to send voucher to Tally',
      response: responseText,
      error: success ? null : `Tally returned status ${response.status}`,
      xmlSent: xmlContent,
      tallyUrl: division.tally_url,
      divisionName: division.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in send-voucher-to-tally function:', error);
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