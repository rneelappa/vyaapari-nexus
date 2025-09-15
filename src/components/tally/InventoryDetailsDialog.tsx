import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Warehouse, FileText, Hash, Calendar } from "lucide-react";

interface BatchAllocation {
  trackingNumber: string;
  orderNo: string;
  godownName: string;
  destinationGodownName: string;
  batchName: string;
  amount: number;
  billedQuantity: number;
  actualQuantity: number;
  uom: string;
}

interface InventoryEntry {
  index: number;
  stockItemName: string;
  stockItemId: string;
  rate: number;
  amount: number;
  billedQuantity: number;
  actualQuantity: number;
  unit: string;
  godownName: string;
  godownId: string;
  batchName: string;
  expiryDate: string;
  manufacturingDate: string;
  mrp: number;
  discount: number;
  discountPercent: number;
  hsnCode: string;
  gstRate: number;
  batchAllocations?: BatchAllocation[];
}

interface InventoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryEntry: InventoryEntry | null;
}

export function InventoryDetailsDialog({ 
  open, 
  onOpenChange, 
  inventoryEntry 
}: InventoryDetailsDialogProps) {
  if (!inventoryEntry) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Item Details
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-center py-8">
            No inventory details available
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Item Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{inventoryEntry.stockItemName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Item ID</label>
                  <p className="text-sm text-muted-foreground">
                    {inventoryEntry.stockItemId || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">HSN Code</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {inventoryEntry.hsnCode || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">GST Rate</label>
                  <p className="text-sm text-muted-foreground">
                    {inventoryEntry.gstRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Quantity & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Billed Quantity</label>
                  <p className="text-sm text-muted-foreground">
                    {inventoryEntry.billedQuantity} {inventoryEntry.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Actual Quantity</label>
                  <p className="text-sm text-muted-foreground">
                    {inventoryEntry.actualQuantity} {inventoryEntry.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rate</label>
                  <p className="text-sm text-muted-foreground">
                    {formatAmount(inventoryEntry.rate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-sm text-muted-foreground font-medium">
                    {formatAmount(inventoryEntry.amount)}
                  </p>
                </div>
              </div>

              {(inventoryEntry.discount > 0 || inventoryEntry.mrp > 0) && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inventoryEntry.mrp > 0 && (
                      <div>
                        <label className="text-sm font-medium">MRP</label>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(inventoryEntry.mrp)}
                        </p>
                      </div>
                    )}
                    {inventoryEntry.discount > 0 && (
                      <div>
                        <label className="text-sm font-medium">Discount</label>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(inventoryEntry.discount)} ({inventoryEntry.discountPercent}%)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Storage Information */}
          {(inventoryEntry.godownName || inventoryEntry.batchName || inventoryEntry.expiryDate || inventoryEntry.manufacturingDate) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  Storage & Batch Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventoryEntry.godownName && (
                    <div>
                      <label className="text-sm font-medium">Godown</label>
                      <p className="text-sm text-muted-foreground">
                        {inventoryEntry.godownName}
                      </p>
                    </div>
                  )}
                  {inventoryEntry.batchName && (
                    <div>
                      <label className="text-sm font-medium">Batch</label>
                      <p className="text-sm text-muted-foreground">
                        {inventoryEntry.batchName}
                      </p>
                    </div>
                  )}
                  {inventoryEntry.manufacturingDate && (
                    <div>
                      <label className="text-sm font-medium">Manufacturing Date</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(inventoryEntry.manufacturingDate)}
                      </p>
                    </div>
                  )}
                  {inventoryEntry.expiryDate && (
                    <div>
                      <label className="text-sm font-medium">Expiry Date</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(inventoryEntry.expiryDate)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Allocations */}
          {inventoryEntry.batchAllocations && inventoryEntry.batchAllocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Batch Allocations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>From Godown</TableHead>
                      <TableHead>To Godown</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryEntry.batchAllocations.map((allocation, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {allocation.trackingNumber || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {allocation.orderNo || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {allocation.godownName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {allocation.destinationGodownName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {allocation.batchName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {allocation.billedQuantity} / {allocation.actualQuantity} {allocation.uom}
                        </TableCell>
                        <TableCell>
                          {formatAmount(allocation.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}