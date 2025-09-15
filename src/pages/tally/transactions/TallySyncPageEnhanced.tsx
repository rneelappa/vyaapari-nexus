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
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tallyApi, type ApiResponse } from '@/services/tallyApiService';

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
  totalVouchers: number;
  storedVouchers: number;
  errorCount: number;
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  method: string;
  entityCounts: {
    ledgers: number;
    groups: number;
    stockItems: number;
    voucherTypes: number;
  };
  businessInsights: {
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
  const { toast } = useToast();

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

  const performEnhancedSync = async () => {
    try {
      setSyncProgress({
        status: 'syncing',
        currentStep: 'Initializing sync...',
        progress: 0,
        totalVouchers: 0,
        processedVouchers: 0,
        errors: [],
        startTime: new Date(),
        endTime: null,
        estimatedTimeRemaining: 0
      });

      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');

      console.log('Starting enhanced sync...', { fromDate, toDate, chunkDays });

      // Update progress
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Syncing vouchers from Tally...',
        progress: 25
      }));

      // Perform voucher sync
      const syncResponse = await tallyApi.syncVouchers(companyId, divisionId, {
        fromDate,
        toDate,
        chunkDays
      });

      if (!syncResponse.success) {
        throw new Error(syncResponse.error || 'Sync failed');
      }

      // Update progress
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Loading entity counts...',
        progress: 50,
        totalVouchers: syncResponse.data.totalVouchers,
        processedVouchers: syncResponse.data.storedVouchers
      }));

      // Load entity counts for insights
      const [ledgersResponse, groupsResponse, stockItemsResponse, voucherTypesResponse] = await Promise.all([
        tallyApi.getLedgers(companyId, divisionId, { limit: 1 }),
        tallyApi.getGroups(companyId, divisionId, { limit: 1 }),
        tallyApi.getStockItems(companyId, divisionId, { limit: 1 }),
        tallyApi.getVoucherTypes(companyId, divisionId, { limit: 1 })
      ]);

      // Update progress
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Generating business insights...',
        progress: 75
      }));

      // Generate business insights
      const vouchers = await tallyApi.getVouchers(companyId, divisionId);
      const voucherData = vouchers.success ? vouchers.data.vouchers : [];
      
      const businessInsights = {
        peakMonth: dateRange.from.toLocaleString('default', { month: 'long' }),
        totalValue: voucherData.reduce((sum, v) => sum + (v.amount || 0), 0),
        averageVoucherValue: voucherData.length > 0 ? voucherData.reduce((sum, v) => sum + (v.amount || 0), 0) / voucherData.length : 0,
        topVoucherType: voucherData.length > 0 ? voucherData[0].type : 'N/A'
      };

      const results: SyncResults = {
        totalVouchers: syncResponse.data.totalVouchers,
        storedVouchers: syncResponse.data.storedVouchers,
        errorCount: syncResponse.data.errorCount,
        dateRange: syncResponse.data.dateRange,
        method: syncResponse.data.method || 'Enhanced API Sync',
        entityCounts: {
          ledgers: ledgersResponse.metadata.pagination?.total || 0,
          groups: groupsResponse.metadata.pagination?.total || 0,
          stockItems: stockItemsResponse.metadata.pagination?.total || 0,
          voucherTypes: voucherTypesResponse.metadata.pagination?.total || 0
        },
        businessInsights
      };

      // Update progress to complete
      setSyncProgress(prev => ({
        ...prev,
        status: 'completed',
        currentStep: 'Sync completed successfully!',
        progress: 100,
        endTime: new Date()
      }));

      setSyncResults(results);

      // Save to sync history
      const newHistory = [results, ...syncHistory.slice(0, 9)]; // Keep last 10
      setSyncHistory(newHistory);
      localStorage.setItem(`sync-history-${companyId}-${divisionId}`, JSON.stringify(newHistory));

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${results.totalVouchers} vouchers with complete analysis`,
      });

    } catch (error) {
      console.error('Enhanced sync failed:', error);
      
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Sync failed',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));

      toast({
        title: "Sync Failed",
        description: "Failed to sync data from Tally",
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
            Live API Connection
          </Badge>
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

            {/* Advanced Options */}
            <div>
              <label className="text-sm font-medium mb-2 block">Options</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                Advanced Options
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="entities">Entity Counts</TabsTrigger>
                <TabsTrigger value="insights">Business Insights</TabsTrigger>
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
                    <div className="text-xl font-bold">{syncResults.entityCounts.ledgers}</div>
                    <div className="text-sm text-muted-foreground">Ledgers Available</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults.entityCounts.groups}</div>
                    <div className="text-sm text-muted-foreground">Groups Available</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults.entityCounts.stockItems}</div>
                    <div className="text-sm text-muted-foreground">Stock Items</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold">{syncResults.entityCounts.voucherTypes}</div>
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
                      {syncResults.businessInsights.peakMonth} shows highest activity with {syncResults.totalVouchers} vouchers
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-semibold">Transaction Value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total value: ₹{syncResults.businessInsights.totalValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-semibold">Average Value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{syncResults.businessInsights.averageVoucherValue.toLocaleString('en-IN')} per voucher
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-semibold">Top Voucher Type</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {syncResults.businessInsights.topVoucherType} is most frequent
                    </p>
                  </div>
                </div>
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

  function getSyncDuration(): number {
    if (!syncProgress.startTime) return 0;
    const endTime = syncProgress.endTime || new Date();
    return Math.round((endTime.getTime() - syncProgress.startTime.getTime()) / 1000);
  }
}

export default TallySyncPageEnhanced;
