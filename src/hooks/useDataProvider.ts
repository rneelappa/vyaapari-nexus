/**
 * Data Provider Hook
 * Provides a unified interface for data access with automatic fallback to mock data
 * Safe for lovable.dev deployment - no environment changes
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockDataProvider } from '@/services/mock-data-provider';

export interface DataProviderState {
  isOnline: boolean;
  isSupabaseAvailable: boolean;
  isMockMode: boolean;
  lastError: string | null;
}

export interface DataProviderResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

// Health check function
const checkSupabaseHealth = async (): Promise<boolean> => {
  try {
    // Try a simple query to check if Supabase is reachable
    const { error } = await supabase.from('config').select('name').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
};

// Generic data fetcher with fallback
const fetchWithFallback = async <T>(
  supabaseQuery: () => Promise<{ data: T | null; error: any }>,
  mockQuery: () => Promise<{ data: T | null; error: any }>,
  isSupabaseAvailable: boolean
): Promise<{ data: T | null; error: string | null }> => {
  if (isSupabaseAvailable) {
    try {
      const result = await supabaseQuery();
      if (result.error) {
        console.warn('Supabase query failed, falling back to mock:', result.error);
        return await mockQuery();
      }
      return { data: result.data, error: null };
    } catch (error) {
      console.warn('Supabase query threw error, falling back to mock:', error);
      return await mockQuery();
    }
  } else {
    return await mockQuery();
  }
};

// Hook for master data
export const useMasterData = <T>(
  tableName: string,
  companyId?: string
): DataProviderResult<T[]> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check Supabase availability
      const isAvailable = await checkSupabaseHealth();
      setIsSupabaseAvailable(isAvailable);

      // Define Supabase query
      const supabaseQuery = async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq(companyId ? 'company_id' : 'id', companyId || 'default');
        return { data, error };
      };

      // Define mock query based on table name
      const mockQuery = async () => {
        switch (tableName) {
          case 'mst_group':
            return await mockDataProvider.getGroups(companyId);
          case 'mst_ledger':
            return await mockDataProvider.getLedgers(companyId);
          case 'mst_uom':
            return await mockDataProvider.getUOMs(companyId);
          case 'mst_stock_item':
            return await mockDataProvider.getStockItems(companyId);
          case 'mst_godown':
            return await mockDataProvider.getGodowns(companyId);
          case 'mst_cost_category':
            return await mockDataProvider.getCostCategories(companyId);
          case 'mst_cost_centre':
            return await mockDataProvider.getCostCentres(companyId);
          case 'mst_employee':
            return await mockDataProvider.getEmployees(companyId);
          case 'mst_payhead':
            return await mockDataProvider.getPayheads(companyId);
          case 'mst_vouchertype':
            return await mockDataProvider.getVoucherTypes(companyId);
          default:
            return { data: [], error: new Error('Unknown table') };
        }
      };

      const result = await fetchWithFallback(supabaseQuery, mockQuery, isAvailable);
      
      if (result.error) {
        setError(result.error);
        setData([]);
      } else {
        setData(result.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tableName, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData
  };
};

// Hook for transaction data
export const useTransactionData = <T>(
  tableName: string,
  companyId?: string
): DataProviderResult<T[]> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check Supabase availability
      const isAvailable = await checkSupabaseHealth();
      setIsSupabaseAvailable(isAvailable);

      // Define Supabase query
      const supabaseQuery = async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq(companyId ? 'company_id' : 'id', companyId || 'default');
        return { data, error };
      };

      // Define mock query based on table name
      const mockQuery = async () => {
        switch (tableName) {
          case 'trn_voucher':
            return await mockDataProvider.getVouchers(companyId);
          case 'trn_accounting':
            return await mockDataProvider.getAccountingEntries(companyId);
          default:
            return { data: [], error: new Error('Unknown table') };
        }
      };

      const result = await fetchWithFallback(supabaseQuery, mockQuery, isAvailable);
      
      if (result.error) {
        setError(result.error);
        setData([]);
      } else {
        setData(result.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tableName, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData
  };
};

// Hook for CRUD operations
export const useCRUD = (tableName: string) => {
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  useEffect(() => {
    checkSupabaseHealth().then(setIsSupabaseAvailable);
  }, []);

  const create = useCallback(async (data: any) => {
    if (isSupabaseAvailable) {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return { data: result, error: null };
      } catch (error) {
        console.warn('Supabase create failed, falling back to mock:', error);
        return await mockDataProvider.create(tableName, data);
      }
    } else {
      return await mockDataProvider.create(tableName, data);
    }
  }, [tableName, isSupabaseAvailable]);

  const update = useCallback(async (id: string, data: any) => {
    if (isSupabaseAvailable) {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return { data: result, error: null };
      } catch (error) {
        console.warn('Supabase update failed, falling back to mock:', error);
        return await mockDataProvider.update(tableName, id, data);
      }
    } else {
      return await mockDataProvider.update(tableName, id, data);
    }
  }, [tableName, isSupabaseAvailable]);

  const remove = useCallback(async (id: string) => {
    if (isSupabaseAvailable) {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return { data: result, error: null };
      } catch (error) {
        console.warn('Supabase delete failed, falling back to mock:', error);
        return await mockDataProvider.delete(tableName, id);
      }
    } else {
      return await mockDataProvider.delete(tableName, id);
    }
  }, [tableName, isSupabaseAvailable]);

  return {
    create,
    update,
    remove,
    isSupabaseAvailable
  };
};

// Hook for data provider state
export const useDataProviderState = (): DataProviderState => {
  const [state, setState] = useState<DataProviderState>({
    isOnline: navigator.onLine,
    isSupabaseAvailable: false,
    isMockMode: true,
    lastError: null
  });

  useEffect(() => {
    const checkHealth = async () => {
      const isSupabaseAvailable = await checkSupabaseHealth();
      const isMockMode = !isSupabaseAvailable;
      
      setState(prev => ({
        ...prev,
        isSupabaseAvailable,
        isMockMode
      }));
    };

    checkHealth();

    // Check health periodically
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
};
