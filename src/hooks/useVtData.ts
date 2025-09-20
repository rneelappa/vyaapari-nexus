import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VtDataOptions {
  companyId?: string;
  divisionId?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface VtDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export const useVtData = <T = any>(
  tableName: string,
  options: VtDataOptions = {}
): VtDataResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const {
    companyId,
    divisionId,
    limit = 50,
    orderBy = 'created_at',
    orderDirection = 'desc',
    filters = {}
  } = options;

  const fetchData = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = isLoadMore ? offset + limit : 0;
      
      // Build query
      let query = supabase
        .from(`vt.${tableName}` as any)
        .select('*', { count: 'exact' });

      // Apply company/division filters if provided
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Apply pagination and ordering
      query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(currentOffset, currentOffset + limit - 1);

      const { data: result, error: queryError, count } = await query;

      if (queryError) throw queryError;

      if (isLoadMore) {
        setData(prev => [...prev, ...(result || [])]);
        setOffset(currentOffset);
      } else {
        setData(result || []);
        setOffset(0);
      }
      
      setTotal(count || 0);
    } catch (err: any) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [tableName, companyId, divisionId, limit, orderBy, orderDirection, filters, offset]);

  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(true);
    }
  }, [fetchData, loading]);

  const hasMore = offset + limit < total;

  useEffect(() => {
    fetchData(false);
  }, [tableName, companyId, divisionId, limit, orderBy, orderDirection, JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    total,
    hasMore,
    refresh,
    loadMore
  };
};

// Specific hooks for common VT tables
export const useVtCompanies = (options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('companies', options);

export const useVtDivisions = (companyId?: string, options?: Omit<VtDataOptions, 'companyId'>) => 
  useVtData('divisions', { ...options, companyId });

export const useVtGroups = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('groups', { ...options, companyId, divisionId });

export const useVtLedgers = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('ledgers', { ...options, companyId, divisionId });

export const useVtStockItems = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('stock_items', { ...options, companyId, divisionId });

export const useVtVouchers = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('vouchers', { ...options, companyId, divisionId });

export const useVtLedgerEntries = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('ledger_entries', { ...options, companyId, divisionId });

export const useVtInventoryEntries = (companyId?: string, divisionId?: string, options?: Omit<VtDataOptions, 'companyId' | 'divisionId'>) => 
  useVtData('inventory_entries', { ...options, companyId, divisionId });