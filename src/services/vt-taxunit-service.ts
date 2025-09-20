/**
 * VT Taxunit Service
 * 
 * Service for managing taxunit data with multi-tenancy support
 * Provides CRUD operations for vt_taxunit table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtTaxunit, 
  VtTaxunitInsert, 
  VtTaxunitUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtTaxunitFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtTaxunitStats {
  totalTaxunit: number;
  recentlyUpdated: number;
}

export class VtTaxunitService extends VtBaseService<VtTaxunit> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_taxunit',
      primaryKey: 'id'
    });
  }

  /**
   * Get taxunit with advanced filtering
   */
  async getTaxunit(
    filters: VtTaxunitFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtTaxunit>> {
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
   * Get taxunit by name
   */
  async getTaxunitByName(name: string): Promise<VtTaxunit | null> {
    try {
      const { data } = await this.getTaxunit({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching taxunit by name:', error);
      throw error;
    }
  }

  /**
   * Get taxunit statistics
   */
  async getTaxunitStats(): Promise<VtTaxunitStats> {
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
        totalTaxunit: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching taxunit stats:', error);
      throw error;
    }
  }

  /**
   * Create a new taxunit
   */
  async createTaxunit(data: VtTaxunitInsert): Promise<VtTaxunit> {
    return this.create(data);
  }

  /**
   * Update an existing taxunit
   */
  async updateTaxunit(id: string, data: VtTaxunitUpdate): Promise<VtTaxunit> {
    return this.update(id, data);
  }

  /**
   * Delete a taxunit
   */
  async deleteTaxunit(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if taxunit name is available
   */
  async isTaxunitNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getTaxunitByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking taxunit name availability:', error);
      return false;
    }
  }

  /**
   * Batch create taxunit
   */
  async createTaxunits(data: VtTaxunitInsert[]): Promise<VtTaxunit[]> {
    return this.batchCreate(data);
  }
}