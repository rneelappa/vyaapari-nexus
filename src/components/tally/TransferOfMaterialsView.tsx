import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Package, Factory, AlertTriangle, CheckCircle, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
  section: 'source' | 'destination';
  sectionLabel: string;
}

interface TransferOfMaterialsData {
  guid: string;
  type: string;
  number: string;
  date: string;
  reference: string;
  narration: string;
  isTransferOfMaterials: boolean;
  sourceInventoryEntries: InventoryEntry[];
  destinationInventoryEntries: InventoryEntry[];
  inventoryEntries: InventoryEntry[];
}

interface TransferOfMaterialsViewProps {
  voucher: TransferOfMaterialsData;
  onSave?: (updatedVoucher: TransferOfMaterialsData) => void;
  readOnly?: boolean;
}

export const TransferOfMaterialsView: React.FC<TransferOfMaterialsViewProps> = ({
  voucher,
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoucher, setEditedVoucher] = useState<TransferOfMaterialsData>(voucher);
  const { toast } = useToast();

  // Calculate totals for validation
  const sourceTotalAmount = editedVoucher.sourceInventoryEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const destinationTotalAmount = editedVoucher.destinationInventoryEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const isBalanced = Math.abs(sourceTotalAmount - destinationTotalAmount) < 0.01;

  // Handle case where voucher doesn't have Transfer of Materials data
  if (!voucher.isTransferOfMaterials && (!voucher.sourceInventoryEntries?.length && !voucher.destinationInventoryEntries?.length)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>This voucher is not a Transfer of Materials voucher.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-6 w-6 text-blue-600" />
                Transfer of Materials
                <Badge variant="outline">{voucher.type}</Badge>
              </CardTitle>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>No: <strong>{voucher.number}</strong></span>
                <span>Date: <strong>{new Date(voucher.date).toLocaleDateString()}</strong></span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Material Transfer is Balanced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-700 font-medium">Transfer Imbalance Detected</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Difference: ₹{Math.abs(sourceTotalAmount - destinationTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Flow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Source (Consumption) */}
        <Card className="bg-red-50 border-red-200 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-red-600" />
              Source (Consumption)
              <Badge variant="outline" className="ml-auto">
                {editedVoucher.sourceInventoryEntries?.length || 0} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {editedVoucher.sourceInventoryEntries?.map((entry, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{entry.stockItemName}</div>
                      <div className="text-sm text-gray-600">{entry.godownName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{entry.actualQuantity} {entry.unit}</div>
                      <div className="font-mono font-bold">₹{entry.amount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">No source entries</div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Consumed:</span>
                <span className="font-mono font-bold text-lg">₹{sourceTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white border-2 border-blue-300 rounded-full p-3 shadow-lg">
            <ArrowRight className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Destination (Production) */}
        <Card className="bg-green-50 border-green-200 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Factory className="h-5 w-5 text-green-600" />
              Destination (Production)
              <Badge variant="outline" className="ml-auto">
                {editedVoucher.destinationInventoryEntries?.length || 0} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {editedVoucher.destinationInventoryEntries?.map((entry, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{entry.stockItemName}</div>
                      <div className="text-sm text-gray-600">{entry.godownName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{entry.actualQuantity} {entry.unit}</div>
                      <div className="font-mono font-bold">₹{entry.amount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">No destination entries</div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Produced:</span>
                <span className="font-mono font-bold text-lg">₹{destinationTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferOfMaterialsView;
