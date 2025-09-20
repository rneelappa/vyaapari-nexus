/**
 * VT Incometaxclassification Service
 * 
 * Service for managing incometaxclassification data with multi-tenancy support
 * Provides CRUD operations for vt_incometaxclassification table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtIncometaxclassification, 
  VtIncometaxclassificationInsert, 
  VtIncometaxclassificationUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtIncometaxclassificationFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtIncometaxclassificationStats {
  totalIncometaxclassification: number;
  recentlyUpdated: number;
}

export class VtIncometaxclassificationService extends VtBaseService<VtIncometaxclassification> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_incometaxclassification',
      primaryKey: 'id'
    });
  }

  /**
   * Get incometaxclassification with advanced filtering
   */
  async getIncometaxclassification(
    filters: VtIncometaxclassificationFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtIncometaxclassification>> {
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
   * Get incometaxclassification by name
   */
  async getIncometaxclassificationByName(name: string): Promise<VtIncometaxclassification | null> {
    try {
      const { data } = await this.getIncometaxclassification({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching incometaxclassification by name:', error);
      throw error;
    }
  }

  /**
   * Get incometaxclassification statistics
   */
  async getIncometaxclassificationStats(): Promise<VtIncometaxclassificationStats> {
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
        totalIncometaxclassification: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching incometaxclassification stats:', error);
      throw error;
    }
  }

  /**
   * Create a new incometaxclassification
   */
  async createIncometaxclassification(data: VtIncometaxclassificationInsert): Promise<VtIncometaxclassification> {
    return this.create(data);
  }

  /**
   * Update an existing incometaxclassification
   */
  async updateIncometaxclassification(id: string, data: VtIncometaxclassificationUpdate): Promise<VtIncometaxclassification> {
    return this.update(id, data);
  }

  /**
   * Delete a incometaxclassification
   */
  async deleteIncometaxclassification(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if incometaxclassification name is available
   */
  async isIncometaxclassificationNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getIncometaxclassificationByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking incometaxclassification name availability:', error);
      return false;
    }
  }

  /**
   * Batch create incometaxclassification
   */
  async createIncometaxclassifications(data: VtIncometaxclassificationInsert[]): Promise<VtIncometaxclassification[]> {
    return this.batchCreate(data);
  }
}