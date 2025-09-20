import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Clock, 
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  Copy,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useVtSync } from '@/hooks/useVtSync';
import { useDatabaseDiagnosis } from '@/hooks/useDatabaseDiagnosis';
import { supabase } from '@/integrations/supabase/client';

interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  startTime: Date | null;
  endTime: Date | null;
}

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
}

interface TallySyncProps {
  companyId?: string;
  divisionId?: string;
}

export function TallySync({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: TallySyncProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    currentStep: 'Ready to sync',
    progress: 0,
    totalRecords: 0,
    processedRecords: 0,
    errors: [],
    startTime: null,
    endTime: null
  });

  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);

  const { 
    performSync: performVtSync, 
    isSyncing: vtProcessing, 
    syncProgress: vtSyncProgress,
    lastSyncResult 
  } = useVtSync();
  const { diagnosisData, isLoading: diagnosisLoading, runDiagnosis } = useDatabaseDiagnosis(companyId, divisionId);
  const { toast } = useToast();

  // Set default date range (April 1, 2025 to today)
  const defaultFromDate = new Date('2025-04-01');
  const defaultToDate = new Date();

  const addDebugLog = (level: DebugLog['level'], message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    setDebugLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const performTallySync = async () => {
    try {
      setSyncProgress({
        status: 'syncing',
        currentStep: 'Initializing sync...',
        progress: 0,
        totalRecords: 0,
        processedRecords: 0,
        errors: [],
        startTime: new Date(),
        endTime: null
      });

      addDebugLog('info', `Starting VT migration for company: ${companyId}, division: ${divisionId}`);
      
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Initializing VT schema migration...',
        progress: 5
      }));

      addDebugLog('info', 'Step 1: Schema validation and preparation');
      setSyncProgress(prev => ({ ...prev, currentStep: 'Validating VT schema...', progress: 10 }));

      addDebugLog('info', 'Step 2: Extracting data from Tally schema tables');
      setSyncProgress(prev => ({ ...prev, currentStep: 'Extracting source data...', progress: 20 }));

      addDebugLog('info', 'Step 3: Data transformation and validation');
      setSyncProgress(prev => ({ ...prev, currentStep: 'Transforming data structures...', progress: 40 }));

      addDebugLog('info', 'Step 4: Inserting into VT schema tables');
      setSyncProgress(prev => ({ ...prev, currentStep: 'Migrating to VT schema...', progress: 60 }));

      // Perform VT schema migration
      const result = await performVtSync(companyId, divisionId);
      
      if (result?.success) {
        const totalRecords = result.totalRecords || 0;
        const totalInserted = result.totalInserted || 0;
        const totalUpdated = result.totalUpdated || 0;
        const totalErrors = result.totalErrors || 0;

        setSyncProgress(prev => ({
          ...prev,
          status: totalErrors > 0 ? 'error' : 'completed',
          currentStep: totalErrors > 0 ? 
            `Sync completed with ${totalErrors} errors` : 
            'Sync completed successfully',
          progress: 100,
          totalRecords,
          processedRecords: totalInserted + totalUpdated,
          errors: totalErrors > 0 ? [`${totalErrors} errors occurred during sync`] : [],
          endTime: new Date()
        }));

        setSyncResults(result);
        
        addDebugLog('success', `VT migration completed successfully!`, {
          totalRecords,
          recordsProcessed: result.recordsProcessed,
          recordsSkipped: result.recordsSkipped,
          errors: totalErrors,
          duration: result.duration,
          tableResults: result.tableResults
        });

        toast({
          title: "VT Migration Complete", 
          description: `Successfully migrated ${totalInserted + totalUpdated} records to VT schema`,
        });

        // Run diagnosis after sync
        await runDiagnosis();
        
      } else {
        throw new Error(result?.error || 'Sync failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog('error', 'VT migration failed:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Sync failed - check debug logs for details',
        errors: [...prev.errors, `Sync Error: ${errorMessage}`],
        endTime: new Date()
      }));

      toast({
        title: "VT Migration Failed",
        description: `Migration failed: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const getSyncDuration = () => {
    if (!syncProgress.startTime) return 0;
    const endTime = syncProgress.endTime || new Date();
    return Math.round((endTime.getTime() - syncProgress.startTime.getTime()) / 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VT Schema Migration</h1>
          <p className="text-muted-foreground">
            Migrate Tally data to VT schema with advanced data transformation and validation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center"
          >
            <Activity className="h-4 w-4 mr-2" />
            Debug Panel ({debugLogs.length})
          </Button>
          <Button 
            onClick={performTallySync} 
            disabled={syncProgress.status === 'syncing'}
            className="flex items-center"
          >
            {syncProgress.status === 'syncing' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {syncProgress.status === 'syncing' ? 'Migrating...' : 'VT Migration'}
          </Button>
        </div>
      </div>

      {/* Sync Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Migration Configuration
          </CardTitle>
          <CardDescription>
            VT schema migration from tally schema with data validation and transformation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Source Schema</div>
              <div className="text-lg font-semibold">Tally Schema</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Target Schema</div>
              <div className="text-lg font-semibold">VT Schema</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Features</div>
              <div className="text-sm">
                <Badge variant="secondary" className="text-xs">Data Validation</Badge>
                <Badge variant="secondary" className="text-xs ml-1">Schema Migration</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      {showDebugPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Debug Panel
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const logText = debugLogs.map(log => 
                      `[${log.level.toUpperCase()}] ${new Date(log.timestamp).toLocaleTimeString()}\n${log.message}`
                    ).join('\n');
                    navigator.clipboard.writeText(logText);
                    toast({ title: "Debug logs copied to clipboard" });
                  }}
                >
                  Copy All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDebugLogs([])}
                >
                  Clear Logs
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Real-time VT migration logs with detailed transformation steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {debugLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No debug logs yet. Start a VT migration to see detailed logs.
                  </p>
                ) : (
                  debugLogs.map((log, index) => (
                     <div 
                      key={index} 
                      className={`p-3 rounded-lg border text-sm font-mono relative group ${
                        log.level === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
                        log.level === 'warn' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                        log.level === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
                        'border-blue-200 bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${
                          log.level === 'error' ? 'text-red-600' :
                          log.level === 'warn' ? 'text-yellow-600' :
                          log.level === 'success' ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs opacity-70">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const logText = `[${log.level.toUpperCase()}] ${new Date(log.timestamp).toLocaleTimeString()}\n${log.message}`;
                              navigator.clipboard.writeText(logText);
                              toast({ title: "Log entry copied to clipboard" });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <pre className="whitespace-pre-wrap break-words">{log.message}</pre>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Sync Progress */}
      {syncProgress.status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Sync Progress
              </div>
              <Badge variant={
                syncProgress.status === 'completed' ? 'default' :
                syncProgress.status === 'error' ? 'destructive' : 'secondary'
              }>
                {syncProgress.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{syncProgress.currentStep}</span>
                  <span className="text-sm text-muted-foreground">{syncProgress.progress}%</span>
                </div>
                <Progress value={syncProgress.progress} className="w-full" />
              </div>

              {/* Sync Statistics */}
              {syncProgress.totalRecords > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {syncProgress.totalRecords}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {syncProgress.processedRecords}
                    </div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {syncProgress.errors.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {getSyncDuration()}s
                    </div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                </div>
              )}

              {/* Errors Display */}
              {syncProgress.errors.length > 0 && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-semibold text-red-600">Sync Errors</span>
                  </div>
                  <ScrollArea className="h-24">
                    {syncProgress.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">
                        {error}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Results */}
      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {syncResults.totalRecords}
                </div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {syncResults.totalInserted}
                </div>
                <div className="text-sm text-muted-foreground">Inserted</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {syncResults.totalUpdated}
                </div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(syncResults.duration / 1000)}s
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>

            {syncResults.results && syncResults.results.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Tables Processed</h4>
                <div className="space-y-2">
                  {syncResults.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <span className="font-medium">{result.table}</span>
                        <Badge 
                          variant={result.status === 'success' ? 'default' : 'destructive'} 
                          className="ml-2"
                        >
                          {result.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.records_fetched} fetched, {result.records_inserted} inserted, {result.records_updated} updated
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TallySync;