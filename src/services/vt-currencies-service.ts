/**
 * VT Currencies Service
 * 
 * Service for managing currency master data with multi-tenancy support
 * Provides CRUD operations for vt_currency table
 */

import { VtBaseService } from './vt-base-service';
import type { 
  VtCurrency, 
  VtCurrencyInsert, 
  VtCurrencyUpdate,
  VtQueryOptions,
  VtPaginatedResponse 
} from '@/types/vt';

export interface VtCurrenciesFilters {
  name?: string;
  symbol?: string;
  is_base_currency?: boolean;
  searchTerm?: string;
}

export interface VtCurrenciesStats {
  totalCurrencies: number;
  baseCurrencies: number;
  foreignCurrencies: number;
  recentlyUpdated: number;
}

export class VtCurrenciesService extends VtBaseService<VtCurrency> {
  constructor(companyId: string, divisionId: string) {
    super({
      companyId,
      divisionId,
      tableName: 'vt_currency',
      primaryKey: 'id'
    });
  }

  /**
   * Get currencies with advanced filtering
   */
  async getCurrencies(
    filters: VtCurrenciesFilters = {},
    options: VtQueryOptions = {}
  ): Promise<VtPaginatedResponse<VtCurrency>> {
    const queryOptions: VtQueryOptions = {
      ...options,
      filters: {
        ...options.filters,
        ...(filters.name && { name: filters.name }),
        ...(filters.symbol && { symbol: filters.symbol }),
        ...(filters.is_base_currency !== undefined && { is_base_currency: filters.is_base_currency })
      },
      searchTerm: filters.searchTerm,
      searchFields: ['name', 'symbol', 'description']
    };

    return this.getAll(queryOptions);
  }

  /**
   * Get currency by name
   */
  async getCurrencyByName(name: string): Promise<VtCurrency | null> {
    try {
      const { data } = await this.getCurrencies({ name }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching currency by name:', error);
      throw error;
    }
  }

  /**
   * Get currency by symbol
   */
  async getCurrencyBySymbol(symbol: string): Promise<VtCurrency | null> {
    try {
      const { data } = await this.getCurrencies({ symbol }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching currency by symbol:', error);
      throw error;
    }
  }

  /**
   * Get base currency
   */
  async getBaseCurrency(): Promise<VtCurrency | null> {
    try {
      const { data } = await this.getCurrencies({ is_base_currency: true }, { limit: 1 });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching base currency:', error);
      throw error;
    }
  }

  /**
   * Get foreign currencies
   */
  async getForeignCurrencies(options: VtQueryOptions = {}): Promise<VtPaginatedResponse<VtCurrency>> {
    return this.getCurrencies({ is_base_currency: false }, options);
  }

  /**
   * Get currency statistics
   */
  async getCurrenciesStats(): Promise<VtCurrenciesStats> {
    try {
      const [total, base, foreign] = await Promise.all([
        this.getCount(),
        this.getCount({ filters: { is_base_currency: true } }),
        this.getCount({ filters: { is_base_currency: false } })
      ]);

      // Get recently updated currencies (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyUpdated = await this.getCount({
        filters: {
          updated_at: `gte.${thirtyDaysAgo.toISOString()}`
        }
      });

      return {
        totalCurrencies: total,
        baseCurrencies: base,
        foreignCurrencies: foreign,
        recentlyUpdated
      };
    } catch (error) {
      console.error('Error fetching currencies stats:', error);
      throw error;
    }
  }

  /**
   * Create a new currency
   */
  async createCurrency(currencyData: VtCurrencyInsert): Promise<VtCurrency> {
    return this.create(currencyData);
  }

  /**
   * Update an existing currency
   */
  async updateCurrency(id: string, currencyData: VtCurrencyUpdate): Promise<VtCurrency> {
    return this.update(id, currencyData);
  }

  /**
   * Delete a currency
   */
  async deleteCurrency(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if currency name is available
   */
  async isCurrencyNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getCurrencyByName(name);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking currency name availability:', error);
      return false;
    }
  }

  /**
   * Check if currency symbol is available
   */
  async isCurrencySymbolAvailable(symbol: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.getCurrencyBySymbol(symbol);
      if (!existing) return true;
      if (excludeId && existing.id === excludeId) return true;
      return false;
    } catch (error) {
      console.error('Error checking currency symbol availability:', error);
      return false;
    }
  }

  /**
   * Batch create currencies
   */
  async createCurrencies(currenciesData: VtCurrencyInsert[]): Promise<VtCurrency[]> {
    return this.batchCreate(currenciesData);
  }

  /**
   * Get distinct currency symbols
   */
  async getCurrencySymbols(): Promise<string[]> {
    return this.getDistinctValues('symbol');
  }
}

