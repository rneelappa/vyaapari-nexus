import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DayBookEntry {
  guid: string;
  voucher_date: string | null;
  date: string | null;
  ledger: string | null;
  voucher_type: string | null;
  voucher_number: string | null;
  amount: number | null;
  amount_forex: number | null;
  currency: string | null;
  company_id: string | null;
  division_id: string | null;
  cost_centre: string | null;
  cost_category: string | null;
  voucher_guid: string | null;
  is_deemed_positive: number | null;
  is_party_ledger: number | null;
}

interface DayBookFilters {
  searchTerm?: string;
  selectedLedger?: string;
  selectedVoucherType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const useDayBook = (
  companyId: string,
  divisionId: string,
  filters: DayBookFilters = {}
) => {
  const [entries, setEntries] = useState<DayBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [aggregatedAmount, setAggregatedAmount] = useState<number | null>(null);

  const {
    searchTerm = '',
    selectedLedger = 'all',
    selectedVoucherType = 'all',
    dateFrom = '',
    dateTo = '',
    sortBy = 'voucher_date',
    sortOrder = 'desc',
    page = 1,
    pageSize = 200
  } = filters;

  const applyCommonFilters = (query: any) => {
    // Apply company and division filters
    if (companyId && companyId !== 'undefined') {
      query = query.eq('company_id', companyId);
    }
    if (divisionId && divisionId !== 'undefined') {
      query = query.eq('division_id', divisionId);
    }

    // Ledger filter
    if (selectedLedger !== 'all') {
      query = query.eq('ledger', selectedLedger);
    }

    // Voucher type filter
    if (selectedVoucherType !== 'all') {
      query = query.eq('voucher_type', selectedVoucherType);
    }

    // Date range filter - use voucher_date column
    if (dateFrom) {
      query = query.gte('voucher_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('voucher_date', dateTo);
    }

    // Search filter across key fields
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      query = query.or(
        `ledger.ilike.${term},voucher_number.ilike.${term},cost_centre.ilike.${term},cost_category.ilike.${term}`
      );
    }

    return query;
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Use backup table directly since VT tables need type regeneration
      let query = supabase
        .from('bkp_trn_accounting')
        .select('*', { count: 'exact' });

      query = applyCommonFilters(query);

      // Sorting - default to voucher_date
      const sortColumn = ['voucher_date', 'ledger', 'amount', 'voucher_type'].includes(sortBy)
        ? sortBy
        : 'voucher_date';
      query = query.order(sortColumn as any, { ascending: sortOrder === 'asc', nullsFirst: false });

      // Pagination
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setEntries((data as any) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching day book entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch day book entries');
      toast({
        title: 'Error',
        description: 'Failed to fetch day book entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotals = async () => {
    // Aggregates are disabled on PostgREST for this table; let UI use page sum
    try {
      setAggregatedAmount(null);
    } catch (e) {
      setAggregatedAmount(null);
    }
  };

  useEffect(() => {
    if (companyId && divisionId) {
      fetchEntries();
    }
  }, [companyId, divisionId, selectedLedger, selectedVoucherType, dateFrom, dateTo, searchTerm, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    if (companyId && divisionId) {
      fetchTotals();
    }
  }, [companyId, divisionId, selectedLedger, selectedVoucherType, dateFrom, dateTo, searchTerm]);

  const refresh = () => {
    fetchEntries();
    fetchTotals();
  };

  return {
    entries,
    loading,
    error,
    totalCount,
    aggregatedAmount,
    refresh
  };
};