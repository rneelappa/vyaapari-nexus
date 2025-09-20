/**
 * VT Inventoryentries Service
 * 
 * Service for managing inventoryentries data with multi-tenancy support
 * Provides CRUD operations for vt_inventoryentries table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtInventoryentries, 
  VtInventoryentriesInsert, 
  VtInventoryentriesUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtInventoryentriesFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtInventoryentriesStats {
  totalInventoryentries: number;
  recentlyUpdated: number;
}

export class VtInventoryentriesService extends VtBaseService<VtInventoryentries> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_inventoryentries',
      primaryKey: 'id'
    });
  }

  /**
   * Get inventoryentries with advanced filtering
   */
  async getInventoryentries(
    filters: VtInventoryentriesFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtInventoryentries>> {
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
   * Get inventoryentries by name
   */
  async getInventoryentriesByName(name: string): Promise<VtInventoryentries | null> {
    try {
      const { data } = await this.getInventoryentries({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching inventoryentries by name:', error);
      throw error;
    }
  }

  /**
   * Get inventoryentries statistics
   */
  async getInventoryentriesStats(): Promise<VtInventoryentriesStats> {
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
        totalInventoryentries: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching inventoryentries stats:', error);
      throw error;
    }
  }

  /**
   * Create a new inventoryentries
   */
  async createInventoryentries(data: VtInventoryentriesInsert): Promise<VtInventoryentries> {
    return this.create(data);
  }

  /**
   * Update an existing inventoryentries
   */
  async updateInventoryentries(id: string, data: VtInventoryentriesUpdate): Promise<VtInventoryentries> {
    return this.update(id, data);
  }

  /**
   * Delete a inventoryentries
   */
  async deleteInventoryentries(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if inventoryentries name is available
   */
  async isInventoryentriesNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getInventoryentriesByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking inventoryentries name availability:', error);
      return false;
    }
  }

  /**
   * Batch create inventoryentries
   */
  async createInventoryentriess(data: VtInventoryentriesInsert[]): Promise<VtInventoryentries[]> {
    return this.batchCreate(data);
  }
}