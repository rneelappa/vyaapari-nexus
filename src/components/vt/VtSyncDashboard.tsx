import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';
import { useVtSync } from '@/hooks/useVtSync';

export const VtSyncDashboard: React.FC = () => {
  const { companyId, divisionId } = useParams();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const {
    isSyncing,
    isValidating,
    syncProgress,
    lastSyncResult,
    lastValidationResult,
    performSync,
    validateData,
    getTableStats,
    clearVtData
  } = useVtSync();

  const handleFullSync = async () => {
    if (!companyId || !divisionId) return;
    await performSync(companyId, divisionId);
  };

  const handlePartialSync = async () => {
    if (!companyId || !divisionId || selectedTables.length === 0) return;
    await performSync(companyId, divisionId, selectedTables);
  };

  const handleValidation = async () => {
    await validateData(companyId, divisionId);
  };

  const handleClearData = async () => {
    if (!companyId || !divisionId) return;
    if (confirm('Are you sure you want to clear all VT data for this company/division?')) {
      await clearVtData(companyId, divisionId);
    }
  };

  const availableTables = [
    'companies', 'divisions', 'groups', 'ledgers', 'units_of_measure',
    'stock_items', 'godowns', 'cost_centres', 'cost_categories',
    'employees', 'payheads', 'voucher_types', 'vouchers',
    'ledger_entries', 'inventory_entries', 'address_details'
  ];

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VT Schema Sync Dashboard</h1>
          <p className="text-muted-foreground">
            Manage data synchronization between Tally and VT schemas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleValidation} 
            disabled={isValidating}
            variant="outline"
          >
            {isValidating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Validate Data
          </Button>
          <Button 
            onClick={handleFullSync} 
            disabled={isSyncing}
          >
            {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Full Sync
          </Button>
        </div>
      </div>

      {syncProgress && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{syncProgress.stage}</span>
                <span>{syncProgress.current}/{syncProgress.total}</span>
              </div>
              <Progress value={syncProgress.percentage} className="w-full" />
              {syncProgress.currentTable && (
                <div className="text-sm text-muted-foreground">
                  Processing: {syncProgress.currentTable} ({syncProgress.recordsProcessed} records)
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Sync Control</TabsTrigger>
          <TabsTrigger value="validation">Data Validation</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync Status</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lastSyncResult ? (
                    lastSyncResult.success ? (
                      <span className="text-green-600">Success</span>
                    ) : (
                      <span className="text-red-600">Failed</span>
                    )
                  ) : (
                    <span className="text-gray-500">Not Run</span>
                  )}
                </div>
                {lastSyncResult && (
                  <p className="text-xs text-muted-foreground">
                    {lastSyncResult.recordsProcessed} records processed in {lastSyncResult.duration}ms
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Health Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${lastValidationResult ? getHealthScoreColor(lastValidationResult.overallHealthScore) : 'text-gray-500'}`}>
                  {lastValidationResult ? `${lastValidationResult.overallHealthScore}%` : 'Unknown'}
                </div>
                {lastValidationResult && (
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthScoreBadge(lastValidationResult.overallHealthScore)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lastValidationResult ? (
                    lastValidationResult.validationResults.reduce((sum, result) => sum + result.issues.length, 0)
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                {lastValidationResult && (
                  <p className="text-xs text-muted-foreground">
                    Across {lastValidationResult.validationResults.length} tables
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Control</CardTitle>
              <CardDescription>
                Manage data synchronization from Tally to VT schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleFullSync} 
                  disabled={isSyncing}
                  className="flex-1"
                >
                  {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  Full Sync
                </Button>
                <Button 
                  onClick={handlePartialSync} 
                  disabled={isSyncing || selectedTables.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  Partial Sync ({selectedTables.length} tables)
                </Button>
                <Button 
                  onClick={handleClearData} 
                  disabled={isSyncing}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Select Tables for Partial Sync:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableTables.map((table) => (
                    <label key={table} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables([...selectedTables, table]);
                          } else {
                            setSelectedTables(selectedTables.filter(t => t !== table));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{table.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {lastValidationResult && (
            <div className="space-y-4">
              {lastValidationResult.validationResults.map((result) => (
                <Card key={result.tableName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {result.tableName}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.recordCount} records</Badge>
                        {result.issues.length === 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {result.issues.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {result.issues.map((issue, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{issue}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
              <CardDescription>
                Record counts and sync status for each table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Statistics will be displayed here after implementing the stats endpoint
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};