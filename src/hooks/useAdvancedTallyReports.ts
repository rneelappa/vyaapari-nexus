import { useState, useCallback } from 'react';
import { externalTallyApi } from '@/services/external-tally-api';
import { useToast } from '@/hooks/use-toast';

interface ReportsState {
  trialBalance: any[];
  profitLoss: any;
  balanceSheet: any;
  loading: boolean;
  error: string | null;
}

export const useAdvancedTallyReports = (companyId: string, divisionId: string) => {
  const [reportsData, setReportsData] = useState<ReportsState>({
    trialBalance: [],
    profitLoss: null,
    balanceSheet: null,
    loading: false,
    error: null
  });
  const { toast } = useToast();

  const fetchTrialBalance = useCallback(async (fromDate: string, toDate: string) => {
    setReportsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getTrialBalance(companyId, divisionId, fromDate, toDate);
      
      if (result.success) {
        setReportsData(prev => ({ 
          ...prev, 
          trialBalance: Array.isArray(result.data) ? result.data : result.data?.accounts || []
        }));
        toast({
          title: "Success",
          description: "Trial balance fetched successfully"
        });
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch trial balance';
        setReportsData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setReportsData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setReportsData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const fetchProfitLoss = useCallback(async (fromDate: string, toDate: string) => {
    setReportsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getProfitLoss(companyId, divisionId, fromDate, toDate);
      
      if (result.success) {
        setReportsData(prev => ({ ...prev, profitLoss: result.data }));
        toast({
          title: "Success",
          description: "Profit & Loss statement fetched successfully"
        });
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch profit & loss';
        setReportsData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setReportsData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setReportsData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const fetchBalanceSheet = useCallback(async (fromDate: string, toDate: string) => {
    setReportsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getBalanceSheet(companyId, divisionId, fromDate, toDate);
      
      if (result.success) {
        setReportsData(prev => ({ ...prev, balanceSheet: result.data }));
        toast({
          title: "Success",
          description: "Balance sheet fetched successfully"
        });
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch balance sheet';
        setReportsData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setReportsData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setReportsData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const clearReportsData = useCallback(() => {
    setReportsData({
      trialBalance: [],
      profitLoss: null,
      balanceSheet: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...reportsData,
    fetchTrialBalance,
    fetchProfitLoss,
    fetchBalanceSheet,
    clearReportsData
  };
};