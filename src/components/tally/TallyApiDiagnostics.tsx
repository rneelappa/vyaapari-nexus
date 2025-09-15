import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, XCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface DiagnosticTest {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  url?: string;
  analysis?: any;
  details?: string;
  count?: number;
  found?: boolean;
}

interface DiagnosticResults {
  timestamp: string;
  companyId: string;
  divisionId: string;
  voucherId?: string;
  tests: DiagnosticTest[];
  summary: {
    successfulTests: number;
    totalTests: number;
    successRate: string;
    recommendations: string[];
  };
}

interface TallyApiDiagnosticsProps {
  voucherId?: string;
}

export const TallyApiDiagnostics: React.FC<TallyApiDiagnosticsProps> = ({ voucherId }) => {
  const { companyId, divisionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const runDiagnostics = async () => {
    if (!companyId || !divisionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tally-api-diagnostics', {
        body: {
          companyId,
          divisionId,
          voucherId
        }
      });

      if (error) {
        console.error('Diagnostics error:', error);
        return;
      }

      setResults(data);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (testName: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName);
    } else {
      newExpanded.add(testName);
    }
    setExpandedTests(newExpanded);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Pass" : "Fail"}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Tally API Diagnostics
        </CardTitle>
        <CardDescription>
          Test and diagnose issues with voucher data retrieval
          {voucherId && ` for voucher ${voucherId}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    Test Results: {results.summary.successfulTests}/{results.summary.totalTests} 
                    ({results.summary.successRate})
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tested at: {new Date(results.timestamp).toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Recommendations */}
            {results.summary.recommendations.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Issues Found:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {results.summary.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Test Results */}
            <div className="space-y-2">
              <h3 className="font-semibold">Detailed Test Results</h3>
              {results.tests.map((test, index) => (
                <Card key={index} className="border-l-4 border-l-gray-200">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleTest(test.test)}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.success)}
                          <span className="font-medium">{test.test}</span>
                          {getStatusBadge(test.success)}
                        </div>
                        {expandedTests.has(test.test) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="space-y-3 border-t pt-3">
                        {test.error && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {test.error}
                          </div>
                        )}
                        
                        {test.status && (
                          <div className="text-sm">
                            <strong>Status:</strong> {test.status}
                          </div>
                        )}

                        {test.url && (
                          <div className="text-sm">
                            <strong>URL:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{test.url}</code>
                          </div>
                        )}

                        {test.details && (
                          <div className="text-sm">
                            <strong>Details:</strong> {test.details}
                          </div>
                        )}

                        {test.count !== undefined && (
                          <div className="text-sm">
                            <strong>Count:</strong> {test.count}
                          </div>
                        )}

                        {test.found !== undefined && (
                          <div className="text-sm">
                            <strong>Found:</strong> {test.found ? 'Yes' : 'No'}
                          </div>
                        )}

                        {test.analysis && (
                          <div className="text-sm">
                            <strong>Analysis:</strong>
                            <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                              <li>Has Entries: {test.analysis.hasEntries ? 'Yes' : 'No'} ({test.analysis.entriesCount})</li>
                              <li>Has Inventory: {test.analysis.hasInventoryEntries ? 'Yes' : 'No'} ({test.analysis.inventoryCount})</li>
                              <li>Has Party Details: {test.analysis.hasPartyDetails ? 'Yes' : 'No'}</li>
                            </ul>
                          </div>
                        )}

                        {test.data && (
                          <details className="text-sm">
                            <summary className="font-medium cursor-pointer">Raw Data</summary>
                            <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(test.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};