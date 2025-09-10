import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, DollarSign, RefreshCw, Calculator, Users, Calendar, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Payhead Form Schema
const payheadFormSchema = z.object({
  name: z.string().min(1, "Payhead name is required"),
  parent: z.string().optional(),
  payslip_name: z.string().optional(),
  pay_type: z.string().min(1, "Pay type is required"),
  calculation_type: z.string().min(1, "Calculation type is required"),
  calculation_period: z.string().min(1, "Calculation period is required"),
  income_type: z.string().optional(),
  leave_type: z.string().optional(),
});

type PayheadFormData = z.infer<typeof payheadFormSchema>;

interface Payhead {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  parent: string;
  _parent: string;
  payslip_name: string;
  pay_type: string;
  calculation_type: string;
  calculation_period: string;
  income_type: string;
  leave_type: string;
}

// Payhead configurations
const PAY_TYPES = ["Earnings", "Deduction", "Reimbursement", "Advance"];

const CALCULATION_TYPES = [
  "Fixed Amount",
  "Percentage of Basic",
  "Percentage of Gross",
  "Formula Based",
  "Attendance Based",
  "Performance Based"
];

const CALCULATION_PERIODS = [
  "Monthly",
  "Daily", 
  "Per Pay Period",
  "Annual",
  "One Time",
  "As Required"
];

const INCOME_TYPES = [
  "Salary Income",
  "Bonus Income",
  "Allowance Income",
  "Commission Income",
  "Other Income",
  "Tax Deductible",
  "Non-Tax Deductible"
];

const LEAVE_TYPES = [
  "Earned Leave",
  "Casual Leave", 
  "Sick Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Compensatory Leave",
  "Loss of Pay"
];

const PAYHEAD_CATEGORIES = [
  "Basic Salary Components",
  "Allowances",
  "Statutory Deductions",
  "Voluntary Deductions",
  "Employer Contributions",
  "Leave Components"
];

export default function PayheadsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [payheads, setPayheads] = useState<Payhead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayhead, setSelectedPayhead] = useState<Payhead | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<PayheadFormData>({
    resolver: zodResolver(payheadFormSchema),
    defaultValues: {
      name: "",
      parent: "",
      payslip_name: "",
      pay_type: "",
      calculation_type: "",
      calculation_period: "",
      income_type: "",
      leave_type: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchPayheads();
    }
  }, [user]);

  const fetchPayheads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('mst_payhead')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setPayheads(data || []);
    } catch (err) {
      console.error('Error fetching payheads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payheads');
      setPayheads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayhead = async (data: PayheadFormData) => {
    try {
      const { error } = await supabase
        .from('mst_payhead')
        .insert({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          payslip_name: data.payslip_name || data.name,
          pay_type: data.pay_type,
          calculation_type: data.calculation_type,
          calculation_period: data.calculation_period,
          income_type: data.income_type || '',
          leave_type: data.leave_type || '',
          guid: crypto.randomUUID(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll head created successfully",
      });

      setIsAddDialogOpen(false);
      form.reset();
      fetchPayheads();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create payroll head",
        variant: "destructive",
      });
    }
  };

  const handleEditPayhead = async (data: PayheadFormData) => {
    if (!selectedPayhead) return;

    try {
      const { error } = await supabase
        .from('mst_payhead')
        .update({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          payslip_name: data.payslip_name || data.name,
          pay_type: data.pay_type,
          calculation_type: data.calculation_type,
          calculation_period: data.calculation_period,
          income_type: data.income_type || '',
          leave_type: data.leave_type || '',
        })
        .eq('guid', selectedPayhead.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll head updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedPayhead(null);
      form.reset();
      fetchPayheads();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update payroll head",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayhead = async (payhead: Payhead) => {
    try {
      const { error } = await supabase
        .from('mst_payhead')
        .delete()
        .eq('guid', payhead.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll head deleted successfully",
      });

      fetchPayheads();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete payroll head",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (payhead: Payhead) => {
    setSelectedPayhead(payhead);
    form.reset({
      name: payhead.name,
      parent: payhead.parent,
      payslip_name: payhead.payslip_name,
      pay_type: payhead.pay_type,
      calculation_type: payhead.calculation_type,
      calculation_period: payhead.calculation_period,
      income_type: payhead.income_type,
      leave_type: payhead.leave_type,
    });
    setIsEditDialogOpen(true);
  };

  const filteredPayheads = payheads.filter(payhead => {
    const matchesSearch = payhead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payhead.payslip_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payhead.pay_type.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "earnings") return matchesSearch && payhead.pay_type === "Earnings";
    if (activeTab === "deductions") return matchesSearch && payhead.pay_type === "Deduction";
    if (activeTab === "reimbursements") return matchesSearch && payhead.pay_type === "Reimbursement";
    
    return matchesSearch;
  });

  const getPayTypeBadgeVariant = (payType: string) => {
    switch (payType) {
      case "Earnings": return "default";
      case "Deduction": return "destructive";
      case "Reimbursement": return "secondary";
      case "Advance": return "outline";
      default: return "outline";
    }
  };

  const getPayTypeIcon = (payType: string) => {
    switch (payType) {
      case "Earnings": return <DollarSign className="h-3 w-3" />;
      case "Deduction": return <Calculator className="h-3 w-3" />;
      case "Reimbursement": return <Briefcase className="h-3 w-3" />;
      case "Advance": return <Calendar className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view payroll heads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Heads</h1>
          <p className="text-muted-foreground">
            Manage salary components, allowances, and deductions for payroll processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayheads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payhead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Payroll Head</DialogTitle>
                <DialogDescription>
                  Create a new payroll component for salary processing.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddPayhead)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="calculation">Calculation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payhead Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter payhead name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payslip_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payslip Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Name on payslip" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="parent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAYHEAD_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
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
                          name="pay_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pay type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAY_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="income_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Income Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select income type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INCOME_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
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
                          name="leave_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leave Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LEAVE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="calculation" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="calculation_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calculation Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select calculation type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CALCULATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name="calculation_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calculation Period *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select calculation period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CALCULATION_PERIODS.map((period) => (
                                  <SelectItem key={period} value={period}>
                                    {period}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Payhead</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Components</CardTitle>
          <CardDescription>
            Salary components, allowances, deductions, and calculation rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payroll heads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Components</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchPayheads} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payhead Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Calculation</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Income Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayheads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No payroll heads found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayheads.map((payhead) => (
                          <TableRow key={payhead.guid}>
                            <TableCell className="font-medium">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {getPayTypeIcon(payhead.pay_type)}
                                  <span>{payhead.name}</span>
                                </div>
                                {payhead.payslip_name && payhead.payslip_name !== payhead.name && (
                                  <div className="text-sm text-muted-foreground">
                                    Payslip: {payhead.payslip_name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPayTypeBadgeVariant(payhead.pay_type)}>
                                {payhead.pay_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payhead.parent && (
                                <Badge variant="outline">{payhead.parent}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{payhead.calculation_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{payhead.calculation_period}</Badge>
                            </TableCell>
                            <TableCell>
                              {payhead.income_type && (
                                <Badge variant="outline">{payhead.income_type}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(payhead)}>
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
                                      <AlertDialogTitle>Delete Payroll Head</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{payhead.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeletePayhead(payhead)}>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar structure to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payroll Head</DialogTitle>
            <DialogDescription>
              Update payroll component details and calculation rules.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditPayhead)} className="space-y-4">
              {/* Same form structure as Add dialog */}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Payhead</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}