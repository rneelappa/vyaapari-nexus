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
  record_type: 'voucher' | 'ledger' | 'stock_item' | 'godown' | 'voucher_type' | 'accounting' | 'inventory' | 'party_details' | 'gst_details' | 'address_details' | 'shipping_details' | 'category_allocation' | 'due_date' | 'tax_details' | 'reference';
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
    
    const totalSteps = voucherMatches.length * 8; // voucher + master data + accounting + inventory + party + gst + address + shipping
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
        const ledgerEntries = extractLedgerEntries(voucherXml, voucherData.guid, companyId, divisionId, voucherData);
        for (const entry of ledgerEntries) {
          const ledgerResult = await upsertLedgerEntry(supabase, entry);
          results.push(ledgerResult);
        }

        // Step 4: Process inventory entries
        const inventoryEntries = extractInventoryEntries(voucherXml, voucherData.guid, companyId, divisionId, voucherData);
        for (const entry of inventoryEntries) {
          const inventoryResult = await upsertInventoryEntry(supabase, entry);
          results.push(inventoryResult);
        }

        // Step 5: Process party details
        const partyDetails = extractPartyDetails(voucherXml, voucherData.guid, companyId, divisionId);
        if (partyDetails) {
          const partyResult = await upsertPartyDetails(supabase, partyDetails);
          results.push(partyResult);
        }

        // Step 6: Process GST details
        const gstDetails = extractGstDetails(voucherXml, voucherData.guid, companyId, divisionId);
        for (const gst of gstDetails) {
          const gstResult = await upsertGstDetails(supabase, gst);
          results.push(gstResult);
        }

        // Step 7: Process address details
        const addressDetails = extractAddressDetails(voucherXml, voucherData.guid, companyId, divisionId);
        for (const address of addressDetails) {
          const addressResult = await upsertAddressDetails(supabase, address);
          results.push(addressResult);
        }

        // Step 8: Process shipping details
        const shippingDetails = extractShippingDetails(voucherXml, voucherData.guid, companyId, divisionId);
        if (shippingDetails) {
          const shippingResult = await upsertShippingDetails(supabase, shippingDetails);
          results.push(shippingResult);
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
function extractVoucherData(voucherXml: string, companyId: string | null, divisionId: string): any {
  const voucherNumber = extractValue(voucherXml, 'VOUCHERNUMBER') || '';
  const reference = extractValue(voucherXml, 'REFERENCE') || '';
  
  return {
    guid: extractValue(voucherXml, 'GUID') || '',
    date: formatTallyDate(extractValue(voucherXml, 'DATE')),
    voucher_type: extractValue(voucherXml, 'VOUCHERTYPENAME') || '',
    voucher_number: voucherNumber,
    voucher_number_prefix: voucherNumber.split('-')[0] || '',
    voucher_number_suffix: voucherNumber.split('-').slice(1).join('-') || '',
    narration: extractValue(voucherXml, 'NARRATION') || '',
    reference: reference,
    due_date: formatTallyDate(extractValue(voucherXml, 'DUEDATE')),
    currency: extractValue(voucherXml, 'CURRENCY') || 'INR',
    exchange_rate: parseFloat(extractValue(voucherXml, 'EXCHANGERATE') || '1.0000'),
    party_ledger_name: extractValue(voucherXml, 'PARTYLEDGERNAME') || '',
    order_reference: extractValue(voucherXml, 'ORDERREF') || '',
    consignment_note: extractValue(voucherXml, 'CONSIGNMENTNOTE') || '',
    receipt_reference: extractValue(voucherXml, 'RECEIPTREF') || '',
    basic_amount: parseFloat(extractValue(voucherXml, 'BASICAMOUNT') || '0'),
    discount_amount: parseFloat(extractValue(voucherXml, 'DISCOUNTAMOUNT') || '0'),
    total_amount: parseFloat(extractValue(voucherXml, 'TOTALAMOUNT') || '0'),
    net_amount: parseFloat(extractValue(voucherXml, 'NETAMOUNT') || '0'),
    tax_amount: parseFloat(extractValue(voucherXml, 'TAXAMOUNT') || '0'),
    final_amount: parseFloat(extractValue(voucherXml, 'FINALAMOUNT') || '0'),
    is_cancelled: extractValue(voucherXml, 'ISCANCELLED') === 'Yes' ? 1 : 0,
    is_optional: extractValue(voucherXml, 'ISOPTIONAL') === 'Yes' ? 1 : 0,
    altered_by: extractValue(voucherXml, 'ALTEREDBY') || '',
    altered_on: extractValue(voucherXml, 'ALTEREDON') ? new Date(extractValue(voucherXml, 'ALTEREDON')!) : null,
    persistedview: parseInt(extractValue(voucherXml, 'PERSISTEDVIEW') || '0'),
    company_id: companyId,
    division_id: divisionId
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
    if (voucherData.party_ledger_name) {
      const ledgerResult = await ensureLedger(supabase, voucherData.party_ledger_name, voucherData.company_id, voucherData.division_id, voucherXml);
      results.push(ledgerResult);
    }

    // 3. Process all ledgers from accounting entries
    const ledgerMatches = voucherXml.match(/<LEDGERENTRIES\.LIST>[\s\S]*?<\/LEDGERENTRIES\.LIST>/g) || [];
    for (const ledgerXml of ledgerMatches) {
      const ledgerName = extractValue(ledgerXml, 'LEDGERNAME');
      if (ledgerName && ledgerName !== voucherData.party_ledger_name) {
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
    const ledgerData = {
      guid,
      name: ledgerName,
      parent: 'Sundry Debtors',
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
      // New enhanced fields
      income_tax_number: '',
      sales_tax_number: '',
      excise_registration_number: '',
      service_tax_number: '',
      buyer_type: '',
      buyer_category: '',
      ledger_contact: '',
      ledger_mobile: '',
      ledger_fax: '',
      ledger_website: '',
      credit_limit: 0,
      credit_days: 0,
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
      // New enhanced fields
      item_category: '',
      item_classification: '',
      manufacturer: '',
      brand: '',
      model: '',
      size: '',
      color: '',
      weight: 0,
      weight_unit: '',
      volume: 0,
      volume_unit: '',
      minimum_level: 0,
      maximum_level: 0,
      reorder_level: 0,
      shelf_life_days: 0,
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
      // New enhanced fields
      godown_type: '',
      storage_type: '',
      capacity: 0,
      capacity_unit: '',
      location_code: '',
      manager_name: '',
      contact_number: '',
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

// Utility functions
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
                   existing.narration !== voucher.narration ||
                   existing.reference !== voucher.reference ||
                   existing.final_amount !== voucher.final_amount;

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

function extractLedgerEntries(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string, voucherData: any): any[] {
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
        currency: voucherData.currency || 'INR',
        // New enhanced fields
        voucher_guid: voucherGuid,
        voucher_type: voucherData.voucher_type,
        voucher_number: voucherData.voucher_number,
        voucher_date: voucherData.date,
        is_party_ledger: ledgerName === voucherData.party_ledger_name ? 1 : 0,
        is_deemed_positive: isDeemedPositive ? 1 : 0,
        amount_cleared: 0,
        bill_allocations: '',
        cost_category: '',
        cost_centre: '',
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

function extractInventoryEntries(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string, voucherData: any): any[] {
  const entries: any[] = [];
  const inventoryMatches = voucherXml.match(/<ALLINVENTORYENTRIES\.LIST>[\s\S]*?<\/ALLINVENTORYENTRIES\.LIST>/g) || [];
  
  for (const inventoryXml of inventoryMatches) {
    const stockItemName = extractValue(inventoryXml, 'STOCKITEMNAME');
    const actualQty = extractValue(inventoryXml, 'ACTUALQTY');
    const billedQty = extractValue(inventoryXml, 'BILLEDQTY');
    const amount = parseFloat(extractValue(inventoryXml, 'AMOUNT') || '0');
    const rate = parseFloat(extractValue(inventoryXml, 'RATE') || '0');
    
    if (stockItemName) {
      entries.push({
        guid: `${voucherGuid}-inventory-${stockItemName}`,
        item: stockItemName,
        _item: stockItemName,
        quantity: parseFloat(actualQty?.split(' ')[0] || '0'),
        amount,
        godown: extractValue(inventoryXml, 'GODOWNNAME') || '',
        _godown: extractValue(inventoryXml, 'GODOWNNAME') || '',
        name: stockItemName,
        tracking_number: '',
        destination_godown: '',
        _destination_godown: '',
        // New enhanced fields
        voucher_guid: voucherGuid,
        voucher_type: voucherData.voucher_type,
        voucher_number: voucherData.voucher_number,
        voucher_date: voucherData.date,
        rate: rate,
        discount_percent: 0,
        discount_amount: 0,
        actual_quantity: parseFloat(actualQty?.split(' ')[0] || '0'),
        billed_quantity: parseFloat(billedQty?.split(' ')[0] || '0'),
        additional_details: '',
        batch_serial_number: '',
        expiry_date: null,
        manufactured_date: null,
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

// New functions for additional transaction tables

function extractPartyDetails(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any | null {
  const partyLedger = extractValue(voucherXml, 'PARTYLEDGERNAME');
  const partyGstin = extractValue(voucherXml, 'PARTYGSTIN');
  
  if (!partyLedger) return null;
  
  return {
    guid: `${voucherGuid}-party`,
    voucher_guid: voucherGuid,
    party_name: partyLedger,
    party_ledger_name: partyLedger,
    gstin: partyGstin || '',
    party_address: extractValue(voucherXml, 'PARTYADDRESS') || '',
    party_state: extractValue(voucherXml, 'PARTYSTATE') || '',
    party_pincode: extractValue(voucherXml, 'PARTYPINCODE') || '',
    party_country: extractValue(voucherXml, 'PARTYCOUNTRY') || 'India',
    place_of_supply: extractValue(voucherXml, 'PLACEOFSUPPLY') || '',
    company_id: companyId,
    division_id: divisionId
  };
}

async function upsertPartyDetails(supabase: any, party: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_party_details')
    .select('*')
    .eq('guid', party.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.party_name !== party.party_name || existing.gstin !== party.gstin;
    if (changed) {
      await supabase.from('trn_party_details').update(party).eq('guid', party.guid);
      return { table: 'trn_party_details', action: 'updated', guid: party.guid, record_type: 'party_details' };
    } else {
      return { table: 'trn_party_details', action: 'ignored', guid: party.guid, record_type: 'party_details' };
    }
  } else {
    await supabase.from('trn_party_details').insert(party);
    return { table: 'trn_party_details', action: 'inserted', guid: party.guid, record_type: 'party_details' };
  }
}

function extractGstDetails(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any[] {
  const gstEntries: any[] = [];
  const ledgerMatches = voucherXml.match(/<LEDGERENTRIES\.LIST>[\s\S]*?<\/LEDGERENTRIES\.LIST>/g) || [];
  
  for (const ledgerXml of ledgerMatches) {
    const ledgerName = extractValue(ledgerXml, 'LEDGERNAME');
    const amount = parseFloat(extractValue(ledgerXml, 'AMOUNT') || '0');
    
    if (ledgerName && (ledgerName.includes('IGST') || ledgerName.includes('CGST') || ledgerName.includes('SGST') || ledgerName.includes('CESS'))) {
      gstEntries.push({
        guid: `${voucherGuid}-gst-${ledgerName}`,
        voucher_guid: voucherGuid,
        gst_class: ledgerName.includes('IGST') ? 'IGST' : ledgerName.includes('CGST') ? 'CGST' : ledgerName.includes('SGST') ? 'SGST' : 'CESS',
        hsn_code: extractValue(voucherXml, 'HSNCODE') || '',
        hsn_description: '',
        taxable_amount: 0,
        igst_amount: ledgerName.includes('IGST') ? amount : 0,
        cgst_amount: ledgerName.includes('CGST') ? amount : 0,
        sgst_amount: ledgerName.includes('SGST') ? amount : 0,
        cess_amount: ledgerName.includes('CESS') ? amount : 0,
        igst_rate: 0,
        cgst_rate: 0,
        sgst_rate: 0,
        cess_rate: 0,
        gst_registration_type: '',
        reverse_charge_applicable: 0,
        company_id: companyId,
        division_id: divisionId
      });
    }
  }
  
  return gstEntries;
}

async function upsertGstDetails(supabase: any, gst: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_gst_details')
    .select('*')
    .eq('guid', gst.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.igst_amount !== gst.igst_amount || existing.cgst_amount !== gst.cgst_amount;
    if (changed) {
      await supabase.from('trn_gst_details').update(gst).eq('guid', gst.guid);
      return { table: 'trn_gst_details', action: 'updated', guid: gst.guid, record_type: 'gst_details' };
    } else {
      return { table: 'trn_gst_details', action: 'ignored', guid: gst.guid, record_type: 'gst_details' };
    }
  } else {
    await supabase.from('trn_gst_details').insert(gst);
    return { table: 'trn_gst_details', action: 'inserted', guid: gst.guid, record_type: 'gst_details' };
  }
}

function extractAddressDetails(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any[] {
  const addresses: any[] = [];
  
  // Extract billing address
  const billingAddress = extractValue(voucherXml, 'BILLINGADDRESS');
  if (billingAddress) {
    addresses.push({
      guid: `${voucherGuid}-addr-billing`,
      voucher_guid: voucherGuid,
      address_type: 'billing',
      address_line1: billingAddress,
      address_line2: '',
      address_line3: '',
      address_line4: '',
      city: '',
      state: extractValue(voucherXml, 'BILLINGSTATE') || '',
      pincode: extractValue(voucherXml, 'BILLINGPINCODE') || '',
      country: 'India',
      contact_person: '',
      phone: '',
      email: '',
      company_id: companyId,
      division_id: divisionId
    });
  }
  
  // Extract shipping address
  const shippingAddress = extractValue(voucherXml, 'SHIPPINGADDRESS');
  if (shippingAddress) {
    addresses.push({
      guid: `${voucherGuid}-addr-shipping`,
      voucher_guid: voucherGuid,
      address_type: 'shipping',
      address_line1: shippingAddress,
      address_line2: '',
      address_line3: '',
      address_line4: '',
      city: '',
      state: extractValue(voucherXml, 'SHIPPINGSTATE') || '',
      pincode: extractValue(voucherXml, 'SHIPPINGPINCODE') || '',
      country: 'India',
      contact_person: '',
      phone: '',
      email: '',
      company_id: companyId,
      division_id: divisionId
    });
  }
  
  return addresses;
}

async function upsertAddressDetails(supabase: any, address: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_address_details')
    .select('*')
    .eq('guid', address.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.address_line1 !== address.address_line1 || existing.state !== address.state;
    if (changed) {
      await supabase.from('trn_address_details').update(address).eq('guid', address.guid);
      return { table: 'trn_address_details', action: 'updated', guid: address.guid, record_type: 'address_details' };
    } else {
      return { table: 'trn_address_details', action: 'ignored', guid: address.guid, record_type: 'address_details' };
    }
  } else {
    await supabase.from('trn_address_details').insert(address);
    return { table: 'trn_address_details', action: 'inserted', guid: address.guid, record_type: 'address_details' };
  }
}

function extractShippingDetails(voucherXml: string, voucherGuid: string, companyId: string | null, divisionId: string): any | null {
  const consigneeName = extractValue(voucherXml, 'CONSIGNEENAME');
  const buyerName = extractValue(voucherXml, 'BUYERNAME');
  
  if (!consigneeName && !buyerName) return null;
  
  return {
    guid: `${voucherGuid}-shipping`,
    voucher_guid: voucherGuid,
    consignee_name: consigneeName || '',
    consignee_address: extractValue(voucherXml, 'CONSIGNEEADDRESS') || '',
    consignee_state: extractValue(voucherXml, 'CONSIGNEESTATE') || '',
    consignee_pincode: extractValue(voucherXml, 'CONSIGNEEPINCODE') || '',
    consignee_country: 'India',
    buyer_name: buyerName || '',
    buyer_address: extractValue(voucherXml, 'BUYERADDRESS') || '',
    buyer_state: extractValue(voucherXml, 'BUYERSTATE') || '',
    dispatch_state: extractValue(voucherXml, 'DISPATCHSTATE') || '',
    ship_to_state: extractValue(voucherXml, 'SHIPTOSTATE') || '',
    company_id: companyId,
    division_id: divisionId
  };
}

async function upsertShippingDetails(supabase: any, shipping: any): Promise<ProcessResult> {
  const { data: existing } = await supabase
    .from('trn_shipping_details')
    .select('*')
    .eq('guid', shipping.guid)
    .maybeSingle();

  if (existing) {
    const changed = existing.consignee_name !== shipping.consignee_name || existing.buyer_name !== shipping.buyer_name;
    if (changed) {
      await supabase.from('trn_shipping_details').update(shipping).eq('guid', shipping.guid);
      return { table: 'trn_shipping_details', action: 'updated', guid: shipping.guid, record_type: 'shipping_details' };
    } else {
      return { table: 'trn_shipping_details', action: 'ignored', guid: shipping.guid, record_type: 'shipping_details' };
    }
  } else {
    await supabase.from('trn_shipping_details').insert(shipping);
    return { table: 'trn_shipping_details', action: 'inserted', guid: shipping.guid, record_type: 'shipping_details' };
  }
}