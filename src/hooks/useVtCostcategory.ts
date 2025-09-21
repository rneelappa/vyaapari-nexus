/**
 * VT Costcategory React Query Hooks
 * 
 * Custom hooks for managing costcategory data with React Query
 * Provides caching, loading states, and error handling for VT costcategory
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtCostcategoryService, 
  type VtCostcategoryFilters, 
  type VtCostcategoryStats 
} from '@/services/vt-costcategory-service';
import type { VtCostcategory, VtCostcategoryInsert, VtCostcategoryUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching costcategory with filters and pagination
 */
export const useVtCostcategory = (
  companyId: string,
  divisionId: string,
  filters?: VtCostcategoryFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtCostcategoryService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtCostcategory', companyId, divisionId, filters, options],
    queryFn: () => service.getCostcategory(filters, options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new costcategory
 */
export const useCreateVtCostcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtCostcategoryInsert 
    }) => {
      const service = new VtCostcategoryService(companyId, divisionId);
      return service.createCostcategory(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtCostcategory', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: "Cost category created successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create costcategory: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};