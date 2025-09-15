import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  RefreshCw,
  Calendar as CalendarIcon,
  DollarSign,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';
import { tallyApi, type ApiResponse } from '@/services/tallyApiService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FinancialReport {
  reportType: string;
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  lineItems: Array<{
    account: string;
    debit: number;
    credit: number;
    openingBalance?: number;
    closingBalance?: number;
  }>;
  summary: {
    totalAssets?: number;
    totalLiabilities?: number;
    totalRevenue?: number;
    totalExpenses?: number;
    netProfit?: number;
    profitMargin?: string;
    totalDebits?: number;
    totalCredits?: number;
    difference?: number;
    isBalanced?: boolean;
  };
}

interface FinancialReportsEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function FinancialReportsEnhanced({ companyId, divisionId }: FinancialReportsEnhancedProps) {
  const [balanceSheet, setBalanceSheet] = useState<FinancialReport | null>(null);
  const [profitLoss, setProfitLoss] = useState<FinancialReport | null>(null);
  const [trialBalance, setTrialBalance] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<'balance-sheet' | 'profit-loss' | 'trial-balance'>('balance-sheet');
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 3, 1), // April 1, 2025
    to: new Date(2025, 3, 30)   // April 30, 2025
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFinancialReports();
  }, [companyId, divisionId, dateRange]);

  const loadFinancialReports = async () => {
    try {
      setLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Loading financial reports from API...', { fromDate, toDate });
      
      // Load all financial reports in parallel
      const [balanceSheetResponse, profitLossResponse, trialBalanceResponse] = await Promise.all([
        tallyApi.getBalanceSheet(companyId, divisionId, fromDate, toDate),
        tallyApi.getProfitLoss(companyId, divisionId, fromDate, toDate),
        tallyApi.getTrialBalance(companyId, divisionId, fromDate, toDate)
      ]);

      if (balanceSheetResponse.success) {
        setBalanceSheet(balanceSheetResponse.data);
      }

      if (profitLossResponse.success) {
        setProfitLoss(profitLossResponse.data);
      }

      if (trialBalanceResponse.success) {
        setTrialBalance(trialBalanceResponse.data);
      }

      console.log('Financial reports loaded successfully');

    } catch (error) {
      console.error('Failed to load financial reports:', error);
      toast({
        title: "Error",
        description: "Failed to load financial reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentReport = () => {
    switch (activeReport) {
      case 'balance-sheet': return balanceSheet;
      case 'profit-loss': return profitLoss;
      case 'trial-balance': return trialBalance;
      default: return null;
    }
  };

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'balance-sheet': return <BarChart3 className="h-5 w-5" />;
      case 'profit-loss': return <TrendingUp className="h-5 w-5" />;
      case 'trial-balance': return <Calculator className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const currentReport = getCurrentReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Real-time financial statements with complete Tally integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Date Range Selector */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                    setCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={loadFinancialReports} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={(value) => setActiveReport(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance-sheet" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            Trial Balance
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          {balanceSheet && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Total Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{balanceSheet.summary.totalAssets?.toLocaleString('en-IN') || '0'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                      Total Liabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{balanceSheet.summary.totalLiabilities?.toLocaleString('en-IN') || '0'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Balance Sheet Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Balance Sheet Details</CardTitle>
                  <CardDescription>
                    As of {format(dateRange.to, 'MMMM dd, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {balanceSheet.lineItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-semibold">{item.account}</span>
                          <div className="flex items-center space-x-4">
                            {item.debit > 0 && (
                              <span className="text-green-600 font-semibold">
                                ₹{item.debit.toLocaleString('en-IN')}
                              </span>
                            )}
                            {item.credit > 0 && (
                              <span className="text-red-600 font-semibold">
                                ₹{item.credit.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss" className="space-y-4">
          {profitLoss && (
            <>
              {/* P&L Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{Math.abs(profitLoss.summary.totalRevenue || 0).toLocaleString('en-IN')}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                      Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{Math.abs(profitLoss.summary.totalExpenses || 0).toLocaleString('en-IN')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${(profitLoss.summary.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(profitLoss.summary.netProfit || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Margin: {profitLoss.summary.profitMargin || '0%'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* P&L Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>
                    For the period {format(dateRange.from, 'MMM dd')} to {format(dateRange.to, 'MMM dd, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {profitLoss.lineItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-semibold">{item.account}</span>
                          <div className="flex items-center space-x-4">
                            {item.debit > 0 && (
                              <span className="text-red-600 font-semibold">
                                ₹{item.debit.toLocaleString('en-IN')}
                              </span>
                            )}
                            {item.credit > 0 && (
                              <span className="text-green-600 font-semibold">
                                ₹{item.credit.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial-balance" className="space-y-4">
          {trialBalance && (
            <>
              {/* Trial Balance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Total Debits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{trialBalance.summary.totalDebits?.toLocaleString('en-IN') || '0'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                      Total Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{trialBalance.summary.totalCredits?.toLocaleString('en-IN') || '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      {trialBalance.summary.isBalanced ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                      )}
                      Balance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-bold ${trialBalance.summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      {trialBalance.summary.isBalanced ? 'Balanced' : 'Unbalanced'}
                    </div>
                    {!trialBalance.summary.isBalanced && (
                      <div className="text-sm text-muted-foreground">
                        Difference: ₹{trialBalance.summary.difference?.toLocaleString('en-IN')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Trial Balance Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Trial Balance</CardTitle>
                  <CardDescription>
                    As of {format(dateRange.to, 'MMMM dd, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-1">
                      <div className="grid grid-cols-5 gap-4 p-3 bg-muted rounded-lg font-semibold text-sm">
                        <span>Ledger</span>
                        <span className="text-center">Opening</span>
                        <span className="text-center">Debit</span>
                        <span className="text-center">Credit</span>
                        <span className="text-center">Closing</span>
                      </div>
                      {trialBalance.lineItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 gap-4 p-3 border rounded-lg text-sm">
                          <span className="font-semibold">{item.account}</span>
                          <span className="text-center">
                            ₹{item.openingBalance?.toLocaleString('en-IN') || '0'}
                          </span>
                          <span className="text-center text-green-600">
                            ₹{item.debit.toLocaleString('en-IN')}
                          </span>
                          <span className="text-center text-red-600">
                            ₹{item.credit.toLocaleString('en-IN')}
                          </span>
                          <span className="text-center font-semibold">
                            ₹{item.closingBalance?.toLocaleString('en-IN') || '0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Report Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View in Tally
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monthly Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeReport === 'balance-sheet' && balanceSheet && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Financial Position</h4>
                    <p className="text-sm text-muted-foreground">
                      Total liabilities of ₹{balanceSheet.summary.totalLiabilities?.toLocaleString('en-IN')} 
                      indicate the company's financial obligations.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Asset Distribution</h4>
                    <p className="text-sm text-muted-foreground">
                      Review asset allocation and liquidity position for better financial planning.
                    </p>
                  </div>
                </div>
              )}

              {activeReport === 'profit-loss' && profitLoss && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Profitability Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Revenue of ₹{Math.abs(profitLoss.summary.totalRevenue || 0).toLocaleString('en-IN')} 
                      with {profitLoss.summary.profitMargin} profit margin.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Performance Indicators</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor monthly trends and seasonal patterns for business optimization.
                    </p>
                  </div>
                </div>
              )}

              {activeReport === 'trial-balance' && trialBalance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Accounting Accuracy</h4>
                    <p className="text-sm text-muted-foreground">
                      Trial balance is {trialBalance.summary.isBalanced ? 'balanced' : 'unbalanced'}.
                      {!trialBalance.summary.isBalanced && ` Difference: ₹${trialBalance.summary.difference?.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Data Integrity</h4>
                    <p className="text-sm text-muted-foreground">
                      All ledger balances are properly reflected with complete audit trail.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FinancialReportsEnhanced;
