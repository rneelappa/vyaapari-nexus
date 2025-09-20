/**
 * VT Incometaxslab Service
 * 
 * Service for managing incometaxslab data with multi-tenancy support
 * Provides CRUD operations for vt_incometaxslab table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtIncometaxslab, 
  VtIncometaxslabInsert, 
  VtIncometaxslabUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtIncometaxslabFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtIncometaxslabStats {
  totalIncometaxslab: number;
  recentlyUpdated: number;
}

export class VtIncometaxslabService extends VtBaseService<VtIncometaxslab> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_incometaxslab',
      primaryKey: 'id'
    });
  }

  /**
   * Get incometaxslab with advanced filtering
   */
  async getIncometaxslab(
    filters: VtIncometaxslabFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtIncometaxslab>> {
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
   * Get incometaxslab by name
   */
  async getIncometaxslabByName(name: string): Promise<VtIncometaxslab | null> {
    try {
      const { data } = await this.getIncometaxslab({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching incometaxslab by name:', error);
      throw error;
    }
  }

  /**
   * Get incometaxslab statistics
   */
  async getIncometaxslabStats(): Promise<VtIncometaxslabStats> {
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
        totalIncometaxslab: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching incometaxslab stats:', error);
      throw error;
    }
  }

  /**
   * Create a new incometaxslab
   */
  async createIncometaxslab(data: VtIncometaxslabInsert): Promise<VtIncometaxslab> {
    return this.create(data);
  }

  /**
   * Update an existing incometaxslab
   */
  async updateIncometaxslab(id: string, data: VtIncometaxslabUpdate): Promise<VtIncometaxslab> {
    return this.update(id, data);
  }

  /**
   * Delete a incometaxslab
   */
  async deleteIncometaxslab(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if incometaxslab name is available
   */
  async isIncometaxslabNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getIncometaxslabByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking incometaxslab name availability:', error);
      return false;
    }
  }

  /**
   * Batch create incometaxslab
   */
  async createIncometaxslabs(data: VtIncometaxslabInsert[]): Promise<VtIncometaxslab[]> {
    return this.batchCreate(data);
  }
}