import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, Receipt, Calendar, MapPin, FileText } from "lucide-react";

interface DispatchDetails {
  deliveryNoteNumbers: string[];
  dispatchDocNo: string;
  dispatchDate: string;
  dispatchedThrough: string;
  destination: string;
  carrierName: string;
  lrNumber: string;
  vehicleNo: string;
}

interface ReceiptDetails {
  receiptNoteNumbers: string[];
  receiptDocNo: string;
  receiptDate: string;
}

interface VoucherShippingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchDetails: DispatchDetails | null;
  receiptDetails: ReceiptDetails | null;
  voucherNumber: string;
}

export function VoucherShippingDetailsDialog({ 
  open, 
  onOpenChange, 
  dispatchDetails, 
  receiptDetails,
  voucherNumber 
}: VoucherShippingDetailsDialogProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN');
    } catch {
      return dateStr;
    }
  };

  const hasDispatchDetails = dispatchDetails && Object.values(dispatchDetails).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  const hasReceiptDetails = receiptDetails && Object.values(receiptDetails).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  if (!hasDispatchDetails && !hasReceiptDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping & Dispatch Details - {voucherNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-center py-8">
            No shipping or dispatch information available
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping & Dispatch Details - {voucherNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dispatch Details */}
          {hasDispatchDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Dispatch Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dispatchDetails?.dispatchDocNo && (
                    <div>
                      <label className="text-sm font-medium">Dispatch Document No.</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {dispatchDetails.dispatchDocNo}
                      </p>
                    </div>
                  )}
                  {dispatchDetails?.dispatchDate && (
                    <div>
                      <label className="text-sm font-medium">Dispatch Date</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(dispatchDetails.dispatchDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Delivery Notes */}
                {dispatchDetails?.deliveryNoteNumbers && dispatchDetails.deliveryNoteNumbers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Delivery Note Numbers</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dispatchDetails.deliveryNoteNumbers.map((note, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Shipping Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dispatchDetails?.carrierName && (
                    <div>
                      <label className="text-sm font-medium">Carrier</label>
                      <p className="text-sm text-muted-foreground">
                        {dispatchDetails.carrierName}
                      </p>
                    </div>
                  )}
                  {dispatchDetails?.dispatchedThrough && (
                    <div>
                      <label className="text-sm font-medium">Dispatched Through</label>
                      <p className="text-sm text-muted-foreground">
                        {dispatchDetails.dispatchedThrough}
                      </p>
                    </div>
                  )}
                  {dispatchDetails?.destination && (
                    <div>
                      <label className="text-sm font-medium">Destination</label>
                      <p className="text-sm text-muted-foreground">
                        {dispatchDetails.destination}
                      </p>
                    </div>
                  )}
                  {dispatchDetails?.lrNumber && (
                    <div>
                      <label className="text-sm font-medium">LR Number</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {dispatchDetails.lrNumber}
                      </p>
                    </div>
                  )}
                  {dispatchDetails?.vehicleNo && (
                    <div>
                      <label className="text-sm font-medium">Vehicle Number</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {dispatchDetails.vehicleNo}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Details */}
          {hasReceiptDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Receipt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receiptDetails?.receiptDocNo && (
                    <div>
                      <label className="text-sm font-medium">Receipt Document No.</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {receiptDetails.receiptDocNo}
                      </p>
                    </div>
                  )}
                  {receiptDetails?.receiptDate && (
                    <div>
                      <label className="text-sm font-medium">Receipt Date</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(receiptDetails.receiptDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Receipt Notes */}
                {receiptDetails?.receiptNoteNumbers && receiptDetails.receiptNoteNumbers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Receipt Note Numbers</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {receiptDetails.receiptNoteNumbers.map((note, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}