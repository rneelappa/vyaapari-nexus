import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Settings,
  RefreshCw,
  Database,
  Users,
  Package,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  recordCount: number;
  lastUpdated: string;
  status: "available" | "generating" | "error";
  type: "master" | "transaction" | "summary";
}

interface ReportData {
  masters: Report[];
  transactions: Report[];
  summaries: Report[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData>({ masters: [], transactions: [], summaries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReports();
  }, []);

  const generateReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get counts and data from various tables to generate reports
      const [
        { count: ledgerCount },
        { count: stockCount },
        { count: employeeCount },
        { count: godownCount },
        { count: voucherTypeCount },
        { count: accountingCount },
        { count: inventoryCount },
        { count: voucherCount },
        { data: recentAccounting },
        { data: recentInventory }
      ] = await Promise.all([
        supabase.from('bkp_mst_ledger').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_stock_item').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_employee').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_godown').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_vouchertype').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_trn_accounting').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_trn_batch').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_tally_trn_voucher').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_trn_accounting').select('*').limit(1),
        supabase.from('bkp_trn_batch').select('*').limit(1)
      ]);

      const currentDate = new Date().toISOString();

      const masterReports: Report[] = [
        {
          id: "ledger-master",
          name: "Ledger Master Report",
          description: "Complete list of all ledger accounts with balances",
          category: "Masters",
          recordCount: ledgerCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "master"
        },
        {
          id: "stock-master",
          name: "Stock Item Master",
          description: "Inventory items with current stock levels and rates",
          category: "Masters",
          recordCount: stockCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "master"
        },
        {
          id: "employee-master",
          name: "Employee Master Report",
          description: "Employee details with designation and contact information",
          category: "Masters",
          recordCount: employeeCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "master"
        },
        {
          id: "godown-master",
          name: "Godown Master Report",
          description: "Storage locations and warehouse details",
          category: "Masters",
          recordCount: godownCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "master"
        },
        {
          id: "voucher-type-master",
          name: "Voucher Type Configuration",
          description: "All configured voucher types and their settings",
          category: "Masters",
          recordCount: voucherTypeCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "master"
        }
      ];

      const transactionReports: Report[] = [
        {
          id: "accounting-transactions",
          name: "Accounting Transactions Report",
          description: "All accounting entries with ledger-wise details",
          category: "Transactions",
          recordCount: accountingCount || 0,
          lastUpdated: recentAccounting && recentAccounting.length > 0 ? currentDate : 'No data',
          status: "available",
          type: "transaction"
        },
        {
          id: "inventory-movements",
          name: "Inventory Movement Report",
          description: "Stock movements, transfers, and batch allocations",
          category: "Transactions",
          recordCount: inventoryCount || 0,
          lastUpdated: recentInventory && recentInventory.length > 0 ? currentDate : 'No data',
          status: "available",
          type: "transaction"
        },
        {
          id: "voucher-register",
          name: "Voucher Register",
          description: "All vouchers with types, numbers, and references",
          category: "Transactions",
          recordCount: voucherCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "transaction"
        }
      ];

      const summaryReports: Report[] = [
        {
          id: "financial-summary",
          name: "Financial Position Summary",
          description: "Balance sheet and profit & loss overview",
          category: "Summary",
          recordCount: (accountingCount || 0) + (inventoryCount || 0),
          lastUpdated: currentDate,
          status: "available",
          type: "summary"
        },
        {
          id: "stock-summary",
          name: "Stock Valuation Summary",
          description: "Current stock values and movement trends",
          category: "Summary",
          recordCount: stockCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "summary"
        },
        {
          id: "organization-summary",
          name: "Organization Overview",
          description: "Company structure and employee distribution",
          category: "Summary",
          recordCount: employeeCount || 0,
          lastUpdated: currentDate,
          status: "available",
          type: "summary"
        }
      ];

      setReports({
        masters: masterReports,
        transactions: transactionReports,
        summaries: summaryReports
      });

    } catch (err) {
      console.error('Error generating reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    toast({
      title: "Download Started",
      description: `Generating ${report.name}...`,
    });
    // In a real implementation, this would trigger the actual report generation
  };

  const handleViewReport = (report: Report) => {
    toast({
      title: "Opening Report",
      description: `Loading ${report.name}...`,
    });
    // In a real implementation, this would navigate to the report view
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'master':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'transaction':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'summary':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const ReportTable = ({ reportList, title }: { reportList: Report[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {reportList.length} reports available
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No reports available
                    </TableCell>
                  </TableRow>
                ) : (
                  reportList.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getReportIcon(report.type)}
                          <div>
                            <div>{report.name}</div>
                            <div className="text-sm text-muted-foreground">{report.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.recordCount.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {report.lastUpdated === 'No data' 
                              ? 'No data' 
                              : new Date(report.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewReport(report)}
                            disabled={report.status !== 'available'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            disabled={report.status !== 'available'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports Center</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive reports from your Tally data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReports} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={generateReports} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master Reports</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.masters.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Reports</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reports.transactions.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Summary Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{reports.summaries.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {[...reports.masters, ...reports.transactions, ...reports.summaries]
                .reduce((sum, report) => sum + report.recordCount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="masters">Master Data</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-6">
          <ReportTable reportList={reports.masters} title="Master Data Reports" />
          <ReportTable reportList={reports.transactions} title="Transaction Reports" />
          <ReportTable reportList={reports.summaries} title="Summary Reports" />
        </TabsContent>

        <TabsContent value="masters" className="mt-6">
          <ReportTable reportList={reports.masters} title="Master Data Reports" />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <ReportTable reportList={reports.transactions} title="Transaction Reports" />
        </TabsContent>

        <TabsContent value="summaries" className="mt-6">
          <ReportTable reportList={reports.summaries} title="Summary Reports" />
        </TabsContent>
      </Tabs>
    </div>
  );
}