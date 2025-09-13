import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAILWAY_BACKEND_URL = "https://vyaapari-xml-parser-q7f7wy4qyq-el.a.run.app"
const RAILWAY_API_KEY = Deno.env.get('RAILWAY_API_KEY')

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucherData, companyName = 'SKM IMPEX-CHENNAI-(24-25)' } = await req.json();
    
    if (!voucherData) {
      return new Response(
        JSON.stringify({ error: 'Voucher data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate XML from voucher data
    const xmlContent = generateVoucherXML(voucherData, companyName);
    console.log('Generated XML:', xmlContent);

    if (!RAILWAY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Railway API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call Railway backend
    const railwayUrl = `${RAILWAY_BACKEND_URL}/tally-send-xml?xml_content=${encodeURIComponent(xmlContent)}`;
    console.log('Calling Railway backend:', railwayUrl);
    
    const response = await fetch(railwayUrl, {
      method: 'GET',
      headers: {
        'x-api-key': RAILWAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('Railway backend response:', result);

    return new Response(JSON.stringify({
      success: result.ok || false,
      message: result.ok ? 'Voucher sent to Tally successfully via Railway backend' : 'Failed to send voucher to Tally',
      response: result.response,
      error: result.error,
      xmlSent: xmlContent,
      railwayResult: result,
      railwayBackendUrl: RAILWAY_BACKEND_URL,
      ngrokUrl: result.response && result.response.includes('ngrok') ? 
        result.response.match(/(\w+\.ngrok-free\.app)/)?.[0] || 'Not found in response' : 
        'No ngrok URL detected'
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
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})