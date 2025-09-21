/**
 * Generate Remaining VT Services and Hooks
 * 
 * This script generates all remaining VT services and React Query hooks
 * based on the VT table definitions from the types file.
 */

const fs = require('fs');
const path = require('path');

// List of tables that already have services
const existingServices = [
  'vt_daybook', // Special service
  'vt_group_table', // vt-groups-service
  'vt_ledger', // vt-ledgers-service
  'vt_stockitem', // vt-stockitems-service
  'vt_vouchertype', // vt-vouchertypes-service
  'vt_voucher', // vt-voucher-details-service
  'vt_currency', // Just created
  'vt_godown', // Just created
  'vt_unit' // Just created
];

// Priority tables to generate first (most commonly used master data)
const priorityTables = [
  'vt_costcategory',
  'vt_company',
  'vt_inventoryentries',
  'vt_ledgerentries',
  'vt_stockcategory',
  'vt_stockgroup',
  'vt_taxunit',
  'vt_tdsrate',
  'vt_incometaxclassification',
  'vt_incometaxslab'
];

console.log(`Generating services for ${priorityTables.length} priority tables...`);

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
   * Check if ${camelCaseName} name is available
   */
  async is${serviceName}NameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.get${serviceName}ByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking ${camelCaseName} name availability:', error);
      return false;
    }
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
} from '@/services/vt-${tableName.replace('vt_', '')}-service';
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
        description: \`\${serviceName} created successfully.\` 
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
const servicesDir = path.join(__dirname, 'src', 'services');
const hooksDir = path.join(__dirname, 'src', 'hooks');

if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

let generatedCount = 0;

priorityTables.forEach(tableName => {
  try {
    const serviceName = tableName.replace('vt_', '');
    
    // Generate service file
    const serviceContent = generateServiceTemplate(tableName);
    const serviceFilePath = path.join(servicesDir, `vt-${serviceName}-service.ts`);
    fs.writeFileSync(serviceFilePath, serviceContent);
    
    // Generate hook file
    const hookContent = generateHookTemplate(tableName);
    const hookFilePath = path.join(hooksDir, `useVt${getServiceName(tableName)}.ts`);
    fs.writeFileSync(hookFilePath, hookContent);
    
    generatedCount++;
    console.log(`✅ Generated: ${tableName} -> vt-${serviceName}-service.ts + useVt${getServiceName(tableName)}.ts`);
  } catch (error) {
    console.error(`❌ Error generating ${tableName}:`, error.message);
  }
});

console.log(`\n🎉 Generated ${generatedCount} service/hook pairs!`);
console.log(`📊 Progress: ${existingServices.length + generatedCount}/101 VT tables have services`);
console.log(`\nFiles created in:`);
console.log(`- Services: ${servicesDir}`);
console.log(`- Hooks: ${hooksDir}`);

