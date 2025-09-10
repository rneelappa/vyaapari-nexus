import { useState } from "react";
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
  Activity
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

const mockStats: StatCard[] = [
  {
    title: "Total Sales",
    value: "₹2,450,000",
    change: 12.5,
    icon: TrendingUp,
    color: "text-green-600"
  },
  {
    title: "Total Purchases",
    value: "₹1,850,000",
    change: -5.2,
    icon: TrendingDown,
    color: "text-red-600"
  },
  {
    title: "Net Profit",
    value: "₹600,000",
    change: 8.3,
    icon: DollarSign,
    color: "text-blue-600"
  },
  {
    title: "Stock Value",
    value: "₹1,200,000",
    change: 3.1,
    icon: Package,
    color: "text-purple-600"
  }
];

const mockTopCustomers = [
  { name: "LSI-MECH ENGINEERS PRIVATE LIMITED", amount: 450000, percentage: 18.4 },
  { name: "ABC Manufacturing Ltd", amount: 320000, percentage: 13.1 },
  { name: "XYZ Industries", amount: 280000, percentage: 11.4 },
  { name: "DEF Corporation", amount: 250000, percentage: 10.2 },
  { name: "GHI Enterprises", amount: 200000, percentage: 8.2 }
];

const mockTopItems = [
  { name: "Finished Product A", quantity: 150, value: 375000 },
  { name: "Steel Rod 12mm", quantity: 5000, value: 325000 },
  { name: "Packaging Material", quantity: 2000, value: 30000 },
  { name: "Finished Product B", quantity: 80, value: 200000 },
  { name: "Raw Material X", quantity: 1000, value: 150000 }
];

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Key performance indicators and business analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last Month
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last Quarter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last Year
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <stat.icon className={`h-4 w-4 mr-1 ${stat.color}`} />
                    <span className={`text-sm ${stat.color}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Sales vs Purchases</span>
                </CardTitle>
                <CardDescription>
                  Monthly comparison of sales and purchase amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Revenue Distribution</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of revenue by product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Pie chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Customers by Sales</span>
              </CardTitle>
              <CardDescription>
                Customers with highest sales volume this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.percentage}% of total sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(customer.amount)}</p>
                      <Badge variant="outline">{customer.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Top Products by Sales</span>
              </CardTitle>
              <CardDescription>
                Best performing products by quantity and value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity.toLocaleString()} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.value)}</p>
                      <Badge variant="outline">{item.quantity} units</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Business Trends</span>
              </CardTitle>
              <CardDescription>
                Performance trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Trend analysis chart would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
