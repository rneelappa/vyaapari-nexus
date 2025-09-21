/**
 * VT Stockgroup React Query Hooks
 * 
 * Custom hooks for managing stockgroup data with React Query
 * Provides caching, loading states, and error handling for VT stockgroup
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtStockgroupService, 
  type VtStockgroupFilters, 
  type VtStockgroupStats 
} from '@/services/vt-stockgroup-service';
import type { VtStockgroup, VtStockgroupInsert, VtStockgroupUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching stockgroup with filters and pagination
 */
export const useVtStockgroup = (
  companyId: string,
  divisionId: string,
  filters?: VtStockgroupFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtStockgroupService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtStockgroup', companyId, divisionId, filters, options],
    queryFn: () => service.getStockgroup(filters, options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new stockgroup
 */
export const useCreateVtStockgroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtStockgroupInsert 
    }) => {
      const service = new VtStockgroupService(companyId, divisionId);
      return service.createStockgroup(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtStockgroup', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: "Stock group created successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create stockgroup: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};