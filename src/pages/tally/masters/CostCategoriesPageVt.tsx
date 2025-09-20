import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Layers, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVtCostCategories } from "@/hooks/useVtData";

export default function CostCategoriesPageVt() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: costCategories, loading, error, refetch } = useVtCostCategories();

  const getAllocationStatus = (category: typeof costCategories[0]) => {
    if (category.allocate_revenue && category.allocate_non_revenue) return "Both";
    if (category.allocate_revenue) return "Revenue Only";
    if (category.allocate_non_revenue) return "Non-Revenue Only";
    return "None";
  };

  const getAllocationBadgeVariant = (category: typeof costCategories[0]) => {
    if (category.allocate_revenue && category.allocate_non_revenue) return "default";
    if (category.allocate_revenue) return "default";
    if (category.allocate_non_revenue) return "secondary";
    return "outline";
  };

  const revenueCostCategories = costCategories.filter(category => category.allocate_revenue);
  const nonRevenueCostCategories = costCategories.filter(category => category.allocate_non_revenue);

  const filteredCategories = costCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view cost categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cost Categories (VT Schema)</h1>
          <p className="text-muted-foreground">
            Define categories for cost allocation and expense tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costCategories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Allocation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueCostCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories allowing revenue allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Revenue Allocation</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonRevenueCostCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories allowing non-revenue allocation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Category Management (VT Schema)</CardTitle>
          <CardDescription>
            Categories for organizing and allocating costs across different business functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Allocation</TabsTrigger>
              <TabsTrigger value="non-revenue">Non-Revenue Allocation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading cost categories...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Revenue Allocation</TableHead>
                      <TableHead>Non-Revenue Allocation</TableHead>
                      <TableHead>Allocation Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No cost categories found in VT schema. Run VT sync to populate data.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.guid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {category.allocate_revenue ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <Badge variant="default">Yes</Badge>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="secondary">No</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {category.allocate_non_revenue ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  <Badge variant="default">Yes</Badge>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="secondary">No</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getAllocationBadgeVariant(category)}>
                              {getAllocationStatus(category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}