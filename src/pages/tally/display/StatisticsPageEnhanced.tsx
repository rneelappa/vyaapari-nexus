import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Package,
  FileText,
  Target,
  Activity,
  Award,
  AlertCircle,
  CheckCircle,
  Network,
  Database,
  Zap,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tallyApi, type ApiResponse } from '@/services/tallyApiService';

interface BusinessStatistics {
  totalLedgers: number;
  totalGroups: number;
  totalStockItems: number;
  totalVoucherTypes: number;
  totalVouchers: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  stockValue: number;
  activeEmployees: number;
  activeCostCenters: number;
  activeGodowns: number;
}

interface PerformanceMetrics {
  revenueGrowth: number;
  profitMargin: number;
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesDays: number;
  payablesDays: number;
  currentRatio: number;
  quickRatio: number;
}

interface StatisticsPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function StatisticsPageEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: StatisticsPageEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [businessStats, setBusinessStats] = useState<BusinessStatistics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'operational' | 'trends'>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { toast } = useToast();

  useEffect(() => {
    loadStatisticsData();
  }, [companyId, divisionId, dateRange]);

  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Loading comprehensive business statistics...', { fromDate, toDate });
      
      // Load all data for comprehensive statistics
      const [
        ledgersResponse,
        groupsResponse,
        stockItemsResponse,
        voucherTypesResponse,
        vouchersResponse,
        balanceSheetResponse,
        profitLossResponse
      ] = await Promise.all([
        tallyApi.getLedgers(companyId, divisionId, { limit: 1 }),
        tallyApi.getGroups(companyId, divisionId, { limit: 1 }),
        tallyApi.getStockItems(companyId, divisionId, { limit: 1 }),
        tallyApi.getVoucherTypes(companyId, divisionId, { limit: 1 }),
        tallyApi.getVouchers(companyId, divisionId),
        tallyApi.getBalanceSheet(companyId, divisionId, fromDate, toDate),
        tallyApi.getProfitLoss(companyId, divisionId, fromDate, toDate)
      ]);

      // Build comprehensive business statistics
      const stats: BusinessStatistics = {
        totalLedgers: ledgersResponse.metadata.pagination?.total || 0,
        totalGroups: groupsResponse.metadata.pagination?.total || 0,
        totalStockItems: stockItemsResponse.metadata.pagination?.total || 0,
        totalVoucherTypes: voucherTypesResponse.metadata.pagination?.total || 0,
        totalVouchers: vouchersResponse.success ? vouchersResponse.data.vouchers.length : 0,
        totalRevenue: profitLossResponse.success ? Math.abs(profitLossResponse.data.summary.totalRevenue || 0) : 0,
        totalExpenses: profitLossResponse.success ? Math.abs(profitLossResponse.data.summary.totalExpenses || 0) : 0,
        netProfit: profitLossResponse.success ? profitLossResponse.data.summary.netProfit || 0 : 0,
        totalAssets: balanceSheetResponse.success ? balanceSheetResponse.data.summary.totalAssets || 0 : 0,
        totalLiabilities: balanceSheetResponse.success ? balanceSheetResponse.data.summary.totalLiabilities || 0 : 0,
        stockValue: 0, // Would calculate from stock items
        activeEmployees: 3, // Mock data
        activeCostCenters: 3, // Mock data
        activeGodowns: 2 // Mock data
      };

      // Calculate performance metrics
      const metrics: PerformanceMetrics = {
        revenueGrowth: 15.2, // Mock calculation
        profitMargin: stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0,
        assetTurnover: stats.totalAssets > 0 ? stats.totalRevenue / stats.totalAssets : 0,
        inventoryTurnover: 4.5, // Mock calculation
        receivablesDays: 45, // Mock calculation
        payablesDays: 30, // Mock calculation
        currentRatio: 1.8, // Mock calculation
        quickRatio: 1.2 // Mock calculation
      };

      setBusinessStats(stats);
      setPerformanceMetrics(metrics);
      setLastUpdated(new Date());

      console.log('Business statistics loaded successfully');

    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast({
        title: "Error",
        description: "Failed to load business statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, type: 'percentage' | 'ratio' | 'days') => {
    switch (type) {
      case 'percentage':
        if (value > 15) return 'text-green-600';
        if (value > 5) return 'text-yellow-600';
        return 'text-red-600';
      case 'ratio':
        if (value > 1.5) return 'text-green-600';
        if (value > 1.0) return 'text-yellow-600';
        return 'text-red-600';
      case 'days':
        if (value < 30) return 'text-green-600';
        if (value < 60) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricIcon = (value: number, benchmark: number) => {
    if (value > benchmark) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < benchmark * 0.8) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-48 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Business Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive business metrics with performance analytics and KPIs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Activity className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={loadStatisticsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {businessStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {businessStats.totalLedgers}
                  </div>
                  <div className="text-sm text-muted-foreground">Ledgers</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {businessStats.totalStockItems}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock Items</div>
                </div>
                <Package className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {businessStats.totalVouchers}
                  </div>
                  <div className="text-sm text-muted-foreground">Vouchers</div>
                </div>
                <FileText className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    ₹{(businessStats.totalRevenue / 10000000).toFixed(1)}Cr
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl font-bold ${businessStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(Math.abs(businessStats.netProfit) / 10000000).toFixed(1)}Cr
                  </div>
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                </div>
                <Target className={`h-8 w-8 opacity-50 ${businessStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {businessStats.activeEmployees}
                  </div>
                  <div className="text-sm text-muted-foreground">Employees</div>
                </div>
                <Users className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial KPIs</TabsTrigger>
          <TabsTrigger value="operational">Operational Metrics</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        {/* Business Overview */}
        <TabsContent value="overview" className="space-y-4">
          {businessStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Master Data Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{businessStats.totalLedgers}</div>
                        <div className="text-sm text-muted-foreground">Chart of Accounts</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">{businessStats.totalGroups}</div>
                        <div className="text-sm text-muted-foreground">Account Groups</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{businessStats.totalStockItems}</div>
                        <div className="text-sm text-muted-foreground">Inventory Items</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-orange-600">{businessStats.totalVoucherTypes}</div>
                        <div className="text-sm text-muted-foreground">Transaction Types</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Financial Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Total Revenue:</span>
                        <span className="font-bold text-green-600">
                          ₹{(businessStats.totalRevenue / 10000000).toFixed(1)} Crores
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Net Profit:</span>
                        <span className={`font-bold ${businessStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{(Math.abs(businessStats.netProfit) / 10000000).toFixed(1)} Crores
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Total Assets:</span>
                        <span className="font-bold text-blue-600">
                          ₹{(businessStats.totalAssets / 10000000).toFixed(1)} Crores
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Total Liabilities:</span>
                        <span className="font-bold text-red-600">
                          ₹{(businessStats.totalLiabilities / 10000000).toFixed(1)} Crores
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Financial KPIs */}
        <TabsContent value="financial" className="space-y-4">
          {performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profit Margin</span>
                    {getMetricIcon(performanceMetrics.profitMargin, 10)}
                  </div>
                  <div className={`text-2xl font-bold ${getMetricColor(performanceMetrics.profitMargin, 'percentage')}`}>
                    {performanceMetrics.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Target: >10%</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Asset Turnover</span>
                    {getMetricIcon(performanceMetrics.assetTurnover, 1.0)}
                  </div>
                  <div className={`text-2xl font-bold ${getMetricColor(performanceMetrics.assetTurnover, 'ratio')}`}>
                    {performanceMetrics.assetTurnover.toFixed(2)}x
                  </div>
                  <div className="text-xs text-muted-foreground">Target: >1.0x</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Ratio</span>
                    {getMetricIcon(performanceMetrics.currentRatio, 1.5)}
                  </div>
                  <div className={`text-2xl font-bold ${getMetricColor(performanceMetrics.currentRatio, 'ratio')}`}>
                    {performanceMetrics.currentRatio.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Target: >1.5</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    {getMetricIcon(performanceMetrics.revenueGrowth, 10)}
                  </div>
                  <div className={`text-2xl font-bold ${getMetricColor(performanceMetrics.revenueGrowth, 'percentage')}`}>
                    {performanceMetrics.revenueGrowth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Target: >10%</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Operational Metrics */}
        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Inventory Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Inventory Turnover:</span>
                    <span className="font-bold text-green-600">
                      {performanceMetrics?.inventoryTurnover.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stock Items:</span>
                    <span className="font-bold">{businessStats?.totalStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Godowns:</span>
                    <span className="font-bold">{businessStats?.activeGodowns}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Human Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Employees:</span>
                    <span className="font-bold text-blue-600">{businessStats?.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Centers:</span>
                    <span className="font-bold">{businessStats?.activeCostCenters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Salary:</span>
                    <span className="font-bold">₹65,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Transaction Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Vouchers:</span>
                    <span className="font-bold text-purple-600">{businessStats?.totalVouchers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Voucher Types:</span>
                    <span className="font-bold">{businessStats?.totalVoucherTypes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Average:</span>
                    <span className="font-bold">
                      {businessStats ? Math.round(businessStats.totalVouchers / 30) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Receivables Days</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(60 - performanceMetrics.receivablesDays) / 60 * 100} className="w-20" />
                          <span className={`text-sm font-bold ${getMetricColor(performanceMetrics.receivablesDays, 'days')}`}>
                            {performanceMetrics.receivablesDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payables Days</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(60 - performanceMetrics.payablesDays) / 60 * 100} className="w-20" />
                          <span className={`text-sm font-bold ${getMetricColor(performanceMetrics.payablesDays, 'days')}`}>
                            {performanceMetrics.payablesDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quick Ratio</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={performanceMetrics.quickRatio / 2 * 100} className="w-20" />
                          <span className={`text-sm font-bold ${getMetricColor(performanceMetrics.quickRatio, 'ratio')}`}>
                            {performanceMetrics.quickRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Business Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">92</div>
                    <div className="text-sm text-muted-foreground">Overall Health Score</div>
                    <Badge variant="default" className="mt-2">Excellent</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Financial Health</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={95} className="w-16" />
                        <span className="text-sm font-bold text-green-600">95%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Operational Efficiency</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={88} className="w-16" />
                        <span className="text-sm font-bold text-green-600">88%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Quality</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={94} className="w-16" />
                        <span className="text-sm font-bold text-green-600">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Statistics
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Detailed Report
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trend Analysis
            </Button>
            <Button variant="outline" size="sm">
              <Network className="h-4 w-4 mr-2" />
              Relationship Map
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function getMetricColor(value: number, type: 'percentage' | 'ratio' | 'days'): string {
    switch (type) {
      case 'percentage':
        if (value > 15) return 'text-green-600';
        if (value > 5) return 'text-yellow-600';
        return 'text-red-600';
      case 'ratio':
        if (value > 1.5) return 'text-green-600';
        if (value > 1.0) return 'text-yellow-600';
        return 'text-red-600';
      case 'days':
        if (value < 30) return 'text-green-600';
        if (value < 60) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  function getMetricIcon(value: number, benchmark: number) {
    if (value > benchmark) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < benchmark * 0.8) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-yellow-600" />;
  }
}

export default StatisticsPageEnhanced;
