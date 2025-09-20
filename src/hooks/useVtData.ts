import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VtCostCategory {
  guid: string;
  name: string;
  company_id: string;
  division_id: string;
  allocate_revenue: number;
  allocate_non_revenue: number;
}

interface VtCostCenter {
  guid: string;
  name: string;
  parent: string;
  category: string;
  company_id: string;
  division_id: string;
}

interface VtCompany {
  company_id: string;
  company_name: string;
  vyaapari_company_id: string;
  vyaapari_division_id: string;
}

interface VtDivision {
  division_id: string;
  division_name: string;
  company_id: string;
  tally_url: string;
}

// Custom hooks using backup tables until VT schema is properly set up
export const useVtCostCategories = () => {
  const [data, setData] = useState<VtCostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from('bkp_mst_cost_category')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch cost categories';
      setError(errorMsg);
      console.error('VT Cost Categories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
};

export const useVtCostCenters = () => {
  const [data, setData] = useState<VtCostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from('bkp_mst_cost_centre')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch cost centers';
      setError(errorMsg);
      console.error('VT Cost Centers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

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
        .select('*')
        .order('company_name');
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch companies';
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

export const useVtDivisions = () => {
  const [data, setData] = useState<VtDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from('bkp_mst_division')
        .select('*')
        .order('division_name');
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch divisions';
      setError(errorMsg);
      console.error('VT Divisions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
};

// General VT data hook
export const useVtData = () => {
  const costCategories = useVtCostCategories();
  const costCenters = useVtCostCenters();
  const companies = useVtCompanies();
  const divisions = useVtDivisions();

  return {
    costCategories,
    costCenters,
    companies,
    divisions,
    loading: costCategories.loading || costCenters.loading || companies.loading || divisions.loading,
    error: costCategories.error || costCenters.error || companies.error || divisions.error
  };
};