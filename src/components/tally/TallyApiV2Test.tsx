import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube } from 'lucide-react';
import { tallyApiService } from '@/services/tally-api-service';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  test: string;
  success: boolean;
  count?: number;
  data?: any[];
  error?: string;
  duration?: number;
}

export const TallyApiV2Test: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testV2Endpoints = async () => {
    setLoading(true);
    setResults([]);
    
    const testCases = [
      { name: 'Get Companies', action: () => tallyApiService.getCompanies({ limit: 5 }) },
      { name: 'Get Ledgers', action: () => tallyApiService.getLedgers(undefined, undefined, { limit: 5 }) },
      { name: 'Get Groups', action: () => tallyApiService.getGroups(undefined, undefined, { limit: 5 }) },
      { name: 'Get Stock Items', action: () => tallyApiService.getStockItems(undefined, undefined, { limit: 5 }) },
      { name: 'Get Vouchers', action: () => tallyApiService.getVouchers(undefined, undefined, { limit: 5 }) },
    ];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const result = await testCase.action();
        const duration = Date.now() - startTime;
        
        setResults(prev => [...prev, {
          test: testCase.name,
          success: true,
          count: result.count,
          data: result.data?.slice(0, 2), // Show first 2 records
          duration
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          test: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]);
      }
    }
    
    setLoading(false);
  };

  const testDirectEdgeFunction = async () => {
    setLoading(true);
    
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('tally-api-test', {});
      const duration = Date.now() - startTime;
      
      if (response.error) {
        setResults([{
          test: 'Direct Edge Function Test',
          success: false,
          error: response.error.message,
          duration
        }]);
      } else {
        setResults([{
          test: 'Direct Edge Function Test',
          success: true,
          data: response.data,
          duration
        }]);
      }
    } catch (error) {
      setResults([{
        test: 'Direct Edge Function Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Tally V2 API Test Suite
        </CardTitle>
        <CardDescription>
          Test the V2 GET endpoints with proper authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testV2Endpoints} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test V2 Client Service
          </Button>
          
          <Button 
            onClick={testDirectEdgeFunction} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Direct Edge Function
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.test}</span>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-sm text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✅ Success" : "❌ Failed"}
                    </Badge>
                  </div>
                </div>
                
                {result.success && result.count !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Found {result.count} records
                  </p>
                )}
                
                {result.data && (
                  <div className="bg-muted p-2 rounded text-xs">
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                )}
                
                {result.error && (
                  <div className="bg-destructive/10 text-destructive p-2 rounded text-sm">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Node.js Example Request:</h4>
          <pre className="text-xs overflow-x-auto">
{`// For your Node.js sync function
const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({
    api_key: "RAJK22**kjar", // Must match TALLY_API_KEY in secrets
    action: "getLedgers",
    companyId: "your-company-id",
    divisionId: "your-division-id",
    filters: {
      limit: 100,
      offset: 0,
      search: "optional-search-term"
    }
  })
});

const data = await response.json();
console.log('API Response:', data);`}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Available Actions:</h4>
          <ul className="text-sm space-y-1">
            <li>• <code>getCompanies</code> - Fetch all companies</li>
            <li>• <code>getLedgers</code> - Fetch ledgers (with company/division filters)</li>
            <li>• <code>getGroups</code> - Fetch account groups</li>
            <li>• <code>getStockItems</code> - Fetch stock items</li>
            <li>• <code>getVouchers</code> - Fetch vouchers (with date filters)</li>
            <li>• <code>getCostCenters</code> - Fetch cost centers</li>
            <li>• <code>getGodowns</code> - Fetch godowns</li>
            <li>• <code>getEmployees</code> - Fetch employees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};