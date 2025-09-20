/**
 * VT Stockcategory Service
 * 
 * Service for managing stockcategory data with multi-tenancy support
 * Provides CRUD operations for vt_stockcategory table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtStockcategory, 
  VtStockcategoryInsert, 
  VtStockcategoryUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtStockcategoryFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtStockcategoryStats {
  totalStockcategory: number;
  recentlyUpdated: number;
}

export class VtStockcategoryService extends VtBaseService<VtStockcategory> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_stockcategory',
      primaryKey: 'id'
    });
  }

  /**
   * Get stockcategory with advanced filtering
   */
  async getStockcategory(
    filters: VtStockcategoryFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtStockcategory>> {
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
   * Get stockcategory by name
   */
  async getStockcategoryByName(name: string): Promise<VtStockcategory | null> {
    try {
      const { data } = await this.getStockcategory({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching stockcategory by name:', error);
      throw error;
    }
  }

  /**
   * Get stockcategory statistics
   */
  async getStockcategoryStats(): Promise<VtStockcategoryStats> {
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
        totalStockcategory: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching stockcategory stats:', error);
      throw error;
    }
  }

  /**
   * Create a new stockcategory
   */
  async createStockcategory(data: VtStockcategoryInsert): Promise<VtStockcategory> {
    return this.create(data);
  }

  /**
   * Update an existing stockcategory
   */
  async updateStockcategory(id: string, data: VtStockcategoryUpdate): Promise<VtStockcategory> {
    return this.update(id, data);
  }

  /**
   * Delete a stockcategory
   */
  async deleteStockcategory(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if stockcategory name is available
   */
  async isStockcategoryNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getStockcategoryByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking stockcategory name availability:', error);
      return false;
    }
  }

  /**
   * Batch create stockcategory
   */
  async createStockcategorys(data: VtStockcategoryInsert[]): Promise<VtStockcategory[]> {
    return this.batchCreate(data);
  }
}