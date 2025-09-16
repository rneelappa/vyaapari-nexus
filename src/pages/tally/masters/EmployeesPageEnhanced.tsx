import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Users, 
  Edit,
  Trash2,
  BarChart3,
  Save,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Briefcase,
  DollarSign,
  Activity,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Employee {
  guid: string;
  name: string;
  employee_id: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  date_of_joining: string;
  date_of_birth: string;
  salary: number;
  is_active: boolean;
  pan_number: string;
  aadhar_number: string;
  bank_account: string;
  ifsc_code: string;
}

interface EmployeesPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function EmployeesPageEnhanced({ companyId, divisionId }: EmployeesPageEnhancedProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'departments' | 'payroll'>('list');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // CRUD state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    address: '',
    date_of_joining: new Date(),
    date_of_birth: new Date(),
    salary: 0,
    is_active: true,
    pan_number: '',
    aadhar_number: '',
    bank_account: '',
    ifsc_code: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadEmployeesData();
  }, [companyId, divisionId]);

  const loadEmployeesData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading employees data...');
      
      // Mock data for employees (would be replaced with API call)
      const mockEmployees: Employee[] = [
        {
          guid: '1',
          name: 'Rajesh Kumar',
          employee_id: 'EMP001',
          designation: 'Sales Manager',
          department: 'Sales',
          email: 'rajesh@company.com',
          phone: '+91 9876543210',
          address: '123 Main Street, Chennai',
          date_of_joining: '2023-01-15',
          date_of_birth: '1985-06-20',
          salary: 75000,
          is_active: true,
          pan_number: 'ABCDE1234F',
          aadhar_number: '1234 5678 9012',
          bank_account: '1234567890',
          ifsc_code: 'HDFC0001234'
        },
        {
          guid: '2',
          name: 'Priya Sharma',
          employee_id: 'EMP002',
          designation: 'Accountant',
          department: 'Finance',
          email: 'priya@company.com',
          phone: '+91 9876543211',
          address: '456 Park Road, Bangalore',
          date_of_joining: '2023-03-10',
          date_of_birth: '1990-12-15',
          salary: 55000,
          is_active: true,
          pan_number: 'FGHIJ5678K',
          aadhar_number: '5678 9012 3456',
          bank_account: '0987654321',
          ifsc_code: 'ICIC0001234'
        },
        {
          guid: '3',
          name: 'Amit Patel',
          employee_id: 'EMP003',
          designation: 'Production Supervisor',
          department: 'Production',
          email: 'amit@company.com',
          phone: '+91 9876543212',
          address: '789 Industrial Area, Mumbai',
          date_of_joining: '2022-08-20',
          date_of_birth: '1988-03-25',
          salary: 65000,
          is_active: true,
          pan_number: 'KLMNO9012P',
          aadhar_number: '9012 3456 7890',
          bank_account: '1122334455',
          ifsc_code: 'SBIN0001234'
        }
      ];

      setEmployees(mockEmployees);
      console.log(`Loaded ${mockEmployees.length} employees`);

    } catch (error) {
      console.error('Failed to load employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      console.log('Creating employee...', formData);
      
      // API call would be implemented for employee creation
      
      toast({
        title: "Employee Created",
        description: `Employee "${formData.name}" created successfully`,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadEmployeesData();

    } catch (error) {
      console.error('Failed to create employee:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create employee",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      console.log('Updating employee...', formData);
      
      // API call would be implemented for employee update
      
      toast({
        title: "Employee Updated",
        description: `Employee "${formData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadEmployeesData();

    } catch (error) {
      console.error('Failed to update employee:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      console.log('Deleting employee...', selectedEmployee.name);
      
      // API call would be implemented for employee deletion
      
      toast({
        title: "Employee Deleted",
        description: `Employee "${selectedEmployee.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedEmployee(null);
      await loadEmployeesData();

    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employee_id: '',
      designation: '',
      department: '',
      email: '',
      phone: '',
      address: '',
      date_of_joining: new Date(),
      date_of_birth: new Date(),
      salary: 0,
      is_active: true,
      pan_number: '',
      aadhar_number: '',
      bank_account: '',
      ifsc_code: ''
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchTerm || 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(e => e.department))];

  // Initialize form data for editing
  useEffect(() => {
    if (selectedEmployee && (showEditDialog || showCreateDialog)) {
      setFormData({
        name: selectedEmployee.name,
        employee_id: selectedEmployee.employee_id,
        designation: selectedEmployee.designation,
        department: selectedEmployee.department,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        address: selectedEmployee.address,
        date_of_joining: new Date(selectedEmployee.date_of_joining),
        date_of_birth: new Date(selectedEmployee.date_of_birth),
        salary: selectedEmployee.salary,
        is_active: selectedEmployee.is_active,
        pan_number: selectedEmployee.pan_number,
        aadhar_number: selectedEmployee.aadhar_number,
        bank_account: selectedEmployee.bank_account,
        ifsc_code: selectedEmployee.ifsc_code
      });
    }
  }, [selectedEmployee, showEditDialog, showCreateDialog]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-32 bg-muted rounded w-full mb-4"></div>
          <div className="h-48 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Complete employee lifecycle management with payroll integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadEmployeesData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Employees ({filteredEmployees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredEmployees.map(employee => (
                      <div
                        key={employee.guid}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedEmployee?.guid === employee.guid ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <User className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.designation} | {employee.department}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                              {employee.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">ID:</span>
                            <div className="font-semibold">{employee.employee_id}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Salary:</span>
                            <div className="font-semibold">₹{employee.salary.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Joined:</span>
                            <div className="font-semibold">
                              {new Date(employee.date_of_joining).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'departments' && (
                  <div className="space-y-4">
                    {departments.map(department => {
                      const deptEmployees = filteredEmployees.filter(emp => emp.department === department);
                      const deptSalaryTotal = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);
                      
                      return (
                        <div key={department} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{department}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{deptEmployees.length} employees</Badge>
                              <Badge variant="secondary">₹{deptSalaryTotal.toLocaleString('en-IN')}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {deptEmployees.map(emp => (
                              <div
                                key={emp.guid}
                                className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                onClick={() => setSelectedEmployee(emp)}
                              >
                                <span className="font-medium">{emp.name}</span>
                                <span className="text-sm text-muted-foreground">{emp.designation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'payroll' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Payroll Overview</h3>
                      <p className="text-sm text-muted-foreground">
                        Employee salary and payroll information
                      </p>
                    </div>
                    
                    {filteredEmployees.map(employee => (
                      <div key={employee.guid} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{employee.name}</span>
                          </div>
                          <Badge variant="default">
                            ₹{employee.salary.toLocaleString('en-IN')}/month
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Department:</span>
                            <div className="font-semibold">{employee.department}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Designation:</span>
                            <div className="font-semibold">{employee.designation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Employee Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEmployee ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployee.designation} | {selectedEmployee.department}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-semibold">{selectedEmployee.employee_id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-semibold">{selectedEmployee.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-muted-foreground">Salary:</span>
                        <span className="font-semibold">₹{selectedEmployee.salary.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Employment Details</div>
                      <div className="text-sm">
                        <div>Joined: {new Date(selectedEmployee.date_of_joining).toLocaleDateString('en-IN')}</div>
                        <div>DOB: {new Date(selectedEmployee.date_of_birth).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Attendance History
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payroll History
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Employee
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Employee
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an employee to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Employee Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Employees:</span>
                  <Badge variant="outline">{employees.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Employees:</span>
                  <Badge variant="default">{employees.filter(e => e.is_active).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Departments:</span>
                  <Badge variant="outline">{departments.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Payroll:</span>
                  <Badge variant="secondary">
                    ₹{employees.filter(e => e.is_active).reduce((sum, e) => sum + e.salary, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Employee Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {showCreateDialog ? <Plus className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
              {showCreateDialog ? 'Add' : 'Edit'} Employee
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="font-semibold mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-id">Employee ID *</Label>
                  <Input 
                    id="emp-id" 
                    value={formData.employee_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                    placeholder="EMP001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input 
                    id="designation" 
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Job title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select department...</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Production">Production</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete address..."
                />
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h4 className="font-semibold mb-3">Employment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input 
                    id="salary" 
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox 
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
                  />
                  <Label htmlFor="active">Active Employee</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
              }}>
                Cancel
              </Button>
              <Button onClick={showCreateDialog ? handleCreateEmployee : handleUpdateEmployee}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateDialog ? 'Add Employee' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Employee
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete employee "{selectedEmployee.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All payroll records will be affected.
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Warning: Check for active payroll entries before deletion.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteEmployee}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function getVarianceColor(variance: number): string {
    if (variance > 10) return 'text-green-600';
    if (variance < -10) return 'text-red-600';
    return 'text-yellow-600';
  }
}

export default EmployeesPageEnhanced;
