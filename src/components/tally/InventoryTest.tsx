import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedTallyMasters } from "@/hooks/useAdvancedTallyMasters";
import { externalTallyApi } from "@/services/external-tally-api";
import { 
  Package, 
  Building, 
  Users, 
  Archive,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface InventoryTestProps {
  companyId: string;
  divisionId: string;
}

export function InventoryTest({ companyId, divisionId }: InventoryTestProps) {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    ledgers,
    stockItems,
    groups,
    units,
    godowns,
    loading: mastersLoading,
    error: mastersError,
    fetchAllMasters
  } = useAdvancedTallyMasters(companyId, divisionId);

  const testEnhancedEndpoints = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Test individual master data endpoints
      const tests = [
        { name: 'Ledger Masters', fn: () => externalTallyApi.getLedgerMasters(companyId, divisionId) },
        { name: 'Stock Masters', fn: () => externalTallyApi.getStockMasters(companyId, divisionId) },
        { name: 'Group Masters', fn: () => externalTallyApi.getGroupMasters(companyId, divisionId) },
        { name: 'Unit Masters', fn: () => externalTallyApi.getUnitMasters(companyId, divisionId) },
        { name: 'Godown Masters', fn: () => externalTallyApi.getGodownMasters(companyId, divisionId) }
      ];

      const results: any = {};

      for (const test of tests) {
        try {
          console.log(`Testing ${test.name}...`);
          const result = await test.fn();
          results[test.name] = {
            success: result.success,
            dataCount: Array.isArray(result.data) ? result.data.length : 
                      result.data?.length || 
                      (typeof result.data === 'object' ? Object.keys(result.data).length : 0),
            error: result.error,
            sampleData: Array.isArray(result.data) ? result.data.slice(0, 2) : result.data
          };
          console.log(`${test.name} result:`, result);
        } catch (error) {
          results[test.name] = {
            success: false,
            error: (error as Error).message,
            dataCount: 0
          };
        }
      }

      // Test a specific voucher with inventory potential
      try {
        console.log('Testing specific voucher for inventory...');
        const voucherResult = await externalTallyApi.getVoucher(companyId, divisionId, '59654');
        results['Sample Voucher (59654)'] = {
          success: voucherResult.success,
          hasInventory: voucherResult.data?.inventoryEntries?.length > 0,
          inventoryCount: voucherResult.data?.inventoryEntries?.length || 0,
          entries: voucherResult.data?.entries?.length || 0,
          voucherData: voucherResult.data
        };
        console.log('Voucher 59654 data:', voucherResult.data);
      } catch (error) {
        results['Sample Voucher (59654)'] = {
          success: false,
          error: (error as Error).message
        };
      }

      setTestResults(results);
      
      toast({
        title: "Test Complete",
        description: "Enhanced API endpoints tested. Check results below."
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testInventoryVoucher = async () => {
    try {
      // Test the sales voucher that should have inventory
      const response = await fetch(`https://tally-sync-vyaapari360-production.up.railway.app/api/v1/voucher/${companyId}/${divisionId}/59654`);
      const data = await response.json();
      
      console.log('Direct API call for voucher 59654:', data);
      
      toast({
        title: "Direct API Test",
        description: `Voucher data retrieved. Inventory entries: ${data.data?.inventoryEntries?.length || 0}`
      });
    } catch (error) {
      console.error('Direct API test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Enhanced API & Inventory Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testEnhancedEndpoints} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Test Enhanced Endpoints
            </Button>
            
            <Button 
              onClick={fetchAllMasters} 
              disabled={mastersLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className={`h-4 w-4 ${mastersLoading ? 'animate-spin' : ''}`} />
              Fetch All Masters
            </Button>

            <Button 
              onClick={testInventoryVoucher} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Test Direct API
            </Button>
          </div>

          {mastersError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{mastersError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{testName}</h4>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={result.success ? "secondary" : "destructive"}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                    {result.dataCount !== undefined && (
                      <span>Count: {result.dataCount}</span>
                    )}
                    {result.hasInventory !== undefined && (
                      <span>Has Inventory: {result.hasInventory ? 'Yes' : 'No'}</span>
                    )}
                    {result.inventoryCount !== undefined && (
                      <span>Inventory Items: {result.inventoryCount}</span>
                    )}
                    {result.entries !== undefined && (
                      <span>Ledger Entries: {result.entries}</span>
                    )}
                  </div>

                  {result.error && (
                    <p className="text-red-600 text-sm mb-2">{result.error}</p>
                  )}

                  {result.sampleData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Sample Data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.sampleData, null, 2)}
                      </pre>
                    </details>
                  )}

                  {result.voucherData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Full Voucher Data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.voucherData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Masters Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ledgers</p>
                <p className="font-semibold">{ledgers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Items</p>
                <p className="font-semibold">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Groups</p>
                <p className="font-semibold">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Units</p>
                <p className="font-semibold">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Godowns</p>
                <p className="font-semibold">{godowns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}