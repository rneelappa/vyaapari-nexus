import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  description: string | null;
}

export interface Division {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  manager_name: string | null;
}

export interface Workspace {
  id: string;
  company_id: string;
  division_id: string | null;
  name: string;
  description: string | null;
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useDivisions(companyId?: string) {
  return useQuery({
    queryKey: ['divisions', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      return data as Division[];
    },
    enabled: !!companyId,
  });
}

export function useWorkspacesByDivision(divisionId?: string) {
  return useQuery({
    queryKey: ['workspaces-by-division', divisionId],
    queryFn: async () => {
      if (!divisionId) return [];
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('division_id', divisionId)
        .order('name');

      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !!divisionId,
  });
}