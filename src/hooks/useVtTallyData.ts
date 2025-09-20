import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// VT Tally data interfaces based on backup table structure
export interface VtVoucher {
  guid: string;
  voucher_number: string;
  date: string;
  voucher_type: string;
  party_ledger_name: string;
  total_amount: number;
  net_amount: number;
  narration: string;
  is_cancelled: boolean;
  company_id?: string;
  division_id?: string;
}

export interface VtVoucherType {
  guid: string;
  name: string;
  parent: string;
  numbering_method: string;
  affects_stock: boolean;
  company_id?: string;
  division_id?: string;
}

export interface VtLedger {
  guid: string;
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
  gstin: string;
  email: string;
  company_id?: string;
  division_id?: string;
}

export interface VtCompany {
  company_id: string;
  company_name: string;
  vyaapari_company_id?: string;
  vyaapari_division_id?: string;
}

export interface VtStockItem {
  guid: string;
  name: string;
  parent: string;
  uom: string;
  opening_balance: number;
  closing_balance: number;
  opening_value: number;
  closing_value: number;
  company_id?: string;
  division_id?: string;
}

export interface VtGroup {
  guid: string;
  name: string;
  parent: string;
  primary_group: string;
  affects_gross_profit: boolean;
  is_revenue: boolean;
  company_id?: string;
  division_id?: string;
}

// Hooks for VT Tally data access using backup tables (temporary until migration completes)
export const useVtVouchers = (companyId?: string, divisionId?: string, limit = 1000) => {
  const [data, setData] = useState<VtVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('bkp_tally_trn_voucher')
        .select(`
          guid,
          voucher_number,
          date,
          voucher_type,
          party_ledger_name,
          total_amount,
          net_amount,
          narration,
          is_cancelled,
          company_id,
          division_id
        `)
        .order('date', { ascending: false })
        .order('voucher_number', { ascending: false })
        .limit(limit);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData: VtVoucher[] = (result || []).map(item => ({
        ...item,
        is_cancelled: Boolean(item.is_cancelled)
      }));
      
      setData(transformedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT vouchers';
      setError(errorMsg);
      console.error('VT Vouchers fetch error:', err);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [companyId, divisionId]);

  return { data, loading, error, refetch: fetch };
};

export const useVtVoucherTypes = (companyId?: string, divisionId?: string) => {
  const [data, setData] = useState<VtVoucherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('bkp_mst_vouchertype')
        .select(`
          guid,
          name,
          parent,
          numbering_method,
          affects_stock,
          company_id,
          division_id
        `)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData: VtVoucherType[] = (result || []).map(item => ({
        ...item,
        affects_stock: Boolean(item.affects_stock)
      }));
      
      setData(transformedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT voucher types';
      setError(errorMsg);
      console.error('VT Voucher Types fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [companyId, divisionId]);

  return { data, loading, error, refetch: fetch };
};

export const useVtLedgers = (companyId?: string, divisionId?: string) => {
  const [data, setData] = useState<VtLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('bkp_mst_ledger')
        .select(`
          guid,
          name,
          parent,
          opening_balance,
          closing_balance,
          gstn,
          email,
          company_id,
          division_id
        `)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match interface (gstn -> gstin mapping)
      const transformedData: VtLedger[] = (result || []).map(item => ({
        ...item,
        gstin: item.gstn || '' // Map gstn to gstin
      }));
      
      setData(transformedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT ledgers';
      setError(errorMsg);
      console.error('VT Ledgers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [companyId, divisionId]);

  return { data, loading, error, refetch: fetch };
};

export const useVtCompanies = () => {
  const [data, setData] = useState<VtCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from('bkp_mst_company')
        .select(`
          company_id,
          company_name,
          vyaapari_company_id,
          vyaapari_division_id
        `)
        .order('company_name');
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT companies';
      setError(errorMsg);
      console.error('VT Companies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
};

export const useVtStockItems = (companyId?: string, divisionId?: string) => {
  const [data, setData] = useState<VtStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('bkp_mst_stock_item')
        .select(`
          guid,
          name,
          parent,
          uom,
          opening_balance,
          closing_balance,
          opening_value,
          closing_value,
          company_id,
          division_id
        `)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT stock items';
      setError(errorMsg);
      console.error('VT Stock Items fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [companyId, divisionId]);

  return { data, loading, error, refetch: fetch };
};

export const useVtGroups = (companyId?: string, divisionId?: string) => {
  const [data, setData] = useState<VtGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('bkp_mst_group')
        .select(`
          guid,
          name,
          parent,
          primary_group,
          affects_gross_profit,
          is_revenue,
          company_id,
          division_id
        `)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData: VtGroup[] = (result || []).map(item => ({
        ...item,
        affects_gross_profit: Boolean(item.affects_gross_profit),
        is_revenue: Boolean(item.is_revenue)
      }));
      
      setData(transformedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch VT groups';
      setError(errorMsg);
      console.error('VT Groups fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [companyId, divisionId]);

  return { data, loading, error, refetch: fetch };
};

// Combined VT Tally data hook
export const useVtTallyData = (companyId?: string, divisionId?: string) => {
  const vouchers = useVtVouchers(companyId, divisionId);
  const voucherTypes = useVtVoucherTypes(companyId, divisionId);
  const ledgers = useVtLedgers(companyId, divisionId);
  const companies = useVtCompanies();
  const stockItems = useVtStockItems(companyId, divisionId);
  const groups = useVtGroups(companyId, divisionId);

  return {
    vouchers,
    voucherTypes,
    ledgers,
    companies,
    stockItems,
    groups,
    loading: vouchers.loading || voucherTypes.loading || ledgers.loading || 
             companies.loading || stockItems.loading || groups.loading,
    error: vouchers.error || voucherTypes.error || ledgers.error || 
           companies.error || stockItems.error || groups.error
  };
};