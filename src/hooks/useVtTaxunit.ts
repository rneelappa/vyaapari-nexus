/**
 * VT Taxunit React Query Hooks
 * 
 * Custom hooks for managing taxunit data with React Query
 * Provides caching, loading states, and error handling for VT taxunit
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtTaxunitService, 
  type VtTaxunitFilters, 
  type VtTaxunitStats 
} from '@/services/vt-taxunit-service';
import type { VtTaxunit, VtTaxunitInsert, VtTaxunitUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching taxunit with filters and pagination
 */
export const useVtTaxunit = (
  companyId: string,
  divisionId: string,
  filters?: VtTaxunitFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtTaxunitService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtTaxunit', companyId, divisionId, filters, options],
    queryFn: () => service.getTaxunit(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new taxunit
 */
export const useCreateVtTaxunit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtTaxunitInsert 
    }) => {
      const service = new VtTaxunitService(companyId, divisionId);
      return service.createTaxunit(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtTaxunit', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: `${serviceName} created successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create taxunit: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};