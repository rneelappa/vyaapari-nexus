import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

function buildSalesVoucherXml(voucherData: any): string {
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
  const companyName = "SKM IMPEX-CHENNAI-(24-25)"; // This should come from user's company settings

  // Build ledger entries
  let ledgerEntries = `
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${partyLedger.name}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>${totalAmount.toFixed(2)}</AMOUNT>
      <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${salesLedger.name}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>${(-totalAmount).toFixed(2)}</AMOUNT>
      <ISPARTYLEDGER>No</ISPARTYLEDGER>
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
    </ALLLEDGERENTRIES.LIST>`;
    }
  });

  // Build inventory entries
  let inventoryEntries = '';
  lines.forEach((line: any) => {
    if (line.type === 'inventory' && line.stockItem) {
      // Get stock item name - handle both object and GUID cases
      let stockItemName = '';
      if (typeof line.stockItem === 'string') {
        // If it's a GUID, we need to use a placeholder name
        // In a real implementation, you'd look this up from the stockItems array
        stockItemName = `Stock Item ${line.stockItem.slice(-6)}`;
      } else if (line.stockItem && line.stockItem.name) {
        stockItemName = line.stockItem.name;
      } else {
        stockItemName = 'Unknown Stock Item';
      }

      inventoryEntries += `
    <ALLINVENTORYENTRIES.LIST>
      <STOCKITEMNAME>${stockItemName}</STOCKITEMNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
      <ISAUTONEGATE>No</ISAUTONEGATE>
      <RATE>${line.rate ? line.rate.toFixed(2) : '0.00'}/PCS</RATE>
      <AMOUNT>${(-line.amount).toFixed(2)}</AMOUNT>
      <ACTUALQTY>-${line.quantity || 0} PCS</ACTUALQTY>
      <BILLEDQTY>-${line.quantity || 0} PCS</BILLEDQTY>
      ${line.trackingNumber ? `<BATCHALLOCATIONS.LIST>
        <TRACKINGNUMBER>${line.trackingNumber}</TRACKINGNUMBER>
        <AMOUNT>${(-line.amount).toFixed(2)}</AMOUNT>
        <ACTUALQTY>-${line.quantity || 0} PCS</ACTUALQTY>
        <BILLEDQTY>-${line.quantity || 0} PCS</BILLEDQTY>
      </BATCHALLOCATIONS.LIST>` : ''}
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

async function postToTally(xml: string, tallyUrl: string): Promise<{ success: boolean; response?: string; error?: string; endpoint?: string; allResponses?: any[] }> {
  const endpoints = ['/', '/vouchers/0/import', '/Import'];
  const allResponses: any[] = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${tallyUrl}${endpoint}`);
      
      const response = await fetch(`${tallyUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=utf-16',
          'Content-Length': new TextEncoder().encode(xml).length.toString(),
        },
        body: xml,
      });

      const responseText = await response.text();
      console.log(`Response from ${endpoint}:`, responseText);

      const responseInfo = {
        endpoint,
        status: response.status,
        response: responseText,
        success: response.ok
      };
      allResponses.push(responseInfo);

      if (response.ok) {
        // Check for Tally success indicators
        if (responseText.includes('<CREATED>') || responseText.includes('<ALTERED>') || 
            responseText.toUpperCase().includes('SUCCESS')) {
          return { success: true, response: responseText, endpoint, allResponses };
        }
        // Even if it's not a success, return the response for debugging
        return { success: false, response: responseText, endpoint, allResponses };
      }
    } catch (error) {
      console.error(`Error with endpoint ${endpoint}:`, error);
      allResponses.push({
        endpoint,
        status: 0,
        error: error.message,
        success: false
      });
      continue;
    }
  }

  return { success: false, error: 'Failed to post to any Tally endpoint', allResponses };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucherData } = await req.json();
    
    if (!voucherData) {
      return new Response(
        JSON.stringify({ error: 'Voucher data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build XML from voucher data
    const xml = buildSalesVoucherXml(voucherData);
    console.log('Generated XML:', xml);

    // Send to Tally
    const tallyUrl = 'https://e34014bc0666.ngrok-free.app';
    const result = await postToTally(xml, tallyUrl);

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Voucher sent to Tally successfully',
          tallyResponse: result.response,
          endpoint: result.endpoint,
          allResponses: result.allResponses,
          xmlSent: xml
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Failed to send voucher to Tally',
          tallyResponse: result.response,
          endpoint: result.endpoint,
          allResponses: result.allResponses,
          xmlSent: xml
        }),
        { 
          status: 200, // Still return 200 so we can show the response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in send-to-tally function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})