import { useState, useCallback } from 'react';
import { externalTallyApi } from '@/services/external-tally-api';
import { useToast } from '@/hooks/use-toast';

interface VoucherFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  type?: string;
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Voucher {
  id: string;
  vchkey: string;
  alterId: string;
  date: string;
  type: string;
  number: string;
  narration: string;
  isInvoice: boolean;
  isModify: boolean;
  isDeleted: boolean;
  isOptional: boolean;
  effectiveDate: string;
  voucherTypeId: string;
  voucherTypeName: string;
  partyLedgerName: string;
  entries: any[];
  inventoryEntries: any[];
}

export const useExternalTallyVouchers = (companyId: string, divisionId: string) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [health, setHealth] = useState<any>(null);
  const { toast } = useToast();

  const checkHealth = useCallback(async () => {
    try {
      const result = await externalTallyApi.getHealth();
      if (result.success) {
        setHealth(result.data);
        return result.data;
      } else {
        setError(result.error || 'Health check failed');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const fetchVouchers = useCallback(async (filters: VoucherFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await externalTallyApi.getVouchers(companyId, divisionId, {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      if (result.success) {
        setVouchers(result.data.vouchers || []);
        setPagination({
          page: result.data.page || 1,
          limit: result.data.limit || 50,
          total: result.data.total || 0,
          pages: result.data.pages || 0
        });
      } else {
        setError(result.error || 'Failed to fetch vouchers');
        toast({
          title: "Error",
          description: result.error || 'Failed to fetch vouchers',
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, divisionId, pagination.page, pagination.limit, toast]);

  const getVoucher = useCallback(async (voucherId: string) => {
    try {
      const result = await externalTallyApi.getVoucher(companyId, divisionId, voucherId);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch voucher');
        toast({
          title: "Error",
          description: result.error || 'Failed to fetch voucher',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [companyId, divisionId, toast]);

  const updateVoucher = useCallback(async (voucherId: string, updates: any) => {
    try {
      const result = await externalTallyApi.updateVoucher(companyId, divisionId, voucherId, updates);
      
      if (result.success) {
        setVouchers(prev => 
          prev.map(v => v.id === voucherId ? { ...v, ...result.data } : v)
        );
        toast({
          title: "Success",
          description: "Voucher updated successfully"
        });
        return result.data;
      } else {
        setError(result.error || 'Failed to update voucher');
        toast({
          title: "Error",
          description: result.error || 'Failed to update voucher',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [companyId, divisionId, toast]);

  const syncFromTally = useCallback(async (fromDate: string, toDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await externalTallyApi.syncFromTally(companyId, divisionId, fromDate, toDate);
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${result.data.storedVouchers || 0} vouchers from Tally`
        });
        await fetchVouchers();
        return result.data;
      } else {
        setError(result.error || 'Sync failed');
        toast({
          title: "Sync Failed",
          description: result.error || 'Failed to sync from Tally',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, divisionId, toast, fetchVouchers]);

  const exportVoucherXml = useCallback(async (voucherId: string) => {
    try {
      const result = await externalTallyApi.exportVoucherXml(companyId, divisionId, voucherId);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to export XML');
        toast({
          title: "Export Failed",
          description: result.error || 'Failed to export voucher XML',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [companyId, divisionId, toast]);

  return {
    vouchers,
    loading,
    error,
    pagination,
    health,
    fetchVouchers,
    getVoucher,
    updateVoucher,
    syncFromTally,
    exportVoucherXml,
    checkHealth
  };
};