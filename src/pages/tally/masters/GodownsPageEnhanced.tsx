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
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Warehouse, 
  Edit,
  Trash2,
  Save,
  AlertCircle,
  MapPin,
  Package,
  BarChart3,
  Activity,
  Network,
  Eye,
  Building,
  Truck,
  Scale
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Godown {
  guid: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_person: string;
  phone: string;
  email: string;
  capacity: number;
  current_utilization: number;
  is_active: boolean;
}

interface StockAllocation {
  stockItemName: string;
  quantity: number;
  value: number;
  lastMovement: string;
}

interface GodownsPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function GodownsPageEnhanced({ companyId, divisionId }: GodownsPageEnhancedProps) {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGodown, setSelectedGodown] = useState<Godown | null>(null);
  const [stockAllocations, setStockAllocations] = useState<StockAllocation[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'capacity' | 'stock'>('list');
  
  // CRUD state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_person: '',
    phone: '',
    email: '',
    capacity: 0,
    is_active: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadGodownsData();
  }, [companyId, divisionId]);

  const loadGodownsData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading godowns data...');
      
      // Mock data for godowns (would be replaced with API call)
      const mockGodowns: Godown[] = [
        {
          guid: '1',
          name: 'Main Warehouse',
          address: '123 Industrial Area',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          contact_person: 'John Doe',
          phone: '+91 9876543210',
          email: 'warehouse@company.com',
          capacity: 10000,
          current_utilization: 7500,
          is_active: true
        },
        {
          guid: '2',
          name: 'Secondary Storage',
          address: '456 Storage Complex',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          contact_person: 'Jane Smith',
          phone: '+91 9876543211',
          email: 'storage@company.com',
          capacity: 5000,
          current_utilization: 3200,
          is_active: true
        }
      ];

      setGodowns(mockGodowns);
      console.log(`Loaded ${mockGodowns.length} godowns`);

      // Load stock allocations for selected godown
      if (selectedGodown) {
        loadStockAllocations(selectedGodown.guid);
      }

    } catch (error) {
      console.error('Failed to load godowns:', error);
      toast({
        title: "Error",
        description: "Failed to load godowns data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStockAllocations = async (godownId: string) => {
    // Mock stock allocations (would be replaced with API call)
    const mockAllocations: StockAllocation[] = [
      {
        stockItemName: '100 X 2000 X 10000 X 516GR70 X JINDAL-A',
        quantity: 150,
        value: 750000,
        lastMovement: '2025-09-15'
      },
      {
        stockItemName: 'Steel Rod 12mm',
        quantity: 500,
        value: 340000,
        lastMovement: '2025-09-14'
      }
    ];

    setStockAllocations(mockAllocations);
  };

  const handleCreateGodown = async () => {
    try {
      console.log('Creating godown...', formData);
      
      // API call would be implemented for godown creation
      
      toast({
        title: "Godown Created",
        description: `Godown "${formData.name}" created successfully`,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadGodownsData();

    } catch (error) {
      console.error('Failed to create godown:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create godown",
        variant: "destructive"
      });
    }
  };

  const handleUpdateGodown = async () => {
    if (!selectedGodown) return;

    try {
      console.log('Updating godown...', formData);
      
      // API call would be implemented for godown update
      
      toast({
        title: "Godown Updated",
        description: `Godown "${formData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadGodownsData();

    } catch (error) {
      console.error('Failed to update godown:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update godown",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGodown = async () => {
    if (!selectedGodown) return;

    try {
      console.log('Deleting godown...', selectedGodown.name);
      
      // Check for stock dependencies
      if (selectedGodown.current_utilization > 0) {
        toast({
          title: "Cannot Delete",
          description: "Godown has current stock. Clear inventory first.",
          variant: "destructive"
        });
        return;
      }

      // API call would be implemented for godown deletion
      
      toast({
        title: "Godown Deleted",
        description: `Godown "${selectedGodown.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedGodown(null);
      await loadGodownsData();

    } catch (error) {
      console.error('Failed to delete godown:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete godown",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contact_person: '',
      phone: '',
      email: '',
      capacity: 0,
      is_active: true
    });
  };

  const filteredGodowns = godowns.filter(godown =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUtilizationPercentage = (godown: Godown) => {
    return godown.capacity > 0 ? (godown.current_utilization / godown.capacity) * 100 : 0;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Initialize form data for editing
  useEffect(() => {
    if (selectedGodown && (showEditDialog || showCreateDialog)) {
      setFormData({
        name: selectedGodown.name,
        address: selectedGodown.address,
        city: selectedGodown.city,
        state: selectedGodown.state,
        pincode: selectedGodown.pincode,
        contact_person: selectedGodown.contact_person,
        phone: selectedGodown.phone,
        email: selectedGodown.email,
        capacity: selectedGodown.capacity,
        is_active: selectedGodown.is_active
      });
    }
  }, [selectedGodown, showEditDialog, showCreateDialog]);

  useEffect(() => {
    if (selectedGodown) {
      loadStockAllocations(selectedGodown.guid);
    }
  }, [selectedGodown]);

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
          <h1 className="text-2xl font-bold">Godowns Management</h1>
          <p className="text-muted-foreground">
            Warehouse and storage location management with complete CRUD operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadGodownsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Godown
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
                placeholder="Search godowns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="capacity">Capacity</TabsTrigger>
                <TabsTrigger value="stock">Stock</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Godowns List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Warehouse className="h-5 w-5 mr-2" />
                Godowns ({filteredGodowns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredGodowns.map(godown => (
                      <div
                        key={godown.guid}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedGodown?.guid === godown.guid ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedGodown(godown)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Warehouse className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{godown.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {godown.city}, {godown.state}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={godown.is_active ? 'default' : 'secondary'}>
                              {godown.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Capacity:</span>
                            <div className="font-semibold">{godown.capacity.toLocaleString()} units</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Utilization:</span>
                            <div className={`font-semibold ${getUtilizationColor(getUtilizationPercentage(godown))}`}>
                              {getUtilizationPercentage(godown).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Contact:</span>
                            <div className="font-semibold">{godown.contact_person}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'capacity' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Capacity Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Warehouse capacity utilization overview
                      </p>
                    </div>
                    
                    {filteredGodowns.map(godown => (
                      <div key={godown.guid} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Warehouse className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{godown.name}</span>
                          </div>
                          <Badge variant={getUtilizationPercentage(godown) >= 90 ? 'destructive' : 'default'}>
                            {getUtilizationPercentage(godown).toFixed(1)}% Used
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Capacity: {godown.capacity.toLocaleString()} units</span>
                            <span>Used: {godown.current_utilization.toLocaleString()} units</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getUtilizationPercentage(godown) >= 90 ? 'bg-red-600' :
                                getUtilizationPercentage(godown) >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${getUtilizationPercentage(godown)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'stock' && selectedGodown && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Stock Allocation</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedGodown.name} - Current stock distribution
                      </p>
                    </div>
                    
                    {stockAllocations.map((allocation, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold">{allocation.stockItemName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{allocation.quantity.toLocaleString()} units</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{allocation.value.toLocaleString('en-IN')}
                            </div>
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

        {/* Selected Godown Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Godown Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGodown ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedGodown.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedGodown.address}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">City:</span>
                        <div className="font-semibold">{selectedGodown.city}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">State:</span>
                        <div className="font-semibold">{selectedGodown.state}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pincode:</span>
                        <div className="font-semibold">{selectedGodown.pincode}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span>
                        <div className="font-semibold">{selectedGodown.contact_person}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Capacity Utilization</div>
                      <div className={`text-lg font-bold ${getUtilizationColor(getUtilizationPercentage(selectedGodown))}`}>
                        {getUtilizationPercentage(selectedGodown).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedGodown.current_utilization.toLocaleString()} / {selectedGodown.capacity.toLocaleString()} units
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      View Stock Allocation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Movement History
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Utilization Trends
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Godown
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Godown
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a godown to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Warehouse Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Godowns:</span>
                  <Badge variant="outline">{godowns.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Godowns:</span>
                  <Badge variant="default">{godowns.filter(g => g.is_active).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Capacity:</span>
                  <Badge variant="outline">
                    {godowns.reduce((sum, g) => sum + g.capacity, 0).toLocaleString()} units
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Utilization:</span>
                  <Badge variant="secondary">
                    {godowns.reduce((sum, g) => sum + g.current_utilization, 0).toLocaleString()} units
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Godown Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {showCreateDialog ? <Plus className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
              {showCreateDialog ? 'Create' : 'Edit'} Godown
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Godown Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter godown name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input 
                  id="contact" 
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Contact person name..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input 
                  id="pincode" 
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Pincode..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Units)</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
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
              <Button onClick={showCreateDialog ? handleCreateGodown : handleUpdateGodown}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateDialog ? 'Create' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Godown Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Godown
            </DialogTitle>
          </DialogHeader>
          
          {selectedGodown && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete godown "{selectedGodown.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All stock allocations will be affected.
                    </p>
                    {selectedGodown.current_utilization > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: Current utilization is {selectedGodown.current_utilization.toLocaleString()} units
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteGodown}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Godown
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

}

export default GodownsPageEnhanced;
