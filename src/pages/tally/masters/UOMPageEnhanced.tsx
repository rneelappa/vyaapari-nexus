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
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Scale, 
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Calculator,
  BarChart3,
  Activity,
  Network,
  Eye,
  ArrowRightLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnitOfMeasure {
  guid: string;
  name: string;
  symbol: string;
  type: 'Simple' | 'Compound';
  base_unit: string;
  conversion_factor: number;
  decimal_places: number;
  is_active: boolean;
  usage_count: number;
}

interface UOMPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function UOMPageEnhanced({ companyId, divisionId }: UOMPageEnhancedProps) {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'conversions' | 'usage'>('list');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Simple' | 'Compound'>('all');
  
  // CRUD state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'Simple' as 'Simple' | 'Compound',
    base_unit: '',
    conversion_factor: 1,
    decimal_places: 2,
    is_active: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadUnitsData();
  }, [companyId, divisionId]);

  const loadUnitsData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading units of measure data...');
      
      // Mock data for UOM (would be replaced with API call)
      const mockUnits: UnitOfMeasure[] = [
        {
          guid: '1',
          name: 'Numbers',
          symbol: 'Nos',
          type: 'Simple',
          base_unit: 'Nos',
          conversion_factor: 1,
          decimal_places: 0,
          is_active: true,
          usage_count: 450
        },
        {
          guid: '2',
          name: 'Kilograms',
          symbol: 'Kg',
          type: 'Simple',
          base_unit: 'Kg',
          conversion_factor: 1,
          decimal_places: 3,
          is_active: true,
          usage_count: 320
        },
        {
          guid: '3',
          name: 'Metric Tons',
          symbol: 'MT',
          type: 'Compound',
          base_unit: 'Kg',
          conversion_factor: 1000,
          decimal_places: 3,
          is_active: true,
          usage_count: 180
        },
        {
          guid: '4',
          name: 'Meters',
          symbol: 'Mtr',
          type: 'Simple',
          base_unit: 'Mtr',
          conversion_factor: 1,
          decimal_places: 2,
          is_active: true,
          usage_count: 95
        },
        {
          guid: '5',
          name: 'Liters',
          symbol: 'Ltr',
          type: 'Simple',
          base_unit: 'Ltr',
          conversion_factor: 1,
          decimal_places: 2,
          is_active: true,
          usage_count: 75
        }
      ];

      setUnits(mockUnits);
      console.log(`Loaded ${mockUnits.length} units of measure`);

    } catch (error) {
      console.error('Failed to load units:', error);
      toast({
        title: "Error",
        description: "Failed to load units data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async () => {
    try {
      console.log('Creating unit...', formData);
      
      // API call would be implemented for unit creation
      
      toast({
        title: "Unit Created",
        description: `Unit "${formData.name}" created successfully`,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadUnitsData();

    } catch (error) {
      console.error('Failed to create unit:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create unit",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUnit = async () => {
    if (!selectedUnit) return;

    try {
      console.log('Updating unit...', formData);
      
      // API call would be implemented for unit update
      
      toast({
        title: "Unit Updated",
        description: `Unit "${formData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadUnitsData();

    } catch (error) {
      console.error('Failed to update unit:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update unit",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;

    try {
      console.log('Deleting unit...', selectedUnit.name);
      
      // Check for usage dependencies
      if (selectedUnit.usage_count > 0) {
        toast({
          title: "Cannot Delete",
          description: `Unit is used in ${selectedUnit.usage_count} stock items. Remove usage first.`,
          variant: "destructive"
        });
        return;
      }

      // API call would be implemented for unit deletion
      
      toast({
        title: "Unit Deleted",
        description: `Unit "${selectedUnit.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedUnit(null);
      await loadUnitsData();

    } catch (error) {
      console.error('Failed to delete unit:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete unit",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      type: 'Simple',
      base_unit: '',
      conversion_factor: 1,
      decimal_places: 2,
      is_active: true
    });
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = !searchTerm || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || unit.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Initialize form data for editing
  useEffect(() => {
    if (selectedUnit && (showEditDialog || showCreateDialog)) {
      setFormData({
        name: selectedUnit.name,
        symbol: selectedUnit.symbol,
        type: selectedUnit.type,
        base_unit: selectedUnit.base_unit,
        conversion_factor: selectedUnit.conversion_factor,
        decimal_places: selectedUnit.decimal_places,
        is_active: selectedUnit.is_active
      });
    }
  }, [selectedUnit, showEditDialog, showCreateDialog]);

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
          <h1 className="text-2xl font-bold">Units of Measure Management</h1>
          <p className="text-muted-foreground">
            Complete UOM management with conversion factors and usage analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadUnitsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Unit
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
                placeholder="Search units..."
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
              <option value="Simple">Simple Units</option>
              <option value="Compound">Compound Units</option>
            </select>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="conversions">Conversions</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Units List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2" />
                Units of Measure ({filteredUnits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredUnits.map(unit => (
                    <div
                      key={unit.guid}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedUnit?.guid === unit.guid ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedUnit(unit)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Scale className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-semibold">{unit.name} ({unit.symbol})</div>
                            <div className="text-sm text-muted-foreground">
                              {unit.type} Unit
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={unit.is_active ? 'default' : 'secondary'}>
                            {unit.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {unit.usage_count} uses
                          </Badge>
                        </div>
                      </div>
                      
                      {unit.type === 'Compound' && (
                        <div className="text-sm text-muted-foreground">
                          1 {unit.symbol} = {unit.conversion_factor} {unit.base_unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Unit Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Unit Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUnit ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedUnit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Symbol: {selectedUnit.symbol} | Type: {selectedUnit.type}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {selectedUnit.type === 'Compound' && (
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Conversion</div>
                        <div className="font-semibold">
                          1 {selectedUnit.symbol} = {selectedUnit.conversion_factor} {selectedUnit.base_unit}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Decimal Places:</span>
                        <div className="font-semibold">{selectedUnit.decimal_places}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usage Count:</span>
                        <div className="font-semibold">{selectedUnit.usage_count}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={selectedUnit.is_active ? 'default' : 'secondary'}>
                        {selectedUnit.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      View Usage
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Conversion Calculator
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Usage Analytics
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Unit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Unit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a unit to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                UOM Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Units:</span>
                  <Badge variant="outline">{units.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Simple Units:</span>
                  <Badge variant="default">{units.filter(u => u.type === 'Simple').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Compound Units:</span>
                  <Badge variant="secondary">{units.filter(u => u.type === 'Compound').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Most Used:</span>
                  <Badge variant="outline">
                    {units.reduce((max, u) => u.usage_count > max.usage_count ? u : max, units[0])?.symbol || 'N/A'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Unit Dialog */}
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
              {showCreateDialog ? 'Create' : 'Edit'} Unit of Measure
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Unit Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter unit name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input 
                  id="symbol" 
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="Kg, Nos, Mtr..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Unit Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'Simple' | 'Compound' }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Simple">Simple Unit</option>
                  <option value="Compound">Compound Unit</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimal">Decimal Places</Label>
                <Input 
                  id="decimal" 
                  type="number"
                  min="0"
                  max="6"
                  value={formData.decimal_places}
                  onChange={(e) => setFormData(prev => ({ ...prev, decimal_places: parseInt(e.target.value) || 0 }))}
                  placeholder="2"
                />
              </div>
            </div>

            {formData.type === 'Compound' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-unit">Base Unit</Label>
                  <select
                    id="base-unit"
                    value={formData.base_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_unit: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select base unit...</option>
                    {units.filter(u => u.type === 'Simple').map(unit => (
                      <option key={unit.guid} value={unit.symbol}>{unit.name} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversion">Conversion Factor</Label>
                  <Input 
                    id="conversion" 
                    type="number"
                    step="0.001"
                    value={formData.conversion_factor}
                    onChange={(e) => setFormData(prev => ({ ...prev, conversion_factor: parseFloat(e.target.value) || 1 }))}
                    placeholder="1.000"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
              />
              <Label htmlFor="active">Active Unit</Label>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
              }}>
                Cancel
              </Button>
              <Button onClick={showCreateDialog ? handleCreateUnit : handleUpdateUnit}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateDialog ? 'Create Unit' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Unit of Measure
            </DialogTitle>
          </DialogHeader>
          
          {selectedUnit && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete unit "{selectedUnit.name}" ({selectedUnit.symbol})?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All stock items using this unit will be affected.
                    </p>
                    {selectedUnit.usage_count > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: Currently used in {selectedUnit.usage_count} stock items
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUnit}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Unit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UOMPageEnhanced;
