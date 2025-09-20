import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessResult {
  table: string;
  action: 'inserted' | 'updated' | 'ignored' | 'created_master' | 'error';
  guid: string;
  record_type: 'voucher' | 'ledger' | 'stock_item' | 'godown' | 'voucher_type' | 'accounting' | 'inventory';
  details?: any;
  error?: string;
}

interface LiveUpdate {
  type: 'progress' | 'complete' | 'error';
  message: string;
  record?: ProcessResult;
  progress?: {
    current: number;
    total: number;
    stage: string;
  };
}

interface EnhancedSyncResult {
  success: boolean;
  results: ProcessResult[];
  liveUpdates: LiveUpdate[];
  summary: {
    total: number;
    inserted: number;
    updated: number;
    ignored: number;
    created_master: number;
    errors: number;
    by_table: Record<string, number>;
  };
  error?: string;
}

export const useEnhancedTallySync = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<LiveUpdate | null>(null);
  const [allResults, setAllResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<EnhancedSyncResult['summary'] | null>(null);
  const { toast } = useToast();

  const processXmlData = useCallback(async (
    xmlText: string, 
    divisionId: string, 
    companyId: string | null,
    onProgress?: (update: LiveUpdate) => void
  ): Promise<EnhancedSyncResult> => {
    setIsProcessing(true);
    setAllResults([]);
    setSummary(null);
    setCurrentProgress(null);

    try {
      const { data, error } = await supabase.functions.invoke('enhanced-xml-parser', {
        body: {
          xmlText,
          divisionId,
          companyId,
          enableLiveUpdates: true
        }
      });

      if (error) throw error;

      if (data.success) {
        setAllResults(data.results);
        setSummary(data.summary);

        // Process live updates if available
        if (data.liveUpdates && onProgress) {
          for (const update of data.liveUpdates) {
            setCurrentProgress(update);
            onProgress(update);
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        toast({
          title: "Processing Complete",
          description: `Processed ${data.summary.total} records: ${data.summary.inserted} inserted, ${data.summary.updated} updated, ${data.summary.created_master} master records created`,
        });

        return data;
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Enhanced XML processing error:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process XML data",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentProgress(null);
    }
  }, [toast]);

  const getRecordsByType = useCallback((recordType: string) => {
    return allResults.filter(result => result.record_type === recordType);
  }, [allResults]);

  const getRecordsByAction = useCallback((action: string) => {
    return allResults.filter(result => result.action === action);
  }, [allResults]);

  const getRecordsByTable = useCallback((table: string) => {
    return allResults.filter(result => result.table === table);
  }, [allResults]);

  return {
    isProcessing,
    currentProgress,
    allResults,
    summary,
    processXmlData,
    getRecordsByType,
    getRecordsByAction,
    getRecordsByTable
  };
};