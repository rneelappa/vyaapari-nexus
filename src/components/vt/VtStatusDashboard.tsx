import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  TestTube,
  BarChart3,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import { useVtData, useVtCompanies, useVtDivisions } from '@/hooks/useVtData';

export const VtStatusDashboard: React.FC = () => {
  const { companyId, divisionId } = useParams();
  
  // Fetch basic VT data for status overview
  const { data: companies, loading: companiesLoading } = useVtCompanies();
  const { data: divisions, loading: divisionsLoading } = useVtDivisions();
  const vouchers: any[] = [];
  const vouchersLoading = false;
  const totalVouchers = 0;

  const getStatusBadge = (count: number, loading: boolean) => {
    if (loading) return <Badge variant="outline">Loading...</Badge>;
    if (count === 0) return <Badge variant="destructive">No Data</Badge>;
    if (count < 10) return <Badge variant="secondary">Limited Data</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getHealthScore = () => {
    if (companiesLoading || divisionsLoading || vouchersLoading) return 0;
    
    let score = 0;
    if (companies.length > 0) score += 25;
    if (divisions.length > 0) score += 25;
    if (totalVouchers > 0) score += 25;
    if (totalVouchers > 100) score += 25;
    
    return score;
  };

  const healthScore = getHealthScore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VT Schema Status</h1>
          <p className="text-muted-foreground">
            Real-time status of the Virtual Tally normalized data schema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TestTube className="mr-2 h-4 w-4" />
            Run Tests
          </Button>
          <Button size="sm">
            <Database className="mr-2 h-4 w-4" />
            Full Sync
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Health Score
          </CardTitle>
          <CardDescription>
            Aggregate health of the VT schema data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{healthScore}%</span>
              {healthScore >= 90 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : healthScore >= 50 ? (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <Progress value={healthScore} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Companies</div>
                <div className="text-muted-foreground">{companies.length}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Divisions</div>
                <div className="text-muted-foreground">{divisions.length}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Vouchers</div>
                <div className="text-muted-foreground">{totalVouchers}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Health</div>
                <div className="text-muted-foreground">
                  {healthScore >= 90 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Poor'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(companies.length, companiesLoading)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{divisions.length}</div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(divisions.length, divisionsLoading)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVouchers}</div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(totalVouchers, vouchersLoading)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Never</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Vouchers</CardTitle>
            <CardDescription>
              Latest vouchers synced to VT schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vouchersLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading vouchers...
              </div>
            ) : vouchers.length > 0 ? (
              <div className="space-y-2">
                {vouchers.slice(0, 5).map((voucher: any, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{voucher.voucher_number || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{voucher.voucher_type || 'Unknown Type'}</div>
                    </div>
                    <Badge variant="outline">{voucher.date || 'No Date'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No vouchers found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schema Tables</CardTitle>
            <CardDescription>
              VT schema table status overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'companies', status: companies.length > 0 ? 'active' : 'empty' },
                { name: 'divisions', status: divisions.length > 0 ? 'active' : 'empty' },
                { name: 'vouchers', status: totalVouchers > 0 ? 'active' : 'empty' },
                { name: 'ledger_entries', status: 'unknown' },
                { name: 'inventory_entries', status: 'unknown' },
              ].map((table) => (
                <div key={table.name} className="flex items-center justify-between">
                  <span className="font-medium">{table.name}</span>
                  <Badge 
                    variant={table.status === 'active' ? 'default' : table.status === 'empty' ? 'destructive' : 'outline'}
                    className={table.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {table.status === 'active' ? 'Active' : table.status === 'empty' ? 'Empty' : 'Unknown'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};