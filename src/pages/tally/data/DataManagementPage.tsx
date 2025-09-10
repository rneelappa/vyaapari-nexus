/**
 * Data Management Page
 * Comprehensive interface for Tally data integration, synchronization, and monitoring
 * Provides production-ready data management capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  FileText,
  Settings,
  Play,
  Pause,
  Stop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TallyDataExtractor, { TallyDataConfig } from '@/services/tally-data-extractor';
import TallyDataSync, { SyncConfig, SyncResult } from '@/services/tally-data-sync';
import TallyDataImportExport, { ImportExportConfig, ImportResult, ExportResult } from '@/services/tally-data-import-export';
import TallyDataMonitor, { DataHealthMetrics, SyncAlert, PerformanceMetrics } from '@/services/tally-data-monitor';

export default function DataManagementPage() {
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  // Configuration
  const [tallyConfig, setTallyConfig] = useState<TallyDataConfig>({
    server: 'localhost',
    port: 9000,
    company: '',
    syncType: 'full',
    masterData: true,
    transactionData: true
  });
  
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    ...tallyConfig,
    batchSize: 100,
    retryAttempts: 3,
    conflictResolution: 'tally_wins',
    validateRelationships: true,
    createBackup: true
  });
  
  const [importExportConfig, setImportExportConfig] = useState<ImportExportConfig>({
    format: 'csv',
    includeHeaders: true,
    dateFormat: 'YYYY-MM-DD',
    encoding: 'utf-8',
    delimiter: ',',
    quoteChar: '"'
  });
  
  // Services
  const [extractor] = useState(() => new TallyDataExtractor(tallyConfig));
  const [syncService] = useState(() => new TallyDataSync(syncConfig));
  const [importExportService] = useState(() => new TallyDataImportExport(importExportConfig));
  const [monitor] = useState(() => new TallyDataMonitor());
  
  // Data
  const [healthMetrics, setHealthMetrics] = useState<Map<string, DataHealthMetrics>>(new Map());
  const [alerts, setAlerts] = useState<SyncAlert[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);

  // Load initial data
  useEffect(() => {
    loadHealthMetrics();
    loadAlerts();
    loadPerformanceMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    try {
      const metrics = await monitor.monitorDataHealth(tallyConfig.company);
      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const loadAlerts = () => {
    const alerts = monitor.getAlerts();
    setAlerts(alerts);
  };

  const loadPerformanceMetrics = () => {
    const metrics = monitor.getPerformanceMetrics();
    setPerformanceMetrics(metrics);
  };

  const handleFullSync = async () => {
    if (syncInProgress) return;
    
    setSyncInProgress(true);
    setCurrentOperation('Full Synchronization');
    setProgress(0);
    
    try {
      const result = await syncService.performFullSync();
      setSyncResults(prev => [result, ...prev]);
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Synchronized ${result.tablesProcessed.length} tables with ${result.totalRecords} records`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: `Errors: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
      
      // Refresh data
      await loadHealthMetrics();
      loadAlerts();
      loadPerformanceMetrics();
      
    } catch (error) {
      console.error('Full sync failed:', error);
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
      setCurrentOperation('');
      setProgress(0);
    }
  };

  const handleIncrementalSync = async () => {
    if (syncInProgress) return;
    
    setSyncInProgress(true);
    setCurrentOperation('Incremental Synchronization');
    setProgress(0);
    
    try {
      const result = await syncService.performIncrementalSync();
      setSyncResults(prev => [result, ...prev]);
      
      if (result.success) {
        toast({
          title: "Incremental Sync Successful",
          description: `Updated ${result.tablesProcessed.length} tables with ${result.totalRecords} records`,
        });
      } else {
        toast({
          title: "Incremental Sync Failed",
          description: `Errors: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
      
      // Refresh data
      await loadHealthMetrics();
      loadAlerts();
      loadPerformanceMetrics();
      
    } catch (error) {
      console.error('Incremental sync failed:', error);
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
      setCurrentOperation('');
      setProgress(0);
    }
  };

  const handleExportMasterData = async () => {
    setIsLoading(true);
    try {
      const result = await importExportService.exportAllMasterData(tallyConfig.company);
      setExportResults(prev => [result, ...prev]);
      
      if (result.success) {
        toast({
          title: "Export Successful",
          description: `Exported ${result.recordsExported} records to ${result.filePath}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export master data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTransactionData = async () => {
    setIsLoading(true);
    try {
      const result = await importExportService.exportAllTransactionData(tallyConfig.company);
      setExportResults(prev => [result, ...prev]);
      
      if (result.success) {
        toast({
          title: "Export Successful",
          description: `Exported ${result.recordsExported} records to ${result.filePath}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export transaction data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">
            Manage Tally data synchronization, import/export, and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadHealthMetrics}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Operation */}
      {syncInProgress && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{currentOperation} in progress...</span>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-32" />
                <span className="text-sm">{progress}%</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Synchronization Tab */}
        <TabsContent value="sync">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Full Synchronization</CardTitle>
                <CardDescription>
                  Complete data sync from Tally to Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tally-server">Tally Server</Label>
                  <Input
                    id="tally-server"
                    value={tallyConfig.server}
                    onChange={(e) => setTallyConfig(prev => ({ ...prev, server: e.target.value }))}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tally-port">Port</Label>
                  <Input
                    id="tally-port"
                    type="number"
                    value={tallyConfig.port}
                    onChange={(e) => setTallyConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                    placeholder="9000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tally-company">Company</Label>
                  <Input
                    id="tally-company"
                    value={tallyConfig.company}
                    onChange={(e) => setTallyConfig(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company ID"
                  />
                </div>
                <Button
                  onClick={handleFullSync}
                  disabled={syncInProgress || !tallyConfig.company}
                  className="w-full flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Start Full Sync
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incremental Synchronization</CardTitle>
                <CardDescription>
                  Sync only new and updated records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sync Type</Label>
                  <Select
                    value={tallyConfig.syncType}
                    onValueChange={(value: 'full' | 'incremental') => 
                      setTallyConfig(prev => ({ ...prev, syncType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Sync</SelectItem>
                      <SelectItem value="incremental">Incremental Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="master-data"
                        checked={tallyConfig.masterData}
                        onChange={(e) => setTallyConfig(prev => ({ ...prev, masterData: e.target.checked }))}
                      />
                      <Label htmlFor="master-data">Master Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="transaction-data"
                        checked={tallyConfig.transactionData}
                        onChange={(e) => setTallyConfig(prev => ({ ...prev, transactionData: e.target.checked }))}
                      />
                      <Label htmlFor="transaction-data">Transaction Data</Label>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleIncrementalSync}
                  disabled={syncInProgress || !tallyConfig.company}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start Incremental Sync
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sync Results */}
          {syncResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tables</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.success ? 'Success' : 'Failed'}</TableCell>
                        <TableCell>
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{result.tablesProcessed.length}</TableCell>
                        <TableCell>{result.totalRecords}</TableCell>
                        <TableCell>{result.duration}ms</TableCell>
                        <TableCell>{result.timestamp.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import-export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Export data to various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={importExportConfig.format}
                    onValueChange={(value: 'csv' | 'json' | 'excel') => 
                      setImportExportConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleExportMasterData}
                    disabled={isLoading || !tallyConfig.company}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Master Data
                  </Button>
                  <Button
                    onClick={handleExportTransactionData}
                    disabled={isLoading || !tallyConfig.company}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Transaction Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>
                  Import data from external sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <div className="space-y-6">
            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Data Health Metrics</CardTitle>
                <CardDescription>
                  Real-time monitoring of data quality and sync status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(healthMetrics.entries()).map(([tableName, metrics]) => (
                      <TableRow key={tableName}>
                        <TableCell className="font-medium">{tableName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metrics.syncStatus)}
                            {getStatusBadge(metrics.syncStatus)}
                          </div>
                        </TableCell>
                        <TableCell>{metrics.recordCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={metrics.dataQuality} className="w-16" />
                            <span className="text-sm">{metrics.dataQuality}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {metrics.lastSyncTime ? metrics.lastSyncTime.toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          {metrics.issues.length > 0 ? (
                            <Badge variant="destructive">{metrics.issues.length}</Badge>
                          ) : (
                            <Badge variant="default">0</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Active alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.slice(0, 10).map((alert) => (
                      <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{alert.tableName}:</strong> {alert.message}
                            </div>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            {performanceMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceMetrics.totalSyncs}</div>
                      <div className="text-sm text-muted-foreground">Total Syncs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{performanceMetrics.successfulSyncs}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{performanceMetrics.failedSyncs}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceMetrics.dataQualityScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Data Quality</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={syncConfig.batchSize}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    value={syncConfig.retryAttempts}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conflict Resolution</Label>
                  <Select
                    value={syncConfig.conflictResolution}
                    onValueChange={(value: 'tally_wins' | 'supabase_wins' | 'manual') => 
                      setSyncConfig(prev => ({ ...prev, conflictResolution: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tally_wins">Tally Wins</SelectItem>
                      <SelectItem value="supabase_wins">Supabase Wins</SelectItem>
                      <SelectItem value="manual">Manual Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import/Export Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delimiter">CSV Delimiter</Label>
                  <Input
                    id="delimiter"
                    value={importExportConfig.delimiter}
                    onChange={(e) => setImportExportConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-char">Quote Character</Label>
                  <Input
                    id="quote-char"
                    value={importExportConfig.quoteChar}
                    onChange={(e) => setImportExportConfig(prev => ({ ...prev, quoteChar: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Input
                    id="date-format"
                    value={importExportConfig.dateFormat}
                    onChange={(e) => setImportExportConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
