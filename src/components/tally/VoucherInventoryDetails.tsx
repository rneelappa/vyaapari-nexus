import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Warehouse, Scale, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  guid: string;
  item: string;
  category: string;
  alias: string;
  partNumber: string;
  uom: string;
  openingBalance: number;
  quantity: number;
  openingRate: number;
  rate: number;
  openingValue: number;
  amount: number;
  description: string;
  gstRate: number;
  hsnCode: string;
  minimumLevel: number;
  maximumLevel: number;
  reorderLevel: number;
  weight: number;
  volume: number;
  itemCategory: string;
  brand: string;
  manufacturer: string;
  size: string;
  color: string;
  godown: string;
  trackingNumber: string;
}

interface GodownInfo {
  guid: string;
  name: string;
  address: string;
  capacity?: number;
  capacityUnit?: string;
  storageType?: string;
  managerName?: string;
  contactNumber?: string;
}

interface UOMInfo {
  guid: string;
  name: string;
  formalname: string;
  baseUnits: string;
  additionalUnits: string;
  conversion: number;
  isSimpleUnit: boolean;
}

interface VoucherInventoryDetailsProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export const VoucherInventoryDetails: React.FC<VoucherInventoryDetailsProps> = ({
  voucherGuid,
  companyId,
  divisionId
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [godowns, setGodowns] = useState<GodownInfo[]>([]);
  const [uoms, setUOMs] = useState<UOMInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    uniqueGodowns: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For now, show a placeholder since we're transitioning to VT schema
        setInventoryItems([]);
        setGodowns([]);
        setUOMs([]);
        setSummary({
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
          uniqueGodowns: 0
        });
      } catch (error: any) {
        console.error('Error fetching inventory data:', error);
        setError('Failed to fetch inventory data');
      } finally {
        setIsLoading(false);
      }
    };

    if (voucherGuid && companyId && divisionId) {
      fetchData();
    }
  }, [voucherGuid, companyId, divisionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatQuantity = (quantity: number, uom?: string) => {
    return `${quantity.toFixed(2)} ${uom || 'units'}`;
  };

  const getStockLevelBadge = (item: InventoryItem) => {
    const { quantity, minimumLevel, maximumLevel, reorderLevel } = item;
    
    if (quantity <= minimumLevel) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (quantity <= reorderLevel) {
      return <Badge variant="secondary">Reorder</Badge>;
    } else if (quantity >= maximumLevel) {
      return <Badge variant="outline">Overstock</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{summary.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                <p className="text-2xl font-bold">{summary.totalQuantity.toFixed(2)}</p>
              </div>
              <Scale className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Godowns</p>
                <p className="text-2xl font-bold">{summary.uniqueGodowns}</p>
              </div>
              <Warehouse className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Detailed breakdown of inventory items in this voucher
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No Inventory Items</p>
              <p className="text-sm">This voucher does not contain any inventory transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Godown</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Tracking #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.item}</div>
                          {item.alias && (
                            <div className="text-sm text-muted-foreground">{item.alias}</div>
                          )}
                          {item.partNumber && (
                            <div className="text-xs text-muted-foreground">
                              Part: {item.partNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{item.category}</div>
                          {item.itemCategory && (
                            <div className="text-xs text-muted-foreground">{item.itemCategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.godown || 'N/A'}</TableCell>
                      <TableCell>{item.uom || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatQuantity(item.quantity, item.uom)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.rate)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>{getStockLevelBadge(item)}</TableCell>
                      <TableCell>
                        {item.trackingNumber && (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {item.trackingNumber}
                          </code>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Godowns Section */}
      {godowns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Associated Godowns</CardTitle>
            <CardDescription>
              Storage locations referenced in this voucher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {godowns.map((godown) => (
                <Card key={godown.guid} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{godown.name}</h4>
                        <p className="text-sm text-muted-foreground">{godown.address}</p>
                        {godown.capacity && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Capacity:</span>{' '}
                            {godown.capacity} {godown.capacityUnit}
                          </div>
                        )}
                        {godown.storageType && (
                          <div className="text-xs">
                            <span className="font-medium">Type:</span> {godown.storageType}
                          </div>
                        )}
                      </div>
                      <Warehouse className="h-6 w-6 text-muted-foreground" />
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