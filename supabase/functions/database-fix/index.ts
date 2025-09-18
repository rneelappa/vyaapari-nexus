import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, divisionId, operation } = await req.json();

    if (!companyId || !divisionId) {
      return new Response(
        JSON.stringify({ error: 'Missing companyId or divisionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[Database Fix] Starting operation: ${operation || 'fix-voucher-relationships'} for company: ${companyId}, division: ${divisionId}`);

    if (operation === 'fix-voucher-relationships' || !operation) {
      const result = await fixVoucherRelationships(supabase, companyId, divisionId);
      
      return new Response(
        JSON.stringify({
          success: true,
          operation: 'fix-voucher-relationships',
          result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (operation === 'calculate-voucher-amounts') {
      const result = await calculateVoucherAmounts(supabase, companyId, divisionId);
      
      return new Response(
        JSON.stringify({
          success: true,
          operation: 'calculate-voucher-amounts',
          result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown operation' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Database fix error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fixVoucherRelationships(supabase: any, companyId: string, divisionId: string) {
  console.log('[Fix] Starting voucher relationship repair...');
  
  const results = {
    accounting: { total: 0, fixed: 0 },
    inventory: { total: 0, fixed: 0 },
    diagnostics: {}
  };

  // Fix trn_accounting relationships (batched)
  console.log('[Fix] Processing trn_accounting relationships...');
  let accOffset = 0;
  const accBatchSize = 1000;
  while (true) {
    const { data: accountingRows, error: accError } = await supabase
      .from('trn_accounting')
      .select('guid, voucher_number, voucher_guid')
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .not('voucher_number', 'is', null)
      .neq('voucher_number', '')
      .order('guid', { ascending: true })
      .range(accOffset, accOffset + accBatchSize - 1);

    if (accError) {
      console.error('[Fix] Error fetching accounting rows:', accError);
      break;
    }

    const batch = accountingRows || [];
    if (accOffset === 0) {
      console.log(`[Fix] Found initial ${batch.length} accounting entries to process (batch size ${accBatchSize})`);
    }
    results.accounting.total += batch.length;

    if (batch.length === 0) break;

    for (const row of batch) {
      try {
        // Find the corresponding voucher
        const { data: voucher, error: vError } = await supabase
          .from('tally_trn_voucher')
          .select('guid')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .eq('voucher_number', row.voucher_number)
          .maybeSingle();

        if (vError || !voucher) {
          continue;
        }

        // Update if voucher_guid is different or empty
        if (!row.voucher_guid || row.voucher_guid !== voucher.guid) {
          const { error: updateError } = await supabase
            .from('trn_accounting')
            .update({ voucher_guid: voucher.guid })
            .eq('guid', row.guid);

          if (!updateError) {
            results.accounting.fixed++;
          }
        }
      } catch (e) {
        console.error(`[Fix] Error processing accounting row ${row.guid}:`, e);
      }
    }

    accOffset += batch.length;
    if (batch.length < accBatchSize) break; // last page
  }

  // Fix trn_inventory relationships (handle missing voucher_number gracefully)
  console.log('[Fix] Processing trn_inventory relationships...');
  const invBatchSize = 1000;

  // First probe to detect if voucher_number column exists
  let probe = await supabase
    .from('trn_inventory')
    .select('guid, voucher_number, voucher_guid')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .order('guid', { ascending: true })
    .range(0, invBatchSize - 1);

  if (probe.error && probe.error.code === '42703') {
    // Fallback path: derive voucher_guid from inventory guid prefix `${voucherGuid}-inventory-#`
    console.warn('[Fix] trn_inventory.voucher_number column missing. Falling back to GUID-derivation strategy.');
    let invOffset = 0;
    while (true) {
      const { data: invRows, error: invErr } = await supabase
        .from('trn_inventory')
        .select('guid, voucher_guid')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('guid', { ascending: true })
        .range(invOffset, invOffset + invBatchSize - 1);

      if (invErr) {
        console.error('[Fix] Error fetching inventory rows (fallback):', invErr);
        break;
      }

      const batch = invRows || [];
      results.inventory.total += batch.length;
      if (batch.length === 0) break;

      for (const row of batch) {
        try {
          const derivedGuid = row.guid?.split('-inventory-')[0] || '';
          if (derivedGuid && row.voucher_guid !== derivedGuid) {
            const { error: updErr } = await supabase
              .from('trn_inventory')
              .update({ voucher_guid: derivedGuid })
              .eq('guid', row.guid);
            if (!updErr) results.inventory.fixed++;
          }
        } catch (e) {
          console.error(`[Fix] Error processing inventory row ${row.guid} (fallback):`, e);
        }
      }

      invOffset += batch.length;
      if (batch.length < invBatchSize) break;
    }
  } else {
    // Standard path using voucher_number
    if (probe.error) {
      console.error('[Fix] Error probing inventory rows:', probe.error);
    }

    let invOffset = 0;
    while (true) {
      const { data: inventoryRows, error: invError } = await supabase
        .from('trn_inventory')
        .select('guid, voucher_number, voucher_guid')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .not('voucher_number', 'is', null)
        .neq('voucher_number', '')
        .order('guid', { ascending: true })
        .range(invOffset, invOffset + invBatchSize - 1);

      if (invError) {
        console.error('[Fix] Error fetching inventory rows:', invError);
        break;
      }

      const batch = inventoryRows || [];
      results.inventory.total += batch.length;
      if (invOffset === 0) {
        console.log(`[Fix] Found initial ${batch.length} inventory entries to process (batch size ${invBatchSize})`);
      }
      if (batch.length === 0) break;

      for (const row of batch) {
        try {
          // Find the corresponding voucher
          const { data: voucher, error: vError } = await supabase
            .from('tally_trn_voucher')
            .select('guid')
            .eq('company_id', companyId)
            .eq('division_id', divisionId)
            .eq('voucher_number', row.voucher_number)
            .maybeSingle();

          if (vError || !voucher) continue;

          // Update if voucher_guid is different or empty
          if (!row.voucher_guid || row.voucher_guid !== voucher.guid) {
            const { error: updateError } = await supabase
              .from('trn_inventory')
              .update({ voucher_guid: voucher.guid })
              .eq('guid', row.guid);

            if (!updateError) {
              results.inventory.fixed++;
            }
          }
        } catch (e) {
          console.error(`[Fix] Error processing inventory row ${row.guid}:`, e);
        }
      }

      invOffset += batch.length;
      if (batch.length < invBatchSize) break; // last page
    }
  }

  // Diagnostic check for the specific voucher mentioned
  const targetVoucher = '2800240/25-26';
  console.log(`[Fix] Checking diagnostic for voucher: ${targetVoucher}`);
  
  const { data: voucherData } = await supabase
    .from('tally_trn_voucher')
    .select('guid')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .eq('voucher_number', targetVoucher)
    .maybeSingle();

  if (voucherData?.guid) {
    const { count: accCount } = await supabase
      .from('trn_accounting')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .eq('voucher_guid', voucherData.guid);

    const { count: invCount } = await supabase
      .from('trn_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('division_id', divisionId)
      .eq('voucher_guid', voucherData.guid);

    results.diagnostics[targetVoucher] = {
      voucher_guid: voucherData.guid,
      accounting_entries: accCount || 0,
      inventory_entries: invCount || 0
    };
  } else {
    results.diagnostics[targetVoucher] = {
      error: 'Voucher not found'
    };
  }

  console.log(`[Fix] Completed: accounting fixed ${results.accounting.fixed}/${results.accounting.total}, inventory fixed ${results.inventory.fixed}/${results.inventory.total}`);
  
  return results;
}

async function calculateVoucherAmounts(supabase: any, companyId: string, divisionId: string) {
  console.log('[Fix] Starting voucher amount calculations...');
  
  const results = {
    vouchers_processed: 0,
    vouchers_updated: 0
  };

  // Get vouchers that need amount calculation
  const { data: vouchers, error: vError } = await supabase
    .from('tally_trn_voucher')
    .select('guid, voucher_number, total_amount, final_amount')
    .eq('company_id', companyId)
    .eq('division_id', divisionId)
    .limit(5000);

  if (vError || !vouchers) {
    console.error('[Fix] Error fetching vouchers:', vError);
    return results;
  }

  results.vouchers_processed = vouchers.length;

  for (const voucher of vouchers) {
    try {
      // Calculate total from accounting entries
      const { data: accEntries } = await supabase
        .from('trn_accounting')
        .select('amount')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .eq('voucher_guid', voucher.guid)
        .gt('amount', 0);

      if (accEntries && accEntries.length > 0) {
        const calculatedTotal = accEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Update if amounts are different or zero
        if (voucher.total_amount !== calculatedTotal || voucher.final_amount !== calculatedTotal) {
          const { error: updateError } = await supabase
            .from('tally_trn_voucher')
            .update({ 
              total_amount: calculatedTotal,
              final_amount: calculatedTotal 
            })
            .eq('guid', voucher.guid);

          if (!updateError) {
            results.vouchers_updated++;
          }
        }
      }
    } catch (e) {
      console.error(`[Fix] Error calculating amounts for voucher ${voucher.guid}:`, e);
    }
  }

  console.log(`[Fix] Amount calculation completed: ${results.vouchers_updated}/${results.vouchers_processed} vouchers updated`);
  
  return results;
}