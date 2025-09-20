import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncResult {
  table: string;
  synced: number;
  errors: number;
  errorDetails?: string[];
}

interface SyncResponse {
  success: boolean;
  message: string;
  results: SyncResult[];
  totalRecords: number;
  totalErrors: number;
}

// Company/Division mapping cache
const companyDivisionCache = new Map<string, { companyId: string; divisionId: string }>();

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { action = 'full_sync', batchSize = 1000, companyId, divisionId } = await req.json();

    console.log(`Starting VT-Tally sync with action: ${action}`);

    let results: SyncResult[] = [];
    let totalRecords = 0;
    let totalErrors = 0;

    if (action === 'full_sync') {
      // Sync in proper order to handle dependencies
      const syncOrder = [
        'companies',
        'divisions', 
        'units_of_measure',
        'groups',
        'ledgers',
        'stock_groups',
        'stock_items',
        'godowns',
        'cost_categories',
        'cost_centres',
        'voucher_types',
        'vouchers',
        'ledger_entries',
        'inventory_entries',
        'address_details',
        'bank_details'
      ];

      for (const table of syncOrder) {
        try {
          console.log(`Syncing table: ${table}`);
          const result = await syncTable(supabase, table, batchSize, companyId, divisionId);
          results.push(result);
          totalRecords += result.synced;
          totalErrors += result.errors;
        } catch (error) {
          console.error(`Error syncing table ${table}:`, error);
          results.push({
            table,
            synced: 0,
            errors: 1,
            errorDetails: [error.message]
          });
          totalErrors++;
        }
      }
    } else if (action === 'sync_table') {
      const { tableName } = await req.json();
      const result = await syncTable(supabase, tableName, batchSize, companyId, divisionId);
      results.push(result);
      totalRecords += result.synced;
      totalErrors += result.errors;
    }

    const response: SyncResponse = {
      success: totalErrors === 0,
      message: `Sync completed. ${totalRecords} records synced, ${totalErrors} errors.`,
      results,
      totalRecords,
      totalErrors
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message,
      results: [],
      totalRecords: 0,
      totalErrors: 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function syncTable(
  supabase: any, 
  tableName: string, 
  batchSize: number,
  filterCompanyId?: string,
  filterDivisionId?: string
): Promise<SyncResult> {
  console.log(`Starting sync for table: ${tableName}`);
  
  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  try {
    switch (tableName) {
      case 'companies':
        return await syncCompanies(supabase, batchSize);
      case 'divisions':
        return await syncDivisions(supabase, batchSize);
      case 'units_of_measure':
        return await syncUnitsOfMeasure(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'groups':
        return await syncGroups(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'ledgers':
        return await syncLedgers(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'stock_groups':
        return await syncStockGroups(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'stock_items':
        return await syncStockItems(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'godowns':
        return await syncGodowns(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'cost_categories':
        return await syncCostCategories(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'cost_centres':
        return await syncCostCentres(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'voucher_types':
        return await syncVoucherTypes(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'vouchers':
        return await syncVouchers(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'ledger_entries':
        return await syncLedgerEntries(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'inventory_entries':
        return await syncInventoryEntries(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'address_details':
        return await syncAddressDetails(supabase, batchSize, filterCompanyId, filterDivisionId);
      case 'bank_details':
        return await syncBankDetails(supabase, batchSize, filterCompanyId, filterDivisionId);
      default:
        throw new Error(`Unknown table: ${tableName}`);
    }
  } catch (error) {
    console.error(`Error in syncTable for ${tableName}:`, error);
    return {
      table: tableName,
      synced,
      errors: errors + 1,
      errorDetails: [...errorDetails, error.message]
    };
  }
}

// Helper function to resolve company/division mapping
async function getCompanyDivision(supabase: any, companyName: string, divisionName?: string) {
  const cacheKey = `${companyName}_${divisionName || 'default'}`;
  
  if (companyDivisionCache.has(cacheKey)) {
    return companyDivisionCache.get(cacheKey);
  }

  // Get or create company
  let { data: company } = await supabase
    .from('vt.companies')
    .select('id')
    .eq('name', companyName)
    .single();

  if (!company) {
    const { data: newCompany, error } = await supabase
      .from('vt.companies')
      .insert({ name: companyName })
      .select('id')
      .single();
    
    if (error) throw error;
    company = newCompany;
  }

  let divisionId = null;
  if (divisionName) {
    let { data: division } = await supabase
      .from('vt.divisions')
      .select('id')
      .eq('company_id', company.id)
      .eq('name', divisionName)
      .single();

    if (!division) {
      const { data: newDivision, error } = await supabase
        .from('vt.divisions')
        .insert({ 
          company_id: company.id,
          name: divisionName 
        })
        .select('id')
        .single();
      
      if (error) throw error;
      division = newDivision;
    }
    divisionId = division.id;
  }

  const result = { companyId: company.id, divisionId };
  companyDivisionCache.set(cacheKey, result);
  return result;
}

// Company sync function
async function syncCompanies(supabase: any, batchSize: number): Promise<SyncResult> {
  console.log('Syncing companies from public.companies table');
  
  const { data: tallyCompanies, error } = await supabase
    .from('companies')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const company of tallyCompanies || []) {
    try {
      const { error: insertError } = await supabase
        .from('vt.companies')
        .upsert({
          name: company.name,
          tally_company_id: company.id
        }, {
          onConflict: 'tally_company_id'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Company ${company.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Company ${company.name}: ${error.message}`);
    }
  }

  return { table: 'companies', synced, errors, errorDetails };
}

// Division sync function
async function syncDivisions(supabase: any, batchSize: number): Promise<SyncResult> {
  console.log('Syncing divisions from public.divisions table');
  
  const { data: tallyDivisions, error } = await supabase
    .from('divisions')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const division of tallyDivisions || []) {
    try {
      // Get company mapping
      const { data: company } = await supabase
        .from('vt.companies')
        .select('id')
        .eq('tally_company_id', division.company_id)
        .single();

      if (!company) {
        errors++;
        errorDetails.push(`Division ${division.name}: Company not found for ${division.company_id}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from('vt.divisions')
        .upsert({
          company_id: company.id,
          name: division.name,
          tally_division_id: division.id,
          tally_url: division.tally_url
        }, {
          onConflict: 'company_id,tally_division_id'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Division ${division.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Division ${division.name}: ${error.message}`);
    }
  }

  return { table: 'divisions', synced, errors, errorDetails };
}

// Groups sync function  
async function syncGroups(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing groups from tally schema');
  
  let query = supabase.from('tally.group_table').select('*');
  
  if (filterCompanyId) {
    query = query.eq('company_id', filterCompanyId);
  }
  if (filterDivisionId) {
    query = query.eq('division_id', filterDivisionId);
  }

  const { data: tallyGroups, error } = await query;
  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  // Create groups map for parent resolution
  const groupsMap = new Map<string, string>();

  // First pass: create all groups without parent relationships
  for (const group of tallyGroups || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { data: insertedGroup, error: insertError } = await supabase
        .from('vt.groups')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: group.id,
          name: group.name,
          primary_group: group.primary_group,
          is_revenue: group.is_revenue === 1,
          is_deemed_positive: group.is_deemed_positive === 1,
          is_reserved: group.is_reserved === 1,
          affects_gross_profit: group.affects_gross_profit === 1,
          sort_position: group.sort_position || 0
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        })
        .select('id')
        .single();

      if (insertError) {
        errors++;
        errorDetails.push(`Group ${group.name}: ${insertError.message}`);
      } else {
        synced++;
        groupsMap.set(group.id, insertedGroup.id);
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Group ${group.name}: ${error.message}`);
    }
  }

  // Second pass: update parent relationships
  for (const group of tallyGroups || []) {
    if (group.parent_group_id && groupsMap.has(group.parent_group_id)) {
      try {
        const parentId = groupsMap.get(group.parent_group_id);
        const groupId = groupsMap.get(group.id);

        if (groupId && parentId) {
          await supabase
            .from('vt.groups')
            .update({ parent_id: parentId })
            .eq('id', groupId);
        }
      } catch (error) {
        console.warn(`Failed to update parent for group ${group.name}:`, error.message);
      }
    }
  }

  return { table: 'groups', synced, errors, errorDetails };
}

// Ledgers sync function
async function syncLedgers(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing ledgers from tally schema');
  
  let query = supabase.from('tally.ledger').select('*');
  
  if (filterCompanyId) {
    query = query.eq('company_id', filterCompanyId);
  }
  if (filterDivisionId) {
    query = query.eq('division_id', filterDivisionId);
  }

  const { data: tallyLedgers, error } = await query;
  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const ledger of tallyLedgers || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      // Find group by name if exists
      let groupId = null;
      if (ledger.parent) {
        const { data: group } = await supabase
          .from('vt.groups')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', ledger.parent)
          .single();
        
        if (group) groupId = group.id;
      }

      const { error: insertError } = await supabase
        .from('vt.ledgers')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          group_id: groupId,
          tally_guid: ledger.id,
          name: ledger.name,
          alias: ledger.alias,
          opening_balance: parseFloat(ledger.opening_balance) || 0,
          closing_balance: parseFloat(ledger.closing_balance) || 0,
          mailing_name: ledger.mailing_name,
          mailing_address: ledger.mailing_address,
          email: ledger.email,
          gstn: ledger.gstn,
          pan: ledger.it_pan,
          gst_registration_type: ledger.gst_registration_type,
          gst_supply_type: ledger.gst_supply_type,
          bank_name: ledger.bank_name,
          bank_account_number: ledger.bank_account_number,
          bank_ifsc: ledger.bank_ifsc,
          bank_account_holder: ledger.bank_account_holder,
          credit_limit: parseFloat(ledger.credit_limit) || 0,
          credit_days: parseInt(ledger.credit_days) || 0,
          is_revenue: ledger.is_revenue === 1,
          is_deemed_positive: ledger.is_deemedpositive === 1
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Ledger ${ledger.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Ledger ${ledger.name}: ${error.message}`);
    }
  }

  return { table: 'ledgers', synced, errors, errorDetails };
}

// Units of Measure sync function
async function syncUnitsOfMeasure(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing units of measure from tally.unitofmeasure');
  
  let query = supabase.from('tally.unitofmeasure').select('*');
  
  const { data: tallyUOMs, error } = await query;
  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const uom of tallyUOMs || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.units_of_measure')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: uom.id,
          name: uom.name,
          formal_name: uom.formalname,
          is_simple_unit: uom.is_simple_unit === 1,
          base_units: uom.base_units,
          additional_units: uom.additional_units,
          conversion_factor: parseFloat(uom.conversion) || 1
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`UOM ${uom.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`UOM ${uom.name}: ${error.message}`);
    }
  }

  return { table: 'units_of_measure', synced, errors, errorDetails };
}

// Stock Groups sync function
async function syncStockGroups(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing stock groups from tally.stockgroup');
  
  const { data: tallyStockGroups, error } = await supabase
    .from('tally.stockgroup')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const stockGroup of tallyStockGroups || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.stock_groups')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: stockGroup.id,
          name: stockGroup.name
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Stock Group ${stockGroup.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Stock Group ${stockGroup.name}: ${error.message}`);
    }
  }

  return { table: 'stock_groups', synced, errors, errorDetails };
}

// Stock Items sync function
async function syncStockItems(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing stock items from tally.stockitem');
  
  const { data: tallyStockItems, error } = await supabase
    .from('tally.stockitem')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const stockItem of tallyStockItems || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.stock_items')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: stockItem.id,
          name: stockItem.name,
          alias: stockItem.alias,
          part_number: stockItem.part_number,
          description: stockItem.description,
          opening_balance: parseFloat(stockItem.opening_balance) || 0,
          opening_rate: parseFloat(stockItem.opening_rate) || 0,
          opening_value: parseFloat(stockItem.opening_value) || 0,
          closing_balance: parseFloat(stockItem.closing_balance) || 0,
          closing_rate: parseFloat(stockItem.closing_rate) || 0,
          closing_value: parseFloat(stockItem.closing_value) || 0,
          gst_hsn_code: stockItem.gst_hsn_code,
          gst_hsn_description: stockItem.gst_hsn_description,
          gst_rate: parseFloat(stockItem.gst_rate) || 0,
          gst_taxability: stockItem.gst_taxability,
          gst_type_of_supply: stockItem.gst_type_of_supply,
          costing_method: stockItem.costing_method || 'FIFO'
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Stock Item ${stockItem.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Stock Item ${stockItem.name}: ${error.message}`);
    }
  }

  return { table: 'stock_items', synced, errors, errorDetails };
}

// Godowns sync function
async function syncGodowns(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing godowns from tally.godown');
  
  const { data: tallyGodowns, error } = await supabase
    .from('tally.godown')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const godown of tallyGodowns || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.godowns')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: godown.id,
          name: godown.name,
          address: godown.address
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Godown ${godown.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Godown ${godown.name}: ${error.message}`);
    }
  }

  return { table: 'godowns', synced, errors, errorDetails };
}

// Cost Categories sync function
async function syncCostCategories(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing cost categories from tally.costcategory');
  
  const { data: tallyCostCategories, error } = await supabase
    .from('tally.costcategory')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const costCategory of tallyCostCategories || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.cost_categories')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: costCategory.id,
          name: costCategory.name,
          allocate_revenue: costCategory.allocate_revenue === 1,
          allocate_non_revenue: costCategory.allocate_non_revenue === 1
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Cost Category ${costCategory.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Cost Category ${costCategory.name}: ${error.message}`);
    }
  }

  return { table: 'cost_categories', synced, errors, errorDetails };
}

// Cost Centres sync function
async function syncCostCentres(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing cost centres from tally.costcentre');
  
  const { data: tallyCostCentres, error } = await supabase
    .from('tally.costcentre')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const costCentre of tallyCostCentres || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.cost_centres')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: costCentre.id,
          name: costCentre.name
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Cost Centre ${costCentre.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Cost Centre ${costCentre.name}: ${error.message}`);
    }
  }

  return { table: 'cost_centres', synced, errors, errorDetails };
}

// Voucher Types sync function
async function syncVoucherTypes(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing voucher types from tally.vouchertype');
  
  const { data: tallyVoucherTypes, error } = await supabase
    .from('tally.vouchertype')
    .select('*');

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const voucherType of tallyVoucherTypes || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      const { error: insertError } = await supabase
        .from('vt.voucher_types')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          tally_guid: voucherType.id,
          name: voucherType.name,
          parent: voucherType.parent,
          numbering_method: voucherType.numbering_method,
          affects_stock: voucherType.affects_stock === 1,
          is_deemed_positive: voucherType.is_deemedpositive === 1
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Voucher Type ${voucherType.name}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Voucher Type ${voucherType.name}: ${error.message}`);
    }
  }

  return { table: 'voucher_types', synced, errors, errorDetails };
}

// Vouchers sync function
async function syncVouchers(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing vouchers from tally.voucher');
  
  const { data: tallyVouchers, error } = await supabase
    .from('tally.voucher')
    .select('*')
    .limit(batchSize);

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const voucher of tallyVouchers || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      // Find voucher type by name
      let voucherTypeId = null;
      if (voucher.voucher_type) {
        const { data: voucherType } = await supabase
          .from('vt.voucher_types')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', voucher.voucher_type)
          .single();
        
        if (voucherType) voucherTypeId = voucherType.id;
      }

      const { error: insertError } = await supabase
        .from('vt.vouchers')
        .upsert({
          company_id: companyId,
          division_id: divisionId,
          voucher_type_id: voucherTypeId,
          tally_guid: voucher.id,
          voucher_number: voucher.voucher_number,
          voucher_number_prefix: voucher.voucher_number_prefix,
          voucher_number_suffix: voucher.voucher_number_suffix,
          reference: voucher.reference,
          voucher_date: voucher.date,
          due_date: voucher.due_date,
          basic_amount: parseFloat(voucher.basic_amount) || 0,
          discount_amount: parseFloat(voucher.discount_amount) || 0,
          tax_amount: parseFloat(voucher.tax_amount) || 0,
          total_amount: parseFloat(voucher.total_amount) || 0,
          final_amount: parseFloat(voucher.final_amount) || 0,
          currency: voucher.currency || 'INR',
          exchange_rate: parseFloat(voucher.exchange_rate) || 1,
          narration: voucher.narration,
          party_ledger_name: voucher.party_ledger_name,
          order_reference: voucher.order_reference,
          consignment_note: voucher.consignment_note,
          receipt_reference: voucher.receipt_reference,
          is_cancelled: voucher.is_cancelled === 1,
          is_optional: voucher.is_optional === 1,
          altered_by: voucher.altered_by,
          altered_on: voucher.altered_on,
          alter_id: parseInt(voucher.alterid) || 0,
          persisted_view: parseInt(voucher.persistedview) || 0
        }, {
          onConflict: 'company_id,division_id,tally_guid'
        });

      if (insertError) {
        errors++;
        errorDetails.push(`Voucher ${voucher.voucher_number}: ${insertError.message}`);
      } else {
        synced++;
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Voucher ${voucher.voucher_number}: ${error.message}`);
    }
  }

  return { table: 'vouchers', synced, errors, errorDetails };
}

// Ledger Entries sync function
async function syncLedgerEntries(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing ledger entries from tally.ledgerentries');
  
  const { data: tallyLedgerEntries, error } = await supabase
    .from('tally.ledgerentries')
    .select('*')
    .limit(batchSize);

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const entry of tallyLedgerEntries || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      // Find voucher by tally GUID
      let voucherId = null;
      if (entry.voucher_id) {
        const { data: voucher } = await supabase
          .from('vt.vouchers')
          .select('id')
          .eq('company_id', companyId)
          .eq('tally_guid', entry.voucher_id)
          .single();
        
        if (voucher) voucherId = voucher.id;
      }

      // Find ledger by name
      let ledgerId = null;
      if (entry.ledger_name) {
        const { data: ledger } = await supabase
          .from('vt.ledgers')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', entry.ledger_name)
          .single();
        
        if (ledger) ledgerId = ledger.id;
      }

      if (voucherId) {
        const { error: insertError } = await supabase
          .from('vt.ledger_entries')
          .upsert({
            company_id: companyId,
            division_id: divisionId,
            voucher_id: voucherId,
            ledger_id: ledgerId,
            tally_guid: entry.id,
            ledger_name: entry.ledger_name,
            amount: parseFloat(entry.amount) || 0,
            amount_forex: parseFloat(entry.amount_forex) || 0,
            currency: entry.currency || 'INR',
            is_party_ledger: entry.is_party_ledger === 1,
            is_deemed_positive: entry.is_deemed_positive === 1,
            amount_cleared: parseFloat(entry.amount_cleared) || 0
          }, {
            onConflict: 'company_id,division_id,tally_guid'
          });

        if (insertError) {
          errors++;
          errorDetails.push(`Ledger Entry ${entry.id}: ${insertError.message}`);
        } else {
          synced++;
        }
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Ledger Entry ${entry.id}: ${error.message}`);
    }
  }

  return { table: 'ledger_entries', synced, errors, errorDetails };
}

// Inventory Entries sync function
async function syncInventoryEntries(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  console.log('Syncing inventory entries from tally.inventoryentries');
  
  const { data: tallyInventoryEntries, error } = await supabase
    .from('tally.inventoryentries')
    .select('*')
    .limit(batchSize);

  if (error) throw error;

  let synced = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const entry of tallyInventoryEntries || []) {
    try {
      const { companyId, divisionId } = await getCompanyDivision(supabase, 'Default Company', 'Default Division');

      // Find voucher by tally GUID
      let voucherId = null;
      if (entry.voucher_id) {
        const { data: voucher } = await supabase
          .from('vt.vouchers')
          .select('id')
          .eq('company_id', companyId)
          .eq('tally_guid', entry.voucher_id)
          .single();
        
        if (voucher) voucherId = voucher.id;
      }

      // Find stock item by ID
      let stockItemId = null;
      if (entry.stockitem_id) {
        const { data: stockItem } = await supabase
          .from('vt.stock_items')
          .select('id')
          .eq('company_id', companyId)
          .eq('tally_guid', entry.stockitem_id)
          .single();
        
        if (stockItem) stockItemId = stockItem.id;
      }

      if (voucherId) {
        const { error: insertError } = await supabase
          .from('vt.inventory_entries')
          .upsert({
            company_id: companyId,
            division_id: divisionId,
            voucher_id: voucherId,
            stock_item_id: stockItemId,
            tally_guid: entry.id,
            stock_item_name: entry.stockitem_name,
            actual_quantity: parseFloat(entry.actual_quantity) || 0,
            billed_quantity: parseFloat(entry.billed_quantity) || 0,
            rate: parseFloat(entry.rate) || 0,
            amount: parseFloat(entry.amount) || 0,
            discount_percent: parseFloat(entry.discount_percent) || 0,
            discount_amount: parseFloat(entry.discount_amount) || 0
          }, {
            onConflict: 'company_id,division_id,tally_guid'
          });

        if (insertError) {
          errors++;
          errorDetails.push(`Inventory Entry ${entry.id}: ${insertError.message}`);
        } else {
          synced++;
        }
      }
    } catch (error) {
      errors++;
      errorDetails.push(`Inventory Entry ${entry.id}: ${error.message}`);
    }
  }

  return { table: 'inventory_entries', synced, errors, errorDetails };
}

// Address Details sync function
async function syncAddressDetails(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  // This would sync from address-related tables in tally schema
  // For now, return empty result as this data may not exist
  return { table: 'address_details', synced: 0, errors: 0 };
}

// Bank Details sync function
async function syncBankDetails(supabase: any, batchSize: number, filterCompanyId?: string, filterDivisionId?: string): Promise<SyncResult> {
  // This would sync from bank-related tables in tally schema  
  // For now, return empty result as this data may not exist
  return { table: 'bank_details', synced: 0, errors: 0 };
}