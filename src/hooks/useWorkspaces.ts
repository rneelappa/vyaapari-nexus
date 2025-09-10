import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  company_id: string;
  division_id: string | null;
  name: string;
  description: string | null;
  is_default: boolean;
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Workspace[];
    },
  });
}

export function useTallyWorkspaces() {
  return useQuery({
    queryKey: ['tally-workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          id,
          name,
          description,
          is_default,
          company_id,
          division_id,
          divisions (
            id,
            name,
            company_id,
            companies (
              id,
              name
            )
          )
        `)
        .eq('name', 'Tally')
        .order('divisions(name)');

      if (error) throw error;
      return data;
    },
  });
}