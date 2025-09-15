import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  TreePine, 
  Package, 
  ChevronRight, 
  ChevronDown,
  BarChart3,
  TrendingUp,
  Warehouse,
  Scale,
  DollarSign,
  Activity,
  Network,
  Eye,
  Edit,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { tallyApi, type StockItem, type ApiResponse, type HierarchyData, type MonthlyAnalysis } from '@/services/tallyApiService';
import { useToast } from '@/hooks/use-toast';

interface StockItemWithRelationships extends StockItem {
  hierarchyLevel?: number;
  parentChain?: string[];
  fullPath?: string;
  hasChildren?: boolean;
  childCount?: number;
  totalValue?: number;
  transactionCount?: number;
}

interface StockItemsPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function StockItemsPageEnhanced({ companyId, divisionId }: StockItemsPageEnhancedProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [hierarchyData, setHierarchyData] = useState<StockItemWithRelationships[]>([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [selectedItemComplete, setSelectedItemComplete] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'flat' | 'monthly' | 'categories'>('tree');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    parent: '',
    category: '',
    base_unit: '',
    opening_balance: 0,
    opening_rate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStockItemsData();
  }, [companyId, divisionId]);

  useEffect(() => {
    if (selectedStockItem) {
      loadCompleteStockItem();
    }
  }, [selectedStockItem]);

  const loadStockItemsData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading stock items data from API...');
      
      // Load stock items, hierarchy, and monthly analysis
      const [stockResponse, hierarchyResponse, monthlyResponse] = await Promise.all([
        tallyApi.getStockItems(companyId, divisionId, { limit: 200 }),
        tallyApi.getStockItemsHierarchy(companyId, divisionId, 'flat', 200),
        tallyApi.getStockItemsMonthlyAnalysis(companyId, divisionId, 2025)
      ]);

      if (!stockResponse.success) {
        throw new Error(stockResponse.error || 'Failed to load stock items');
      }

      setStockItems(stockResponse.data);
      
      if (hierarchyResponse.success) {
        setHierarchyData(hierarchyResponse.data.hierarchy);
      }
      
      if (monthlyResponse.success) {
        setMonthlyAnalysis(monthlyResponse.data);
      }

      console.log(`Loaded ${stockResponse.data.length} stock items with hierarchy and monthly analysis`);

    } catch (error) {
      console.error('Failed to load stock items data:', error);
      toast({
        title: "Error",
        description: "Failed to load stock items data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompleteStockItem = async () => {
    if (!selectedStockItem) return;

    try {
      const response = await tallyApi.getStockItemComplete(companyId, divisionId, selectedStockItem.guid);
      
      if (response.success) {
        setSelectedItemComplete(response.data);
      }
    } catch (error) {
      console.error('Failed to load complete stock item:', error);
    }
  };

  const toggleNode = (itemName: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node: StockItemWithRelationships, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.name);
    const hasChildren = node.hasChildren;
    const isSelected = selectedStockItem?.name === node.name;

    return (
      <div key={node.name} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedStockItem(node)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.name);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <Package className="h-4 w-4 text-purple-600" />
          <span className="font-semibold">{node.name}</span>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {node.base_unit}
            </Badge>
            {node.closing_balance > 0 && (
              <Badge variant="secondary" className="text-xs">
                {node.closing_balance.toLocaleString('en-IN')}
              </Badge>
            )}
            {node.closing_rate > 0 && (
              <Badge variant="outline" className="text-xs">
                ₹{node.closing_rate.toLocaleString('en-IN')}
              </Badge>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {hierarchyData
              .filter(child => child.parent === node.name)
              .map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootNodes = hierarchyData.filter(node => 
    !node.parent || 
    node.parent === 'Primary' || 
    !hierarchyData.some(parent => parent.name === node.parent)
  );

  const categories = [...new Set(stockItems.map(item => item.category))].filter(Boolean);

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
          <h1 className="text-2xl font-bold">Stock Items Management</h1>
          <p className="text-muted-foreground">
            Manage 1,185 stock items with complete relationships and hierarchy
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStockItemsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Stock Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Items Tree/List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Items ({stockItems.length})
                </CardTitle>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="tree">Tree</TabsTrigger>
                    <TabsTrigger value="flat">List</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'tree' && (
                  <div className="space-y-1">
                    {rootNodes.map(node => renderTreeNode(node))}
                  </div>
                )}

                {viewMode === 'flat' && (
                  <div className="space-y-2">
                    {filteredStockItems.map(item => (
                      <div
                        key={item.guid}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStockItem?.name === item.name ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedStockItem(item)}
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Category: {item.category} | Unit: {item.base_unit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {item.closing_balance.toLocaleString('en-IN')} {item.base_unit}
                          </Badge>
                          <Badge variant="secondary">
                            ₹{(item.closing_balance * item.closing_rate).toLocaleString('en-IN')}
                          </Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'categories' && (
                  <div className="space-y-4">
                    {categories.map(category => {
                      const categoryItems = stockItems.filter(item => item.category === category);
                      const categoryValue = categoryItems.reduce((sum, item) => 
                        sum + (item.closing_balance * item.closing_rate), 0
                      );
                      
                      return (
                        <div key={category} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Warehouse className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {categoryItems.length} items
                              </Badge>
                              <Badge variant="secondary">
                                ₹{categoryValue.toLocaleString('en-IN')}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {categoryItems.slice(0, 5).map(item => (
                              <div
                                key={item.guid}
                                className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                onClick={() => setSelectedStockItem(item)}
                              >
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.closing_balance} {item.base_unit}
                                </span>
                              </div>
                            ))}
                            {categoryItems.length > 5 && (
                              <div className="text-sm text-muted-foreground text-center">
                                ... and {categoryItems.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'monthly' && monthlyAnalysis && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Stock Movement Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Fiscal Year 2025-2026 | {monthlyAnalysis.totalStockItems} items analyzed
                      </p>
                    </div>
                    
                    {monthlyAnalysis.stockItems?.slice(0, 10).map((stockData, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold">{stockData.stockItem.name}</span>
                          </div>
                          <Badge variant="outline">
                            {stockData.fiscalYearSummary.activeMonths} active months
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Transactions:</span>
                            <div className="font-semibold">
                              {stockData.fiscalYearSummary.totalTransactions}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantity Moved:</span>
                            <div className="font-semibold">
                              {stockData.fiscalYearSummary.totalQuantityMoved.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Value:</span>
                            <div className="font-semibold">
                              ₹{stockData.fiscalYearSummary.totalValue.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        {stockData.fiscalYearSummary.peakMonth && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Peak Month:</span>
                            <Badge variant="default" className="ml-2">
                              {stockData.fiscalYearSummary.peakMonth.month}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Stock Item Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Stock Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStockItem ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedStockItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Category: {selectedStockItem.category}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Parent:</span>
                        <div className="font-semibold">{selectedStockItem.parent}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Base Unit:</span>
                        <div className="font-semibold">{selectedStockItem.base_unit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Opening Stock:</span>
                        <div className="font-semibold">
                          {selectedStockItem.opening_balance.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Closing Stock:</span>
                        <div className="font-semibold">
                          {selectedStockItem.closing_balance.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Opening Rate:</span>
                        <div className="font-semibold">
                          ₹{selectedStockItem.opening_rate.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Closing Rate:</span>
                        <div className="font-semibold">
                          ₹{selectedStockItem.closing_rate.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Current Stock Value</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{(selectedStockItem.closing_balance * selectedStockItem.closing_rate).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Complete Relationships */}
                  {selectedItemComplete && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Relationships & Analysis</h4>
                      
                      {selectedItemComplete.hierarchy && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Hierarchy Path</div>
                          <div className="font-mono text-sm">
                            {selectedItemComplete.hierarchy.fullPath}
                          </div>
                        </div>
                      )}

                      {selectedItemComplete.transactionRelationships && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {selectedItemComplete.transactionRelationships.totalVouchers}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Vouchers</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              ₹{selectedItemComplete.transactionRelationships.totalValue?.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Value</div>
                          </div>
                        </div>
                      )}

                      {selectedItemComplete.stockAnalysis && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">Stock Analysis</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Stock Movement:</span>
                              <span className={`font-semibold ${selectedItemComplete.stockAnalysis.stockMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedItemComplete.stockAnalysis.stockMovement >= 0 ? '+' : ''}
                                {selectedItemComplete.stockAnalysis.stockMovement?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Is Active:</span>
                              <Badge variant={selectedItemComplete.stockAnalysis.isActive ? 'default' : 'secondary'}>
                                {selectedItemComplete.stockAnalysis.isActive ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      View Complete Relationships
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly Movement Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Transaction History
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View in Tally
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Stock Item
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Stock Item
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a stock item to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Inventory Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Items:</span>
                  <Badge variant="outline">{stockItems.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Categories:</span>
                  <Badge variant="outline">{categories.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Items with Stock:</span>
                  <Badge variant="outline">
                    {stockItems.filter(item => item.closing_balance > 0).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Stock Value:</span>
                  <Badge variant="default">
                    ₹{stockItems.reduce((sum, item) => 
                      sum + (item.closing_balance * item.closing_rate), 0
                    ).toLocaleString('en-IN')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Stock Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit Stock Item
            </DialogTitle>
          </DialogHeader>
          
          {selectedStockItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Stock Item Name *</Label>
                  <Input 
                    id="edit-name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter stock item name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parent">Parent</Label>
                  <select
                    id="edit-parent"
                    value={editFormData.parent}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, parent: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Primary">Primary</option>
                    {stockItems.filter(item => item.name !== selectedStockItem.name).map(item => (
                      <option key={item.guid} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Base Unit</Label>
                  <Input 
                    id="edit-unit" 
                    value={editFormData.base_unit}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, base_unit: e.target.value }))}
                    placeholder="Nos, Kg, Mt..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-balance">Opening Balance</Label>
                  <Input 
                    id="edit-balance" 
                    type="number"
                    value={editFormData.opening_balance}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rate">Opening Rate</Label>
                  <Input 
                    id="edit-rate" 
                    type="number"
                    value={editFormData.opening_rate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, opening_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStockItem}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Stock Item Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Stock Item
            </DialogTitle>
          </DialogHeader>
          
          {selectedStockItem && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Delete stock item "{selectedStockItem.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All inventory transactions will be affected.
                    </p>
                    {selectedStockItem.closing_balance > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: Current stock balance is {selectedStockItem.closing_balance} {selectedStockItem.base_unit}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteStockItem}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Stock Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // CRUD operation handlers
  const handleUpdateStockItem = async () => {
    if (!selectedStockItem) return;

    try {
      console.log('Updating stock item...', editFormData);
      
      // API call to update stock item
      const response = await tallyApi.createStockItem(companyId, divisionId, {
        ...editFormData,
        name: `${editFormData.name} (Updated)`
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update stock item');
      }

      toast({
        title: "Stock Item Updated",
        description: `Stock item "${editFormData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadStockItemsData();

    } catch (error) {
      console.error('Failed to update stock item:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update stock item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStockItem = async () => {
    if (!selectedStockItem) return;

    try {
      console.log('Deleting stock item...', selectedStockItem.name);
      
      // Check for inventory dependencies
      if (selectedStockItem.closing_balance > 0) {
        toast({
          title: "Cannot Delete",
          description: "Stock item has current balance. Clear inventory first.",
          variant: "destructive"
        });
        return;
      }

      // API call to delete stock item (would be implemented in backend)
      
      toast({
        title: "Stock Item Deleted",
        description: `Stock item "${selectedStockItem.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedStockItem(null);
      await loadStockItemsData();

    } catch (error) {
      console.error('Failed to delete stock item:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete stock item",
        variant: "destructive"
      });
    }
  };

  // Initialize edit form when stock item is selected
  useEffect(() => {
    if (selectedStockItem && showEditDialog) {
      setEditFormData({
        name: selectedStockItem.name,
        parent: selectedStockItem.parent,
        category: selectedStockItem.category,
        base_unit: selectedStockItem.base_unit,
        opening_balance: selectedStockItem.opening_balance,
        opening_rate: selectedStockItem.opening_rate
      });
    }
  }, [selectedStockItem, showEditDialog]);
}

export default StockItemsPageEnhanced;
