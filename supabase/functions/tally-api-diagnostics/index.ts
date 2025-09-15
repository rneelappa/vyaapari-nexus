import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, divisionId, voucherId } = await req.json();
    
    console.log('Testing Tally API with:', { companyId, divisionId, voucherId });
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      companyId,
      divisionId,
      voucherId,
      tests: []
    };

    // Test 1: Get division details
    console.log('Testing division details...');
    try {
      const { data: division, error: divisionError } = await supabase
        .from('divisions')
        .select('*')
        .eq('id', divisionId)
        .single();

      diagnostics.tests.push({
        test: 'Division Details',
        success: !divisionError,
        data: division,
        error: divisionError?.message,
        details: division ? {
          tallyEnabled: division.tally_enabled,
          tallyUrl: division.tally_url,
          tallyCompanyId: division.tally_company_id
        } : null
      });
    } catch (error) {
      diagnostics.tests.push({
        test: 'Division Details',
        success: false,
        error: error.message
      });
    }

    // Test 2: Test external Tally API health
    console.log('Testing external Tally API...');
    try {
      const response = await fetch('https://tally-sync-vyaapari360-production.up.railway.app/api/v1/health');
      const healthData = await response.json();
      
      diagnostics.tests.push({
        test: 'External Tally API Health',
        success: response.ok,
        status: response.status,
        data: healthData,
        error: response.ok ? null : `HTTP ${response.status}`
      });
    } catch (error) {
      diagnostics.tests.push({
        test: 'External Tally API Health',
        success: false,
        error: error.message
      });
    }

    // Test 3: Get voucher details from external API
    if (voucherId) {
      console.log('Testing voucher details from external API...');
      try {
        const voucherUrl = `https://tally-sync-vyaapari360-production.up.railway.app/api/v1/voucher/${companyId}/${divisionId}/${voucherId}`;
        const response = await fetch(voucherUrl);
        const voucherData = await response.json();
        
        diagnostics.tests.push({
          test: 'External API Voucher Details',
          success: response.ok,
          status: response.status,
          url: voucherUrl,
          data: voucherData,
          error: response.ok ? null : `HTTP ${response.status}`,
          analysis: {
            hasEntries: voucherData?.data?.entries?.length > 0,
            hasInventoryEntries: voucherData?.data?.inventoryEntries?.length > 0,
            hasPartyDetails: !!voucherData?.data?.partyLedgerName,
            entriesCount: voucherData?.data?.entries?.length || 0,
            inventoryCount: voucherData?.data?.inventoryEntries?.length || 0
          }
        });
      } catch (error) {
        diagnostics.tests.push({
          test: 'External API Voucher Details',
          success: false,
          error: error.message
        });
      }
    }

    // Test 4: Check Supabase voucher data
    if (voucherId) {
      console.log('Testing Supabase voucher data...');
      try {
        const { data: voucherData, error: voucherError } = await supabase
          .from('tally_trn_voucher')
          .select('*')
          .eq('vch_key', voucherId)
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .maybeSingle();

        diagnostics.tests.push({
          test: 'Supabase Voucher Data',
          success: !voucherError,
          data: voucherData,
          error: voucherError?.message,
          found: !!voucherData
        });

        // Test 5: Check accounting entries
        if (voucherData) {
          const { data: accountingEntries, error: accountingError } = await supabase
            .from('trn_accounting')
            .select('*')
            .eq('voucher_key', voucherId)
            .eq('company_id', companyId)
            .eq('division_id', divisionId);

          diagnostics.tests.push({
            test: 'Supabase Accounting Entries',
            success: !accountingError,
            data: accountingEntries,
            error: accountingError?.message,
            count: accountingEntries?.length || 0
          });

          // Test 6: Check inventory entries
          const { data: inventoryEntries, error: inventoryError } = await supabase
            .from('trn_inventory')
            .select('*')
            .eq('voucher_key', voucherId)
            .eq('company_id', companyId)
            .eq('division_id', divisionId);

          diagnostics.tests.push({
            test: 'Supabase Inventory Entries',
            success: !inventoryError,
            data: inventoryEntries,
            error: inventoryError?.message,
            count: inventoryEntries?.length || 0
          });
        }
      } catch (error) {
        diagnostics.tests.push({
          test: 'Supabase Voucher Data',
          success: false,
          error: error.message
        });
      }
    }

    // Test 7: Check if TDL is properly configured
    console.log('Testing TDL configuration...');
    try {
      const { data: division } = await supabase
        .from('divisions')
        .select('tally_url')
        .eq('id', divisionId)
        .single();

      if (division?.tally_url) {
        // Test a simple TDL request to check if detailed data is available
        const testUrl = `${division.tally_url}/tally`;
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
          },
          body: `<ENVELOPE>
            <HEADER>
              <VERSION>1</VERSION>
              <TALLYREQUEST>Export</TALLYREQUEST>
              <TYPE>Data</TYPE>
              <ID>VoucherExport</ID>
            </HEADER>
            <BODY>
              <DESC>
                <STATICVARIABLES>
                  <SVCOMPANY>${companyId}</SVCOMPANY>
                </STATICVARIABLES>
              </DESC>
            </BODY>
          </ENVELOPE>`
        });

        diagnostics.tests.push({
          test: 'Direct Tally TDL Test',
          success: testResponse.ok,
          status: testResponse.status,
          error: testResponse.ok ? null : `HTTP ${testResponse.status}`,
          details: 'Testing if Tally server responds to TDL requests'
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        test: 'Direct Tally TDL Test',
        success: false,
        error: error.message
      });
    }

    // Summary
    const successfulTests = diagnostics.tests.filter(t => t.success).length;
    const totalTests = diagnostics.tests.length;
    
    diagnostics.summary = {
      successfulTests,
      totalTests,
      successRate: `${Math.round((successfulTests / totalTests) * 100)}%`,
      recommendations: []
    };

    // Add recommendations based on test results
    const externalApiTest = diagnostics.tests.find(t => t.test === 'External API Voucher Details');
    if (externalApiTest && externalApiTest.success && externalApiTest.analysis) {
      if (!externalApiTest.analysis.hasEntries) {
        diagnostics.summary.recommendations.push('External API is not returning accounting entries - check TDL configuration');
      }
      if (!externalApiTest.analysis.hasInventoryEntries) {
        diagnostics.summary.recommendations.push('External API is not returning inventory entries - check inventory TDL setup');
      }
      if (!externalApiTest.analysis.hasPartyDetails) {
        diagnostics.summary.recommendations.push('External API is not returning party details - check ledger mapping');
      }
    }

    const supabaseVoucherTest = diagnostics.tests.find(t => t.test === 'Supabase Voucher Data');
    if (supabaseVoucherTest && !supabaseVoucherTest.found) {
      diagnostics.summary.recommendations.push('Voucher not found in Supabase - sync may be incomplete');
    }

    return new Response(JSON.stringify(diagnostics, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in tally-api-diagnostics:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});