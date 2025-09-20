import { useState, useCallback } from 'react';
import { externalTallyApi } from '@/services/external-tally-api';
import { useToast } from '@/hooks/use-toast';

interface MasterDataState {
  ledgers: any[];
  stockItems: any[];
  groups: any[];
  units: any[];
  godowns: any[];
  loading: boolean;
  error: string | null;
}

export const useAdvancedTallyMasters = (companyId: string, divisionId: string) => {
  const [masterData, setMasterData] = useState<MasterDataState>({
    ledgers: [],
    stockItems: [],
    groups: [],
    units: [],
    godowns: [],
    loading: false,
    error: null
  });
  const { toast } = useToast();

  const fetchLedgerMasters = useCallback(async () => {
    setMasterData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getLedgerMasters(companyId, divisionId);
      
      if (result.success) {
        setMasterData(prev => ({ 
          ...prev, 
          ledgers: Array.isArray(result.data) ? result.data : result.data?.ledgers || []
        }));
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch ledger masters';
        setMasterData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setMasterData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setMasterData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const fetchStockMasters = useCallback(async () => {
    setMasterData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getStockMasters(companyId, divisionId);
      
      if (result.success) {
        setMasterData(prev => ({ 
          ...prev, 
          stockItems: Array.isArray(result.data) ? result.data : result.data?.stockItems || []
        }));
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch stock masters';
        setMasterData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setMasterData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setMasterData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const fetchGroupMasters = useCallback(async () => {
    setMasterData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await externalTallyApi.getGroupMasters(companyId, divisionId);
      
      if (result.success) {
        setMasterData(prev => ({ 
          ...prev, 
          groups: Array.isArray(result.data) ? result.data : result.data?.groups || []
        }));
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to fetch group masters';
        setMasterData(prev => ({ ...prev, error: errorMsg }));
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setMasterData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setMasterData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const fetchAllMasters = useCallback(async () => {
    setMasterData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [ledgers, stocks, groups, units, godowns] = await Promise.all([
        externalTallyApi.getLedgerMasters(companyId, divisionId),
        externalTallyApi.getStockMasters(companyId, divisionId),
        externalTallyApi.getGroupMasters(companyId, divisionId),
        externalTallyApi.getUnitMasters(companyId, divisionId),
        externalTallyApi.getGodownMasters(companyId, divisionId)
      ]);

      setMasterData(prev => ({
        ...prev,
        ledgers: ledgers.success ? (Array.isArray(ledgers.data) ? ledgers.data : ledgers.data?.ledgers || []) : [],
        stockItems: stocks.success ? (Array.isArray(stocks.data) ? stocks.data : stocks.data?.stockItems || []) : [],
        groups: groups.success ? (Array.isArray(groups.data) ? groups.data : groups.data?.groups || []) : [],
        units: units.success ? (Array.isArray(units.data) ? units.data : units.data?.units || []) : [],
        godowns: godowns.success ? (Array.isArray(godowns.data) ? godowns.data : godowns.data?.godowns || []) : []
      }));

      toast({
        title: "Success",
        description: "All master data fetched successfully"
      });

      return {
        ledgers: ledgers.data,
        stockItems: stocks.data,
        groups: groups.data,
        units: units.data,
        godowns: godowns.data
      };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setMasterData(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setMasterData(prev => ({ ...prev, loading: false }));
    }
  }, [companyId, divisionId, toast]);

  const clearMasterData = useCallback(() => {
    setMasterData({
      ledgers: [],
      stockItems: [],
      groups: [],
      units: [],
      godowns: [],
      loading: false,
      error: null
    });
  }, []);

  return {
    ...masterData,
    fetchLedgerMasters,
    fetchStockMasters,
    fetchGroupMasters,
    fetchAllMasters,
    clearMasterData
  };
};