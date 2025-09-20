/**
 * VT Stockgroup Service
 * 
 * Service for managing stockgroup data with multi-tenancy support
 * Provides CRUD operations for vt_stockgroup table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtStockgroup, 
  VtStockgroupInsert, 
  VtStockgroupUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtStockgroupFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtStockgroupStats {
  totalStockgroup: number;
  recentlyUpdated: number;
}

export class VtStockgroupService extends VtBaseService<VtStockgroup> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_stockgroup',
      primaryKey: 'id'
    });
  }

  /**
   * Get stockgroup with advanced filtering
   */
  async getStockgroup(
    filters: VtStockgroupFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtStockgroup>> {
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
   * Get stockgroup by name
   */
  async getStockgroupByName(name: string): Promise<VtStockgroup | null> {
    try {
      const { data } = await this.getStockgroup({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching stockgroup by name:', error);
      throw error;
    }
  }

  /**
   * Get stockgroup statistics
   */
  async getStockgroupStats(): Promise<VtStockgroupStats> {
    try {
      const total = await this.getCount();

      // Get recently updated records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyUpdated = await this.getCount({
        filters: {
          updated_at: `gte.${thirtyDaysAgo.toISOString()}`
        }
      });

      return {
        totalStockgroup: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching stockgroup stats:', error);
      throw error;
    }
  }

  /**
   * Create a new stockgroup
   */
  async createStockgroup(data: VtStockgroupInsert): Promise<VtStockgroup> {
    return this.create(data);
  }

  /**
   * Update an existing stockgroup
   */
  async updateStockgroup(id: string, data: VtStockgroupUpdate): Promise<VtStockgroup> {
    return this.update(id, data);
  }

  /**
   * Delete a stockgroup
   */
  async deleteStockgroup(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if stockgroup name is available
   */
  async isStockgroupNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getStockgroupByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking stockgroup name availability:', error);
      return false;
    }
  }

  /**
   * Batch create stockgroup
   */
  async createStockgroups(data: VtStockgroupInsert[]): Promise<VtStockgroup[]> {
    return this.batchCreate(data);
  }
}