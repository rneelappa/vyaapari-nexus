import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const tallyApiKey = Deno.env.get('TALLY_API_KEY')!;

interface TallyApiRequest {
  api_key: string;
  action: 'getCompanies' | 'getLedgers' | 'getGroups' | 'getStockItems' | 'getVouchers' | 'getCostCenters' | 'getGodowns' | 'getEmployees';
  divisionId?: string;
  companyId?: string;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { api_key, action, divisionId, companyId, filters = {} } = await req.json() as TallyApiRequest
    
    // Validate API key
    if (api_key !== tallyApiKey) {
      console.error('Invalid API key in tally-api request');
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log(`Tally API request: ${action}`, { divisionId, companyId, filters })

    const { limit = 100, offset = 0, search = '', dateFrom, dateTo } = filters

    let query: any
    let data: any = null
    let error: any = null

    switch (action) {
      case 'getCompanies':
        query = supabaseClient
          .from('mst_company')
          .select('*')
          .order('company_name')
        
        if (search) {
          query = query.ilike('company_name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getLedgers':
        query = supabaseClient
          .from('mst_ledger')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getGroups':
        query = supabaseClient
          .from('mst_group')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getStockItems':
        query = supabaseClient
          .from('mst_stock_item')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getVouchers':
        query = supabaseClient
          .from('tally_trn_voucher')
          .select('*')
          .order('date', { ascending: false })
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (dateFrom) {
          query = query.gte('date', dateFrom)
        }
        if (dateTo) {
          query = query.lte('date', dateTo)
        }
        if (search) {
          query = query.or(`voucher_number.ilike.%${search}%,narration.ilike.%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getCostCenters':
        query = supabaseClient
          .from('mst_cost_centre')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getGodowns':
        query = supabaseClient
          .from('mst_godown')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      case 'getEmployees':
        query = supabaseClient
          .from('mst_employee')
          .select('*')
          .order('name')
        
        if (companyId) {
          query = query.eq('company_id', companyId)
        }
        if (divisionId) {
          query = query.eq('division_id', divisionId)
        }
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        query = query.range(offset, offset + limit - 1)
        break

      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const result = await query
    data = result.data
    error = result.error

    if (error) {
      console.error(`Error fetching ${action}:`, error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully fetched ${data?.length || 0} records for ${action}`)

    return new Response(
      JSON.stringify({ data, count: data?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Tally API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})