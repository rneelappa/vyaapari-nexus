/**
 * Analytics Dashboard
 * Comprehensive analytics dashboard with financial, inventory, and sales insights
 * Built on Tally ERP data with interactive visualizations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FinancialAnalytics, { FinancialPeriod, ProfitLossData, BalanceSheetData, CashFlowData, FinancialMetrics } from '@/services/financial-analytics';
import InventoryAnalytics, { InventoryMetrics, ABCAnalysis, ReorderAnalysis } from '@/services/inventory-analytics';
import SalesAnalytics, { RevenueAnalysis, CustomerAnalysis, ProductPerformance, SalesMetrics } from '@/services/sales-analytics';
import { 
  BarChart, 
  LineChart as LineChartComponent, 
  PieChart as PieChartComponent, 
  DonutChart, 
  AreaChart, 
  MetricCard 
} from '@/components/analytics/ChartComponents';

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    periodType: 'monthly'
  });
  const [companyId, setCompanyId] = useState('default');
  
  // Analytics services
  const [financialAnalytics] = useState(() => new FinancialAnalytics(companyId));
  const [inventoryAnalytics] = useState(() => new InventoryAnalytics(companyId));
  const [salesAnalytics] = useState(() => new SalesAnalytics(companyId));
  
  // Data state
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null);
  const [abcAnalysis, setAbcAnalysis] = useState<ABCAnalysis[]>([]);
  const [reorderAnalysis, setReorderAnalysis] = useState<ReorderAnalysis[]>([]);
  const [revenueAnalysis, setRevenueAnalysis] = useState<RevenueAnalysis | null>(null);
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysis[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [selectedPeriod, companyId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadFinancialData(),
        loadInventoryData(),
        loadSalesData()
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialData = async () => {
    try {
      const [pl, bs, cf, metrics] = await Promise.all([
        financialAnalytics.generateProfitLoss(selectedPeriod),
        financialAnalytics.generateBalanceSheet(selectedPeriod),
        financialAnalytics.generateCashFlow(selectedPeriod),
        financialAnalytics.calculateFinancialMetrics(selectedPeriod)
      ]);
      
      setProfitLoss(pl);
      setBalanceSheet(bs);
      setCashFlow(cf);
      setFinancialMetrics(metrics);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const loadInventoryData = async () => {
    try {
      const [metrics, abc, reorder] = await Promise.all([
        inventoryAnalytics.calculateInventoryMetrics(),
        inventoryAnalytics.performABCAnalysis(),
        inventoryAnalytics.analyzeReorderRequirements()
      ]);
      
      setInventoryMetrics(metrics);
      setAbcAnalysis(abc);
      setReorderAnalysis(reorder);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      const [revenue, customers, products, metrics] = await Promise.all([
        salesAnalytics.analyzeRevenue(selectedPeriod),
        salesAnalytics.analyzeCustomers(),
        salesAnalytics.analyzeProductPerformance(),
        salesAnalytics.calculateSalesMetrics()
      ]);
      
      setRevenueAnalysis(revenue);
      setCustomerAnalysis(customers);
      setProductPerformance(products);
      setSalesMetrics(metrics);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  const handlePeriodChange = (periodType: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodType) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    setSelectedPeriod({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      periodType: periodType as any
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Analytics data export has been initiated",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod.periodType} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={loadAllData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading analytics data...
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value={revenueAnalysis?.totalRevenue?.toLocaleString() || '0'}
                change={revenueAnalysis?.period ? {
                  value: revenueAnalysis.period.growthPercentage,
                  type: revenueAnalysis.period.growth > 0 ? 'increase' : 'decrease'
                } : undefined}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <MetricCard
                title="Inventory Value"
                value={inventoryMetrics?.totalValue?.toLocaleString() || '0'}
                icon={<Package className="h-4 w-4" />}
              />
              <MetricCard
                title="Active Customers"
                value={customerAnalysis?.length?.toString() || '0'}
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard
                title="Net Profit"
                value={profitLoss?.netProfit?.toLocaleString() || '0'}
                change={profitLoss?.trends ? {
                  value: profitLoss.trends.profitGrowth,
                  type: profitLoss.trends.profitGrowth > 0 ? 'increase' : 'decrease'
                } : undefined}
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <LineChartComponent
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [{
                    label: 'Revenue',
                    data: [50000, 55000, 48000, 62000, 58000, 65000]
                  }]
                }}
                title="Revenue Trend"
                description="Monthly revenue performance"
              />
              
              {/* Top Products */}
              <BarChart
                data={{
                  labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
                  datasets: [{
                    label: 'Sales',
                    data: [25000, 20000, 18000, 15000, 12000]
                  }]
                }}
                title="Top Products"
                description="Best performing products by revenue"
              />
            </div>

            {/* ABC Analysis */}
            {abcAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventory ABC Analysis</CardTitle>
                  <CardDescription>
                    Classification of inventory items by value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {abcAnalysis.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Category {category.category}</h3>
                          <Badge variant={category.category === 'A' ? 'destructive' : category.category === 'B' ? 'default' : 'secondary'}>
                            {category.count} items
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">
                          {category.totalValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}% of total value
                        </div>
                        <ul className="text-xs space-y-1">
                          {category.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="text-muted-foreground">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <div className="space-y-6">
            {/* Financial Metrics */}
            {financialMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Gross Margin"
                  value={`${financialMetrics.profitability.grossMargin.toFixed(1)}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MetricCard
                  title="Operating Margin"
                  value={`${financialMetrics.profitability.operatingMargin.toFixed(1)}%`}
                  icon={<BarChart3 className="h-4 w-4" />}
                />
                <MetricCard
                  title="Net Margin"
                  value={`${financialMetrics.profitability.netMargin.toFixed(1)}%`}
                  icon={<Target className="h-4 w-4" />}
                />
                <MetricCard
                  title="ROE"
                  value={`${financialMetrics.profitability.returnOnEquity.toFixed(1)}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
              </div>
            )}

            {/* P&L Chart */}
            {profitLoss && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartComponent
                  data={{
                    labels: ['Revenue', 'Expenses'],
                    datasets: [{
                      label: 'Amount',
                      data: [profitLoss.revenue.total, profitLoss.expenses.total]
                    }]
                  }}
                  title="Revenue vs Expenses"
                  description="Profit & Loss breakdown"
                />
                
                <BarChart
                  data={{
                    labels: profitLoss.revenue.breakdown.slice(0, 5).map(item => item.account),
                    datasets: [{
                      label: 'Revenue',
                      data: profitLoss.revenue.breakdown.slice(0, 5).map(item => item.amount)
                    }]
                  }}
                  title="Top Revenue Sources"
                  description="Highest revenue generating accounts"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="space-y-6">
            {/* Inventory Metrics */}
            {inventoryMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Items"
                  value={inventoryMetrics.totalItems.toString()}
                  icon={<Package className="h-4 w-4" />}
                />
                <MetricCard
                  title="Total Value"
                  value={inventoryMetrics.totalValue.toLocaleString()}
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <MetricCard
                  title="Turnover Ratio"
                  value={inventoryMetrics.turnoverRatio.toFixed(2)}
                  icon={<RefreshCw className="h-4 w-4" />}
                />
                <MetricCard
                  title="Stockout Rate"
                  value={`${inventoryMetrics.stockoutRate.toFixed(1)}%`}
                  icon={<AlertCircle className="h-4 w-4" />}
                />
              </div>
            )}

            {/* Reorder Analysis */}
            {reorderAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reorder Analysis</CardTitle>
                  <CardDescription>
                    Items requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reorderAnalysis.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.currentStock} | Reorder Point: {item.reorderPoint}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.urgency === 'immediate' ? 'destructive' : item.urgency === 'soon' ? 'default' : 'secondary'}>
                            {item.urgency}
                          </Badge>
                          <Badge variant={item.stockoutRisk === 'high' ? 'destructive' : item.stockoutRisk === 'medium' ? 'default' : 'secondary'}>
                            {item.stockoutRisk} risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="space-y-6">
            {/* Sales Metrics */}
            {salesMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Sales"
                  value={salesMetrics.totalSales.toLocaleString()}
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <MetricCard
                  title="Avg Order Value"
                  value={salesMetrics.averageOrderValue.toLocaleString()}
                  icon={<Target className="h-4 w-4" />}
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${salesMetrics.conversionRate}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MetricCard
                  title="Customer LTV"
                  value={salesMetrics.customerLifetimeValue.toLocaleString()}
                  icon={<Users className="h-4 w-4" />}
                />
              </div>
            )}

            {/* Top Customers */}
            {customerAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>
                    Highest value customers by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerAnalysis.slice(0, 10).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{customer.customerName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {customer.totalTransactions} transactions • {customer.averageOrderValue.toLocaleString()} avg order
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={customer.segment === 'high_value' ? 'destructive' : customer.segment === 'medium_value' ? 'default' : 'secondary'}>
                            {customer.segment}
                          </Badge>
                          <span className="font-semibold">{customer.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
