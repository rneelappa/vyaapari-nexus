import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Layers, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Cost Category Form Schema
const costCategoryFormSchema = z.object({
  name: z.string().min(1, "Cost category name is required"),
  allocate_revenue: z.boolean().optional(),
  allocate_non_revenue: z.boolean().optional(),
});

type CostCategoryFormData = z.infer<typeof costCategoryFormSchema>;

interface CostCategory {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  allocate_revenue: boolean;
  allocate_non_revenue: boolean;
}

// Predefined cost categories
const PREDEFINED_CATEGORIES = [
  "Direct Material Cost",
  "Direct Labor Cost", 
  "Manufacturing Overhead",
  "Administrative Expenses",
  "Selling Expenses",
  "Research & Development",
  "Quality Control",
  "Utilities",
  "Maintenance",
  "Transportation",
  "Insurance",
  "Depreciation"
];

export default function CostCategoriesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null);

  const form = useForm<CostCategoryFormData>({
    resolver: zodResolver(costCategoryFormSchema),
    defaultValues: {
      name: "",
      allocate_revenue: true,
      allocate_non_revenue: false,
    },
  });

  useEffect(() => {
    if (user) {
      fetchCostCategories();
    }
  }, [user]);

  const fetchCostCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('mst_cost_category')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match interface
      const transformedData: CostCategory[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id || '',
        division_id: item.division_id || '',
        name: item.name,
        allocate_revenue: !!item.allocate_revenue,
        allocate_non_revenue: !!item.allocate_non_revenue,
      }));
      
      setCostCategories(transformedData);
    } catch (err) {
      console.error('Error fetching cost categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cost categories');
      setCostCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (data: CostCategoryFormData) => {
    try {
      const { error } = await supabase
        .from('mst_cost_category')
        .insert({
          name: data.name,
          allocate_revenue: data.allocate_revenue ? 1 : 0,
          allocate_non_revenue: data.allocate_non_revenue ? 1 : 0,
          guid: crypto.randomUUID(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cost category created successfully",
      });

      setIsAddDialogOpen(false);
      form.reset();
      fetchCostCategories();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create cost category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (data: CostCategoryFormData) => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('mst_cost_category')
        .update({
          name: data.name,
          allocate_revenue: data.allocate_revenue ? 1 : 0,
          allocate_non_revenue: data.allocate_non_revenue ? 1 : 0,
        })
        .eq('guid', selectedCategory.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cost category updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      form.reset();
      fetchCostCategories();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update cost category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (category: CostCategory) => {
    try {
      const { error } = await supabase
        .from('mst_cost_category')
        .delete()
        .eq('guid', category.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cost category deleted successfully",
      });

      fetchCostCategories();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete cost category",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: CostCategory) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      allocate_revenue: category.allocate_revenue,
      allocate_non_revenue: category.allocate_non_revenue,
    });
    setIsEditDialogOpen(true);
  };

  const filteredCategories = costCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAllocationStatus = (category: CostCategory) => {
    if (category.allocate_revenue && category.allocate_non_revenue) return "Both";
    if (category.allocate_revenue) return "Revenue Only";
    if (category.allocate_non_revenue) return "Non-Revenue Only";
    return "None";
  };

  const getAllocationBadgeVariant = (category: CostCategory) => {
    if (category.allocate_revenue && category.allocate_non_revenue) return "default";
    if (category.allocate_revenue) return "default";
    if (category.allocate_non_revenue) return "secondary";
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
          <h1 className="text-3xl font-bold">Cost Categories</h1>
          <p className="text-muted-foreground">
            Manage cost allocation categories for expense classification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCostCategories} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Cost Category</DialogTitle>
                <DialogDescription>
                  Create a new cost category for expense allocation and classification.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or enter category name" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PREDEFINED_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input 
                            placeholder="Or enter custom category name" 
                            {...field}
                            className="mt-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <FormLabel>Allocation Settings</FormLabel>
                    <FormField
                      control={form.control}
                      name="allocate_revenue"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Allocate to Revenue</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Include this category in revenue-generating cost allocation
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allocate_non_revenue"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Allocate to Non-Revenue</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Include this category in non-revenue cost allocation
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Category</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Categories</CardTitle>
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
              <Button onClick={fetchCostCategories} variant="outline">
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
                        No cost categories found
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
                                <TrendingDown className="h-4 w-4 text-gray-400" />
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
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Cost Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Cost Category</DialogTitle>
            <DialogDescription>
              Update cost category settings and allocation rules.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCategory)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormLabel>Allocation Settings</FormLabel>
                <FormField
                  control={form.control}
                  name="allocate_revenue"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Allocate to Revenue</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include this category in revenue-generating cost allocation
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allocate_non_revenue"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Allocate to Non-Revenue</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include this category in non-revenue cost allocation
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}