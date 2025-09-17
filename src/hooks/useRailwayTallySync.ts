import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RailwaySyncProgress {
  currentTable?: string;
  tablesProcessed: number;
  totalTables: number;
  recordsProcessed: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
}

interface RailwaySyncResult {
  success: boolean;
  jobId: string;
  tablesProcessed: number;
  totalRecords: number;
  totalInserted: number;
  totalUpdated: number;
  totalErrors: number;
  duration: number;
  results: Array<{
    table: string;
    api_table: string;
    records_fetched: number;
    records_inserted: number;
    records_updated: number;
    errors: number;
    status: 'success' | 'failed';
    error?: string;
  }>;
  error?: string;
}

export const useRailwayTallySync = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<RailwaySyncProgress>({
    tablesProcessed: 0,
    totalTables: 0,
    recordsProcessed: 0,
    status: 'idle'
  });
  const [lastSyncResult, setLastSyncResult] = useState<RailwaySyncResult | null>(null);
  const { toast } = useToast();

  const performRailwaySync = useCallback(async (
    companyId: string,
    divisionId: string,
    tables?: string[]
  ): Promise<RailwaySyncResult> => {
    setIsProcessing(true);
    setSyncProgress({
      tablesProcessed: 0,
      totalTables: tables?.length || 6,
      recordsProcessed: 0,
      status: 'processing',
      message: 'Initializing Railway API sync...'
    });

    try {
      console.log('[Railway Sync] Starting with Railway API endpoints');
      
      const { data, error } = await supabase.functions.invoke('tally-railway-sync', {
        body: {
          companyId,
          divisionId,
          tables,
          action: 'full_sync'
        }
      });

      if (error) {
        console.error('[Railway Sync] Function invocation error:', error);
        throw error;
      }

      if (data.success) {
        console.log('[Railway Sync] Completed successfully:', data);
        
        setSyncProgress({
          tablesProcessed: data.tablesProcessed,
          totalTables: data.tablesProcessed,
          recordsProcessed: data.totalRecords,
          status: 'completed',
          message: 'Railway sync completed successfully'
        });

        setLastSyncResult(data);

        toast({
          title: "Railway Sync Complete",
          description: `Synced ${data.totalRecords} records: ${data.totalInserted} inserted, ${data.totalUpdated} updated, ${data.totalErrors} errors`,
          variant: data.totalErrors > 0 ? "destructive" : "default"
        });

        return data;
      } else {
        throw new Error(data.error || 'Railway sync failed');
      }
    } catch (error: any) {
      console.error('[Railway Sync] Error:', error);
      
      setSyncProgress({
        tablesProcessed: 0,
        totalTables: 0,
        recordsProcessed: 0,
        status: 'error',
        message: error.message || 'Railway sync failed'
      });

      toast({
        title: "Railway Sync Error",
        description: error.message || "Failed to sync with Railway API",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const checkRailwayApiHealth = useCallback(async (
    companyId: string,
    divisionId: string
  ): Promise<any | null> => {
    try {
      console.log('[Railway Sync] Checking Railway API health');
      
      const { data, error } = await supabase.functions.invoke('tally-railway-sync', {
        body: {
          companyId,
          divisionId,
          action: 'health_check'
        }
      });

      if (error) {
        console.error('[Railway Sync] Health check error:', error);
        return null;
      }

      console.log('[Railway Sync] Health check result:', data);
      return data;
    } catch (error) {
      console.error('[Railway Sync] Health check failed:', error);
      return null;
    }
  }, []);

  const getRailwayApiMetadata = useCallback(async (
    companyId: string,
    divisionId: string
  ): Promise<any | null> => {
    try {
      console.log('[Railway Sync] Getting Railway API metadata');
      
      const { data, error } = await supabase.functions.invoke('tally-railway-sync', {
        body: {
          companyId,
          divisionId,
          action: 'metadata'
        }
      });

      if (error) {
        console.error('[Railway Sync] Metadata error:', error);
        return null;
      }

      console.log('[Railway Sync] Metadata result:', data);
      return data;
    } catch (error) {
      console.error('[Railway Sync] Metadata failed:', error);
      return null;
    }
  }, []);

  return {
    isProcessing,
    syncProgress,
    lastSyncResult,
    performRailwaySync,
    checkRailwayApiHealth,
    getRailwayApiMetadata
  };
};