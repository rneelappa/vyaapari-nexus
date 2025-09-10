import { useState } from "react";
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
  Settings
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string;
  status: "available" | "generating" | "error";
  type: "standard" | "custom";
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Sales Summary Report",
    description: "Monthly sales summary with customer-wise breakdown",
    category: "Sales",
    lastGenerated: "2025-01-15",
    status: "available",
    type: "standard"
  },
  {
    id: "2",
    name: "Purchase Analysis",
    description: "Detailed purchase analysis with vendor performance",
    category: "Purchase",
    lastGenerated: "2025-01-14",
    status: "available",
    type: "standard"
  },
  {
    id: "3",
    name: "Stock Valuation Report",
    description: "Current stock valuation with aging analysis",
    category: "Inventory",
    lastGenerated: "2025-01-15",
    status: "available",
    type: "standard"
  },
  {
    id: "4",
    name: "Customer Outstanding Report",
    description: "Age-wise outstanding receivables from customers",
    category: "Receivables",
    lastGenerated: "2025-01-13",
    status: "available",
    type: "standard"
  },
  {
    id: "5",
    name: "Vendor Outstanding Report",
    description: "Age-wise outstanding payables to vendors",
    category: "Payables",
    lastGenerated: "2025-01-12",
    status: "available",
    type: "standard"
  },
  {
    id: "6",
    name: "GST Summary Report",
    description: "GST collected and paid summary for tax filing",
    category: "Tax",
    lastGenerated: "2025-01-10",
    status: "available",
    type: "standard"
  },
  {
    id: "7",
    name: "Custom Sales Performance",
    description: "Custom report for sales team performance analysis",
    category: "Sales",
    lastGenerated: "2025-01-08",
    status: "available",
    type: "custom"
  },
  {
    id: "8",
    name: "Monthly P&L Analysis",
    description: "Detailed profit and loss analysis by cost centers",
    category: "Financial",
    lastGenerated: "2025-01-05",
    status: "generating",
    type: "standard"
  }
];

const reportCategories = [
  "All Reports",
  "Sales",
  "Purchase", 
  "Inventory",
  "Receivables",
  "Payables",
  "Tax",
  "Financial"
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [reports] = useState<Report[]>(mockReports);

  const filteredReports = selectedCategory === "All Reports" 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Available</Badge>;
      case "generating":
        return <Badge variant="secondary">Generating</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "standard" ? (
      <Badge variant="outline">Standard</Badge>
    ) : (
      <Badge variant="secondary">Custom</Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "sales":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "purchase":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "inventory":
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case "receivables":
      case "payables":
        return <FileText className="h-4 w-4 text-orange-600" />;
      case "tax":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "financial":
        return <PieChart className="h-4 w-4 text-indigo-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view various business reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Report Settings
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Create Custom Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Select and generate reports based on your business needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {reportCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(report.type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(report.lastGenerated).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={report.status === "generating"}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {report.type === "custom" && (
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="grid" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          {getTypeBadge(report.type)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Generated:</span>
                          <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            disabled={report.status === "generating"}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>
                    Reports that are automatically generated on a schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No scheduled reports configured</p>
                      <Button className="mt-2" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
