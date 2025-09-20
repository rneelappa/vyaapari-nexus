/**
 * VT Tdsrate Service
 * 
 * Service for managing tdsrate data with multi-tenancy support
 * Provides CRUD operations for vt_tdsrate table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtTdsrate, 
  VtTdsrateInsert, 
  VtTdsrateUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtTdsrateFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtTdsrateStats {
  totalTdsrate: number;
  recentlyUpdated: number;
}

export class VtTdsrateService extends VtBaseService<VtTdsrate> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_tdsrate',
      primaryKey: 'id'
    });
  }

  /**
   * Get tdsrate with advanced filtering
   */
  async getTdsrate(
    filters: VtTdsrateFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtTdsrate>> {
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
   * Get tdsrate by name
   */
  async getTdsrateByName(name: string): Promise<VtTdsrate | null> {
    try {
      const { data } = await this.getTdsrate({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching tdsrate by name:', error);
      throw error;
    }
  }

  /**
   * Get tdsrate statistics
   */
  async getTdsrateStats(): Promise<VtTdsrateStats> {
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
        totalTdsrate: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching tdsrate stats:', error);
      throw error;
    }
  }

  /**
   * Create a new tdsrate
   */
  async createTdsrate(data: VtTdsrateInsert): Promise<VtTdsrate> {
    return this.create(data);
  }

  /**
   * Update an existing tdsrate
   */
  async updateTdsrate(id: string, data: VtTdsrateUpdate): Promise<VtTdsrate> {
    return this.update(id, data);
  }

  /**
   * Delete a tdsrate
   */
  async deleteTdsrate(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if tdsrate name is available
   */
  async isTdsrateNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getTdsrateByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking tdsrate name availability:', error);
      return false;
    }
  }

  /**
   * Batch create tdsrate
   */
  async createTdsrates(data: VtTdsrateInsert[]): Promise<VtTdsrate[]> {
    return this.batchCreate(data);
  }
}