import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  VtVoucherManagementService,
  type VoucherFilters,
  type VoucherSortOptions,
  type VoucherPaginationOptions,
  type VoucherListResponse,
  type VoucherStats,
  type CreateVoucherData,
  type UpdateVoucherData
} from '@/services/vt-voucher-management-service';
import type { VtVoucher } from '@/types/vt';

const STALE_TIME = 1 * 60 * 1000; // 1 minute for voucher lists
const CACHE_TIME = 3 * 60 * 1000; // 3 minutes

/**
 * Hook to get paginated vouchers with filtering and sorting
 */
export const useVtVouchers = (
  companyId: string,
  divisionId: string,
  filters?: VoucherFilters,
  sort?: VoucherSortOptions,
  pagination?: VoucherPaginationOptions,
  options?: { enabled?: boolean }
) => {
  const service = new VtVoucherManagementService(companyId, divisionId);

  return useQuery<VoucherListResponse, Error>({
    queryKey: ['vtVouchers', companyId, divisionId, filters, sort, pagination],
    queryFn: () => service.getVouchers(filters, sort, pagination),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (options?.enabled !== false),
  });
};

/**
 * Hook to get voucher statistics
 */
export const useVtVoucherStats = (
  companyId: string,
  divisionId: string,
  filters?: VoucherFilters,
  options?: { enabled?: boolean }
) => {
  const service = new VtVoucherManagementService(companyId, divisionId);

  return useQuery<VoucherStats, Error>({
    queryKey: ['vtVoucherStats', companyId, divisionId, filters],
    queryFn: () => service.getVoucherStats(filters),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && (options?.enabled !== false),
  });
};

/**
 * Hook to get a single voucher by ID
 */
export const useVtVoucher = (
  companyId: string,
  divisionId: string,
  voucherId: string,
  options?: { enabled?: boolean }
) => {
  const service = new VtVoucherManagementService(companyId, divisionId);

  return useQuery<VtVoucher | null, Error>({
    queryKey: ['vtVoucher', companyId, divisionId, voucherId],
    queryFn: () => service.getVoucherById(voucherId),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && !!voucherId && (options?.enabled !== false),
  });
};

/**
 * Hook to get a single voucher by GUID
 */
export const useVtVoucherByGuid = (
  companyId: string,
  divisionId: string,
  guid: string,
  options?: { enabled?: boolean }
) => {
  const service = new VtVoucherManagementService(companyId, divisionId);

  return useQuery<VtVoucher | null, Error>({
    queryKey: ['vtVoucherByGuid', companyId, divisionId, guid],
    queryFn: () => service.getVoucherByGuid(guid),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!companyId && !!divisionId && !!guid && (options?.enabled !== false),
  });
};

/**
 * Hook to get available voucher types
 */
export const useVtVoucherTypes = (
  companyId: string,
  divisionId: string,
  options?: { enabled?: boolean }
) => {
  const service = new VtVoucherManagementService(companyId, divisionId);

  return useQuery<string[], Error>({
    queryKey: ['vtVoucherTypes', companyId, divisionId],
    queryFn: () => service.getVoucherTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes for types (less frequent changes)
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!companyId && !!divisionId && (options?.enabled !== false),
  });
};

/**
 * Hook to refresh vouchers from Tally
 */
export const useRefreshVtVouchers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, divisionId }: { companyId: string; divisionId: string }) => {
      const service = new VtVoucherManagementService(companyId, divisionId);
      return service.refreshFromTally();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Success", 
        description: data.message || "Vouchers refreshed from Tally successfully" 
      });
      
      // Invalidate all voucher-related queries for this company/division
      queryClient.invalidateQueries({ 
        queryKey: ['vtVouchers', variables.companyId, variables.divisionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVoucherStats', variables.companyId, variables.divisionId] 
      });
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: `Failed to refresh vouchers: ${err.message}`, 
        variant: "destructive" 
      });
    },
  });
};

/**
 * Hook to create a new voucher
 */
export const useCreateVtVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      divisionId, 
      voucherData 
    }: { 
      companyId: string; 
      divisionId: string; 
      voucherData: CreateVoucherData 
    }) => {
      const service = new VtVoucherManagementService(companyId, divisionId);
      return service.createVoucher(voucherData);
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Success", 
        description: "Voucher created successfully" 
      });
      
      // Invalidate voucher lists and stats
      queryClient.invalidateQueries({ 
        queryKey: ['vtVouchers', variables.companyId, variables.divisionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVoucherStats', variables.companyId, variables.divisionId] 
      });
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: `Failed to create voucher: ${err.message}`, 
        variant: "destructive" 
      });
    },
  });
};

/**
 * Hook to update an existing voucher
 */
export const useUpdateVtVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      divisionId, 
      voucherData 
    }: { 
      companyId: string; 
      divisionId: string; 
      voucherData: UpdateVoucherData 
    }) => {
      const service = new VtVoucherManagementService(companyId, divisionId);
      return service.updateVoucher(voucherData);
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Success", 
        description: "Voucher updated successfully" 
      });
      
      // Invalidate specific voucher and lists
      queryClient.invalidateQueries({ 
        queryKey: ['vtVoucher', variables.companyId, variables.divisionId, variables.voucherData.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVouchers', variables.companyId, variables.divisionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVoucherStats', variables.companyId, variables.divisionId] 
      });
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: `Failed to update voucher: ${err.message}`, 
        variant: "destructive" 
      });
    },
  });
};

/**
 * Hook to delete a voucher
 */
export const useDeleteVtVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      divisionId, 
      voucherId 
    }: { 
      companyId: string; 
      divisionId: string; 
      voucherId: string 
    }) => {
      const service = new VtVoucherManagementService(companyId, divisionId);
      return service.deleteVoucher(voucherId);
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Success", 
        description: "Voucher deleted successfully" 
      });
      
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ 
        queryKey: ['vtVoucher', variables.companyId, variables.divisionId, variables.voucherId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVouchers', variables.companyId, variables.divisionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vtVoucherStats', variables.companyId, variables.divisionId] 
      });
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete voucher: ${err.message}`, 
        variant: "destructive" 
      });
    },
  });
};

/**
 * Combined hook for voucher management with all common operations
 */
export const useVtVoucherManagement = (
  companyId: string,
  divisionId: string,
  filters?: VoucherFilters,
  sort?: VoucherSortOptions,
  pagination?: VoucherPaginationOptions
) => {
  const vouchersQuery = useVtVouchers(companyId, divisionId, filters, sort, pagination);
  const statsQuery = useVtVoucherStats(companyId, divisionId, filters);
  const voucherTypesQuery = useVtVoucherTypes(companyId, divisionId);
  
  const refreshMutation = useRefreshVtVouchers();
  const createMutation = useCreateVtVoucher();
  const updateMutation = useUpdateVtVoucher();
  const deleteMutation = useDeleteVtVoucher();

  return {
    // Data
    vouchers: vouchersQuery.data?.vouchers || [],
    totalCount: vouchersQuery.data?.totalCount || 0,
    totalPages: vouchersQuery.data?.totalPages || 0,
    currentPage: vouchersQuery.data?.currentPage || 1,
    hasNextPage: vouchersQuery.data?.hasNextPage || false,
    hasPreviousPage: vouchersQuery.data?.hasPreviousPage || false,
    
    stats: statsQuery.data,
    voucherTypes: voucherTypesQuery.data || [],
    
    // Loading states
    isLoading: vouchersQuery.isLoading || statsQuery.isLoading,
    isLoadingVouchers: vouchersQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingTypes: voucherTypesQuery.isLoading,
    
    // Error states
    error: vouchersQuery.error || statsQuery.error,
    vouchersError: vouchersQuery.error,
    statsError: statsQuery.error,
    typesError: voucherTypesQuery.error,
    
    // Mutations
    refresh: refreshMutation.mutate,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Mutation states
    isRefreshing: refreshMutation.isPending,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Refetch functions
    refetchVouchers: vouchersQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchTypes: voucherTypesQuery.refetch,
  };
};
