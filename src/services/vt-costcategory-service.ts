/**
 * VT Costcategory Service
 * 
 * Service for managing costcategory data with multi-tenancy support
 * Provides CRUD operations for vt_costcategory table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtCostcategory, 
  VtCostcategoryInsert, 
  VtCostcategoryUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtCostcategoryFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtCostcategoryStats {
  totalCostcategory: number;
  recentlyUpdated: number;
}

export class VtCostcategoryService extends VtBaseService<VtCostcategory> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_costcategory',
      primaryKey: 'id'
    });
  }

  /**
   * Get costcategory with advanced filtering
   */
  async getCostcategory(
    filters: VtCostcategoryFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtCostcategory>> {
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
   * Get costcategory by name
   */
  async getCostcategoryByName(name: string): Promise<VtCostcategory | null> {
    try {
      const { data } = await this.getCostcategory({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching costcategory by name:', error);
      throw error;
    }
  }

  /**
   * Get costcategory statistics
   */
  async getCostcategoryStats(): Promise<VtCostcategoryStats> {
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
        totalCostcategory: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching costcategory stats:', error);
      throw error;
    }
  }

  /**
   * Create a new costcategory
   */
  async createCostcategory(data: VtCostcategoryInsert): Promise<VtCostcategory> {
    return this.create(data);
  }

  /**
   * Update an existing costcategory
   */
  async updateCostcategory(id: string, data: VtCostcategoryUpdate): Promise<VtCostcategory> {
    return this.update(id, data);
  }

  /**
   * Delete a costcategory
   */
  async deleteCostcategory(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if costcategory name is available
   */
  async isCostcategoryNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getCostcategoryByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking costcategory name availability:', error);
      return false;
    }
  }

  /**
   * Batch create costcategory
   */
  async createCostcategorys(data: VtCostcategoryInsert[]): Promise<VtCostcategory[]> {
    return this.batchCreate(data);
  }
}