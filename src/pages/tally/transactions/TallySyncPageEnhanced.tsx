import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Download, 
  Clock, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Play, 
  Database, 
  Package, 
  FileText, 
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Network,
  Target,
  Award,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tallyApi, type ApiResponse } from '@/services/tallyApiService';
import { useFullTallySync } from '@/hooks/useFullTallySync';
import { useRailwayTallySync } from '@/hooks/useRailwayTallySync';
import { useDatabaseDiagnosis } from '@/hooks/useDatabaseDiagnosis';

interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  totalVouchers: number;
  processedVouchers: number;
  errors: string[];
  startTime: Date | null;
  endTime: Date | null;
  estimatedTimeRemaining: number;
}

interface SyncResults {
  lastSyncTime?: string;
  totalRecords: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: number;
  duration: number;
  byTable: Record<string, any>;
  totalVouchers?: number;
  storedVouchers?: number;
  errorCount?: number;
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
  method?: string;
  entityCounts?: {
    ledgers: number;
    groups: number;
    stockItems: number;
    voucherTypes: number;
  };
  businessInsights?: {
    peakMonth: string;
    totalValue: number;
    averageVoucherValue: number;
    topVoucherType: string;
  };
}

interface TallySyncPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function TallySyncPageEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: TallySyncPageEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    currentStep: '',
    progress: 0,
    totalVouchers: 0,
    processedVouchers: 0,
    errors: [],
    startTime: null,
    endTime: null,
    estimatedTimeRemaining: 0
  });
  
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [chunkDays, setChunkDays] = useState(7);
  const [syncHistory, setSyncHistory] = useState<SyncResults[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: string, level: string, message: string}>>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isFullDatabaseSync, setIsFullDatabaseSync] = useState(false);
  const [useRailwayApi, setUseRailwayApi] = useState(true);
  const { toast } = useToast();
  
  // New hooks for enhanced functionality
  const { 
    isProcessing: isFullSyncing, 
    syncProgress: fullSyncProgress,
    lastSyncResult,
    performFullSync,
    checkApiHealth,
    getApiMetadata
  } = useFullTallySync();
  
  const { 
    isProcessing: isRailwayProcessing, 
    syncProgress: railwaySyncProgress,
    lastSyncResult: lastRailwaySyncResult,
    performRailwaySync,
    checkRailwayApiHealth,
    getRailwayApiMetadata
  } = useRailwayTallySync();
  
  const {
    diagnosisData,
    isLoading: isDiagnosisLoading,
    error: diagnosisError,
    runDiagnosis
  } = useDatabaseDiagnosis(companyId, divisionId);

  useEffect(() => {
    loadSyncHistory();
  }, [companyId, divisionId]);

  const loadSyncHistory = async () => {
    // Load previous sync results from local storage or API
    const history = localStorage.getItem(`sync-history-${companyId}-${divisionId}`);
    if (history) {
      setSyncHistory(JSON.parse(history));
    }
  };

  // Enhanced debug logging function
  const addDebugLog = (level: 'info' | 'warn' | 'error' | 'success', message: string, data?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: data ? `${message} ${JSON.stringify(data, null, 2)}` : message
    };
    
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 logs
    
    // Also log to console with emojis for better visibility
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️', 
      error: '❌',
      success: '✅'
    }[level];
    
    console.log(`${emoji} ${message}`, data || '');
  };

  const performEnhancedSync = async () => {
    try {
      // Clear previous logs
      setDebugLogs([]);
      
      addDebugLog('info', 'Starting Enhanced Supabase Sync...', { 
        companyId, 
        divisionId, 
        dateRange: {
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd')
        }
      });

      setSyncProgress({
        status: 'syncing',
        currentStep: 'Initializing Supabase sync...',
        progress: 0,
        totalVouchers: 0,
        processedVouchers: 0,
        errors: [],
        startTime: new Date(),
        endTime: null,
        estimatedTimeRemaining: 0
      });

      // Step 1: API Health Check
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Checking Tally API health...',
        progress: 10
      }));

      addDebugLog('info', 'Checking API health...');
      const healthCheck = await checkApiHealth(companyId, divisionId);
      addDebugLog('info', 'API Health Response:', healthCheck);

      if (!healthCheck) {
        addDebugLog('warn', 'API health check failed, proceeding anyway...');
        setSyncProgress(prev => ({
          ...prev,
          errors: [...prev.errors, 'API health check failed - Tally system may be offline']
        }));
      } else {
        addDebugLog('success', 'API health check passed');
      }

      // Step 2: Get API Metadata
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Fetching API metadata...',
        progress: 20
      }));

      addDebugLog('info', 'Getting API metadata...');
      const metadata = await getApiMetadata(companyId, divisionId);
      addDebugLog('info', 'API Metadata received:', metadata);

      // Step 3: Perform Full Sync using Supabase function
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Performing full data sync via Supabase...',
        progress: 30
      }));

      // Use table filter based on sync type selection
      const tableFilter = isFullDatabaseSync ? undefined : [
        'mst_group',
        'mst_ledger', 
        'mst_stock_item',
        'mst_godown',
        'mst_vouchertype',
        'tally_trn_voucher',
        'trn_accounting'
      ];
      
      if (useRailwayApi) {
        addDebugLog('info', 'Starting Railway API sync...');
        addDebugLog('info', `Railway sync payload (${isFullDatabaseSync ? 'Full Database' : 'Selective'} sync):`, { companyId, divisionId, tables: tableFilter });

        const railwaySyncResult = await performRailwaySync(companyId, divisionId, tableFilter);
        addDebugLog('success', 'Railway API Sync completed:', {
          jobId: railwaySyncResult.jobId,
          totals: {
            records: railwaySyncResult.totalRecords,
            inserted: railwaySyncResult.totalInserted,
            updated: railwaySyncResult.totalUpdated,
            errors: railwaySyncResult.totalErrors
          },
          results: railwaySyncResult.results
        });

        // Log detailed results for each table
        railwaySyncResult.results.forEach(result => {
          if (result.status === 'failed') {
            addDebugLog('error', `${result.table} (${result.api_table}): ${result.error}`, result);
          } else {
            addDebugLog('info', `${result.table} (${result.api_table}): ${result.records_fetched} fetched, ${result.records_inserted} inserted, ${result.errors} errors`, result);
          }
        });

        setSyncResults({
          lastSyncTime: new Date().toISOString(),
          totalRecords: railwaySyncResult.totalRecords,
          recordsInserted: railwaySyncResult.totalInserted,
          recordsUpdated: railwaySyncResult.totalUpdated,
          errors: railwaySyncResult.totalErrors,
          duration: railwaySyncResult.duration,
          byTable: railwaySyncResult.results.reduce((acc: any, result) => {
            acc[result.table] = {
              fetched: result.records_fetched,
              inserted: result.records_inserted,
              updated: result.records_updated,
              errors: result.errors
            };
            return acc;
          }, {})
        });
      } else {
        addDebugLog('info', 'Starting full sync with Supabase function...');
        addDebugLog('info', `Supabase invoke payload (${isFullDatabaseSync ? 'Full Database' : 'Selective'} sync):`, { companyId, divisionId, tables: tableFilter });

        const fullSyncResult = await performFullSync(companyId, divisionId, tableFilter);
        addDebugLog('success', 'Full Sync completed:', {
          jobId: fullSyncResult.jobId,
          totals: {
            records: fullSyncResult.totalRecords,
            inserted: fullSyncResult.totalInserted,
            updated: fullSyncResult.totalUpdated,
            errors: fullSyncResult.totalErrors
          }
        });

        setSyncResults({
          lastSyncTime: new Date().toISOString(),
          totalRecords: fullSyncResult.totalRecords,
          recordsInserted: fullSyncResult.totalInserted,
          recordsUpdated: fullSyncResult.totalUpdated,
          errors: fullSyncResult.totalErrors,
          duration: 0,
          byTable: {}
        });

        addDebugLog('success', 'Full Sync completed:', {
          jobId: fullSyncResult.jobId,
          totals: {
            totalRecords: fullSyncResult.totalRecords,
            totalInserted: fullSyncResult.totalInserted,
            totalUpdated: fullSyncResult.totalUpdated,
            totalErrors: fullSyncResult.totalErrors,
          }
        });
      }

      // Step 4: Generate comprehensive insights
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Generating business insights...',
        progress: 80
      }));

      addDebugLog('success', 'Enhanced sync completed successfully!');

      // Update progress to complete
      setSyncProgress(prev => ({
        ...prev,
        status: 'completed',
        currentStep: 'Enhanced sync completed successfully!',
        progress: 100,
        endTime: new Date()
      }));

      // Save to sync history
      const newHistory = [syncResults, ...syncHistory.slice(0, 9)];
      setSyncHistory(newHistory);
      localStorage.setItem(`sync-history-${companyId}-${divisionId}`, JSON.stringify(newHistory));

      toast({
        title: "Enhanced Sync Complete",
        description: `Successfully synced ${syncResults.totalRecords} records`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog('error', 'Enhanced sync failed:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Sync failed - check console for details',
        errors: [...prev.errors, `Sync Error: ${errorMessage}`]
      }));

      toast({
        title: "Enhanced Sync Failed",
        description: `Supabase sync failed: ${errorMessage}`,
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
          <h1 className="text-2xl font-bold">Enhanced Tally Sync</h1>
          <p className="text-muted-foreground">
            Real-time synchronization with comprehensive business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Database className="h-4 w-4 mr-1" />
            Supabase Edge Function
          </Badge>
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
            onClick={performEnhancedSync} 
            disabled={syncProgress.status === 'syncing'}
            className="flex items-center"
          >
            {syncProgress.status === 'syncing' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {syncProgress.status === 'syncing' ? 'Syncing...' : 'Start Enhanced Sync'}
          </Button>
        </div>
      </div>

      {/* Sync Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Sync Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Chunk Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Chunk Size (Days)</label>
              <select 
                value={chunkDays} 
                onChange={(e) => setChunkDays(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            {/* API Source */}
            <div>
              <label className="text-sm font-medium mb-2 block">API Source</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiSource"
                    checked={useRailwayApi}
                    onChange={() => setUseRailwayApi(true)}
                    className="form-radio"
                  />
                  <span className="text-sm">Railway API (Recommended)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiSource"
                    checked={!useRailwayApi}
                    onChange={() => setUseRailwayApi(false)}
                    className="form-radio"
                  />
                  <span className="text-sm">Supabase API</span>
                </label>
              </div>
            </div>

            {/* Sync Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sync Type</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="syncType"
                    checked={!isFullDatabaseSync}
                    onChange={() => setIsFullDatabaseSync(false)}
                    className="form-radio"
                  />
                  <span className="text-sm">Selective Sync</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="syncType"
                    checked={isFullDatabaseSync}
                    onChange={() => setIsFullDatabaseSync(true)}
                    className="form-radio"
                  />
                  <span className="text-sm">Full Database Sync</span>
                </label>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  Advanced Options
                </Button>
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
                Debug Logs
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{debugLogs.length} logs</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const logText = debugLogs.map(log => 
                      `[${log.level.toUpperCase()}] ${new Date(log.timestamp).toLocaleTimeString()}\n${log.message}\n`
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
              Real-time sync debugging and API interaction logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {debugLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No debug logs yet. Start a sync to see detailed logs.
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
              {syncProgress.totalVouchers > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {syncProgress.totalVouchers}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Vouchers</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {syncProgress.processedVouchers}
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
              Sync Results & Business Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="entities">Entity Counts</TabsTrigger>
                <TabsTrigger value="insights">Business Insights</TabsTrigger>
                <TabsTrigger value="diagnosis">Database Diagnosis</TabsTrigger>
                <TabsTrigger value="debug">Debug Logs</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {syncResults.totalVouchers}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Vouchers</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResults.storedVouchers}
                    </div>
                    <div className="text-sm text-muted-foreground">Successfully Stored</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {syncResults.errorCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {syncResults.method}
                    </div>
                    <div className="text-sm text-muted-foreground">Sync Method</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="entities" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults?.entityCounts?.ledgers ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Ledgers Available</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults?.entityCounts?.groups ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Groups Available</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults?.entityCounts?.stockItems ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Stock Items</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults?.entityCounts?.voucherTypes ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Voucher Types</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Award className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="font-semibold">Peak Performance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {syncResults?.businessInsights?.peakMonth ?? 'N/A'} shows highest activity with {syncResults?.totalVouchers ?? 0} vouchers
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-semibold">Transaction Value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total value: ₹{(syncResults?.businessInsights?.totalValue ?? 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-semibold">Average Value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{(syncResults?.businessInsights?.averageVoucherValue ?? 0).toLocaleString('en-IN')} per voucher
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-semibold">Top Voucher Type</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {syncResults?.businessInsights?.topVoucherType ?? 'N/A'} is most frequent
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="diagnosis" className="space-y-4">
                {isDiagnosisLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                    <span>Running comprehensive diagnosis...</span>
                  </div>
                ) : diagnosisData ? (
                  <div className="space-y-6">
                    {/* API Health Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          API Health Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {diagnosisData.apiHealth.map((health, index) => (
                            <div key={index} className="text-center p-3 border rounded-lg">
                              <div className={`text-lg font-bold ${
                                health.status === 'healthy' ? 'text-green-600' :
                                health.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {health.status === 'healthy' ? '✓' : 
                                 health.status === 'warning' ? '⚠' : '✗'}
                              </div>
                              <div className="text-sm font-medium">{health.endpoint}</div>
                              <div className="text-xs text-muted-foreground">{health.responseTime}ms</div>
                              {health.errorMessage && (
                                <div className="text-xs text-red-600 mt-1">{health.errorMessage}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Table Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Database className="h-5 w-5 mr-2" />
                          Table Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {diagnosisData.tableOverview.map((table, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                  table.hasData ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <span className="font-medium">{table.tableName}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{table.recordCount.toLocaleString()} records</div>
                                <div className="text-xs text-muted-foreground">
                                  {table.lastUpdated ? format(new Date(table.lastUpdated), 'MMM dd, yyyy') : 'Never synced'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Migration Completeness */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Migration Completeness
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {diagnosisData.migrationCompleteness.map((migration, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{migration.table}</span>
                                <span className={`text-sm font-bold ${
                                  migration.completeness >= 95 ? 'text-green-600' :
                                  migration.completeness >= 80 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {migration.completeness}%
                                </span>
                              </div>
                              <Progress value={migration.completeness} className="w-full" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Local: {migration.localRecords}</span>
                                <span>API: {migration.apiRecords}</span>
                                {migration.gaps > 0 && <span className="text-red-600">Gap: {migration.gaps}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Full Sync Button */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Zap className="h-5 w-5 mr-2" />
                          Full Sync Operations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button 
                            onClick={() => performFullSync(companyId, divisionId)}
                            disabled={isFullSyncing}
                            className="w-full"
                          >
                            {isFullSyncing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Running Full Sync...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Perform Full Data Sync
                              </>
                            )}
                          </Button>
                          
                          {lastSyncResult && (
                            <div className="p-3 border rounded-lg bg-green-50">
                              <div className="text-sm font-medium text-green-800">Last Full Sync Results</div>
                              <div className="text-xs text-green-600 mt-1">
                                {lastSyncResult.totalRecords} records processed across {Object.keys(lastSyncResult.tablesProcessed).length} tables
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No diagnosis data available</p>
                    <Button onClick={runDiagnosis}>Run Diagnosis</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center mb-2">
                      <Zap className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-semibold">Data Quality</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sync completed with {syncResults.errorCount === 0 ? 'no errors' : `${syncResults.errorCount} errors`}. 
                      Data integrity is {syncResults.errorCount === 0 ? 'excellent' : 'good'}.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center mb-2">
                      <Network className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-semibold">Relationship Mapping</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete relationship mapping available across all {syncResults.totalVouchers} vouchers.
                      Explore entity connections for business insights.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-semibold">Monthly Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Monthly analysis available for fiscal year planning. 
                      Review seasonal patterns for business optimization.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="debug" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Real-time Debug Logs</h3>
                    <Badge variant="secondary">{debugLogs.length} entries</Badge>
                  </div>
                  
                  <ScrollArea className="h-80 border rounded-lg p-4">
                    {debugLogs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No debug logs available. Logs will appear here during sync operations.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {debugLogs.map((log, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded text-xs font-mono ${
                              log.level === 'error' ? 'bg-red-100 text-red-800' :
                              log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                              log.level === 'success' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{log.level.toUpperCase()}</span>
                              <span className="opacity-70">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <pre className="whitespace-pre-wrap">{log.message}</pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {syncHistory.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-semibold">{result.totalVouchers} vouchers</div>
                        <div className="text-sm text-muted-foreground">
                          {result.dateRange.fromDate} to {result.dateRange.toDate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{result.method}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.errorCount} errors
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TallySyncPageEnhanced;
