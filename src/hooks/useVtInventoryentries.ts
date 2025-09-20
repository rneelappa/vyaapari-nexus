/**
 * VT Inventoryentries React Query Hooks
 * 
 * Custom hooks for managing inventoryentries data with React Query
 * Provides caching, loading states, and error handling for VT inventoryentries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtInventoryentriesService, 
  type VtInventoryentriesFilters, 
  type VtInventoryentriesStats 
} from '@/services/vt-inventoryentries-service';
import type { VtInventoryentries, VtInventoryentriesInsert, VtInventoryentriesUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching inventoryentries with filters and pagination
 */
export const useVtInventoryentries = (
  companyId: string,
  divisionId: string,
  filters?: VtInventoryentriesFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtInventoryentriesService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtInventoryentries', companyId, divisionId, filters, options],
    queryFn: () => service.getInventoryentries(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new inventoryentries
 */
export const useCreateVtInventoryentries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtInventoryentriesInsert 
    }) => {
      const service = new VtInventoryentriesService(companyId, divisionId);
      return service.createInventoryentries(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtInventoryentries', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: `${serviceName} created successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create inventoryentries: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};