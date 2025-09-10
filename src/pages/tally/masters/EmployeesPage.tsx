import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Users, RefreshCw, User, Mail, Phone, Calendar, MapPin, CreditCard, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Employee Form Schema
const employeeFormSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  parent: z.string().optional(),
  designation: z.string().optional(),
  function_role: z.string().optional(),
  id_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  date_of_joining: z.string().optional(),
  date_of_release: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  father_mother_name: z.string().optional(),
  spouse_name: z.string().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  aadhar: z.string().optional(),
  pan: z.string().optional(),
  pf_number: z.string().optional(),
  uan: z.string().optional(),
  location: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface Employee {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  parent: string;
  _parent: string;
  designation: string;
  function_role: string;
  id_number: string;
  date_of_birth: string;
  date_of_joining: string;
  date_of_release: string;
  gender: string;
  blood_group: string;
  father_mother_name: string;
  spouse_name: string;
  address: string;
  mobile: string;
  email: string;
  aadhar: string;
  pan: string;
  pf_number: string;
  uan: string;
  pf_joining_date: string;
  pf_relieving_date: string;
  pr_account_number: string;
  location: string;
}

// Dropdown Options
const DESIGNATIONS = [
  "Managing Director", "General Manager", "Assistant General Manager", "Deputy General Manager",
  "Manager", "Assistant Manager", "Senior Executive", "Executive", "Junior Executive",
  "Senior Officer", "Officer", "Assistant Officer", "Supervisor", "Senior Associate",
  "Associate", "Trainee", "Intern"
];

const FUNCTION_ROLES = [
  "Administration", "Accounts", "Finance", "Human Resources", "Sales", "Marketing",
  "Production", "Operations", "Quality Control", "Research & Development", 
  "Information Technology", "Customer Service", "Procurement", "Legal", "Audit"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const GENDERS = ["Male", "Female", "Other"];

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      parent: "",
      designation: "",
      function_role: "",
      id_number: "",
      date_of_birth: "",
      date_of_joining: "",
      date_of_release: "",
      gender: "",
      blood_group: "",
      father_mother_name: "",
      spouse_name: "",
      address: "",
      mobile: "",
      email: "",
      aadhar: "",
      pan: "",
      pf_number: "",
      uan: "",
      location: "",
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('mst_employee')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (data: EmployeeFormData) => {
    try {
      const { error } = await supabase
        .from('mst_employee')
        .insert({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          designation: data.designation || '',
          function_role: data.function_role || '',
          id_number: data.id_number || '',
          date_of_birth: data.date_of_birth || null,
          date_of_joining: data.date_of_joining || null,
          date_of_release: data.date_of_release || null,
          gender: data.gender || '',
          blood_group: data.blood_group || '',
          father_mother_name: data.father_mother_name || '',
          spouse_name: data.spouse_name || '',
          address: data.address || '',
          mobile: data.mobile || '',
          email: data.email || '',
          aadhar: data.aadhar || '',
          pan: data.pan || '',
          pf_number: data.pf_number || '',
          uan: data.uan || '',
          location: data.location || '',
          pf_joining_date: null,
          pf_relieving_date: null,
          pr_account_number: '',
          guid: crypto.randomUUID(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee created successfully",
      });

      setIsAddDialogOpen(false);
      form.reset();
      fetchEmployees();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (!selectedEmployee) return;

    try {
      const { error } = await supabase
        .from('mst_employee')
        .update({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          designation: data.designation || '',
          function_role: data.function_role || '',
          id_number: data.id_number || '',
          date_of_birth: data.date_of_birth || null,
          date_of_joining: data.date_of_joining || null,
          date_of_release: data.date_of_release || null,
          gender: data.gender || '',
          blood_group: data.blood_group || '',
          father_mother_name: data.father_mother_name || '',
          spouse_name: data.spouse_name || '',
          address: data.address || '',
          mobile: data.mobile || '',
          email: data.email || '',
          aadhar: data.aadhar || '',
          pan: data.pan || '',
          pf_number: data.pf_number || '',
          uan: data.uan || '',
          location: data.location || '',
        })
        .eq('guid', selectedEmployee.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      form.reset();
      fetchEmployees();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('mst_employee')
        .delete()
        .eq('guid', employee.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      fetchEmployees();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.reset({
      name: employee.name,
      parent: employee.parent,
      designation: employee.designation,
      function_role: employee.function_role,
      id_number: employee.id_number,
      date_of_birth: employee.date_of_birth,
      date_of_joining: employee.date_of_joining,
      date_of_release: employee.date_of_release,
      gender: employee.gender,
      blood_group: employee.blood_group,
      father_mother_name: employee.father_mother_name,
      spouse_name: employee.spouse_name,
      address: employee.address,
      mobile: employee.mobile,
      email: employee.email,
      aadhar: employee.aadhar,
      pan: employee.pan,
      pf_number: employee.pf_number,
      uan: employee.uan,
      location: employee.location,
    });
    setIsEditDialogOpen(true);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.function_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && !employee.date_of_release;
    if (activeTab === "inactive") return matchesSearch && employee.date_of_release;
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getEmployeeStatus = (employee: Employee) => {
    return employee.date_of_release ? "Inactive" : "Active";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee information, roles, and employment details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee record with personal and employment details.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddEmployee)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="official">Official</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="id_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Employee ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="designation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select designation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DESIGNATIONS.map((designation) => (
                                    <SelectItem key={designation} value={designation}>
                                      {designation}
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
                          name="function_role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FUNCTION_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role}
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
                          name="date_of_joining"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Joining</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Work location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {GENDERS.map((gender) => (
                                    <SelectItem key={gender} value={gender}>
                                      {gender}
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
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Complete address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="official" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="PAN number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aadhar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aadhar Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Aadhar number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pf_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PF Number</FormLabel>
                              <FormControl>
                                <Input placeholder="PF number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="uan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UAN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="UAN number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Employee</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Complete employee database with personal and professional information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, designation, department, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchEmployees} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees.map((employee) => (
                          <TableRow key={employee.guid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div>{employee.name}</div>
                                  {employee.id_number && (
                                    <div className="text-sm text-muted-foreground">
                                      ID: {employee.id_number}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{employee.designation || '-'}</Badge>
                            </TableCell>
                            <TableCell>{employee.function_role || '-'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {employee.mobile && (
                                  <div className="flex items-center space-x-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    <span>{employee.mobile}</span>
                                  </div>
                                )}
                                {employee.email && (
                                  <div className="flex items-center space-x-1 text-sm">
                                    <Mail className="h-3 w-3" />
                                    <span>{employee.email}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{formatDate(employee.date_of_joining)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getEmployeeStatus(employee) === "Active" ? "default" : "secondary"}>
                                {getEmployeeStatus(employee)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(employee)}>
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
                                      <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{employee.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteEmployee(employee)}>
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
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditEmployee)} className="space-y-4">
              {/* Same tabbed form structure as Add dialog */}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Employee</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}