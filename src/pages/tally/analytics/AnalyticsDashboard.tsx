/**
 * Analytics Dashboard
 * Comprehensive analytics dashboard with financial, inventory, and sales metrics
 * Currently using mock data - will be updated when real data services are ready
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { financialAnalytics, type FinancialPeriod, type ProfitLossData, type BalanceSheetData, type FinancialMetrics } from '@/services/financial-analytics';
import { inventoryAnalytics, type InventoryItem, type InventoryAnalysis } from '@/services/inventory-analytics';
import { salesAnalytics, type SalesAnalysis, type SalesMetrics } from '@/services/sales-analytics';

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<FinancialPeriod>({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });
  
  // Analytics data
  const [profitLossData, setProfitLossData] = useState<ProfitLossData | null>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryAnalysis | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalysis | null>(null);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load financial data
      const [pnl, balanceSheet, metrics] = await Promise.all([
        financialAnalytics.generateProfitLoss(period),
        financialAnalytics.generateBalanceSheet(period),
        financialAnalytics.calculateFinancialMetrics(period)
      ]);
      
      setProfitLossData(pnl);
      setBalanceSheetData(balanceSheet);
      setFinancialMetrics(metrics);

      // Load inventory data
      const inventory = await inventoryAnalytics.getInventoryOverview();
      setInventoryData(inventory);

      // Load sales data
      const [sales, salesMet] = await Promise.all([
        salesAnalytics.analyzeRevenue(period),
        salesAnalytics.getSalesMetrics()
      ]);
      
      setSalesData(sales);
      setSalesMetrics(salesMet);

      toast({
        title: "Analytics Updated",
        description: "Dashboard data has been refreshed successfully",
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={`${period.startDate}-${period.endDate}`}
            onValueChange={(value) => {
              const [start, end] = value.split('-');
              setPeriod({ startDate: start, endDate: end });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01-01-2024-12-31">2024 (Full Year)</SelectItem>
              <SelectItem value="2024-01-01-2024-03-31">Q1 2024</SelectItem>
              <SelectItem value="2024-04-01-2024-06-30">Q2 2024</SelectItem>
              <SelectItem value="2024-07-01-2024-09-30">Q3 2024</SelectItem>
              <SelectItem value="2024-10-01-2024-12-31">Q4 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} disabled={isLoading}>
            <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitLossData ? formatCurrency(profitLossData.netProfit) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{profitLossData ? formatPercentage(profitLossData.margins.netMargin) : '0%'} margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitLossData ? formatCurrency(profitLossData.revenue.total) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{salesData ? formatPercentage(salesData.period.growthPercentage) : '0%'} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData ? formatCurrency(inventoryData.totalValue) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              <Package className="h-3 w-3 inline mr-1" />
              {inventoryData ? inventoryData.totalItems : 0} items in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesMetrics ? salesMetrics.totalOrders.toLocaleString() : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              <Users className="h-3 w-3 inline mr-1" />
              {salesMetrics ? formatCurrency(salesMetrics.averageOrderValue) : '—'} avg value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        {/* Financial Analytics */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Overview</CardTitle>
                <CardDescription>Revenue, expenses, and profitability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profitLossData && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue</span>
                        <span className="font-medium">{formatCurrency(profitLossData.revenue.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses</span>
                        <span className="font-medium">{formatCurrency(profitLossData.expenses.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gross Profit</span>
                        <span className="font-medium">{formatCurrency(profitLossData.grossProfit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Net Profit</span>
                        <span className="font-bold text-green-600">{formatCurrency(profitLossData.netProfit)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Gross Margin</div>
                        <div className="text-lg font-semibold">{formatPercentage(profitLossData.margins.grossMargin)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Operating Margin</div>
                        <div className="text-lg font-semibold">{formatPercentage(profitLossData.margins.operatingMargin)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Net Margin</div>
                        <div className="text-lg font-semibold">{formatPercentage(profitLossData.margins.netMargin)}</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Assets, liabilities, and equity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {balanceSheetData && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                        <span className="font-medium">{formatCurrency(balanceSheetData.assets.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Liabilities</span>
                        <span className="font-medium">{formatCurrency(balanceSheetData.liabilities.total)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Equity</span>
                        <span className="font-bold text-blue-600">{formatCurrency(balanceSheetData.equity.total)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Assets Breakdown</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Current</span>
                            <span>{formatCurrency(balanceSheetData.assets.current)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fixed</span>
                            <span>{formatCurrency(balanceSheetData.assets.fixed)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Liabilities Breakdown</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Current</span>
                            <span>{formatCurrency(balanceSheetData.liabilities.current)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Long-term</span>
                            <span>{formatCurrency(balanceSheetData.liabilities.longTerm)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Ratios</CardTitle>
              <CardDescription>Key financial performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              {financialMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Profitability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">ROA</span>
                        <Badge variant="secondary">{formatPercentage(financialMetrics.profitability.returnOnAssets)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ROE</span>
                        <Badge variant="secondary">{formatPercentage(financialMetrics.profitability.returnOnEquity)}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Liquidity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current Ratio</span>
                        <Badge variant="secondary">{financialMetrics.liquidity.currentRatio.toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quick Ratio</span>
                        <Badge variant="secondary">{financialMetrics.liquidity.quickRatio.toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Efficiency</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Asset Turnover</span>
                        <Badge variant="secondary">{financialMetrics.efficiency.assetTurnover.toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Inventory Turnover</span>
                        <Badge variant="secondary">{financialMetrics.efficiency.inventoryTurnover.toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Leverage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Debt to Assets</span>
                        <Badge variant="secondary">{formatPercentage(financialMetrics.leverage.debtToAssets * 100)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Interest Coverage</span>
                        <Badge variant="secondary">{financialMetrics.leverage.interestCoverage.toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Analytics */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
                <CardDescription>Stock levels and valuation</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{inventoryData.totalItems}</div>
                        <div className="text-sm text-blue-600">Total Items</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(inventoryData.totalValue)}</div>
                        <div className="text-sm text-green-600">Total Value</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average Turnover</span>
                        <Badge variant="outline">{inventoryData.averageTurnover.toFixed(1)}x</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Stockout Items</span>
                        <Badge variant="destructive">{inventoryData.stockoutItems}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Overstock Items</span>
                        <Badge variant="secondary">{inventoryData.overstockItems}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Inventory value by category</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData && (
                  <div className="space-y-3">
                    {Object.entries(inventoryData.categoryBreakdown).map(([category, value]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(value)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPercentage((value / inventoryData.totalValue) * 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Revenue and growth metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(salesData.period.current)}</div>
                        <div className="text-sm text-green-600">Current Period</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatPercentage(salesData.period.growthPercentage)}</div>
                        <div className="text-sm text-blue-600">Growth Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Previous Period</span>
                        <span className="font-medium">{formatCurrency(salesData.period.previous)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Amount</span>
                        <span className="font-medium text-green-600">+{formatCurrency(salesData.period.growth)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Metrics</CardTitle>
                <CardDescription>Key sales performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {salesMetrics && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">{formatCurrency(salesMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-medium">{salesMetrics.totalOrders.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-medium">{formatCurrency(salesMetrics.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate</span>
                      <Badge variant="outline">{formatPercentage(salesMetrics.conversionRate)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Lifetime Value</span>
                      <span className="font-medium">{formatCurrency(salesMetrics.customerLifetimeValue)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert for Mock Data */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This dashboard is currently displaying mock data for demonstration purposes. 
          Real-time data integration will be available once the database schema is finalized.
        </AlertDescription>
      </Alert>
    </div>
  );
}