import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VtCostCategory {
  id: string;
  company_id: string;
  division_id: string;
  name: string;
  allows_allocation_revenue: boolean;
  allows_allocation_non_revenue: boolean;
}

interface VtCostCenter {
  id: string;
  company_id: string;
  division_id: string;
  name: string;
  parent_name?: string;
  category_name?: string;
}

// Custom hooks for each VT table
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
        .from('vt.cost_categories')
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
        .from('vt.cost_centers')
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