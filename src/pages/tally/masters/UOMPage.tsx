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
import { Search, Plus, Edit, Trash2, Scale, RefreshCw, Calculator, Gauge } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// UOM Form Schema
const uomFormSchema = z.object({
  name: z.string().min(1, "UOM name is required"),
  formalname: z.string().optional(),
  base_units: z.string().optional(),
  additional_units: z.string().optional(),
  conversion: z.number().min(1, "Conversion factor must be at least 1"),
  is_simple_unit: z.boolean().optional(),
});

type UomFormData = z.infer<typeof uomFormSchema>;

interface UOM {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  formalname: string;
  base_units: string;
  additional_units: string;
  conversion: number;
  is_simple_unit: boolean;
}

// Common base units
const BASE_UNITS = [
  "Numbers", "Kilograms", "Meters", "Liters", "Pieces", "Boxes", "Sets", 
  "Tons", "Grams", "Centimeters", "Millimeters", "Square Meters", "Cubic Meters"
];

// Unit categories for better organization
const UNIT_CATEGORIES = [
  { name: "Count", units: ["Nos", "Pcs", "Pairs", "Dozen", "Gross"] },
  { name: "Weight", units: ["Kg", "Gm", "Ton", "Qtl", "Lb", "Oz"] },
  { name: "Length", units: ["Mtr", "Cm", "Mm", "Km", "Inch", "Ft", "Yard"] },
  { name: "Volume", units: ["Ltr", "Ml", "Cu.Mtr", "Cu.Ft", "Gallon"] },
  { name: "Area", units: ["Sq.Mtr", "Sq.Ft", "Sq.Inch", "Acre", "Hectare"] },
];

export default function UOMPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UOM | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const form = useForm<UomFormData>({
    resolver: zodResolver(uomFormSchema),
    defaultValues: {
      name: "",
      formalname: "",
      base_units: "",
      additional_units: "",
      conversion: 1,
      is_simple_unit: true,
    },
  });

  useEffect(() => {
    if (user) {
      fetchUoms();
    }
  }, [user]);

  const fetchUoms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('mst_uom')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match interface
      const transformedData: UOM[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id || '',
        division_id: item.division_id || '',
        name: item.name,
        formalname: item.formalname,
        base_units: item.base_units || '',
        additional_units: item.additional_units || '',
        conversion: item.conversion || 1,
        is_simple_unit: !!item.is_simple_unit,
      }));
      
      setUoms(transformedData);
    } catch (err) {
      console.error('Error fetching UOMs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch UOMs');
      setUoms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUom = async (data: UomFormData) => {
    try {
      const { error } = await supabase
        .from('mst_uom')
        .insert({
          name: data.name,
          formalname: data.formalname || '',
          base_units: data.base_units || '',
          additional_units: data.additional_units || '',
          conversion: data.conversion,
          is_simple_unit: data.is_simple_unit ? 1 : 0,
          guid: crypto.randomUUID(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unit of measure created successfully",
      });

      setIsAddDialogOpen(false);
      form.reset();
      fetchUoms();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create UOM",
        variant: "destructive",
      });
    }
  };

  const handleEditUom = async (data: UomFormData) => {
    if (!selectedUom) return;

    try {
      const { error } = await supabase
        .from('mst_uom')
        .update({
          name: data.name,
          formalname: data.formalname || '',
          base_units: data.base_units || '',
          additional_units: data.additional_units || '',
          conversion: data.conversion,
          is_simple_unit: data.is_simple_unit ? 1 : 0,
        })
        .eq('guid', selectedUom.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unit of measure updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedUom(null);
      form.reset();
      fetchUoms();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update UOM",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUom = async (uom: UOM) => {
    try {
      const { error } = await supabase
        .from('mst_uom')
        .delete()
        .eq('guid', uom.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unit of measure deleted successfully",
      });

      fetchUoms();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete UOM",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (uom: UOM) => {
    setSelectedUom(uom);
    form.reset({
      name: uom.name,
      formalname: uom.formalname,
      base_units: uom.base_units,
      additional_units: uom.additional_units,
      conversion: uom.conversion,
      is_simple_unit: uom.is_simple_unit,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUoms = uoms.filter(uom => {
    const matchesSearch = uom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uom.formalname.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCategory === "all") return matchesSearch;
    
    const category = UNIT_CATEGORIES.find(cat => 
      cat.units.some(unit => uom.name.toLowerCase().includes(unit.toLowerCase()))
    );
    
    return matchesSearch && category?.name.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getUnitCategory = (uomName: string) => {
    const category = UNIT_CATEGORIES.find(cat => 
      cat.units.some(unit => uomName.toLowerCase().includes(unit.toLowerCase()))
    );
    return category?.name || "Other";
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view units of measure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Units of Measure</h1>
          <p className="text-muted-foreground">
            Manage units of measurement and conversion factors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUoms} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add UOM
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Unit of Measure</DialogTitle>
                <DialogDescription>
                  Create a new unit of measurement with conversion factors.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddUom)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Symbol *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Kg, Nos, Mtr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="formalname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formal Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Kilograms, Numbers" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="base_units"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Units</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select base unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BASE_UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="conversion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conversion Factor</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              step="0.001"
                              placeholder="1"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additional_units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Units</FormLabel>
                        <FormControl>
                          <Input placeholder="Related or alternate units" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_simple_unit"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Simple Unit (no conversion)</FormLabel>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create UOM</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Units of Measurement</CardTitle>
          <CardDescription>
            Standard units and conversion factors for inventory and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {UNIT_CATEGORIES.map((category) => (
                  <SelectItem key={category.name} value={category.name.toLowerCase()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={fetchUoms} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Symbol</TableHead>
                    <TableHead>Formal Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Units</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUoms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No units of measure found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUoms.map((uom) => (
                      <TableRow key={uom.guid}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{uom.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{uom.formalname || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getUnitCategory(uom.name)}</Badge>
                        </TableCell>
                        <TableCell>{uom.base_units || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calculator className="h-3 w-3 text-muted-foreground" />
                            <span>{uom.conversion}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Gauge className="h-3 w-3 text-muted-foreground" />
                            {uom.is_simple_unit ? (
                              <Badge variant="default">Simple</Badge>
                            ) : (
                              <Badge variant="secondary">Compound</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(uom)}>
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
                                  <AlertDialogTitle>Delete Unit of Measure</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{uom.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUom(uom)}>
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
            <DialogTitle>Edit Unit of Measure</DialogTitle>
            <DialogDescription>
              Update unit details and conversion factors.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUom)} className="space-y-4">
              {/* Same form fields as Add dialog */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Symbol *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kg, Nos, Mtr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="formalname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kilograms, Numbers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="base_units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select base unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BASE_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conversion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversion Factor</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          step="0.001"
                          placeholder="1"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additional_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Units</FormLabel>
                    <FormControl>
                      <Input placeholder="Related or alternate units" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_simple_unit"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Simple Unit (no conversion)</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update UOM</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}