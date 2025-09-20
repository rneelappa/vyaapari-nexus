/**
 * VT Stockcategory React Query Hooks
 * 
 * Custom hooks for managing stockcategory data with React Query
 * Provides caching, loading states, and error handling for VT stockcategory
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtStockcategoryService, 
  type VtStockcategoryFilters, 
  type VtStockcategoryStats 
} from '@/services/vt-stockcategory-service';
import type { VtStockcategory, VtStockcategoryInsert, VtStockcategoryUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching stockcategory with filters and pagination
 */
export const useVtStockcategory = (
  companyId: string,
  divisionId: string,
  filters?: VtStockcategoryFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtStockcategoryService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtStockcategory', companyId, divisionId, filters, options],
    queryFn: () => service.getStockcategory(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new stockcategory
 */
export const useCreateVtStockcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtStockcategoryInsert 
    }) => {
      const service = new VtStockcategoryService(companyId, divisionId);
      return service.createStockcategory(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtStockcategory', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: `${serviceName} created successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create stockcategory: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};