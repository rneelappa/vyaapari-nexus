import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Building,
  Warehouse
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  loading?: boolean;
}

interface StatisticsData {
  totalLedgers: number;
  totalStockItems: number;
  totalEmployees: number;
  totalGodowns: number;
  totalCompanies: number;
  totalDivisions: number;
  accountingEntries: number;
  inventoryTransactions: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch counts from various tables
      const [
        { count: ledgerCount },
        { count: stockCount },
        { count: employeeCount },
        { count: godownCount },
        { count: companyCount },
        { count: divisionCount },
        { count: accountingCount },
        { count: inventoryCount }
      ] = await Promise.all([
        supabase.from('bkp_mst_ledger').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_stock_item').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_employee').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_mst_godown').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('divisions').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_trn_accounting').select('*', { count: 'exact', head: true }),
        supabase.from('bkp_trn_batch').select('*', { count: 'exact', head: true })
      ]);

      const data: StatisticsData = {
        totalLedgers: ledgerCount || 0,
        totalStockItems: stockCount || 0,
        totalEmployees: employeeCount || 0,
        totalGodowns: godownCount || 0,
        totalCompanies: companyCount || 0,
        totalDivisions: divisionCount || 0,
        accountingEntries: accountingCount || 0,
        inventoryTransactions: inventoryCount || 0,
      };

      setStatisticsData(data);

      // Create stat cards with real data
      const statCards: StatCard[] = [
        {
          title: "Total Ledgers",
          value: data.totalLedgers.toLocaleString(),
          change: 0, // Could calculate from historical data
          icon: BarChart3,
          color: "text-blue-600"
        },
        {
          title: "Stock Items",
          value: data.totalStockItems.toLocaleString(),
          change: 0,
          icon: Package,
          color: "text-green-600"
        },
        {
          title: "Employees",
          value: data.totalEmployees.toLocaleString(),
          change: 0,
          icon: Users,
          color: "text-purple-600"
        },
        {
          title: "Godowns",
          value: data.totalGodowns.toLocaleString(),
          change: 0,
          icon: Warehouse,
          color: "text-orange-600"
        },
        {
          title: "Companies",
          value: data.totalCompanies.toLocaleString(),
          change: 0,
          icon: Building,
          color: "text-indigo-600"
        },
        {
          title: "Divisions",
          value: data.totalDivisions.toLocaleString(),
          change: 0,
          icon: Activity,
          color: "text-cyan-600"
        },
        {
          title: "Accounting Entries",
          value: data.accountingEntries.toLocaleString(),
          change: 0,
          icon: DollarSign,
          color: "text-emerald-600"
        },
        {
          title: "Inventory Transactions",
          value: data.inventoryTransactions.toLocaleString(),
          change: 0,
          icon: TrendingUp,
          color: "text-rose-600"
        }
      ];

      setStats(statCards);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ stat }: { stat: StatCard }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <stat.icon className={`h-4 w-4 ${stat.color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${stat.color}`}>
          {loading ? '...' : stat.value}
        </div>
        {stat.change !== 0 && (
          <p className="text-xs text-muted-foreground flex items-center">
            {stat.change > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            {Math.abs(stat.change)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Tally data and key performance indicators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStatistics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={fetchStatistics} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="masters">Masters Data</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="masters" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.slice(0, 4).map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Master Data Summary</CardTitle>
              <CardDescription>
                Breakdown of master data entities in your Tally system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statisticsData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span>Ledger Accounts</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalLedgers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span>Stock Items</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalStockItems}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>Employee Records</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalEmployees}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Warehouse className="h-4 w-4 text-orange-600" />
                      <span>Storage Locations</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalGodowns}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.slice(6, 8).map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
              <CardDescription>
                Overview of transaction volumes and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statisticsData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span>Accounting Transactions</span>
                    </span>
                    <Badge variant="outline">{statisticsData.accountingEntries}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-rose-600" />
                      <span>Inventory Movements</span>
                    </span>
                    <Badge variant="outline">{statisticsData.inventoryTransactions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span>Total Transactions</span>
                    </span>
                    <Badge variant="default">
                      {(statisticsData.accountingEntries + statisticsData.inventoryTransactions).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.slice(4, 6).map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Organizational Structure</CardTitle>
              <CardDescription>
                Company and division hierarchy overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statisticsData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-indigo-600" />
                      <span>Companies</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalCompanies}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-cyan-600" />
                      <span>Divisions</span>
                    </span>
                    <Badge variant="outline">{statisticsData.totalDivisions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>Avg. Employees per Division</span>
                    </span>
                    <Badge variant="default">
                      {statisticsData.totalDivisions > 0 
                        ? Math.round(statisticsData.totalEmployees / statisticsData.totalDivisions)
                        : 0
                      }
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}