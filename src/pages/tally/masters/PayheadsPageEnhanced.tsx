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
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Calculator, 
  Edit,
  Trash2,
  Save,
  AlertCircle,
  DollarSign,
  BarChart3,
  Activity,
  Network,
  Eye,
  TrendingUp,
  TrendingDown,
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payhead {
  guid: string;
  name: string;
  alias: string;
  type: 'Earnings' | 'Deductions' | 'Employer Liabilities';
  calculation_type: 'Fixed Amount' | 'Percentage' | 'Formula';
  calculation_value: number;
  calculation_formula: string;
  is_statutory: boolean;
  is_active: boolean;
  usage_count: number;
  total_amount: number;
}

interface PayheadsPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function PayheadsPageEnhanced({ companyId, divisionId }: PayheadsPageEnhancedProps) {
  const [payheads, setPayheads] = useState<Payhead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayhead, setSelectedPayhead] = useState<Payhead | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'categories' | 'calculations'>('list');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Earnings' | 'Deductions' | 'Employer Liabilities'>('all');
  
  // CRUD state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    type: 'Earnings' as 'Earnings' | 'Deductions' | 'Employer Liabilities',
    calculation_type: 'Fixed Amount' as 'Fixed Amount' | 'Percentage' | 'Formula',
    calculation_value: 0,
    calculation_formula: '',
    is_statutory: false,
    is_active: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadPayheadsData();
  }, [companyId, divisionId]);

  const loadPayheadsData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading payheads data...');
      
      // Mock data for payheads (would be replaced with API call)
      const mockPayheads: Payhead[] = [
        {
          guid: '1',
          name: 'Basic Salary',
          alias: 'BASIC',
          type: 'Earnings',
          calculation_type: 'Fixed Amount',
          calculation_value: 0,
          calculation_formula: '',
          is_statutory: false,
          is_active: true,
          usage_count: 25,
          total_amount: 1250000
        },
        {
          guid: '2',
          name: 'House Rent Allowance',
          alias: 'HRA',
          type: 'Earnings',
          calculation_type: 'Percentage',
          calculation_value: 40,
          calculation_formula: '40% of Basic Salary',
          is_statutory: false,
          is_active: true,
          usage_count: 25,
          total_amount: 500000
        },
        {
          guid: '3',
          name: 'Provident Fund',
          alias: 'PF',
          type: 'Deductions',
          calculation_type: 'Percentage',
          calculation_value: 12,
          calculation_formula: '12% of Basic Salary',
          is_statutory: true,
          is_active: true,
          usage_count: 25,
          total_amount: 150000
        },
        {
          guid: '4',
          name: 'Professional Tax',
          alias: 'PTAX',
          type: 'Deductions',
          calculation_type: 'Fixed Amount',
          calculation_value: 200,
          calculation_formula: '',
          is_statutory: true,
          is_active: true,
          usage_count: 25,
          total_amount: 5000
        },
        {
          guid: '5',
          name: 'Employer PF Contribution',
          alias: 'EMPF',
          type: 'Employer Liabilities',
          calculation_type: 'Percentage',
          calculation_value: 12,
          calculation_formula: '12% of Basic Salary',
          is_statutory: true,
          is_active: true,
          usage_count: 25,
          total_amount: 150000
        }
      ];

      setPayheads(mockPayheads);
      console.log(`Loaded ${mockPayheads.length} payheads`);

    } catch (error) {
      console.error('Failed to load payheads:', error);
      toast({
        title: "Error",
        description: "Failed to load payheads data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayhead = async () => {
    try {
      console.log('Creating payhead...', formData);
      
      // API call would be implemented for payhead creation
      
      toast({
        title: "Payhead Created",
        description: `Payhead "${formData.name}" created successfully`,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadPayheadsData();

    } catch (error) {
      console.error('Failed to create payhead:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create payhead",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePayhead = async () => {
    if (!selectedPayhead) return;

    try {
      console.log('Updating payhead...', formData);
      
      // API call would be implemented for payhead update
      
      toast({
        title: "Payhead Updated",
        description: `Payhead "${formData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadPayheadsData();

    } catch (error) {
      console.error('Failed to update payhead:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update payhead",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayhead = async () => {
    if (!selectedPayhead) return;

    try {
      console.log('Deleting payhead...', selectedPayhead.name);
      
      // Check for usage dependencies
      if (selectedPayhead.usage_count > 0) {
        toast({
          title: "Cannot Delete",
          description: `Payhead is used for ${selectedPayhead.usage_count} employees. Remove usage first.`,
          variant: "destructive"
        });
        return;
      }

      // API call would be implemented for payhead deletion
      
      toast({
        title: "Payhead Deleted",
        description: `Payhead "${selectedPayhead.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedPayhead(null);
      await loadPayheadsData();

    } catch (error) {
      console.error('Failed to delete payhead:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete payhead",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      alias: '',
      type: 'Earnings',
      calculation_type: 'Fixed Amount',
      calculation_value: 0,
      calculation_formula: '',
      is_statutory: false,
      is_active: true
    });
  };

  const filteredPayheads = payheads.filter(payhead => {
    const matchesSearch = !searchTerm || 
      payhead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payhead.alias.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || payhead.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const earningsPayheads = payheads.filter(p => p.type === 'Earnings');
  const deductionsPayheads = payheads.filter(p => p.type === 'Deductions');
  const liabilitiesPayheads = payheads.filter(p => p.type === 'Employer Liabilities');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Earnings': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Deductions': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'Employer Liabilities': return <Calculator className="h-4 w-4 text-blue-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Earnings': return 'text-green-600';
      case 'Deductions': return 'text-red-600';
      case 'Employer Liabilities': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Initialize form data for editing
  useEffect(() => {
    if (selectedPayhead && (showEditDialog || showCreateDialog)) {
      setFormData({
        name: selectedPayhead.name,
        alias: selectedPayhead.alias,
        type: selectedPayhead.type,
        calculation_type: selectedPayhead.calculation_type,
        calculation_value: selectedPayhead.calculation_value,
        calculation_formula: selectedPayhead.calculation_formula,
        is_statutory: selectedPayhead.is_statutory,
        is_active: selectedPayhead.is_active
      });
    }
  }, [selectedPayhead, showEditDialog, showCreateDialog]);

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
          <h1 className="text-2xl font-bold">Payheads Management</h1>
          <p className="text-muted-foreground">
            Payroll components management with calculation rules and formulas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadPayheadsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Payhead
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
                placeholder="Search payheads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="Earnings">Earnings</option>
              <option value="Deductions">Deductions</option>
              <option value="Employer Liabilities">Employer Liabilities</option>
            </select>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payheads List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Payheads ({filteredPayheads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'categories' && (
                  <div className="space-y-4">
                    {/* Earnings */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">Earnings</span>
                        </div>
                        <Badge variant="default">{earningsPayheads.length} payheads</Badge>
                      </div>
                      <div className="space-y-2">
                        {earningsPayheads.map(payhead => (
                          <div
                            key={payhead.guid}
                            className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => setSelectedPayhead(payhead)}
                          >
                            <span className="font-medium">{payhead.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{payhead.total_amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="font-semibold">Deductions</span>
                        </div>
                        <Badge variant="destructive">{deductionsPayheads.length} payheads</Badge>
                      </div>
                      <div className="space-y-2">
                        {deductionsPayheads.map(payhead => (
                          <div
                            key={payhead.guid}
                            className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => setSelectedPayhead(payhead)}
                          >
                            <span className="font-medium">{payhead.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{payhead.total_amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employer Liabilities */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold">Employer Liabilities</span>
                        </div>
                        <Badge variant="secondary">{liabilitiesPayheads.length} payheads</Badge>
                      </div>
                      <div className="space-y-2">
                        {liabilitiesPayheads.map(payhead => (
                          <div
                            key={payhead.guid}
                            className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => setSelectedPayhead(payhead)}
                          >
                            <span className="font-medium">{payhead.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{payhead.total_amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filteredPayheads.map(payhead => (
                      <div
                        key={payhead.guid}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedPayhead?.guid === payhead.guid ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedPayhead(payhead)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(payhead.type)}
                            <div>
                              <div className="font-semibold">{payhead.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {payhead.type} | {payhead.alias}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{payhead.total_amount.toLocaleString('en-IN')}</div>
                            <div className="flex items-center space-x-1">
                              {payhead.is_statutory && (
                                <Badge variant="outline" className="text-xs">Statutory</Badge>
                              )}
                              <Badge variant={payhead.is_active ? 'default' : 'secondary'} className="text-xs">
                                {payhead.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {payhead.calculation_type}: {
                            payhead.calculation_type === 'Fixed Amount' ? `₹${payhead.calculation_value}` :
                            payhead.calculation_type === 'Percentage' ? `${payhead.calculation_value}%` :
                            'Formula based'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Payhead Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payhead Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPayhead ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPayhead.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPayhead.type} | {selectedPayhead.alias}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Calculation Method</div>
                      <div className="font-semibold">{selectedPayhead.calculation_type}</div>
                      {selectedPayhead.calculation_type === 'Formula' && selectedPayhead.calculation_formula && (
                        <div className="text-sm text-muted-foreground mt-1 font-mono">
                          {selectedPayhead.calculation_formula}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {selectedPayhead.usage_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Employees</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          ₹{selectedPayhead.total_amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Statutory:</span>
                      <Badge variant={selectedPayhead.is_statutory ? 'default' : 'secondary'}>
                        {selectedPayhead.is_statutory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      View Employee Usage
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Percent className="h-4 w-4 mr-2" />
                      Calculation Test
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Payhead
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Payhead
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a payhead to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Payroll Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Payheads:</span>
                  <Badge variant="outline">{payheads.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Earnings:</span>
                  <Badge variant="default" className="bg-green-600">{earningsPayheads.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Deductions:</span>
                  <Badge variant="destructive">{deductionsPayheads.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Statutory:</span>
                  <Badge variant="outline">{payheads.filter(p => p.is_statutory).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Earnings:</span>
                  <Badge variant="default" className="bg-green-600">
                    ₹{earningsPayheads.reduce((sum, p) => sum + p.total_amount, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Payhead Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {showCreateDialog ? <Plus className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
              {showCreateDialog ? 'Create' : 'Edit'} Payhead
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Payhead Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter payhead name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alias">Alias</Label>
                <Input 
                  id="alias" 
                  value={formData.alias}
                  onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                  placeholder="Short name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Payhead Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Earnings">Earnings</option>
                  <option value="Deductions">Deductions</option>
                  <option value="Employer Liabilities">Employer Liabilities</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-type">Calculation Type</Label>
                <select
                  id="calc-type"
                  value={formData.calculation_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, calculation_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Formula">Formula</option>
                </select>
              </div>
            </div>

            {formData.calculation_type !== 'Formula' && (
              <div className="space-y-2">
                <Label htmlFor="calc-value">
                  {formData.calculation_type === 'Fixed Amount' ? 'Amount' : 'Percentage'}
                </Label>
                <Input 
                  id="calc-value" 
                  type="number"
                  value={formData.calculation_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, calculation_value: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.calculation_type === 'Fixed Amount' ? '0.00' : '0'}
                />
              </div>
            )}

            {formData.calculation_type === 'Formula' && (
              <div className="space-y-2">
                <Label htmlFor="formula">Calculation Formula</Label>
                <Textarea 
                  id="formula" 
                  value={formData.calculation_formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, calculation_formula: e.target.value }))}
                  placeholder="Enter calculation formula..."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="statutory"
                  checked={formData.is_statutory}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_statutory: !!checked }))}
                />
                <Label htmlFor="statutory">Statutory Payhead</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
                />
                <Label htmlFor="active">Active Payhead</Label>
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
              <Button onClick={showCreateDialog ? handleCreatePayhead : handleUpdatePayhead}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateDialog ? 'Create Payhead' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Payhead Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Payhead
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayhead && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete payhead "{selectedPayhead.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All employee payroll records will be affected.
                    </p>
                    {selectedPayhead.usage_count > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: Currently used for {selectedPayhead.usage_count} employees
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeletePayhead}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Payhead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function getTypeIcon(type: string) {
    switch (type) {
      case 'Earnings': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Deductions': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'Employer Liabilities': return <Calculator className="h-4 w-4 text-blue-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case 'Earnings': return 'text-green-600';
      case 'Deductions': return 'text-red-600';
      case 'Employer Liabilities': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }
}

export default PayheadsPageEnhanced;
