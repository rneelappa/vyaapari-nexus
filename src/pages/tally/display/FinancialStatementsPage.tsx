import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileBarChart, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Calendar,
  DollarSign,
  RefreshCw,
  BarChart3,
  PieChart
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FinancialStatementItem {
  name: string;
  currentAmount: number;
  level: number;
  type: 'asset' | 'liability' | 'income' | 'expense';
}

interface LedgerSummary {
  ledger: string;
  total_amount: number;
  transaction_count: number;
  is_revenue: boolean;
  is_deemedpositive: boolean;
}

export default function FinancialStatementsPage() {
  const [profitLossItems, setProfitLossItems] = useState<FinancialStatementItem[]>([]);
  const [balanceSheetItems, setBalanceSheetItems] = useState<FinancialStatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch accounting data and group by ledger
      const { data: accountingData, error: accountingError } = await supabase
        .from('bkp_trn_accounting')
        .select('ledger, amount')
        .order('ledger');

      if (accountingError) throw accountingError;

      // Fetch ledger master data for classification
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('bkp_mst_ledger')
        .select('name, is_revenue, is_deemedpositive, parent')
        .order('name');

      if (ledgerError) throw ledgerError;

      // Process data to create financial statements
      const ledgerSummaries = processAccountingData(accountingData || [], ledgerData || []);
      
      // Generate P&L and Balance Sheet items
      const pnlItems = generateProfitLossItems(ledgerSummaries);
      const bsItems = generateBalanceSheetItems(ledgerSummaries);

      setProfitLossItems(pnlItems);
      setBalanceSheetItems(bsItems);

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const processAccountingData = (accountingData: any[], ledgerData: any[]): LedgerSummary[] => {
    const ledgerMap = new Map<string, LedgerSummary>();

    // Initialize ledger summaries
    ledgerData.forEach(ledger => {
      ledgerMap.set(ledger.name, {
        ledger: ledger.name,
        total_amount: 0,
        transaction_count: 0,
        is_revenue: !!ledger.is_revenue,
        is_deemedpositive: !!ledger.is_deemedpositive,
      });
    });

    // Aggregate accounting transactions
    accountingData.forEach(entry => {
      const existing = ledgerMap.get(entry.ledger);
      if (existing) {
        existing.total_amount += entry.amount || 0;
        existing.transaction_count += 1;
      } else {
        ledgerMap.set(entry.ledger, {
          ledger: entry.ledger,
          total_amount: entry.amount || 0,
          transaction_count: 1,
          is_revenue: false,
          is_deemedpositive: true,
        });
      }
    });

    return Array.from(ledgerMap.values());
  };

  const generateProfitLossItems = (ledgerSummaries: LedgerSummary[]): FinancialStatementItem[] => {
    const items: FinancialStatementItem[] = [];
    
    // Revenue items
    const revenueItems = ledgerSummaries.filter(l => l.is_revenue && l.total_amount !== 0);
    const totalRevenue = revenueItems.reduce((sum, item) => sum + Math.abs(item.total_amount), 0);
    
    items.push({ name: "INCOME", currentAmount: 0, level: 0, type: 'income' });
    revenueItems.forEach(item => {
      items.push({
        name: item.ledger,
        currentAmount: Math.abs(item.total_amount),
        level: 1,
        type: 'income'
      });
    });
    items.push({ name: "Total Income", currentAmount: totalRevenue, level: 0, type: 'income' });
    
    // Expense items
    const expenseItems = ledgerSummaries.filter(l => !l.is_revenue && !l.is_deemedpositive && l.total_amount !== 0);
    const totalExpenses = expenseItems.reduce((sum, item) => sum + Math.abs(item.total_amount), 0);
    
    items.push({ name: "EXPENSES", currentAmount: 0, level: 0, type: 'expense' });
    expenseItems.forEach(item => {
      items.push({
        name: item.ledger,
        currentAmount: Math.abs(item.total_amount),
        level: 1,
        type: 'expense'
      });
    });
    items.push({ name: "Total Expenses", currentAmount: totalExpenses, level: 0, type: 'expense' });
    
    // Net result
    const netProfit = totalRevenue - totalExpenses;
    items.push({
      name: netProfit >= 0 ? "Net Profit" : "Net Loss",
      currentAmount: Math.abs(netProfit),
      level: 0,
      type: netProfit >= 0 ? 'income' : 'expense'
    });

    return items;
  };

  const generateBalanceSheetItems = (ledgerSummaries: LedgerSummary[]): FinancialStatementItem[] => {
    const items: FinancialStatementItem[] = [];
    
    // Assets (deemed positive)
    const assetItems = ledgerSummaries.filter(l => l.is_deemedpositive && !l.is_revenue && l.total_amount !== 0);
    const totalAssets = assetItems.reduce((sum, item) => sum + Math.abs(item.total_amount), 0);
    
    items.push({ name: "ASSETS", currentAmount: 0, level: 0, type: 'asset' });
    assetItems.forEach(item => {
      items.push({
        name: item.ledger,
        currentAmount: Math.abs(item.total_amount),
        level: 1,
        type: 'asset'
      });
    });
    items.push({ name: "Total Assets", currentAmount: totalAssets, level: 0, type: 'asset' });
    
    // Liabilities
    const liabilityItems = ledgerSummaries.filter(l => !l.is_deemedpositive && !l.is_revenue && l.total_amount !== 0);
    const totalLiabilities = liabilityItems.reduce((sum, item) => sum + Math.abs(item.total_amount), 0);
    
    items.push({ name: "LIABILITIES", currentAmount: 0, level: 0, type: 'liability' });
    liabilityItems.forEach(item => {
      items.push({
        name: item.ledger,
        currentAmount: Math.abs(item.total_amount),
        level: 1,
        type: 'liability'
      });
    });
    items.push({ name: "Total Liabilities", currentAmount: totalLiabilities, level: 0, type: 'liability' });

    return items;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRowStyle = (item: FinancialStatementItem) => {
    const baseStyle = item.level === 0 ? "font-bold" : "";
    const marginStyle = item.level > 0 ? `pl-${item.level * 4}` : "";
    
    let colorStyle = "";
    if (item.level === 0) {
      switch (item.type) {
        case 'income':
          colorStyle = "text-green-700 bg-green-50";
          break;
        case 'expense':
          colorStyle = "text-red-700 bg-red-50";
          break;
        case 'asset':
          colorStyle = "text-blue-700 bg-blue-50";
          break;
        case 'liability':
          colorStyle = "text-purple-700 bg-purple-50";
          break;
      }
    }
    
    return `${baseStyle} ${marginStyle} ${colorStyle}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            Profit & Loss and Balance Sheet reports based on your accounting data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFinancialData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={fetchFinancialData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profit-loss" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Profit & Loss Statement</span>
              </CardTitle>
              <CardDescription>
                Income and expense summary for the current period
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
                        <TableHead>Particulars</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitLossItems.map((item, index) => (
                        <TableRow key={index} className={getRowStyle(item)}>
                          <TableCell className={getRowStyle(item)}>
                            {item.name}
                          </TableCell>
                          <TableCell className={`text-right ${getRowStyle(item)}`}>
                            {item.currentAmount > 0 ? formatCurrency(item.currentAmount) : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Balance Sheet</span>
              </CardTitle>
              <CardDescription>
                Assets and liabilities as of current date
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
                        <TableHead>Particulars</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceSheetItems.map((item, index) => (
                        <TableRow key={index} className={getRowStyle(item)}>
                          <TableCell className={getRowStyle(item)}>
                            {item.name}
                          </TableCell>
                          <TableCell className={`text-right ${getRowStyle(item)}`}>
                            {item.currentAmount > 0 ? formatCurrency(item.currentAmount) : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    profitLossItems
                      .filter(item => item.type === 'income' && item.level === 1)
                      .reduce((sum, item) => sum + item.currentAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    profitLossItems
                      .filter(item => item.type === 'expense' && item.level === 1)
                      .reduce((sum, item) => sum + item.currentAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    balanceSheetItems
                      .filter(item => item.type === 'asset' && item.level === 1)
                      .reduce((sum, item) => sum + item.currentAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                <PieChart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    balanceSheetItems
                      .filter(item => item.type === 'liability' && item.level === 1)
                      .reduce((sum, item) => sum + item.currentAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}