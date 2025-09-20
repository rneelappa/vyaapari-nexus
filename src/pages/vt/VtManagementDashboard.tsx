import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  TestTube,
  BarChart3,
  Clock,
  ArrowLeft,
  Settings,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { VtSyncDashboard } from '@/components/vt/VtSyncDashboard';
import { VtDataExplorer } from '@/components/vt/VtDataExplorer';
import { VtStatusDashboard } from '@/components/vt/VtStatusDashboard';
import { VtTestingSuite } from '@/components/vt/VtTestingSuite';
import { useVtSync } from '@/hooks/useVtSync';

export const VtManagementDashboard: React.FC = () => {
  const { companyId, divisionId } = useParams();
  const navigate = useNavigate();
  
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

  const getOverallHealthScore = () => {
    let score = 0;
    
    // Sync status contributes 40%
    if (lastSyncResult?.success) score += 40;
    
    // Validation score contributes 60%
    if (lastValidationResult) {
      score += (lastValidationResult.overallHealthScore * 0.6);
    }
    
    return Math.min(100, Math.round(score));
  };

  const overallScore = getOverallHealthScore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/company/${companyId}/division/${divisionId}/tally`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tally
          </Button>
          <div>
            <h1 className="text-3xl font-bold">VT Schema Management</h1>
            <p className="text-muted-foreground">
              Virtual Tally normalized data schema - Phase 4 Complete Implementation
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

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            VT Schema Health Score
          </CardTitle>
          <CardDescription>
            Overall health and readiness of the Virtual Tally normalized schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{overallScore}%</span>
              {overallScore >= 90 ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : overallScore >= 70 ? (
                <AlertTriangle className="h-10 w-10 text-yellow-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <Progress value={overallScore} className="w-full h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Schema Status</div>
                <div className="text-muted-foreground">
                  <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Sync Status</div>
                <div className="text-muted-foreground">{getSyncStatusBadge()}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Data Health</div>
                <div className="text-muted-foreground">{getHealthScoreBadge()}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Overall</div>
                <div className="text-muted-foreground">
                  {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Progress value={syncProgress.percentage} className="w-full" />
              {syncProgress.currentTable && (
                <div className="text-sm text-muted-foreground">
                  Processing: {syncProgress.currentTable}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Management</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Manage Schema
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Explorer</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Explore Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Data</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="sync">Sync Control</TabsTrigger>
          <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
          <TabsTrigger value="testing">Testing Suite</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <VtStatusDashboard />
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <VtSyncDashboard />
        </TabsContent>

        <TabsContent value="explorer" className="space-y-4">
          <VtDataExplorer />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <VtTestingSuite />
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Summary</CardTitle>
              <CardDescription>
                Complete VT Schema implementation with all phases completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Phase 1</div>
                  <div className="text-sm text-muted-foreground">Schema Design</div>
                  <Badge variant="default" className="bg-green-100 text-green-800 mt-2">Complete</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Phase 2</div>
                  <div className="text-sm text-muted-foreground">Edge Functions</div>
                  <Badge variant="default" className="bg-green-100 text-green-800 mt-2">Complete</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Phase 3</div>
                  <div className="text-sm text-muted-foreground">React Hooks & UI</div>
                  <Badge variant="default" className="bg-green-100 text-green-800 mt-2">Complete</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Phase 4</div>
                  <div className="text-sm text-muted-foreground">Integration & Testing</div>
                  <Badge variant="default" className="bg-green-100 text-green-800 mt-2">Complete</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Implementation Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">✅ Schema Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 16 normalized VT tables</li>
                      <li>• Multi-tenant RLS policies</li>
                      <li>• Foreign key relationships</li>
                      <li>• Performance indexes</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">✅ Sync Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Full data synchronization</li>
                      <li>• Progress tracking</li>
                      <li>• Error handling</li>
                      <li>• Data validation</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">✅ UI Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Sync dashboard</li>
                      <li>• Data explorer</li>
                      <li>• Testing suite</li>
                      <li>• Status monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">✅ Testing Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Automated tests</li>
                      <li>• Performance monitoring</li>
                      <li>• Custom queries</li>
                      <li>• Health scoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};