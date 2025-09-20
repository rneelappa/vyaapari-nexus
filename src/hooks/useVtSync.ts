import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
  currentTable?: string;
  recordsProcessed?: number;
}

interface SyncResult {
  success: boolean;
  totalRecords: number;
  recordsProcessed: number;
  recordsSkipped: number;
  errors: number;
  duration: number;
  tableResults: Record<string, {
    processed: number;
    errors: number;
    skipped: number;
  }>;
  error?: string;
}

interface ValidationResult {
  tableName: string;
  recordCount: number;
  issues: string[];
  missingReferences: number;
  duplicates: number;
}

interface ValidationResponse {
  success: boolean;
  validationResults: ValidationResult[];
  overallHealthScore: number;
  error?: string;
}

export const useVtSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [lastValidationResult, setLastValidationResult] = useState<ValidationResponse | null>(null);
  const { toast } = useToast();

  const performSync = useCallback(async (
    companyId: string,
    divisionId: string,
    tables?: string[]
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    setSyncProgress({ stage: 'Initializing', current: 0, total: 100, percentage: 0 });
    
    try {
      const { data, error } = await supabase.functions.invoke('vt-tally-sync', {
        body: {
          action: 'sync',
          companyId,
          divisionId,
          tables: tables || []
        }
      });

      if (error) throw error;

      if (data.success) {
        setLastSyncResult(data);
        setSyncProgress(null);
        
        toast({
          title: "Sync Complete",
          description: `Successfully processed ${data.recordsProcessed} records in ${data.duration}ms`,
        });

        return data;
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('VT sync error:', error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync data",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [toast]);

  const validateData = useCallback(async (
    companyId?: string,
    divisionId?: string
  ): Promise<ValidationResponse> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vt-sync-validation', {
        body: {
          action: 'validate',
          companyId,
          divisionId
        }
      });

      if (error) throw error;

      if (data.success) {
        setLastValidationResult(data);
        
        const healthScore = data.overallHealthScore;
        const variant = healthScore >= 90 ? 'default' : healthScore >= 70 ? 'default' : 'destructive';
        
        toast({
          title: "Validation Complete",
          description: `Data health score: ${healthScore}%`,
          variant,
        });

        return data;
      } else {
        throw new Error(data.error || 'Validation failed');
      }
    } catch (error: any) {
      console.error('VT validation error:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate data",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const getTableStats = useCallback(async (
    companyId?: string,
    divisionId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('vt-tally-sync', {
        body: {
          action: 'stats',
          companyId,
          divisionId
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching VT stats:', error);
      return null;
    }
  }, []);

  const clearVtData = useCallback(async (
    companyId: string,
    divisionId: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('vt-tally-sync', {
        body: {
          action: 'clear',
          companyId,
          divisionId
        }
      });

      if (error) throw error;

      toast({
        title: "Data Cleared",
        description: "VT schema data has been cleared for the selected company/division",
      });

      return data;
    } catch (error: any) {
      console.error('Error clearing VT data:', error);
      toast({
        title: "Clear Error",
        description: error.message || "Failed to clear data",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    isSyncing,
    isValidating,
    syncProgress,
    lastSyncResult,
    lastValidationResult,
    performSync,
    validateData,
    getTableStats,
    clearVtData
  };
};