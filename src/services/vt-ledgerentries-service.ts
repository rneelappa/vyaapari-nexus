/**
 * VT Ledgerentries Service
 * 
 * Service for managing ledgerentries data with multi-tenancy support
 * Provides CRUD operations for vt_ledgerentries table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtLedgerentries, 
  VtLedgerentriesInsert, 
  VtLedgerentriesUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtLedgerentriesFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtLedgerentriesStats {
  totalLedgerentries: number;
  recentlyUpdated: number;
}

export class VtLedgerentriesService extends VtBaseService<VtLedgerentries> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_ledgerentries',
      primaryKey: 'id'
    });
  }

  /**
   * Get ledgerentries with advanced filtering
   */
  async getLedgerentries(
    filters: VtLedgerentriesFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtLedgerentries>> {
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
   * Get ledgerentries by name
   */
  async getLedgerentriesByName(name: string): Promise<VtLedgerentries | null> {
    try {
      const { data } = await this.getLedgerentries({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching ledgerentries by name:', error);
      throw error;
    }
  }

  /**
   * Get ledgerentries statistics
   */
  async getLedgerentriesStats(): Promise<VtLedgerentriesStats> {
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
        totalLedgerentries: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching ledgerentries stats:', error);
      throw error;
    }
  }

  /**
   * Create a new ledgerentries
   */
  async createLedgerentries(data: VtLedgerentriesInsert): Promise<VtLedgerentries> {
    return this.create(data);
  }

  /**
   * Update an existing ledgerentries
   */
  async updateLedgerentries(id: string, data: VtLedgerentriesUpdate): Promise<VtLedgerentries> {
    return this.update(id, data);
  }

  /**
   * Delete a ledgerentries
   */
  async deleteLedgerentries(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if ledgerentries name is available
   */
  async isLedgerentriesNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getLedgerentriesByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking ledgerentries name availability:', error);
      return false;
    }
  }

  /**
   * Batch create ledgerentries
   */
  async createLedgerentriess(data: VtLedgerentriesInsert[]): Promise<VtLedgerentries[]> {
    return this.batchCreate(data);
  }
}