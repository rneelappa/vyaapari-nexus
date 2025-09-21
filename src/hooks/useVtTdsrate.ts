/**
 * VT Tdsrate React Query Hooks
 * 
 * Custom hooks for managing tdsrate data with React Query
 * Provides caching, loading states, and error handling for VT tdsrate
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtTdsrateService, 
  type VtTdsrateFilters, 
  type VtTdsrateStats 
} from '@/services/vt-tdsrate-service';
import type { VtTdsrate, VtTdsrateInsert, VtTdsrateUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching tdsrate with filters and pagination
 */
export const useVtTdsrate = (
  companyId: string,
  divisionId: string,
  filters?: VtTdsrateFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtTdsrateService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtTdsrate', companyId, divisionId, filters, options],
    queryFn: () => service.getTdsrate(filters, options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new tdsrate
 */
export const useCreateVtTdsrate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtTdsrateInsert 
    }) => {
      const service = new VtTdsrateService(companyId, divisionId);
      return service.createTdsrate(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtTdsrate', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: "TDS rate created successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create tdsrate: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};