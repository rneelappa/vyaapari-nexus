/**
 * VT Ledgerentries React Query Hooks
 * 
 * Custom hooks for managing ledgerentries data with React Query
 * Provides caching, loading states, and error handling for VT ledgerentries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtLedgerentriesService, 
  type VtLedgerentriesFilters, 
  type VtLedgerentriesStats 
} from '@/services/vt-ledgerentries-service';
import type { VtLedgerentries, VtLedgerentriesInsert, VtLedgerentriesUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching ledgerentries with filters and pagination
 */
export const useVtLedgerentries = (
  companyId: string,
  divisionId: string,
  filters?: VtLedgerentriesFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtLedgerentriesService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtLedgerentries', companyId, divisionId, filters, options],
    queryFn: () => service.getLedgerentries(filters, options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new ledgerentries
 */
export const useCreateVtLedgerentries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtLedgerentriesInsert 
    }) => {
      const service = new VtLedgerentriesService(companyId, divisionId);
      return service.createLedgerentries(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtLedgerentries', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: "Ledger entry created successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create ledgerentries: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};