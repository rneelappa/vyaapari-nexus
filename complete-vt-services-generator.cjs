/**
 * Complete VT Services Generator
 * 
 * Generates ALL remaining VT services and hooks to achieve 100% coverage
 */

const fs = require('fs');
const path = require('path');

// All 101 VT tables from the types file
const allVtTables = [
  'vt_accountingallocations_list',
  'vt_address_list',
  'vt_allinventoryentries_list',
  'vt_allledgerentries_list',
  'vt_basicbuyeraddress_list',
  'vt_batchallocations_list',
  'vt_billallocations_list',
  'vt_body',
  'vt_cancelledpayallocations_list',
  'vt_categorydetails_list',
  'vt_chequerange_list',
  'vt_company',
  'vt_consigneeaddress_list',
  'vt_consignoraddress_list',
  'vt_contactdetails_list',
  'vt_costcategory',
  'vt_currency',
  'vt_deductinsamevchrules_list',
  'vt_dispatchfromaddress_list',
  'vt_envelope',
  'vt_ewaybilldetails_list',
  'vt_godown',
  'vt_group_table',
  'vt_gst_list',
  'vt_gstdetails_list',
  'vt_gsteinvoicedetails_list',
  'vt_gstewaybilldetails_list',
  'vt_gstin',
  'vt_gstreconconfigdetails_list',
  'vt_gstregistrationdetails_list',
  'vt_header',
  'vt_hsndetails_list',
  'vt_importdata',
  'vt_incometaxclassification',
  'vt_incometaxslab',
  'vt_interestcollection_list',
  'vt_inventoryentries',
  'vt_invoicedelnotes_list',
  'vt_itclassificationdetails_list',
  'vt_itclassificationperiod_list',
  'vt_itregimedetails_list',
  'vt_itslabperiod_list',
  'vt_itslabrate_list',
  'vt_languagename_list',
  'vt_lastexchangeinfo_list',
  'vt_lastgsttaxunitbyseries_list',
  'vt_lastnumberlist_list',
  'vt_lastseriesbygsttaxunit_list',
  'vt_lastsynctime_list',
  'vt_ledger',
  'vt_ledgerclosingvalues_list',
  'vt_ledgerentries',
  'vt_ledgerentries_list',
  'vt_ledgerentrieslist_list',
  'vt_ledgerforinventorylist_list',
  'vt_ledgstregdetails_list',
  'vt_ledmailingdetails_list',
  'vt_ledmultiaddresslist_list',
  'vt_lowerdeduction_list',
  'vt_mrpratedetails_list',
  'vt_name_list',
  'vt_oldaddress_list',
  'vt_oldauditentryids_list',
  'vt_oldmailingname_list',
  'vt_oldmrpdetails_list',
  'vt_paymentdetails_list',
  'vt_prefixlist_list',
  'vt_previousname_list',
  'vt_ratedetails_list',
  'vt_rateofinvoicetax_list',
  'vt_remotecmpinfo_list',
  'vt_reportinguomdetails_list',
  'vt_reportinguqcdetails_list',
  'vt_requestdesc',
  'vt_restartfromlist_list',
  'vt_stat_list',
  'vt_statewisedetails_list',
  'vt_staticvariables',
  'vt_stockcategory',
  'vt_stockgroup',
  'vt_stockitem',
  'vt_subcategoryallocation_list',
  'vt_suffixlist_list',
  'vt_supabase_change_log',
  'vt_sync_configuration',
  'vt_sync_conflicts',
  'vt_sync_execution_log',
  'vt_tally_supabase_sync',
  'vt_tally_xml_schema_db',
  'vt_taxobjectallocations_list',
  'vt_taxunit',
  'vt_tcscategorydetails_list',
  'vt_tdscategorydetails_list',
  'vt_tdsrate',
  'vt_transportdetails_list',
  'vt_unit',
  'vt_vchnumseriesid_list',
  'vt_voucher',
  'vt_voucherclasslist_list',
  'vt_vouchernumberseries_list',
  'vt_vouchertype'
];

// Check what services already exist
const servicesDir = path.join(__dirname, 'src', 'services');
const hooksDir = path.join(__dirname, 'src', 'hooks');

// Get existing services by reading the directory
let existingServiceFiles = [];
try {
  existingServiceFiles = fs.readdirSync(servicesDir)
    .filter(file => file.startsWith('vt-') && file.endsWith('-service.ts'))
    .map(file => {
      // Convert filename back to table name
      const tableName = file.replace('vt-', '').replace('-service.ts', '').replace(/-/g, '_');
      return `vt_${tableName}`;
    });
} catch (error) {
  console.log('Services directory not found, will create it');
  existingServiceFiles = [];
}

// Add known mappings for existing services with different names
const knownExistingServices = [
  'vt_group_table', // vt-groups-service
  'vt_ledger', // vt-ledgers-service  
  'vt_stockitem', // vt-stockitems-service
  'vt_vouchertype', // vt-vouchertypes-service
  'vt_voucher' // vt-voucher-details-service and vt-voucher-management-service
];

const allExistingServices = [...new Set([...existingServiceFiles, ...knownExistingServices])];

console.log('Existing services:', allExistingServices);

// Filter out tables that already have services
const tablesToGenerate = allVtTables.filter(table => !allExistingServices.includes(table));

console.log(`\n🎯 COMPLETE VT SERVICES GENERATION`);
console.log(`Total VT tables: ${allVtTables.length}`);
console.log(`Existing services: ${allExistingServices.length}`);
console.log(`Tables to generate: ${tablesToGenerate.length}`);

// Helper functions
function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function getServiceName(tableName) {
  const name = tableName.replace('vt_', '');
  return toPascalCase(name);
}

function getTypeNames(tableName) {
  const serviceName = getServiceName(tableName);
  return {
    main: `Vt${serviceName}`,
    insert: `Vt${serviceName}Insert`,
    update: `Vt${serviceName}Update`,
    filters: `Vt${serviceName}Filters`,
    stats: `Vt${serviceName}Stats`
  };
}

// Generate service template
function generateServiceTemplate(tableName) {
  const serviceName = getServiceName(tableName);
  const types = getTypeNames(tableName);
  const camelCaseName = toCamelCase(serviceName);
  
  return `/**
 * VT ${serviceName} Service
 * 
 * Service for managing ${serviceName.toLowerCase()} data with multi-tenancy support
 * Provides CRUD operations for ${tableName} table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  ${types.main}, 
  ${types.insert}, 
  ${types.update},
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface ${types.filters} {
  name?: string;
  searchTerm?: string;
}

export interface ${types.stats} {
  total${serviceName}: number;
  recentlyUpdated: number;
}

export class Vt${serviceName}Service extends VtBaseService<${types.main}> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: '${tableName}',
      primaryKey: 'id'
    });
  }

  /**
   * Get ${camelCaseName} with advanced filtering
   */
  async get${serviceName}(
    filters: ${types.filters} = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<${types.main}>> {
    const queryOptions: VtQueryOptions = {
      ...options,
      filters: {
        ...options.filters,
        ...(filters.name && { name: filters.name })
      },
      searchTerm: filters.searchTerm,
      searchFields: ['name']
    };

    return this.getAll(queryOptions);
  }

  /**
   * Get ${camelCaseName} by name
   */
  async get${serviceName}ByName(name: string): Promise<${types.main} | null> {
    try {
      const { data } = await this.get${serviceName}({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching ${camelCaseName} by name:', error);
      throw error;
    }
  }

  /**
   * Get ${camelCaseName} statistics
   */
  async get${serviceName}Stats(): Promise<${types.stats}> {
    try {
      const total = await this.getCount();

      // Get recently updated records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyUpdated = await this.getCount({
        filters: {
          updated_at: \`gte.\${thirtyDaysAgo.toISOString()}\`
        }
      });

      return {
        total${serviceName}: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching ${camelCaseName} stats:', error);
      throw error;
    }
  }

  /**
   * Create a new ${camelCaseName}
   */
  async create${serviceName}(data: ${types.insert}): Promise<${types.main}> {
    return this.create(data);
  }

  /**
   * Update an existing ${camelCaseName}
   */
  async update${serviceName}(id: string, data: ${types.update}): Promise<${types.main}> {
    return this.update(id, data);
  }

  /**
   * Delete a ${camelCaseName}
   */
  async delete${serviceName}(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Batch create ${camelCaseName}
   */
  async create${serviceName}s(data: ${types.insert}[]): Promise<${types.main}[]> {
    return this.batchCreate(data);
  }
}`;
}

// Generate hook template
function generateHookTemplate(tableName) {
  const serviceName = getServiceName(tableName);
  const types = getTypeNames(tableName);
  const camelCaseName = toCamelCase(serviceName);
  const serviceFileName = tableName.replace('vt_', '').replace(/_/g, '-');
  
  return `/**
 * VT ${serviceName} React Query Hooks
 * 
 * Custom hooks for managing ${camelCaseName} data with React Query
 * Provides caching, loading states, and error handling for VT ${camelCaseName}
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Vt${serviceName}Service, 
  type ${types.filters}, 
  type ${types.stats} 
} from '@/services/vt-${serviceFileName}-service';
import type { ${types.main}, ${types.insert}, ${types.update}, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching ${camelCaseName} with filters and pagination
 */
export const useVt${serviceName} = (
  companyId: string,
  divisionId: string,
  filters?: ${types.filters},
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new Vt${serviceName}Service(companyId, divisionId);
  return useQuery({
    queryKey: ['vt${serviceName}', companyId, divisionId, filters, options],
    queryFn: () => service.get${serviceName}(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new ${camelCaseName}
 */
export const useCreateVt${serviceName} = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: ${types.insert} 
    }) => {
      const service = new Vt${serviceName}Service(companyId, divisionId);
      return service.create${serviceName}(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vt${serviceName}', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: \`${serviceName} created successfully.\` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: \`Failed to create ${camelCaseName}: \${error.message}\`, 
        variant: "destructive" 
      });
    },
  });
};`;
}

// Create directories if they don't exist
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

// Get existing services by reading the directory
let existingServiceFiles = [];
try {
  existingServiceFiles = fs.readdirSync(servicesDir)
    .filter(file => file.startsWith('vt-') && file.endsWith('-service.ts'))
    .map(file => {
      // Convert filename back to table name
      const tableName = file.replace('vt-', '').replace('-service.ts', '').replace(/-/g, '_');
      return `vt_${tableName}`;
    });
} catch (error) {
  console.log('Services directory not found, will create it');
  existingServiceFiles = [];
}

// Add known mappings for existing services with different names
const knownExistingServices = [
  'vt_group_table', // vt-groups-service
  'vt_ledger', // vt-ledgers-service  
  'vt_stockitem', // vt-stockitems-service
  'vt_vouchertype', // vt-vouchertypes-service
  'vt_voucher' // vt-voucher-details-service and vt-voucher-management-service
];

const allExistingServices = [...new Set([...existingServiceFiles, ...knownExistingServices])];

console.log('Existing services:', allExistingServices);

// Filter out tables that already have services
const tablesToGenerate = allVtTables.filter(table => !allExistingServices.includes(table));

console.log(`\n🎯 COMPLETE VT SERVICES GENERATION`);
console.log(`Total VT tables: ${allVtTables.length}`);
console.log(`Existing services: ${allExistingServices.length}`);
console.log(`Tables to generate: ${tablesToGenerate.length}`);

console.log(`\n🚀 Generating services and hooks for ${tablesToGenerate.length} tables...`);

let generatedCount = 0;
let errorCount = 0;

tablesToGenerate.forEach(tableName => {
  try {
    const serviceFileName = tableName.replace('vt_', '').replace(/_/g, '-');
    
    // Generate service file
    const serviceContent = generateServiceTemplate(tableName);
    const serviceFilePath = path.join(servicesDir, `vt-${serviceFileName}-service.ts`);
    fs.writeFileSync(serviceFilePath, serviceContent);
    
    // Generate hook file
    const hookContent = generateHookTemplate(tableName);
    const hookFilePath = path.join(hooksDir, `useVt${getServiceName(tableName)}.ts`);
    fs.writeFileSync(hookFilePath, hookContent);
    
    generatedCount++;
    console.log(`✅ Generated: ${tableName} -> vt-${serviceFileName}-service.ts + useVt${getServiceName(tableName)}.ts`);
  } catch (error) {
    errorCount++;
    console.error(`❌ Error generating ${tableName}:`, error.message);
  }
});

console.log(`\n🎉 VT SERVICES GENERATION COMPLETE!`);
console.log(`✅ Successfully generated: ${generatedCount} service/hook pairs`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📊 Total VT services now: ${allExistingServices.length + generatedCount}/${allVtTables.length} (${Math.round(((allExistingServices.length + generatedCount) / allVtTables.length) * 100)}%)`);

if (generatedCount === tablesToGenerate.length) {
  console.log(`\n🎯 MISSION ACCOMPLISHED: 100% VT SERVICES COVERAGE ACHIEVED! 🚀`);
} else {
  console.log(`\n⚠️ Partial completion: ${generatedCount}/${tablesToGenerate.length} tables processed`);
}

console.log(`\nFiles created in:`);
console.log(`- Services: ${servicesDir}`);
console.log(`- Hooks: ${hooksDir}`);

