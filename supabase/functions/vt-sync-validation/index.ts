import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationResult {
  table: string;
  recordCount: number;
  missingReferences: number;
  duplicates: number;
  issues: string[];
}

interface ValidationResponse {
  success: boolean;
  message: string;
  results: ValidationResult[];
  overallHealthScore: number;
}

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

    const { action = 'full_validation', companyId, divisionId } = await req.json();

    console.log(`Starting VT schema validation with action: ${action}`);

    let results: ValidationResult[] = [];
    let totalIssues = 0;

    // Validate in order of dependencies
    const validationOrder = [
      'companies',
      'divisions',
      'groups',
      'ledgers',
      'units_of_measure',
      'stock_groups',
      'stock_items',
      'godowns',
      'cost_categories',
      'cost_centres',
      'voucher_types',
      'vouchers',
      'ledger_entries',
      'inventory_entries'
    ];

    for (const table of validationOrder) {
      try {
        console.log(`Validating table: vt.${table}`);
        const result = await validateTable(supabase, table, companyId, divisionId);
        results.push(result);
        totalIssues += result.missingReferences + result.duplicates + result.issues.length;
      } catch (error) {
        console.error(`Error validating table ${table}:`, error);
        results.push({
          table,
          recordCount: 0,
          missingReferences: 0,
          duplicates: 0,
          issues: [error.message]
        });
        totalIssues++;
      }
    }

    // Calculate overall health score (0-100)
    const totalRecords = results.reduce((sum, r) => sum + r.recordCount, 0);
    const healthScore = totalRecords > 0 ? Math.max(0, 100 - (totalIssues / totalRecords) * 100) : 100;

    const response: ValidationResponse = {
      success: totalIssues === 0,
      message: `Validation completed. Health Score: ${healthScore.toFixed(1)}%. ${totalIssues} issues found.`,
      results,
      overallHealthScore: healthScore
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message,
      results: [],
      overallHealthScore: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function validateTable(
  supabase: any,
  tableName: string,
  filterCompanyId?: string,
  filterDivisionId?: string
): Promise<ValidationResult> {
  console.log(`Validating table: vt.${tableName}`);
  
  let recordCount = 0;
  let missingReferences = 0;
  let duplicates = 0;
  const issues: string[] = [];

  try {
    // Get record count
    let countQuery = supabase.from(`vt.${tableName}`).select('*', { count: 'exact', head: true });
    
    if (filterCompanyId && tableName !== 'companies') {
      countQuery = countQuery.eq('company_id', filterCompanyId);
    }
    if (filterDivisionId && tableName !== 'companies' && tableName !== 'divisions') {
      countQuery = countQuery.eq('division_id', filterDivisionId);
    }

    const { count } = await countQuery;
    recordCount = count || 0;

    // Table-specific validations
    switch (tableName) {
      case 'companies':
        return await validateCompanies(supabase, recordCount);
      case 'divisions':
        return await validateDivisions(supabase, recordCount, filterCompanyId);
      case 'groups':
        return await validateGroups(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'ledgers':
        return await validateLedgers(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'units_of_measure':
        return await validateUnitsOfMeasure(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'stock_groups':
        return await validateStockGroups(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'stock_items':
        return await validateStockItems(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'godowns':
        return await validateGodowns(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'cost_categories':
        return await validateCostCategories(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'cost_centres':
        return await validateCostCentres(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'voucher_types':
        return await validateVoucherTypes(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'vouchers':
        return await validateVouchers(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'ledger_entries':
        return await validateLedgerEntries(supabase, recordCount, filterCompanyId, filterDivisionId);
      case 'inventory_entries':
        return await validateInventoryEntries(supabase, recordCount, filterCompanyId, filterDivisionId);
      default:
        return {
          table: tableName,
          recordCount,
          missingReferences: 0,
          duplicates: 0,
          issues: []
        };
    }
  } catch (error) {
    return {
      table: tableName,
      recordCount,
      missingReferences: 0,
      duplicates: 0,
      issues: [error.message]
    };
  }
}

async function validateCompanies(supabase: any, recordCount: number): Promise<ValidationResult> {
  const issues: string[] = [];
  let duplicates = 0;

  // Check for duplicate names
  const { data: duplicateNames } = await supabase
    .rpc('count_duplicate_companies');

  if (duplicateNames > 0) {
    duplicates = duplicateNames;
    issues.push(`${duplicates} companies have duplicate names`);
  }

  // Check for missing tally_company_id
  const { count: missingTallyIds } = await supabase
    .from('vt.companies')
    .select('*', { count: 'exact', head: true })
    .is('tally_company_id', null);

  if (missingTallyIds > 0) {
    issues.push(`${missingTallyIds} companies missing tally_company_id`);
  }

  return {
    table: 'companies',
    recordCount,
    missingReferences: 0,
    duplicates,
    issues
  };
}

async function validateDivisions(supabase: any, recordCount: number, filterCompanyId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for orphaned divisions (company_id not in companies table)
  const { data: orphanedDivisions } = await supabase
    .from('vt.divisions')
    .select('id, company_id')
    .not('company_id', 'in', supabase.from('vt.companies').select('id'));

  if (orphanedDivisions && orphanedDivisions.length > 0) {
    missingReferences = orphanedDivisions.length;
    issues.push(`${missingReferences} divisions reference non-existent companies`);
  }

  return {
    table: 'divisions',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateGroups(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for self-referencing groups
  const { data: selfReferencing } = await supabase
    .from('vt.groups')
    .select('id, name')
    .filter('id', 'eq', 'parent_id');

  if (selfReferencing && selfReferencing.length > 0) {
    issues.push(`${selfReferencing.length} groups are self-referencing`);
  }

  // Check for orphaned parent references
  const { data: orphanedParents } = await supabase
    .from('vt.groups')
    .select('id, name, parent_id')
    .not('parent_id', 'is', null)
    .not('parent_id', 'in', supabase.from('vt.groups').select('id'));

  if (orphanedParents && orphanedParents.length > 0) {
    missingReferences = orphanedParents.length;
    issues.push(`${missingReferences} groups reference non-existent parent groups`);
  }

  return {
    table: 'groups',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateLedgers(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for ledgers with invalid group references
  const { data: invalidGroups } = await supabase
    .from('vt.ledgers')
    .select('id, name, group_id')
    .not('group_id', 'is', null)
    .not('group_id', 'in', supabase.from('vt.groups').select('id'));

  if (invalidGroups && invalidGroups.length > 0) {
    missingReferences = invalidGroups.length;
    issues.push(`${missingReferences} ledgers reference non-existent groups`);
  }

  // Check for balance inconsistencies
  const { data: balanceIssues } = await supabase
    .from('vt.ledgers')
    .select('id, name, opening_balance, closing_balance')
    .or('opening_balance.is.null,closing_balance.is.null');

  if (balanceIssues && balanceIssues.length > 0) {
    issues.push(`${balanceIssues.length} ledgers have null balance values`);
  }

  return {
    table: 'ledgers',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateUnitsOfMeasure(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];

  // Check for invalid conversion factors
  const { data: invalidConversions } = await supabase
    .from('vt.units_of_measure')
    .select('id, name, conversion_factor')
    .or('conversion_factor.is.null,conversion_factor.lte.0');

  if (invalidConversions && invalidConversions.length > 0) {
    issues.push(`${invalidConversions.length} units have invalid conversion factors`);
  }

  return {
    table: 'units_of_measure',
    recordCount,
    missingReferences: 0,
    duplicates: 0,
    issues
  };
}

async function validateStockGroups(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for orphaned parent references
  const { data: orphanedParents } = await supabase
    .from('vt.stock_groups')
    .select('id, name, parent_id')
    .not('parent_id', 'is', null)
    .not('parent_id', 'in', supabase.from('vt.stock_groups').select('id'));

  if (orphanedParents && orphanedParents.length > 0) {
    missingReferences = orphanedParents.length;
    issues.push(`${missingReferences} stock groups reference non-existent parent groups`);
  }

  return {
    table: 'stock_groups',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateStockItems(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for items with invalid UOM references
  const { data: invalidUOMs } = await supabase
    .from('vt.stock_items')
    .select('id, name, uom_id')
    .not('uom_id', 'is', null)
    .not('uom_id', 'in', supabase.from('vt.units_of_measure').select('id'));

  if (invalidUOMs && invalidUOMs.length > 0) {
    missingReferences += invalidUOMs.length;
    issues.push(`${invalidUOMs.length} stock items reference non-existent units of measure`);
  }

  // Check for items with invalid stock group references
  const { data: invalidStockGroups } = await supabase
    .from('vt.stock_items')
    .select('id, name, stock_group_id')
    .not('stock_group_id', 'is', null)
    .not('stock_group_id', 'in', supabase.from('vt.stock_groups').select('id'));

  if (invalidStockGroups && invalidStockGroups.length > 0) {
    missingReferences += invalidStockGroups.length;
    issues.push(`${invalidStockGroups.length} stock items reference non-existent stock groups`);
  }

  return {
    table: 'stock_items',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateGodowns(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for orphaned parent references
  const { data: orphanedParents } = await supabase
    .from('vt.godowns')
    .select('id, name, parent_id')
    .not('parent_id', 'is', null)
    .not('parent_id', 'in', supabase.from('vt.godowns').select('id'));

  if (orphanedParents && orphanedParents.length > 0) {
    missingReferences = orphanedParents.length;
    issues.push(`${missingReferences} godowns reference non-existent parent godowns`);
  }

  return {
    table: 'godowns',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateCostCategories(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  return {
    table: 'cost_categories',
    recordCount,
    missingReferences: 0,
    duplicates: 0,
    issues: []
  };
}

async function validateCostCentres(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for cost centres with invalid category references
  const { data: invalidCategories } = await supabase
    .from('vt.cost_centres')
    .select('id, name, cost_category_id')
    .not('cost_category_id', 'is', null)
    .not('cost_category_id', 'in', supabase.from('vt.cost_categories').select('id'));

  if (invalidCategories && invalidCategories.length > 0) {
    missingReferences = invalidCategories.length;
    issues.push(`${missingReferences} cost centres reference non-existent cost categories`);
  }

  return {
    table: 'cost_centres',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateVoucherTypes(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  return {
    table: 'voucher_types',
    recordCount,
    missingReferences: 0,
    duplicates: 0,
    issues: []
  };
}

async function validateVouchers(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for vouchers with invalid voucher type references
  const { data: invalidVoucherTypes } = await supabase
    .from('vt.vouchers')
    .select('id, voucher_number, voucher_type_id')
    .not('voucher_type_id', 'is', null)
    .not('voucher_type_id', 'in', supabase.from('vt.voucher_types').select('id'));

  if (invalidVoucherTypes && invalidVoucherTypes.length > 0) {
    missingReferences = invalidVoucherTypes.length;
    issues.push(`${missingReferences} vouchers reference non-existent voucher types`);
  }

  // Check for vouchers with invalid dates
  const { data: invalidDates } = await supabase
    .from('vt.vouchers')
    .select('id, voucher_number, voucher_date')
    .or('voucher_date.is.null,voucher_date.gt.now()');

  if (invalidDates && invalidDates.length > 0) {
    issues.push(`${invalidDates.length} vouchers have invalid dates`);
  }

  return {
    table: 'vouchers',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateLedgerEntries(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for ledger entries with invalid voucher references
  const { data: invalidVouchers } = await supabase
    .from('vt.ledger_entries')
    .select('id, voucher_id')
    .not('voucher_id', 'in', supabase.from('vt.vouchers').select('id'));

  if (invalidVouchers && invalidVouchers.length > 0) {
    missingReferences += invalidVouchers.length;
    issues.push(`${invalidVouchers.length} ledger entries reference non-existent vouchers`);
  }

  // Check for ledger entries with invalid ledger references
  const { data: invalidLedgers } = await supabase
    .from('vt.ledger_entries')
    .select('id, ledger_id')
    .not('ledger_id', 'is', null)
    .not('ledger_id', 'in', supabase.from('vt.ledgers').select('id'));

  if (invalidLedgers && invalidLedgers.length > 0) {
    missingReferences += invalidLedgers.length;
    issues.push(`${invalidLedgers.length} ledger entries reference non-existent ledgers`);
  }

  return {
    table: 'ledger_entries',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}

async function validateInventoryEntries(supabase: any, recordCount: number, filterCompanyId?: string, filterDivisionId?: string): Promise<ValidationResult> {
  const issues: string[] = [];
  let missingReferences = 0;

  // Check for inventory entries with invalid voucher references
  const { data: invalidVouchers } = await supabase
    .from('vt.inventory_entries')
    .select('id, voucher_id')
    .not('voucher_id', 'in', supabase.from('vt.vouchers').select('id'));

  if (invalidVouchers && invalidVouchers.length > 0) {
    missingReferences += invalidVouchers.length;
    issues.push(`${invalidVouchers.length} inventory entries reference non-existent vouchers`);
  }

  // Check for inventory entries with invalid stock item references
  const { data: invalidStockItems } = await supabase
    .from('vt.inventory_entries')
    .select('id, stock_item_id')
    .not('stock_item_id', 'is', null)
    .not('stock_item_id', 'in', supabase.from('vt.stock_items').select('id'));

  if (invalidStockItems && invalidStockItems.length > 0) {
    missingReferences += invalidStockItems.length;
    issues.push(`${invalidStockItems.length} inventory entries reference non-existent stock items`);
  }

  return {
    table: 'inventory_entries',
    recordCount,
    missingReferences,
    duplicates: 0,
    issues
  };
}