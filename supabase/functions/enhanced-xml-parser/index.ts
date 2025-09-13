import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessResult {
  table: string;
  action: 'inserted' | 'updated' | 'ignored' | 'created_master' | 'error';
  guid: string;
  record_type: 'voucher' | 'ledger' | 'stock_item' | 'godown' | 'voucher_type' | 'accounting' | 'inventory';
  details?: any;
  error?: string;
}

interface LiveUpdate {
  type: 'progress' | 'complete' | 'error';
  message: string;
  record?: ProcessResult;
  progress?: {
    current: number;
    total: number;
    stage: string;
  };
}

serve(async (req) => {
  console.log('enhanced-xml-parser function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlText, divisionId, companyId, enableLiveUpdates = false } = await req.json();
    
    if (!xmlText || !divisionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'XML text and division ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: ProcessResult[] = [];
    const liveUpdates: LiveUpdate[] = [];
    
    // Extract all vouchers from XML
    const voucherMatches = xmlText.match(/<VOUCHER[^>]*>[\s\S]*?<\/VOUCHER>/g) || [];
    console.log(`Found ${voucherMatches.length} vouchers in XML`);
    
    const totalSteps = voucherMatches.length * 4; // voucher + master data + accounting + inventory
    let currentStep = 0;

    // Process each voucher
    for (const voucherXml of voucherMatches) {
      try {
        currentStep++;
        
        // Extract all voucher data
        const voucherData = extractVoucherData(voucherXml, companyId, divisionId);
        
        if (!voucherData.guid) {
          console.log('Skipping voucher without GUID');
          continue;
        }

        // Send live update
        if (enableLiveUpdates) {
          liveUpdates.push({
            type: 'progress',
            message: `Processing voucher ${voucherData.voucher_number || voucherData.guid}`,
            progress: { current: currentStep, total: totalSteps, stage: 'voucher' }
          });
        }

        // Step 1: Process master data (create if needed)
        const masterResults = await processMasterData(supabase, voucherData, voucherXml);
        results.push(...masterResults);

        // Step 2: Process voucher
        const voucherResult = await upsertVoucher(supabase, voucherData);
        results.push(voucherResult);

        // Step 3: Process accounting entries
        const ledgerEntries = extractLedgerEntries(voucherXml, voucherData.guid, companyId, divisionId);
        for (const entry of ledgerEntries) {
          const ledgerResult = await upsertLedgerEntry(supabase, entry);
          results.push(ledgerResult);
        }

        // Step 4: Process inventory entries
        const inventoryEntries = extractInventoryEntries(voucherXml, voucherData.guid, companyId, divisionId);
        for (const entry of inventoryEntries) {
          const inventoryResult = await upsertInventoryEntry(supabase, entry);
          results.push(inventoryResult);
        }

        // Send progress update
        if (enableLiveUpdates) {
          liveUpdates.push({
            type: 'progress',
            message: `Completed voucher ${voucherData.voucher_number || voucherData.guid}`,
            progress: { current: currentStep, total: totalSteps, stage: 'complete' }
          });
        }

      } catch (error) {
        console.error('Error processing voucher:', error);
        results.push({
          table: 'error',
          action: 'error',
          guid: extractValue(voucherXml, 'GUID') || 'unknown',
          record_type: 'voucher',
          error: error.message
        });
      }
    }

    const summary = {
      total: results.length,
      inserted: results.filter(r => r.action === 'inserted').length,
      updated: results.filter(r => r.action === 'updated').length,
      ignored: results.filter(r => r.action === 'ignored').length,
      created_master: results.filter(r => r.action === 'created_master').length,
      errors: results.filter(r => r.action === 'error').length,
      by_table: results.reduce((acc, r) => {
        acc[r.table] = (acc[r.table] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return new Response(JSON.stringify({
      success: true,
      results,
      liveUpdates,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in enhanced-xml-parser:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

// Enhanced data extraction functions
function extractVoucherData(voucherXml: string, companyId: string | null, divisionId: string) {
  return {
    guid: extractValue(voucherXml, 'GUID'),
    voucher_number: extractValue(voucherXml, 'VOUCHERNUMBER'),
    voucher_type: extractValue(voucherXml, 'VOUCHERTYPENAME'),
    date: formatTallyDate(extractValue(voucherXml, 'DATE')),
    narration: extractValue(voucherXml, 'NARRATION') || extractValue(voucherXml, 'PARTYLEDGERNAME') || '',
    reference: extractValue(voucherXml, 'REFERENCE'),
    party_ledger: extractValue(voucherXml, 'PARTYLEDGERNAME'),
    alterid: extractValue(voucherXml, 'ALTERID'),
    amount: parseFloat(extractValue(voucherXml, 'AMOUNT') || '0'),
    company_id: companyId,
    division_id: divisionId,
    // Additional fields from XML
    gst_number: extractValue(voucherXml, 'PARTYGSTIN'),
    invoice_type: extractValue(voucherXml, 'INVOICETYPE'),
    place_of_supply: extractValue(voucherXml, 'PLACEOFSUPPLY')
  };
}

async function processMasterData(supabase: any, voucherData: any, voucherXml: string): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];
  
  try {
    // 1. Process voucher type
    if (voucherData.voucher_type) {
      const voucherTypeResult = await ensureVoucherType(supabase, voucherData.voucher_type, voucherData.company_id, voucherData.division_id);
      results.push(voucherTypeResult);
    }

    // 2. Process party ledger
    if (voucherData.party_ledger) {
      const ledgerResult = await ensureLedger(supabase, voucherData.party_ledger, voucherData.company_id, voucherData.division_id, voucherXml);
      results.push(ledgerResult);
    }

    // 3. Process all ledgers from accounting entries
    const ledgerMatches = voucherXml.match(/<LEDGERENTRIES\.LIST>[\s\S]*?<\/LEDGERENTRIES\.LIST>/g) || [];
    for (const ledgerXml of ledgerMatches) {
      const ledgerName = extractValue(ledgerXml, 'LEDGERNAME');
      if (ledgerName && ledgerName !== voucherData.party_ledger) {
        const ledgerResult = await ensureLedger(supabase, ledgerName, voucherData.company_id, voucherData.division_id, ledgerXml);
        results.push(ledgerResult);
      }
    }

    // 4. Process stock items
    const inventoryMatches = voucherXml.match(/<ALLINVENTORYENTRIES\.LIST>[\s\S]*?<\/ALLINVENTORYENTRIES\.LIST>/g) || [];
    for (const inventoryXml of inventoryMatches) {
      const stockItemName = extractValue(inventoryXml, 'STOCKITEMNAME');
      const godownName = extractValue(inventoryXml, 'GODOWNNAME');
      
      if (stockItemName) {
        const stockResult = await ensureStockItem(supabase, stockItemName, voucherData.company_id, voucherData.division_id, inventoryXml);
        results.push(stockResult);
      }
      
      if (godownName) {
        const godownResult = await ensureGodown(supabase, godownName, voucherData.company_id, voucherData.division_id);
        results.push(godownResult);
      }
    }

  } catch (error) {
    console.error('Error processing master data:', error);
    results.push({
      table: 'master_data_error',
      action: 'error',
      guid: voucherData.guid || 'unknown',
      record_type: 'voucher',
      error: error.message
    });
  }

  return results;
}

async function ensureVoucherType(supabase: any, voucherTypeName: string, companyId: string | null, divisionId: string): Promise<ProcessResult> {
  const guid = `vtype-${voucherTypeName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const { data: existing } = await supabase
    .from('mst_vouchertype')
    .select('*')
    .eq('guid', guid)
    .maybeSingle();

  if (!existing) {
    await supabase.from('mst_vouchertype').insert({
      guid,
      name: voucherTypeName,
      parent: '',
      _parent: '',
      numbering_method: 'Auto',
      is_deemedpositive: 1,
      affects_stock: 0,
      company_id: companyId,
      division_id: divisionId
    });
    
    return {
      table: 'mst_vouchertype',
      action: 'created_master',
      guid,
      record_type: 'voucher_type',
      details: { name: voucherTypeName }
    };
  }

  return {
    table: 'mst_vouchertype',
    action: 'ignored',
    guid,
    record_type: 'voucher_type'
  };
}

async function ensureLedger(supabase: any, ledgerName: string, companyId: string | null, divisionId: string, ledgerXml?: string): Promise<ProcessResult> {
  const guid = `ledger-${ledgerName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const { data: existing } = await supabase
    .from('mst_ledger')
    .select('*')
    .eq('guid', guid)
    .maybeSingle();

  if (!existing) {
    // Extract additional ledger details from XML if available
    const ledgerData = {
      guid,
      name: ledgerName,
      parent: 'Sundry Debtors', // Default parent
      _parent: 'Sundry Debtors',
      alias: '',
      description: '',
      notes: '',
      mailing_name: ledgerName,
      mailing_address: ledgerXml ? extractValue(ledgerXml, 'ADDRESS') || '' : '',
      mailing_state: '',
      mailing_country: 'India',
      mailing_pincode: '',
      email: '',
      it_pan: '',
      gstn: ledgerXml ? extractValue(ledgerXml, 'PARTYGSTIN') || '' : '',
      gst_registration_type: '',
      gst_supply_type: '',
      gst_duty_head: '',
      bank_account_holder: '',
      bank_account_number: '',
      bank_ifsc: '',
      bank_swift: '',
      bank_name: '',
      bank_branch: '',
      opening_balance: 0,
      closing_balance: 0,
      tax_rate: 0,
      bill_credit_period: 0,
      is_revenue: 0,
      is_deemedpositive: 1,
      company_id: companyId,
      division_id: divisionId
    };

    await supabase.from('mst_ledger').insert(ledgerData);
    
    return {
      table: 'mst_ledger',
      action: 'created_master',
      guid,
      record_type: 'ledger',
      details: { name: ledgerName }
    };
  }

  return {
    table: 'mst_ledger',
    action: 'ignored',
    guid,
    record_type: 'ledger'
  };
}

async function ensureStockItem(supabase: any, stockItemName: string, companyId: string | null, divisionId: string, inventoryXml?: string): Promise<ProcessResult> {
  const guid = `stock-${stockItemName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const { data: existing } = await supabase
    .from('mst_stock_item')
    .select('*')
    .eq('guid', guid)
    .maybeSingle();

  if (!existing) {
    const stockData = {
      guid,
      name: stockItemName,
      parent: 'Primary',
      _parent: 'Primary',
      alias: '',
      description: '',
      notes: '',
      part_number: '',
      uom: inventoryXml ? extractValue(inventoryXml, 'UOM') || 'Nos' : 'Nos',
      _uom: inventoryXml ? extractValue(inventoryXml, 'UOM') || 'Nos' : 'Nos',
      alternate_uom: '',
      _alternate_uom: '',
      conversion: 1,
      opening_balance: 0,
      opening_rate: 0,
      opening_value: 0,
      closing_balance: 0,
      closing_rate: 0,
      closing_value: 0,
      costing_method: 'Average',
      gst_hsn_code: inventoryXml ? extractValue(inventoryXml, 'HSNCODE') || '' : '',
      gst_hsn_description: '',
      gst_taxability: 'Taxable',
      gst_rate: 0,
      gst_type_of_supply: 'Goods',
      company_id: companyId,
      division_id: divisionId
    };

    await supabase.from('mst_stock_item').insert(stockData);
    
    return {
      table: 'mst_stock_item',
      action: 'created_master',
      guid,
      record_type: 'stock_item',
      details: { name: stockItemName }
    };
  }

  return {
    table: 'mst_stock_item',
    action: 'ignored',
    guid,
    record_type: 'stock_item'
  };
}

async function ensureGodown(supabase: any, godownName: string, companyId: string | null, divisionId: string): Promise<ProcessResult> {
  const guid = `godown-${godownName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const { data: existing } = await supabase
    .from('mst_godown')
    .select('*')
    .eq('guid', guid)
    .maybeSingle();

  if (!existing) {
    await supabase.from('mst_godown').insert({
      guid,
      name: godownName,
      parent: 'Main Location',
      _parent: 'Main Location',
      address: '',
      company_id: companyId,
      division_id: divisionId
    });
    
    return {
      table: 'mst_godown',
      action: 'created_master',
      guid,
      record_type: 'godown',
      details: { name: godownName }
    };
  }

  return {
    table: 'mst_godown',
    action: 'ignored',
    guid,
    record_type: 'godown'
  };
}

// Utility functions remain the same
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

async function upsertVoucher(supabase: any, voucher: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('tally_trn_voucher')
    .select('*')
    .eq('guid', voucher.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.voucher_number !== voucher.voucher_number ||
                   existing.voucher_type !== voucher.voucher_type ||
                   existing.date !== voucher.date ||
                   existing.narration !== voucher.narration;

    if (changed) {
      await supabase
        .from('tally_trn_voucher')
        .update(voucher)
        .eq('guid', voucher.guid);
      return { table: 'tally_trn_voucher', action: 'updated', guid: voucher.guid, record_type: 'voucher' };
    } else {
      return { table: 'tally_trn_voucher', action: 'ignored', guid: voucher.guid, record_type: 'voucher' };
    }
  } else {
    await supabase
      .from('tally_trn_voucher')
      .insert(voucher);
    return { table: 'tally_trn_voucher', action: 'inserted', guid: voucher.guid, record_type: 'voucher' };
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

async function upsertLedgerEntry(supabase: any, entry: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_accounting')
    .select('*')
    .eq('guid', entry.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.amount !== entry.amount || existing.ledger !== entry.ledger;
    if (changed) {
      await supabase.from('trn_accounting').update(entry).eq('guid', entry.guid);
      return { table: 'trn_accounting', action: 'updated', guid: entry.guid, record_type: 'accounting' };
    } else {
      return { table: 'trn_accounting', action: 'ignored', guid: entry.guid, record_type: 'accounting' };
    }
  } else {
    await supabase.from('trn_accounting').insert(entry);
    return { table: 'trn_accounting', action: 'inserted', guid: entry.guid, record_type: 'accounting' };
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

async function upsertInventoryEntry(supabase: any, entry: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_batch')
    .select('*')
    .eq('guid', entry.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.quantity !== entry.quantity || existing.amount !== entry.amount;
    if (changed) {
      await supabase.from('trn_batch').update(entry).eq('guid', entry.guid);
      return { table: 'trn_batch', action: 'updated', guid: entry.guid, record_type: 'inventory' };
    } else {
      return { table: 'trn_batch', action: 'ignored', guid: entry.guid, record_type: 'inventory' };
    }
  } else {
    await supabase.from('trn_batch').insert(entry);
    return { table: 'trn_batch', action: 'inserted', guid: entry.guid, record_type: 'inventory' };
  }
}
