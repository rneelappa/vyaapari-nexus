import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  Settings,
  TestTube
} from 'lucide-react';
import { VtSyncDashboard } from '@/components/vt/VtSyncDashboard';
import { VtDataExplorer } from '@/components/vt/VtDataExplorer';
import { useVtSync } from '@/hooks/useVtSync';

export const VtIntegrationPage: React.FC = () => {
  const { companyId, divisionId } = useParams();
  
  const {
    isSyncing,
    isValidating,
    syncProgress,
    lastSyncResult,
    lastValidationResult,
    performSync,
    validateData
  } = useVtSync();

  const handleQuickSync = async () => {
    if (!companyId || !divisionId) return;
    await performSync(companyId, divisionId);
  };

  const handleQuickValidation = async () => {
    await validateData(companyId, divisionId);
  };

  const getSyncStatusBadge = () => {
    if (!lastSyncResult) {
      return <Badge variant="outline">Not Run</Badge>;
    }
    return lastSyncResult.success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    );
  };

  const getHealthScoreBadge = () => {
    if (!lastValidationResult) {
      return <Badge variant="outline">Unknown</Badge>;
    }

    const score = lastValidationResult.overallHealthScore;
    if (score >= 90) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Excellent ({score}%)</Badge>;
    }
    if (score >= 70) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Good ({score}%)</Badge>;
    }
    return <Badge variant="destructive">Poor ({score}%)</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/company/${companyId}/division/${divisionId}/tally`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tally
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">VT Schema Integration</h1>
            <p className="text-muted-foreground">
              Virtual Tally (VT) normalized data schema management and testing
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleQuickValidation} 
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            {isValidating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
            Quick Validate
          </Button>
          <Button 
            onClick={handleQuickSync} 
            disabled={isSyncing}
            size="sm"
          >
            {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Quick Sync
          </Button>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {getSyncStatusBadge()}
              </div>
            </div>
            {lastSyncResult && (
              <p className="text-xs text-muted-foreground mt-2">
                {lastSyncResult.recordsProcessed} records processed
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {getHealthScoreBadge()}
              </div>
            </div>
            {lastValidationResult && (
              <p className="text-xs text-muted-foreground mt-2">
                {lastValidationResult.validationResults.reduce((sum, result) => sum + result.issues.length, 0)} issues found
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSyncing ? (
                <Badge variant="secondary">
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Syncing
                </Badge>
              ) : isValidating ? (
                <Badge variant="secondary">
                  <TestTube className="mr-1 h-3 w-3" />
                  Validating
                </Badge>
              ) : (
                <Badge variant="outline">Idle</Badge>
              )}
            </div>
            {syncProgress && (
              <p className="text-xs text-muted-foreground mt-2">
                {syncProgress.stage}: {syncProgress.current}/{syncProgress.total}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Alert */}
      {syncProgress && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{syncProgress.stage}</span>
                <span>{syncProgress.percentage}%</span>
              </div>
              {syncProgress.currentTable && (
                <div className="text-sm text-muted-foreground">
                  Processing: {syncProgress.currentTable}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Sync Dashboard</TabsTrigger>
          <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
          <TabsTrigger value="testing">Testing Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <VtSyncDashboard />
        </TabsContent>

        <TabsContent value="explorer" className="space-y-4">
          <VtDataExplorer />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Schema Testing</CardTitle>
                <CardDescription>
                  Test the VT schema structure and relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Schema Tests</p>
                  <p className="text-sm">Automated tests for VT schema integrity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Testing</CardTitle>
                <CardDescription>
                  Monitor sync performance and data processing speeds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Performance Metrics</p>
                  <p className="text-sm">Sync timing and throughput analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Integration Testing</CardTitle>
                <CardDescription>
                  End-to-end testing of Tally to VT data flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Database className="h-6 w-6" />
                    <span>Test Sync</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <CheckCircle className="h-6 w-6" />
                    <span>Test Validation</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Test Queries</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};