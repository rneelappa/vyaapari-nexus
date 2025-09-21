/**
 * VT Incometaxslab React Query Hooks
 * 
 * Custom hooks for managing incometaxslab data with React Query
 * Provides caching, loading states, and error handling for VT incometaxslab
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtIncometaxslabService, 
  type VtIncometaxslabFilters, 
  type VtIncometaxslabStats 
} from '@/services/vt-incometaxslab-service';
import type { VtIncometaxslab, VtIncometaxslabInsert, VtIncometaxslabUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching incometaxslab with filters and pagination
 */
export const useVtIncometaxslab = (
  companyId: string,
  divisionId: string,
  filters?: VtIncometaxslabFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtIncometaxslabService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtIncometaxslab', companyId, divisionId, filters, options],
    queryFn: () => service.getIncometaxslab(filters, options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new incometaxslab
 */
export const useCreateVtIncometaxslab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtIncometaxslabInsert 
    }) => {
      const service = new VtIncometaxslabService(companyId, divisionId);
      return service.createIncometaxslab(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtIncometaxslab', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: "Income tax slab created successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create incometaxslab: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};