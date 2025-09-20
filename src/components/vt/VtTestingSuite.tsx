import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';
import { useVtSync } from '@/hooks/useVtSync';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  message?: string;
  details?: string;
}

export const VtTestingSuite: React.FC = () => {
  const { companyId, divisionId } = useParams();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);

  const { performSync, validateData } = useVtSync();

  const availableTests: TestResult[] = [
    {
      id: 'schema_integrity',
      name: 'Schema Integrity Test',
      status: 'pending',
      details: 'Validates that all VT schema tables exist and have correct structure'
    },
    {
      id: 'data_consistency',
      name: 'Data Consistency Test',
      status: 'pending',
      details: 'Checks for data consistency between related tables'
    },
    {
      id: 'relationship_integrity',
      name: 'Relationship Integrity Test',
      status: 'pending',
      details: 'Validates foreign key relationships and referential integrity'
    },
    {
      id: 'sync_performance',
      name: 'Sync Performance Test',
      status: 'pending',
      details: 'Measures sync performance and identifies bottlenecks'
    },
    {
      id: 'data_validation',
      name: 'Data Validation Test',
      status: 'pending',
      details: 'Runs validation rules on synced data'
    },
    {
      id: 'query_performance',
      name: 'Query Performance Test',
      status: 'pending',
      details: 'Tests query performance on VT schema tables'
    }
  ];

  const runAllTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    for (const test of availableTests) {
      results.push({ ...test, status: 'running' });
      setTestResults([...results]);

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      const success = Math.random() > 0.3; // 70% success rate for demo
      const duration = Math.floor(Math.random() * 3000) + 500;

      results[results.length - 1] = {
        ...test,
        status: success ? 'passed' : 'failed',
        duration,
        message: success ? 'Test passed successfully' : 'Test failed - see details for more information'
      };
      setTestResults([...results]);
    }

    setIsRunningTests(false);
  };

  const runSingleTest = async (testId: string) => {
    const testIndex = testResults.findIndex(t => t.id === testId);
    const updatedResults = [...testResults];
    
    if (testIndex === -1) {
      // Add new test result
      updatedResults.push({
        ...availableTests.find(t => t.id === testId)!,
        status: 'running'
      });
    } else {
      updatedResults[testIndex].status = 'running';
    }
    
    setTestResults(updatedResults);

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.3;
    const duration = Math.floor(Math.random() * 3000) + 500;
    const currentIndex = updatedResults.findIndex(t => t.id === testId);

    updatedResults[currentIndex] = {
      ...updatedResults[currentIndex],
      status: success ? 'passed' : 'failed',
      duration,
      message: success ? 'Test passed successfully' : 'Test failed - check configuration'
    };

    setTestResults(updatedResults);
  };

  const runCustomQuery = async () => {
    if (!customQuery.trim()) return;

    try {
      setQueryResult({ loading: true });
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result
      setQueryResult({
        success: true,
        data: [
          { id: 1, name: 'Sample Result 1', value: 100 },
          { id: 2, name: 'Sample Result 2', value: 200 },
        ],
        rowCount: 2,
        executionTime: '0.45ms'
      });
    } catch (error) {
      setQueryResult({
        success: false,
        error: 'Query execution failed',
        executionTime: '0.12ms'
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VT Testing Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing tools for the VT schema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            variant="outline"
          >
            {isRunningTests ? <Clock className="mr-2 h-4 w-4 animate-pulse" /> : <TestTube className="mr-2 h-4 w-4" />}
            Run All Tests
          </Button>
        </div>
      </div>

      <Tabs defaultValue="automated" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance Tests</TabsTrigger>
          <TabsTrigger value="custom">Custom Queries</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Test Suite</CardTitle>
              <CardDescription>
                Run automated tests to validate VT schema integrity and functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableTests.map((test) => {
                  const result = testResults.find(r => r.id === test.id);
                  const status = result?.status || test.status;
                  
                  return (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-muted-foreground">{test.details}</div>
                          {result?.duration && (
                            <div className="text-xs text-muted-foreground">
                              Completed in {result.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleTest(test.id)}
                          disabled={status === 'running'}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance</CardTitle>
                <CardDescription>
                  Test data synchronization performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => performSync(companyId!, divisionId!)}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Run Sync Performance Test
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => validateData(companyId, divisionId)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Run Validation Performance Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>
                  Test query execution performance on VT tables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Test Complex Queries
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Test Report Queries
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Query Testing</CardTitle>
              <CardDescription>
                Execute custom SQL queries against the VT schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">SQL Query</label>
                  <Textarea
                    placeholder="SELECT * FROM vt.companies LIMIT 10;"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    className="mt-1"
                    rows={6}
                  />
                </div>
                
                <Button onClick={runCustomQuery} disabled={!customQuery.trim()}>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Query
                </Button>

                {queryResult && (
                  <div className="space-y-2">
                    {queryResult.loading ? (
                      <Alert>
                        <Clock className="h-4 w-4 animate-pulse" />
                        <AlertDescription>Executing query...</AlertDescription>
                      </Alert>
                    ) : queryResult.success ? (
                      <div className="space-y-2">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Query executed successfully in {queryResult.executionTime}. 
                            Returned {queryResult.rowCount} rows.
                          </AlertDescription>
                        </Alert>
                        <div className="bg-muted p-4 rounded-md">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(queryResult.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Query failed: {queryResult.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};