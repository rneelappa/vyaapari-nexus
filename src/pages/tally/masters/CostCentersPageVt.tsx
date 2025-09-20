import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Target, Building, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVtCostCenters } from "@/hooks/useVtData";

export default function CostCentersPageVt() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: costCenters, loading, error, refetch } = useVtCostCenters();

  const filteredCostCenters = costCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (center.parent && center.parent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (center.category && center.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view cost centers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cost Centers (VT Schema)</h1>
          <p className="text-muted-foreground">
            Manage cost centers for expense allocation and tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Center
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Center Management (VT Schema)</CardTitle>
          <CardDescription>
            Organizational units for cost allocation and budget tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Centers</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
              <TabsTrigger value="administration">Administration</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading cost centers...</p>
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
                      <TableHead>Cost Center</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCostCenters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">No cost centers found in VT schema. Run VT sync to populate data.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCostCenters.map((center) => (
                        <TableRow key={center.guid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              {center.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline">{center.parent || 'None'}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {center.category || 'General'}
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