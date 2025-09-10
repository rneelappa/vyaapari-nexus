import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceModule {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  icon: string;
  sort_order: number;
  is_expandable: boolean;
  children?: WorkspaceModule[];
}

export function useWorkspaceModules(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['workspace-modules', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('workspace_modules')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('sort_order');

      if (error) throw error;

      // Build tree structure
      const modulesMap = new Map<string, WorkspaceModule>();
      const rootModules: WorkspaceModule[] = [];

      // First pass: create all modules
      data.forEach(module => {
        modulesMap.set(module.id, { ...module, children: [] });
      });

      // Second pass: build tree
      data.forEach(module => {
        const moduleObj = modulesMap.get(module.id)!;
        if (module.parent_id) {
          const parent = modulesMap.get(module.parent_id);
          if (parent) {
            parent.children!.push(moduleObj);
          }
        } else {
          rootModules.push(moduleObj);
        }
      });

      return rootModules;
    },
    enabled: !!workspaceId,
  });
}