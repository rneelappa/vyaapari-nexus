import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Layers, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVtCostCategories } from "@/hooks/useVtData";

export default function CostCategoriesPageVt() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: costCategories, loading, error, refetch } = useVtCostCategories();

  const filteredCategories = costCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAllocationStatus = (category: typeof costCategories[0]) => {
    if (category.allows_allocation_revenue && category.allows_allocation_non_revenue) return "Both";
    if (category.allows_allocation_revenue) return "Revenue Only";
    if (category.allows_allocation_non_revenue) return "Non-Revenue Only";
    return "None";
  };

  const getAllocationBadgeVariant = (category: typeof costCategories[0]) => {
    if (category.allows_allocation_revenue && category.allows_allocation_non_revenue) return "default";
    if (category.allows_allocation_revenue) return "default";
    if (category.allows_allocation_non_revenue) return "secondary";
    return "outline";
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
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
            Manage cost allocation categories for expense classification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Categories (VT Schema)</CardTitle>
          <CardDescription>
            Categories for classifying and allocating costs across different business functions
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

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Revenue Allocation</TableHead>
                    <TableHead>Non-Revenue Allocation</TableHead>
                    <TableHead>Allocation Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No cost categories found in VT schema. Run VT sync to populate data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            {category.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {category.allows_allocation_revenue ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <Badge variant="default">Yes</Badge>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-gray-400" />
                                <Badge variant="secondary">No</Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {category.allows_allocation_non_revenue ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <Badge variant="default">Yes</Badge>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-gray-400" />
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}