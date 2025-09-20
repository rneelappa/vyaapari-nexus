/**
 * VT Incometaxclassification React Query Hooks
 * 
 * Custom hooks for managing incometaxclassification data with React Query
 * Provides caching, loading states, and error handling for VT incometaxclassification
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtIncometaxclassificationService, 
  type VtIncometaxclassificationFilters, 
  type VtIncometaxclassificationStats 
} from '@/services/vt-incometaxclassification-service';
import type { VtIncometaxclassification, VtIncometaxclassificationInsert, VtIncometaxclassificationUpdate, VtQueryOptions } from '@/types/vt';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes for master data
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for fetching incometaxclassification with filters and pagination
 */
export const useVtIncometaxclassification = (
  companyId: string,
  divisionId: string,
  filters?: VtIncometaxclassificationFilters,
  options?: VtQueryOptions,
  queryOptions?: { enabled?: boolean }
) => {
  const service = new VtIncometaxclassificationService(companyId, divisionId);
  return useQuery({
    queryKey: ['vtIncometaxclassification', companyId, divisionId, filters, options],
    queryFn: () => service.getIncometaxclassification(filters, options),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (queryOptions?.enabled ?? true),
  });
};

/**
 * Hook for creating a new incometaxclassification
 */
export const useCreateVtIncometaxclassification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, divisionId, data }: { 
      companyId: string; 
      divisionId: string; 
      data: VtIncometaxclassificationInsert 
    }) => {
      const service = new VtIncometaxclassificationService(companyId, divisionId);
      return service.createIncometaxclassification(data);
    },
    onSuccess: (newRecord, { companyId, divisionId }) => {
      queryClient.invalidateQueries({ queryKey: ['vtIncometaxclassification', companyId, divisionId] });
      toast({ 
        title: "Success", 
        description: `${serviceName} created successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create incometaxclassification: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};