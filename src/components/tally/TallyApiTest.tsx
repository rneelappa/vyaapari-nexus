import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import TallyApiService from '@/services/tally-api';

export default function TallyApiTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    health: boolean | null;
    groups: number | null;
    ledgers: number | null;
    vouchers: number | null;
    error: string | null;
  }>({
    health: null,
    groups: null,
    ledgers: null,
    vouchers: null,
    error: null
  });

  const testApiConnection = async () => {
    setLoading(true);
    setResults({
      health: null,
      groups: null,
      ledgers: null,
      vouchers: null,
      error: null
    });

    try {
      // Test health check
      const health = await TallyApiService.healthCheck();
      
      // Test API endpoints
      const [groupsResponse, ledgersResponse, vouchersResponse] = await Promise.all([
        TallyApiService.getGroups({ limit: 10 }),
        TallyApiService.getLedgers({ limit: 10 }),
        TallyApiService.getVouchers({ limit: 10 })
      ]);

      setResults({
        health,
        groups: groupsResponse.success ? groupsResponse.data.length : 0,
        ledgers: ledgersResponse.success ? ledgersResponse.data.length : 0,
        vouchers: vouchersResponse.success ? vouchersResponse.data.length : 0,
        error: null
      });
    } catch (error) {
      setResults({
        health: false,
        groups: null,
        ledgers: null,
        vouchers: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Tally API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testApiConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Tally API Connection
            </>
          )}
        </Button>

        {results.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Connection Failed</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{results.error}</p>
          </div>
        )}

        {results.health !== null && !results.error && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">API Health</span>
              <Badge variant={results.health ? "default" : "destructive"}>
                {results.health ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                  </>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.groups ?? '--'}
                </div>
                <div className="text-sm text-blue-800">Groups</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.ledgers ?? '--'}
                </div>
                <div className="text-sm text-green-800">Ledgers</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {results.vouchers ?? '--'}
                </div>
                <div className="text-sm text-purple-800">Vouchers</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
