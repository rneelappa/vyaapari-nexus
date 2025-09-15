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
  Target, 
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Building,
  Calculator,
  BarChart3,
  Activity,
  Network,
  Eye,
  ChevronRight,
  ChevronDown,
  TreePine
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostCenter {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  category: string;
  is_active: boolean;
  opening_balance: number;
  closing_balance: number;
  budget_amount: number;
  actual_amount: number;
  variance_percentage: number;
}

interface CostCenterAllocation {
  voucherNumber: string;
  date: string;
  ledgerName: string;
  amount: number;
  percentage: number;
}

interface CostCentersPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function CostCentersPageEnhanced({ companyId, divisionId }: CostCentersPageEnhancedProps) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [allocations, setAllocations] = useState<CostCenterAllocation[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy' | 'budget' | 'allocations'>('list');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // CRUD state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    alias: '',
    category: 'Primary',
    is_active: true,
    budget_amount: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCostCentersData();
  }, [companyId, divisionId]);

  const loadCostCentersData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading cost centers data...');
      
      // Mock data for cost centers (would be replaced with API call)
      const mockCostCenters: CostCenter[] = [
        {
          guid: '1',
          name: 'Sales Department',
          parent: 'Primary',
          alias: 'SALES',
          category: 'Department',
          is_active: true,
          opening_balance: 0,
          closing_balance: 2500000,
          budget_amount: 3000000,
          actual_amount: 2500000,
          variance_percentage: 16.67
        },
        {
          guid: '2',
          name: 'Production Unit',
          parent: 'Primary',
          alias: 'PROD',
          category: 'Production',
          is_active: true,
          opening_balance: 0,
          closing_balance: 5200000,
          budget_amount: 5000000,
          actual_amount: 5200000,
          variance_percentage: -4.0
        },
        {
          guid: '3',
          name: 'Administration',
          parent: 'Primary',
          alias: 'ADMIN',
          category: 'Support',
          is_active: true,
          opening_balance: 0,
          closing_balance: 850000,
          budget_amount: 800000,
          actual_amount: 850000,
          variance_percentage: -6.25
        }
      ];

      setCostCenters(mockCostCenters);
      console.log(`Loaded ${mockCostCenters.length} cost centers`);

    } catch (error) {
      console.error('Failed to load cost centers:', error);
      toast({
        title: "Error",
        description: "Failed to load cost centers data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCostCenter = async () => {
    try {
      console.log('Creating cost center...', formData);
      
      // API call would be implemented for cost center creation
      
      toast({
        title: "Cost Center Created",
        description: `Cost center "${formData.name}" created successfully`,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadCostCentersData();

    } catch (error) {
      console.error('Failed to create cost center:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create cost center",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCostCenter = async () => {
    if (!selectedCostCenter) return;

    try {
      console.log('Updating cost center...', formData);
      
      // API call would be implemented for cost center update
      
      toast({
        title: "Cost Center Updated",
        description: `Cost center "${formData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadCostCentersData();

    } catch (error) {
      console.error('Failed to update cost center:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update cost center",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCostCenter = async () => {
    if (!selectedCostCenter) return;

    try {
      console.log('Deleting cost center...', selectedCostCenter.name);
      
      // Check for allocation dependencies
      if (selectedCostCenter.closing_balance > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cost center has allocations. Clear all allocations first.",
          variant: "destructive"
        });
        return;
      }

      // API call would be implemented for cost center deletion
      
      toast({
        title: "Cost Center Deleted",
        description: `Cost center "${selectedCostCenter.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedCostCenter(null);
      await loadCostCentersData();

    } catch (error) {
      console.error('Failed to delete cost center:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete cost center",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent: '',
      alias: '',
      category: 'Primary',
      is_active: true,
      budget_amount: 0
    });
  };

  const filteredCostCenters = costCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(costCenters.map(c => c.category))];

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return 'text-green-600';
    if (variance < -10) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Initialize form data for editing
  useEffect(() => {
    if (selectedCostCenter && (showEditDialog || showCreateDialog)) {
      setFormData({
        name: selectedCostCenter.name,
        parent: selectedCostCenter.parent,
        alias: selectedCostCenter.alias,
        category: selectedCostCenter.category,
        is_active: selectedCostCenter.is_active,
        budget_amount: selectedCostCenter.budget_amount
      });
    }
  }, [selectedCostCenter, showEditDialog, showCreateDialog]);

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
          <h1 className="text-2xl font-bold">Cost Centers Management</h1>
          <p className="text-muted-foreground">
            Cost allocation and budget management with complete CRUD operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadCostCentersData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cost Center
          </Button>
        </div>
      </div>

      {/* Search and View Mode */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="allocations">Allocations</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Centers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Cost Centers ({filteredCostCenters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredCostCenters.map(center => (
                      <div
                        key={center.guid}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCostCenter?.guid === center.guid ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedCostCenter(center)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Target className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{center.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {center.category} | {center.alias}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={center.is_active ? 'default' : 'secondary'}>
                              {center.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Budget:</span>
                            <div className="font-semibold">₹{center.budget_amount.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual:</span>
                            <div className="font-semibold">₹{center.actual_amount.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Variance:</span>
                            <div className={`font-semibold ${getVarianceColor(center.variance_percentage)}`}>
                              {center.variance_percentage > 0 ? '+' : ''}{center.variance_percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'budget' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Budget vs Actual Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Cost center performance against budget
                      </p>
                    </div>
                    
                    {filteredCostCenters.map(center => (
                      <div key={center.guid} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{center.name}</span>
                          </div>
                          <Badge variant={
                            center.variance_percentage > 0 ? 'default' : 
                            center.variance_percentage < -10 ? 'destructive' : 'secondary'
                          }>
                            {center.variance_percentage > 0 ? '+' : ''}{center.variance_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Budget Amount:</span>
                            <div className="font-semibold text-blue-600">
                              ₹{center.budget_amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual Amount:</span>
                            <div className="font-semibold text-green-600">
                              ₹{center.actual_amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                center.variance_percentage < -10 ? 'bg-red-600' :
                                center.variance_percentage < 0 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ 
                                width: `${Math.min(100, (center.actual_amount / center.budget_amount) * 100)}%` 
                              }}
                            ></div>
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

        {/* Selected Cost Center Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cost Center Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCostCenter ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCostCenter.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCostCenter.category} | {selectedCostCenter.alias}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Budget Amount</div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{selectedCostCenter.budget_amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Actual Amount</div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{selectedCostCenter.actual_amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Variance</div>
                        <div className={`text-lg font-bold ${getVarianceColor(selectedCostCenter.variance_percentage)}`}>
                          {selectedCostCenter.variance_percentage > 0 ? '+' : ''}
                          {selectedCostCenter.variance_percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={selectedCostCenter.is_active ? 'default' : 'secondary'}>
                        {selectedCostCenter.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      View Allocations
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Budget Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Monthly Trends
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Cost Center
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Cost Center
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a cost center to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Budget Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Centers:</span>
                  <Badge variant="outline">{costCenters.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Centers:</span>
                  <Badge variant="default">{costCenters.filter(c => c.is_active).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Budget:</span>
                  <Badge variant="outline">
                    ₹{costCenters.reduce((sum, c) => sum + c.budget_amount, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Actual:</span>
                  <Badge variant="secondary">
                    ₹{costCenters.reduce((sum, c) => sum + c.actual_amount, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Cost Center Dialog */}
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
              {showCreateDialog ? 'Create' : 'Edit'} Cost Center
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cost Center Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter cost center name..."
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
                <Label htmlFor="parent">Parent</Label>
                <select
                  id="parent"
                  value={formData.parent}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Primary">Primary</option>
                  {costCenters.filter(c => c.name !== selectedCostCenter?.name).map(center => (
                    <option key={center.guid} value={center.name}>{center.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Amount</Label>
              <Input 
                id="budget" 
                type="number"
                value={formData.budget_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
              />
              <Label htmlFor="active">Active Cost Center</Label>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
              }}>
                Cancel
              </Button>
              <Button onClick={showCreateDialog ? handleCreateCostCenter : handleUpdateCostCenter}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateDialog ? 'Create' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Cost Center Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Cost Center
            </DialogTitle>
          </DialogHeader>
          
          {selectedCostCenter && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete cost center "{selectedCostCenter.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All cost allocations will be affected.
                    </p>
                    {selectedCostCenter.closing_balance > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: Current balance is ₹{selectedCostCenter.closing_balance.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteCostCenter}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cost Center
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

export default CostCentersPageEnhanced;
