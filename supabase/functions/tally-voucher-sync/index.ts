import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoucherData {
  basicInfo: {
    voucherType: string;
    voucherNumber: string;
    alterId: string;
    date: string;
    effectiveDate: string;
    action: string;
    objectView: string;
    voucherTypeName: string;
  };
  party: {
    name: string;
    ledgerName: string;
    gstin: string;
    state: string;
    isPartyLedger: string;
  };
  addresses: {
    customer: string[];
    dispatch: string[];
    buyer: string[];
  };
  financial: {
    amounts: string[];
    ledgers: string[];
    grossAmount?: string;
    netAmount?: string;
    totalAmount?: string;
    billAmount?: string;
  };
  inventory: {
    stockItems: string[];
    quantities: string[];
    rates: string[];
  };
  tax: {
    cgstRate?: string;
    sgstRate?: string;
    igstRate?: string;
    cessRate?: string;
    totalTax?: string;
    taxableAmount?: string;
  };
  references: {
    referenceNumber?: string;
    referenceDate?: string;
    narration?: string;
    remarks?: string;
  };
  audit: {
    createdBy?: string;
    modifiedBy?: string;
    createdDate?: string;
    modifiedDate?: string;
    alteredOn?: string;
  };
  rawXml: string;
}

function parseVoucherFromXml(xmlResponse: string): VoucherData | null {
  try {
    console.log('Parsing XML response for voucher data...');
    
    // Extract voucher sections from XML
    const voucherMatch = xmlResponse.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/);
    if (!voucherMatch) {
      console.log('No voucher found in XML response');
      return null;
    }
    
    const voucher = voucherMatch[0];
    console.log('Found voucher section, parsing fields...');
    
    // Basic voucher info using regex patterns
    const voucherType = voucher.match(/VCHTYPE="([^"]*)"/)?.[1] || '';
    const voucherNumber = voucher.match(/<VOUCHERNUMBER>([^<]*)<\/VOUCHERNUMBER>/)?.[1] || '';
    const alterId = voucher.match(/<ALTERID>([^<]*)<\/ALTERID>/)?.[1] || '';
    const date = voucher.match(/<DATE>([^<]*)<\/DATE>/)?.[1] || '';
    const effectiveDate = voucher.match(/<EFFECTIVEDATE>([^<]*)<\/EFFECTIVEDATE>/)?.[1] || date;
    
    console.log(`Parsed basic info: ${voucherType}, ${voucherNumber}, ${date}`);
    
    // Party info
    const partyName = voucher.match(/<PARTYNAME>([^<]*)<\/PARTYNAME>/)?.[1] || '';
    const partyLedger = voucher.match(/<PARTYLEDGERNAME>([^<]*)<\/PARTYLEDGERNAME>/)?.[1] || partyName;
    const partyGstin = voucher.match(/<PARTYGSTIN>([^<]*)<\/PARTYGSTIN>/)?.[1] || '';
    const partyState = voucher.match(/<PARTYSTATENAME>([^<]*)<\/PARTYSTATENAME>/)?.[1] || '';
    const isPartyLedger = voucher.match(/<ISPARTYLEDGER>([^<]*)<\/ISPARTYLEDGER>/)?.[1] || 'No';
    
    console.log(`Parsed party info: ${partyName}, ${partyGstin}`);
    
    // Financial data
    const amounts = voucher.match(/<AMOUNT>([^<]*)<\/AMOUNT>/g)?.map(amt => 
      amt.replace(/<\/?AMOUNT>/g, '').trim()
    ) || [];
    
    const ledgers = voucher.match(/<LEDGERNAME>([^<]*)<\/LEDGERNAME>/g)?.map(name => 
      name.replace(/<\/?LEDGERNAME>/g, '').trim()
    ) || [];
    
    // Calculate financial totals
    const grossAmount = voucher.match(/<GROSSAMOUNT>([^<]*)<\/GROSSAMOUNT>/)?.[1];
    const netAmount = voucher.match(/<NETAMOUNT>([^<]*)<\/NETAMOUNT>/)?.[1];
    const totalAmount = voucher.match(/<TOTALAMOUNT>([^<]*)<\/TOTALAMOUNT>/)?.[1];
    const billAmount = voucher.match(/<BILLAMOUNT>([^<]*)<\/BILLAMOUNT>/)?.[1];
    
    console.log(`Parsed financial data: ${amounts.length} amounts, ${ledgers.length} ledgers`);
    
    // Inventory data
    const stockItems = voucher.match(/<STOCKITEMNAME>([^<]*)<\/STOCKITEMNAME>/g)?.map(item => 
      item.replace(/<\/?STOCKITEMNAME>/g, '').trim()
    ) || [];
    
    const quantities = voucher.match(/<ACTUALQTY>([^<]*)<\/ACTUALQTY>/g)?.map(qty => 
      qty.replace(/<\/?ACTUALQTY>/g, '').trim()
    ) || [];
    
    const rates = voucher.match(/<RATE>([^<]*)<\/RATE>/g)?.map(rate => 
      rate.replace(/<\/?RATE>/g, '').trim()
    ) || [];
    
    console.log(`Parsed inventory data: ${stockItems.length} items, ${quantities.length} quantities`);
    
    // Address data
    const customerAddresses = voucher.match(/<ADDRESS>([^<]*)<\/ADDRESS>/g)?.map(addr => 
      addr.replace(/<\/?ADDRESS>/g, '').trim()
    ) || [];
    
    const dispatchAddresses = voucher.match(/<DISPATCHFROMADDRESS>([^<]*)<\/DISPATCHFROMADDRESS>/g)?.map(addr => 
      addr.replace(/<\/?DISPATCHFROMADDRESS>/g, '').trim()
    ) || [];
    
    const buyerAddresses = voucher.match(/<BUYERADDRESS>([^<]*)<\/BUYERADDRESS>/g)?.map(addr => 
      addr.replace(/<\/?BUYERADDRESS>/g, '').trim()
    ) || customerAddresses; // Fallback to customer addresses
    
    // Tax data
    const cgstRate = voucher.match(/<CGSTRATE>([^<]*)<\/CGSTRATE>/)?.[1];
    const sgstRate = voucher.match(/<SGSTRATE>([^<]*)<\/SGSTRATE>/)?.[1];
    const igstRate = voucher.match(/<IGSTRATE>([^<]*)<\/IGSTRATE>/)?.[1];
    const cessRate = voucher.match(/<CESSRATE>([^<]*)<\/CESSRATE>/)?.[1];
    const totalTax = voucher.match(/<TOTALTAX>([^<]*)<\/TOTALTAX>/)?.[1];
    const taxableAmount = voucher.match(/<TAXABLEAMOUNT>([^<]*)<\/TAXABLEAMOUNT>/)?.[1];
    
    // References and audit
    const referenceNumber = voucher.match(/<REFERENCE>([^<]*)<\/REFERENCE>/)?.[1];
    const referenceDate = voucher.match(/<REFERENCEDATE>([^<]*)<\/REFERENCEDATE>/)?.[1];
    const narration = voucher.match(/<NARRATION>([^<]*)<\/NARRATION>/)?.[1];
    const remarks = voucher.match(/<REMARKS>([^<]*)<\/REMARKS>/)?.[1];
    
    const createdBy = voucher.match(/<CREATEDBY>([^<]*)<\/CREATEDBY>/)?.[1];
    const modifiedBy = voucher.match(/<MODIFIEDBY>([^<]*)<\/MODIFIEDBY>/)?.[1];
    const createdDate = voucher.match(/<CREATEDDATE>([^<]*)<\/CREATEDDATE>/)?.[1];
    const modifiedDate = voucher.match(/<MODIFIEDDATE>([^<]*)<\/MODIFIEDDATE>/)?.[1];
    const alteredOn = voucher.match(/<ALTEREDON>([^<]*)<\/ALTEREDON>/)?.[1];
    
    const parsedData: VoucherData = {
      basicInfo: {
        voucherType,
        voucherNumber,
        alterId,
        date,
        effectiveDate,
        action: 'Update',
        objectView: 'Invoice Voucher View',
        voucherTypeName: voucherType
      },
      party: {
        name: partyName,
        ledgerName: partyLedger,
        gstin: partyGstin,
        state: partyState,
        isPartyLedger
      },
      addresses: {
        customer: customerAddresses,
        dispatch: dispatchAddresses,
        buyer: buyerAddresses
      },
      financial: {
        amounts,
        ledgers,
        grossAmount,
        netAmount,
        totalAmount,
        billAmount
      },
      inventory: {
        stockItems,
        quantities,
        rates
      },
      tax: {
        cgstRate,
        sgstRate,
        igstRate,
        cessRate,
        totalTax,
        taxableAmount
      },
      references: {
        referenceNumber,
        referenceDate,
        narration,
        remarks
      },
      audit: {
        createdBy,
        modifiedBy,
        createdDate,
        modifiedDate,
        alteredOn
      },
      rawXml: xmlResponse
    };
    
    console.log('Successfully parsed voucher data');
    return parsedData;
    
  } catch (error) {
    console.error('Error parsing voucher XML:', error);
    throw new Error(`Failed to parse voucher XML: ${error.message}`);
  }
}

async function fetchVoucherFromTally(
  tallyUrl: string,
  companyName: string,
  voucherGuid: string
): Promise<VoucherData | null> {
  try {
    console.log(`Fetching voucher ${voucherGuid} from Tally at ${tallyUrl}`);
    
    // Build XML request for specific voucher
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>VoucherExport</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="VoucherCollection">
            <TYPE>Voucher</TYPE>
            <FILTERS>VoucherFilter</FILTERS>
          </COLLECTION>
          
          <SYSTEM TYPE="Formulae" NAME="VoucherFilter">
            <VARIABLE>VchGUID</VARIABLE>
            <FORMULA>$GUID = "${voucherGuid}"</FORMULA>
          </SYSTEM>
          
          <REPORT NAME="VoucherReport">
            <FORMS>VoucherForm</FORMS>
          </REPORT>
          
          <FORM NAME="VoucherForm">
            <TOPPARTS>VoucherPart</TOPPARTS>
            <XMLTAG>"VOUCHER"</XMLTAG>
          </FORM>
          
          <PART NAME="VoucherPart">
            <TOPLINES>VoucherLine</TOPLINES>
            <REPEAT>VoucherCollection</REPEAT>
            <SCROLLED>Vertical</SCROLLED>
          </PART>
          
          <LINE NAME="VoucherLine">
            <XMLTAG>"VOUCHERDETAILS"</XMLTAG>
            <FIELD>VchType,VchNumber,VchDate,PartyName,Amount,Narration</FIELD>
          </LINE>
          
          <FIELD NAME="VchType">
            <SET>$VoucherTypeName</SET>
            <XMLTAG>"VOUCHERTYPENAME"</XMLTAG>
          </FIELD>
          
          <FIELD NAME="VchNumber">
            <SET>$VoucherNumber</SET>
            <XMLTAG>"VOUCHERNUMBER"</XMLTAG>
          </FIELD>
          
          <FIELD NAME="VchDate">
            <SET>$Date</SET>
            <XMLTAG>"DATE"</XMLTAG>
          </FIELD>
          
          <FIELD NAME="PartyName">
            <SET>$PartyLedgerName</SET>
            <XMLTAG>"PARTYNAME"</XMLTAG>
          </FIELD>
          
          <FIELD NAME="Amount">
            <SET>$Amount</SET>
            <XMLTAG>"AMOUNT"</XMLTAG>
          </FIELD>
          
          <FIELD NAME="Narration">
            <SET>$Narration</SET>
            <XMLTAG>"NARRATION"</XMLTAG>
          </FIELD>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`;

    console.log('Sending XML request to Tally...');
    
    const response = await fetch(tallyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': xmlRequest.length.toString(),
      },
      body: xmlRequest,
    });

    if (!response.ok) {
      throw new Error(`Tally API request failed: ${response.status} ${response.statusText}`);
    }

    const xmlResponse = await response.text();
    console.log('Received response from Tally, parsing...');
    
    if (!xmlResponse || xmlResponse.includes('ERROR') || xmlResponse.includes('error')) {
      console.error('Tally returned error response:', xmlResponse);
      throw new Error('Tally returned an error response');
    }

    return parseVoucherFromXml(xmlResponse);
    
  } catch (error) {
    console.error('Error fetching from Tally:', error);
    throw new Error(`Failed to fetch voucher from Tally: ${error.message}`);
  }
}

async function updateVoucherInDatabase(
  supabase: any,
  companyId: string,
  divisionId: string,
  voucherGuid: string,
  tallyData: VoucherData,
  autoUpdate: boolean = false
) {
  try {
    console.log(`Updating voucher ${voucherGuid} in database (auto: ${autoUpdate})`);
    
    // Update main voucher record
    const voucherUpdate = {
      voucher_number: tallyData.basicInfo.voucherNumber,
      voucher_type: tallyData.basicInfo.voucherType,
      date: tallyData.basicInfo.date,
      party_ledger_name: tallyData.party.name,
      narration: tallyData.references.narration,
      basic_amount: parseFloat(tallyData.financial.grossAmount || '0'),
      net_amount: parseFloat(tallyData.financial.netAmount || '0'),
      total_amount: parseFloat(tallyData.financial.totalAmount || '0'),
      final_amount: parseFloat(tallyData.financial.billAmount || tallyData.financial.totalAmount || '0'),
      reference: tallyData.references.referenceNumber,
      altered_by: tallyData.audit.modifiedBy,
      altered_on: tallyData.audit.alteredOn ? new Date(tallyData.audit.alteredOn).toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { error: voucherError } = await supabase
      .from('tally_trn_voucher')
      .update(voucherUpdate)
      .eq('guid', voucherGuid)
      .eq('company_id', companyId)
      .eq('division_id', divisionId);

    if (voucherError) {
      throw new Error(`Failed to update voucher: ${voucherError.message}`);
    }

    console.log('Successfully updated voucher in database');
    return { success: true, message: 'Voucher updated successfully' };
    
  } catch (error) {
    console.error('Error updating voucher in database:', error);
    throw new Error(`Failed to update voucher in database: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      voucherGuid, 
      companyId, 
      divisionId, 
      autoUpdate = false,
      action = 'fetch' // 'fetch' | 'update'
    } = await req.json();

    console.log(`Processing ${action} request for voucher: ${voucherGuid}`);

    if (!voucherGuid || !companyId || !divisionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get division details for Tally URL
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('tally_url, name')
      .eq('id', divisionId)
      .eq('company_id', companyId)
      .single();

    if (divisionError || !division) {
      return new Response(
        JSON.stringify({ error: 'Division not found or Tally URL not configured' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!division.tally_url) {
      return new Response(
        JSON.stringify({ error: 'Tally URL not configured for this division' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get current voucher data from database
    const { data: currentVoucher, error: currentVoucherError } = await supabase
      .from('tally_trn_voucher')
      .select('*')
      .eq('guid', voucherGuid)
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .single();

    if (currentVoucherError || !currentVoucher) {
      return new Response(
        JSON.stringify({ error: 'Voucher not found in database' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch latest data from Tally
    const tallyData = await fetchVoucherFromTally(
      division.tally_url,
      division.name,
      voucherGuid
    );

    if (!tallyData) {
      return new Response(
        JSON.stringify({ error: 'Voucher not found in Tally or failed to parse response' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If action is 'update', perform the update
    if (action === 'update') {
      const updateResult = await updateVoucherInDatabase(
        supabase,
        companyId,
        divisionId,
        voucherGuid,
        tallyData,
        autoUpdate
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Voucher updated successfully',
          ...updateResult
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return comparison data for manual review
    const response = {
      success: true,
      currentData: currentVoucher,
      tallyData: tallyData,
      differences: {
        voucherNumber: currentVoucher.voucher_number !== tallyData.basicInfo.voucherNumber,
        partyLedger: currentVoucher.party_ledger_name !== tallyData.party.name,
        narration: currentVoucher.narration !== tallyData.references.narration,
        basicAmount: Math.abs(parseFloat(currentVoucher.basic_amount || '0') - parseFloat(tallyData.financial.grossAmount || '0')) > 0.01,
        totalAmount: Math.abs(parseFloat(currentVoucher.total_amount || '0') - parseFloat(tallyData.financial.totalAmount || '0')) > 0.01,
        modifiedBy: currentVoucher.altered_by !== tallyData.audit.modifiedBy,
        modifiedOn: currentVoucher.altered_on !== tallyData.audit.alteredOn
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});