import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  currentTable?: string;
  progress: number;
  totalTables: number;
  processedTables: number;
  errors: string[];
  startTime: Date | null;
  endTime: Date | null;
}

interface TableSyncResult {
  records: number;
  inserted: number;
  updated: number;
  errors: number;
  error?: string;
}

interface FullSyncResult {
  success: boolean;
  jobId?: string;
  tablesProcessed: Record<string, TableSyncResult>;
  totalRecords: number;
  totalInserted: number;
  totalUpdated: number;
  totalErrors: number;
  startTime: string;
  endTime?: string;
  error?: string;
}

export const useFullTallySync = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    progress: 0,
    totalTables: 0,
    processedTables: 0,
    errors: [],
    startTime: null,
    endTime: null
  });
  const [lastSyncResult, setLastSyncResult] = useState<FullSyncResult | null>(null);
  const { toast } = useToast();

  const performFullSync = useCallback(async (
    companyId: string,
    divisionId: string,
    tables?: string[]
  ): Promise<FullSyncResult> => {
    setIsProcessing(true);
    setSyncProgress({
      status: 'syncing',
      progress: 0,
      totalTables: tables?.length || 10,
      processedTables: 0,
      errors: [],
      startTime: new Date(),
      endTime: null
    });

    try {
      console.log('Starting full Tally sync via Supabase function...');

      const { data, error } = await supabase.functions.invoke('tally-full-sync', {
        body: {
          companyId,
          divisionId,
          tables,
          action: 'full_sync'
        }
      });

      if (error) throw error;

      if (data.success) {
        const result: FullSyncResult = data.data;
        
        setSyncProgress(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          endTime: new Date()
        }));

        setLastSyncResult(result);

        toast({
          title: "Full Sync Complete",
          description: `Successfully processed ${result.totalRecords} records across ${Object.keys(result.tablesProcessed).length} tables`,
        });

        return result;
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Full sync error:', error);
      
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        errors: [...prev.errors, error.message]
      }));

      toast({
        title: "Sync Failed",
        description: error.message || "Failed to perform full sync",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const checkApiHealth = useCallback(async (companyId: string, divisionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tally-full-sync', {
        body: {
          companyId,
          divisionId,
          action: 'health_check'
        }
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      console.error('Health check error:', error);
      return null;
    }
  }, []);

  const getApiMetadata = useCallback(async (companyId: string, divisionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tally-full-sync', {
        body: {
          companyId,
          divisionId,
          action: 'metadata'
        }
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      console.error('Metadata fetch error:', error);
      return null;
    }
  }, []);

  return {
    isProcessing,
    syncProgress,
    lastSyncResult,
    performFullSync,
    checkApiHealth,
    getApiMetadata
  };
};