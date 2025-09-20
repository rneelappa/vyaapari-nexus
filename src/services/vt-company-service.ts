/**
 * VT Company Service
 * 
 * Service for managing company data with multi-tenancy support
 * Provides CRUD operations for vt_company table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtCompany, 
  VtCompanyInsert, 
  VtCompanyUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtCompanyFilters {
  name?: string;
  searchTerm?: string;
}

export interface VtCompanyStats {
  totalCompany: number;
  recentlyUpdated: number;
}

export class VtCompanyService extends VtBaseService<VtCompany> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_company',
      primaryKey: 'id'
    });
  }

  /**
   * Get company with advanced filtering
   */
  async getCompany(
    filters: VtCompanyFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtCompany>> {
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
   * Get company by name
   */
  async getCompanyByName(name: string): Promise<VtCompany | null> {
    try {
      const { data } = await this.getCompany({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching company by name:', error);
      throw error;
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(): Promise<VtCompanyStats> {
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
        totalCompany: total,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching company stats:', error);
      throw error;
    }
  }

  /**
   * Create a new company
   */
  async createCompany(data: VtCompanyInsert): Promise<VtCompany> {
    return this.create(data);
  }

  /**
   * Update an existing company
   */
  async updateCompany(id: string, data: VtCompanyUpdate): Promise<VtCompany> {
    return this.update(id, data);
  }

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if company name is available
   */
  async isCompanyNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getCompanyByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking company name availability:', error);
      return false;
    }
  }

  /**
   * Batch create company
   */
  async createCompanys(data: VtCompanyInsert[]): Promise<VtCompany[]> {
    return this.batchCreate(data);
  }
}