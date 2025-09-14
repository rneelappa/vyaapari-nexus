import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Package, 
  Warehouse, 
  Scale, 
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  Boxes
} from 'lucide-react';

interface InventoryItem {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  part_number: string;
  uom: string;
  opening_balance: number;
  closing_balance: number;
  opening_rate: number;
  closing_rate: number;
  opening_value: number;
  closing_value: number;
  description: string;
  gst_rate: number;
  gst_hsn_code: string;
  minimum_level: number;
  maximum_level: number;
  reorder_level: number;
  weight: number;
  volume: number;
  item_category: string;
  brand: string;
  manufacturer: string;
  size: string;
  color: string;
}

interface GodownInfo {
  guid: string;
  name: string;
  parent: string;
  address: string;
  godown_type: string;
  storage_type: string;
  capacity: number;
  capacity_unit: string;
  manager_name: string;
  contact_number: string;
}

interface UOMInfo {
  guid: string;
  name: string;
  formalname: string;
  conversion: number;
  is_simple_unit: number;
  base_units: string;
  additional_units: string;
}

interface VoucherInventoryDetailsProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherInventoryDetails({ voucherGuid, companyId, divisionId }: VoucherInventoryDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [godowns, setGodowns] = useState<GodownInfo[]>([]);
  const [uoms, setUoms] = useState<UOMInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalValue: 0,
    totalQuantity: 0
  });

  useEffect(() => {
    fetchInventoryDetails();
  }, [voucherGuid, companyId, divisionId]);

  const fetchInventoryDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll fetch all stock items for the company/division
      // In a real implementation, this would be filtered by voucher-specific inventory entries
      const [stockItemsResult, godownsResult, uomsResult] = await Promise.all([
        supabase
          .from('mst_stock_item')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(50), // Limit for performance
        
        supabase
          .from('mst_godown')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId),
        
        supabase
          .from('mst_uom')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
      ]);

      if (stockItemsResult.error) {
        console.error('Error fetching stock items:', stockItemsResult.error);
        setError('Failed to fetch inventory items');
        return;
      }

      if (godownsResult.error) {
        console.error('Error fetching godowns:', godownsResult.error);
      }

      if (uomsResult.error) {
        console.error('Error fetching UOMs:', uomsResult.error);
      }

      const items = stockItemsResult.data || [];
      const godownData = godownsResult.data || [];
      const uomData = uomsResult.data || [];

      setInventoryItems(items);
      setGodowns(godownData);
      setUoms(uomData);

      // Calculate totals
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.closing_value || 0), 0);
      const totalQuantity = items.reduce((sum, item) => sum + (item.closing_balance || 0), 0);

      setTotals({ totalItems, totalValue, totalQuantity });

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatQuantity = (quantity: number, uom?: string) => {
    return `${quantity.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${uom || ''}`.trim();
  };

  const getStockLevelBadge = (item: InventoryItem) => {
    const currentStock = item.closing_balance || 0;
    const minLevel = item.minimum_level || 0;
    const maxLevel = item.maximum_level || 0;
    const reorderLevel = item.reorder_level || 0;

    if (currentStock <= minLevel) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (currentStock <= reorderLevel) {
      return <Badge variant="secondary">Reorder</Badge>;
    } else if (maxLevel > 0 && currentStock >= maxLevel) {
      return <Badge variant="outline">Overstock</Badge>;
    } else {
      return <Badge variant="default">Normal</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Inventory Details</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-lg font-semibold">{totals.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="text-lg font-semibold text-blue-600">
                  {totals.totalQuantity.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totals.totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Godowns</p>
                <p className="text-lg font-semibold text-orange-600">{godowns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items Table */}
      {inventoryItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Inventory Items ({inventoryItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="text-right">Stock Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.guid}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.alias && (
                            <div className="text-sm text-muted-foreground">{item.alias}</div>
                          )}
                          {item.part_number && (
                            <div className="text-xs text-muted-foreground">
                              Part: {item.part_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.parent || 'N/A'}</div>
                          {item.item_category && (
                            <div className="text-muted-foreground">{item.item_category}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.uom || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatQuantity(item.closing_balance || 0, item.uom)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.closing_rate || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.closing_value || 0)}
                      </TableCell>
                      <TableCell>
                        {getStockLevelBadge(item)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {item.brand && (
                            <div><span className="text-muted-foreground">Brand:</span> {item.brand}</div>
                          )}
                          {item.manufacturer && (
                            <div><span className="text-muted-foreground">Mfg:</span> {item.manufacturer}</div>
                          )}
                          {item.gst_hsn_code && (
                            <div><span className="text-muted-foreground">HSN:</span> {item.gst_hsn_code}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
            <p className="text-muted-foreground">No inventory items found for this voucher.</p>
          </div>
        </div>
      )}

      {/* Godowns/Warehouses */}
      {godowns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Godowns/Warehouses ({godowns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {godowns.map((godown) => (
                <Card key={godown.guid} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium">{godown.name}</div>
                      {godown.parent && (
                        <div className="text-sm text-muted-foreground">
                          Parent: {godown.parent}
                        </div>
                      )}
                      {godown.address && (
                        <div className="text-sm">{godown.address}</div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {godown.godown_type && (
                          <Badge variant="secondary" className="text-xs">
                            {godown.godown_type}
                          </Badge>
                        )}
                        {godown.storage_type && (
                          <Badge variant="outline" className="text-xs">
                            {godown.storage_type}
                          </Badge>
                        )}
                      </div>
                      {godown.capacity && godown.capacity > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Capacity:</span> {godown.capacity} {godown.capacity_unit}
                        </div>
                      )}
                      {godown.manager_name && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Manager:</span> {godown.manager_name}
                        </div>
                      )}
                      {godown.contact_number && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Contact:</span> {godown.contact_number}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Units of Measure */}
      {uoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Units of Measure ({uoms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uoms.map((uom) => (
                <Card key={uom.guid} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{uom.name}</div>
                        <Badge variant={uom.is_simple_unit === 1 ? "default" : "secondary"}>
                          {uom.is_simple_unit === 1 ? "Simple" : "Compound"}
                        </Badge>
                      </div>
                      {uom.formalname && uom.formalname !== uom.name && (
                        <div className="text-sm text-muted-foreground">
                          Formal: {uom.formalname}
                        </div>
                      )}
                      {uom.conversion && uom.conversion !== 1 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Conversion:</span> {uom.conversion}
                        </div>
                      )}
                      {uom.base_units && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Base:</span> {uom.base_units}
                        </div>
                      )}
                      {uom.additional_units && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Additional:</span> {uom.additional_units}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}