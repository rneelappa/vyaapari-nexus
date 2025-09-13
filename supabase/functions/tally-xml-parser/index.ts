import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParseResult {
  table: string;
  action: 'inserted' | 'updated' | 'ignored';
  guid: string;
  details?: any;
}

serve(async (req) => {
  console.log('tally-xml-parser function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlText, divisionId, companyId } = await req.json();
    
    if (!xmlText || !divisionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'XML text and division ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: ParseResult[] = [];
    
    // Extract vouchers from XML
    const voucherMatches = xmlText.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/g) || [];
    
    for (const voucherXml of voucherMatches) {
      try {
        // Parse voucher header data
        const guid = extractValue(voucherXml, 'GUID');
        const voucherNumber = extractValue(voucherXml, 'VOUCHERNUMBER');
        const voucherType = extractValue(voucherXml, 'VOUCHERTYPENAME');
        const date = formatTallyDate(extractValue(voucherXml, 'DATE'));
        const narration = extractValue(voucherXml, 'NARRATION') || extractValue(voucherXml, 'PARTYLEDGERNAME') || '';
        
        if (!guid) continue;

        // Process voucher
        const voucherResult = await upsertVoucher(supabase, {
          guid,
          voucher_number: voucherNumber,
          voucher_type: voucherType,
          date,
          narration,
          company_id: companyId,
          division_id: divisionId
        });
        results.push(voucherResult);

        // Process ledger entries
        const ledgerEntries = extractLedgerEntries(voucherXml, guid, companyId, divisionId);
        for (const entry of ledgerEntries) {
          const ledgerResult = await upsertLedgerEntry(supabase, entry);
          results.push(ledgerResult);
        }

        // Process inventory entries  
        const inventoryEntries = extractInventoryEntries(voucherXml, guid, companyId, divisionId);
        for (const entry of inventoryEntries) {
          const inventoryResult = await upsertInventoryEntry(supabase, entry);
          results.push(inventoryResult);
        }

      } catch (error) {
        console.error('Error processing voucher:', error);
        results.push({
          table: 'error',
          action: 'ignored',
          guid: extractValue(voucherXml, 'GUID') || 'unknown',
          details: { error: error.message }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: results.length,
        inserted: results.filter(r => r.action === 'inserted').length,
        updated: results.filter(r => r.action === 'updated').length,
        ignored: results.filter(r => r.action === 'ignored').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in tally-xml-parser:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

function extractValue(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's'));
  return match?.[1]?.trim() || null;
}

function formatTallyDate(dateStr: string | null): string | null {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

async function upsertVoucher(supabase: any, voucher: any): Promise<ParseResult> {
  // Check if exists
  const { data: existing } = await supabase
    .from('tally_trn_voucher')
    .select('*')
    .eq('guid', voucher.guid)
    .maybeSingle();

  if (existing) {
    // Check if data changed
    const changed = existing.voucher_number !== voucher.voucher_number ||
                   existing.voucher_type !== voucher.voucher_type ||
                   existing.date !== voucher.date ||
                   existing.narration !== voucher.narration;

    if (changed) {
      await supabase
        .from('tally_trn_voucher')
        .update(voucher)
        .eq('guid', voucher.guid);
      return { table: 'tally_trn_voucher', action: 'updated', guid: voucher.guid };
    } else {
      return { table: 'tally_trn_voucher', action: 'ignored', guid: voucher.guid };
    }
  } else {
    await supabase
      .from('tally_trn_voucher')
      .insert(voucher);
    return { table: 'tally_trn_voucher', action: 'inserted', guid: voucher.guid };
  }
}

function extractLedgerEntries(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any[] {
  const entries: any[] = [];
  const ledgerMatches = voucherXml.match(/<LEDGERENTRIES\.LIST>[\s\S]*?<\/LEDGERENTRIES\.LIST>/g) || [];
  
  for (const ledgerXml of ledgerMatches) {
    const ledgerName = extractValue(ledgerXml, 'LEDGERNAME');
    const amount = parseFloat(extractValue(ledgerXml, 'AMOUNT') || '0');
    const isDeemedPositive = extractValue(ledgerXml, 'ISDEEMEDPOSITIVE') === 'Yes';
    
    if (ledgerName) {
      entries.push({
        guid: `${voucherGuid}-ledger-${ledgerName}`,
        ledger: ledgerName,
        _ledger: ledgerName,
        amount,
        amount_forex: amount,
        currency: 'INR',
        company_id: companyId,
        division_id: divisionId
      });
    }
  }
  
  return entries;
}

async function upsertLedgerEntry(supabase: any, entry: any): Promise<ParseResult> {
  const { data: existing } = await supabase
    .from('trn_accounting')
    .select('*')
    .eq('guid', entry.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.amount !== entry.amount || existing.ledger !== entry.ledger;
    if (changed) {
      await supabase.from('trn_accounting').update(entry).eq('guid', entry.guid);
      return { table: 'trn_accounting', action: 'updated', guid: entry.guid };
    } else {
      return { table: 'trn_accounting', action: 'ignored', guid: entry.guid };
    }
  } else {
    await supabase.from('trn_accounting').insert(entry);
    return { table: 'trn_accounting', action: 'inserted', guid: entry.guid };
  }
}

function extractInventoryEntries(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any[] {
  const entries: any[] = [];
  const inventoryMatches = voucherXml.match(/<ALLINVENTORYENTRIES\.LIST>[\s\S]*?<\/ALLINVENTORYENTRIES\.LIST>/g) || [];
  
  for (const inventoryXml of inventoryMatches) {
    const stockItemName = extractValue(inventoryXml, 'STOCKITEMNAME');
    const actualQty = extractValue(inventoryXml, 'ACTUALQTY');
    const amount = parseFloat(extractValue(inventoryXml, 'AMOUNT') || '0');
    const rate = extractValue(inventoryXml, 'RATE');
    
    if (stockItemName) {
      entries.push({
        guid: `${voucherGuid}-inventory-${stockItemName}`,
        item: stockItemName,
        _item: stockItemName,
        quantity: parseFloat(actualQty?.split(' ')[0] || '0'),
        amount,
        godown: extractValue(inventoryXml, 'GODOWNNAME') || '',
        _godown: extractValue(inventoryXml, 'GODOWNNAME') || '',
        company_id: companyId,
        division_id: divisionId
      });
    }
  }
  
  return entries;
}

async function upsertInventoryEntry(supabase: any, entry: any): Promise<ParseResult> {
  const { data: existing } = await supabase
    .from('trn_batch')
    .select('*')
    .eq('guid', entry.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.quantity !== entry.quantity || existing.amount !== entry.amount;
    if (changed) {
      await supabase.from('trn_batch').update(entry).eq('guid', entry.guid);
      return { table: 'trn_batch', action: 'updated', guid: entry.guid };
    } else {
      return { table: 'trn_batch', action: 'ignored', guid: entry.guid };
    }
  } else {
    await supabase.from('trn_batch').insert(entry);
    return { table: 'trn_batch', action: 'inserted', guid: entry.guid };
  }
}