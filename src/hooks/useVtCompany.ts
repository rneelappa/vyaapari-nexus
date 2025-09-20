/**
 * VT Company React Query Hooks
 * 
 * Custom hooks for managing company data with React Query
 * Provides caching, loading states, and error handling for VT company
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtCompanyService, 
  type VtCompanyFilters, 
  type VtCompanyStats 
} from '@/services/vt-company-service';
import type { VtCompany, VtCompanyInsert, VtCompanyUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching company with filters and pagination
 */
export const useVtCompany = (
  companyId: string,
  divisionId: string,
  filters?: VtCompanyFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtCompanyService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtCompany', companyId, divisionId, filters, options],
    queryFn: () => service.getCompany(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new company
 */
export const useCreateVtCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtCompanyInsert 
    }) => {
      const service = new VtCompanyService(companyId, divisionId);
      return service.createCompany(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtCompany', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: `${serviceName} created successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create company: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};