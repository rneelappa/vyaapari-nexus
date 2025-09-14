import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  endpoint: string;
  method: string;
  status?: number;
  success?: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

interface RailwayApiTestProps {
  companyId: string;
  divisionId: string;
}

export const RailwayApiTest: React.FC<RailwayApiTestProps> = ({ companyId, divisionId }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-12-31');
  
  const baseUrl = 'https://tally-sync-vyaapari360-production.up.railway.app/api/v1';

  const updateResult = (endpoint: string, result: Partial<TestResult>) => {
    setResults(prev => {
      const existingIndex = prev.findIndex(r => r.endpoint === endpoint);
      const newResult = { endpoint, method: result.method || 'GET', ...result };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newResult };
        return updated;
      } else {
        return [...prev, newResult];
      }
    });
  };

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(endpoint);
    const startTime = Date.now();

    try {
      const url = `${baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      console.log(`Testing ${method} ${url}`, body ? { body } : '');
      
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      updateResult(endpoint, {
        method,
        status: response.status,
        success: response.ok,
        data,
        duration
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      updateResult(endpoint, {
        method,
        success: false,
        error: (error as Error).message,
        duration
      });
    }

    setLoading(null);
  };

  const testAll = async () => {
    setResults([]);
    
    // Test all endpoints in sequence to avoid overwhelming the server
    await testEndpoint('/health');
    await testEndpoint(`/vouchers/${companyId}/${divisionId}`);
    await testEndpoint(`/sync/${companyId}/${divisionId}`, 'POST', { fromDate, toDate });
    await testEndpoint(`/debug-parse/${companyId}/${divisionId}`, 'POST', { fromDate, toDate });
  };

  const getStatusIcon = (result: TestResult) => {
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (result.success === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.success) return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
    if (result.success === false) return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Railway API Test Suite
          <Badge variant="outline">Production</Badge>
        </CardTitle>
        <Alert>
          <AlertDescription>
            Testing endpoints for Company: {companyId} | Division: {divisionId}
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromDate">From Date</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="toDate">To Date</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testAll} 
            disabled={!!loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Test All Endpoints
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => testEndpoint('/health')}
            disabled={loading === '/health'}
          >
            {loading === '/health' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Health Check
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => testEndpoint(`/vouchers/${companyId}/${divisionId}`)}
            disabled={loading === `/vouchers/${companyId}/${divisionId}`}
          >
            {loading === `/vouchers/${companyId}/${divisionId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Get Vouchers
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => testEndpoint(`/sync/${companyId}/${divisionId}`, 'POST', { fromDate, toDate })}
            disabled={loading === `/sync/${companyId}/${divisionId}`}
          >
            {loading === `/sync/${companyId}/${divisionId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sync Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => testEndpoint(`/debug-parse/${companyId}/${divisionId}`, 'POST', { fromDate, toDate })}
            disabled={loading === `/debug-parse/${companyId}/${divisionId}`}
          >
            {loading === `/debug-parse/${companyId}/${divisionId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Debug Parse
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {result.method} {result.endpoint}
                    </code>
                    {getStatusBadge(result)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {result.status && <span>HTTP {result.status}</span>}
                    {result.duration && <span>{result.duration}ms</span>}
                  </div>
                </div>
                
                {result.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
                
                {result.data && (
                  <div className="mt-2">
                    <Label>Response:</Label>
                    <Textarea
                      value={typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                      readOnly
                      className="mt-1 font-mono text-xs"
                      rows={Math.min(10, String(result.data).split('\n').length)}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};