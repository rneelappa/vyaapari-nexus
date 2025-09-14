import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Save, 
  X, 
  Download, 
  Package, 
  Receipt, 
  Calendar, 
  User, 
  FileText,
  Building,
  MapPin
} from "lucide-react";
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
  godownId: string;
  hsnCode?: string;
  batchName?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  mrp?: number;
  discount?: number;
  discountPercent?: number;
}

interface LedgerEntry {
  index: number;
  ledgerName: string;
  amount: number;
  isDeemedPositive: boolean;
  isPartyLedger: boolean;
  ledgerId: string;
}

interface AdvancedVoucher {
  id: string;
  vchkey: string;
  alterId: string;
  date: string;
  type: string;
  number: string;
  narration: string;
  isInvoice: boolean;
  isModify: boolean;
  isDeleted: boolean;
  isOptional: boolean;
  effectiveDate: string;
  voucherTypeId: string;
  voucherTypeName: string;
  partyLedgerName: string;
  entries: LedgerEntry[];
  inventoryEntries: InventoryEntry[];
}

interface AdvancedVoucherDetailsProps {
  voucher: AdvancedVoucher;
  companyId: string;
  divisionId: string;
  onClose: () => void;
  onUpdate: (updatedVoucher: AdvancedVoucher) => void;
  onExportXml?: (voucherId: string) => void;
}

export function AdvancedVoucherDetails({ 
  voucher, 
  companyId, 
  divisionId, 
  onClose, 
  onUpdate, 
  onExportXml 
}: AdvancedVoucherDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoucher, setEditedVoucher] = useState<AdvancedVoucher>(voucher);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedVoucher(voucher);
  }, [voucher]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would call your update API
      onUpdate(editedVoucher);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Voucher updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update voucher",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedVoucher(voucher);
    setIsEditing(false);
  };

  // Separate party ledger from other ledgers
  const partyLedger = editedVoucher.entries?.find(entry => entry.isPartyLedger);
  const otherLedgers = editedVoucher.entries?.filter(entry => !entry.isPartyLedger) || [];
  
  const totalDebit = editedVoucher.entries?.reduce((sum, entry) => 
    entry.amount > 0 ? sum + entry.amount : sum, 0) || 0;
  const totalCredit = editedVoucher.entries?.reduce((sum, entry) => 
    entry.amount < 0 ? sum + Math.abs(entry.amount) : sum, 0) || 0;
  const totalInventoryValue = editedVoucher.inventoryEntries?.reduce((sum, entry) => 
    sum + entry.amount, 0) || 0;
  
  // Calculate other ledgers total (excluding party ledger)
  const otherLedgersTotal = otherLedgers.reduce((sum, entry) => 
    sum + Math.abs(entry.amount), 0);
  
  // Party ledger amount (should match inventory + other ledgers)
  const partyLedgerAmount = partyLedger ? Math.abs(partyLedger.amount) : 0;
  const inventoryPlusOthersTotal = totalInventoryValue + otherLedgersTotal;
  
  const grandTotal = Math.max(totalDebit, totalCredit);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const hasInventory = editedVoucher.inventoryEntries?.length > 0;
  const partyBalanceMatch = Math.abs(partyLedgerAmount - inventoryPlusOthersTotal) < 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              {voucher.type} #{voucher.number}
            </h2>
            <p className="text-muted-foreground">
              {voucher.partyLedgerName && `Party: ${voucher.partyLedgerName}`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {onExportXml && (
                  <Button 
                    onClick={() => onExportXml(voucher.id)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export XML
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Voucher Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Voucher Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(voucher.date)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge 
                      variant={voucher.type === 'Payment' ? 'default' : 
                             voucher.type === 'Sales' ? 'secondary' : 
                             voucher.type === 'Purchase' ? 'destructive' : 'outline'}
                    >
                      {voucher.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex gap-2">
                      {voucher.isInvoice && <Badge variant="outline">Invoice</Badge>}
                      {voucher.isModify && <Badge variant="destructive">Modified</Badge>}
                      {voucher.isDeleted && <Badge variant="destructive">Deleted</Badge>}
                      {!voucher.isDeleted && !voucher.isModify && <Badge variant="secondary">Active</Badge>}
                    </div>
                  </div>
                  
                  {voucher.partyLedgerName && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Party</label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{voucher.partyLedgerName}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Narration</label>
                  {isEditing ? (
                    <Textarea
                      value={editedVoucher.narration || ''}
                      onChange={(e) => setEditedVoucher({
                        ...editedVoucher, 
                        narration: e.target.value
                      })}
                      className="min-h-20"
                      placeholder="Enter voucher narration..."
                    />
                  ) : (
                    <div className="bg-muted/50 rounded-md p-3 min-h-20">
                      {voucher.narration || 'No narration'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Ledger and Inventory Entries */}
            <Tabs defaultValue="ledger" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ledger" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Ledger Entries ({editedVoucher.entries?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventory ({editedVoucher.inventoryEntries?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Ledger Entries Tab */}
              <TabsContent value="ledger" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Accounting Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ledger Name</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Party Ledger First */}
                          {partyLedger && (
                            <TableRow className="bg-blue-50 dark:bg-blue-950/30">
                              <TableCell className="font-bold">
                                {partyLedger.ledgerName}
                                <Badge variant="default" className="ml-2 text-xs">
                                  Party Account
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {partyLedger.amount > 0 ? formatAmount(partyLedger.amount) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {partyLedger.amount < 0 ? formatAmount(Math.abs(partyLedger.amount)) : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">
                                  {partyLedger.isDeemedPositive ? 'Positive' : 'Negative'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Other Ledgers */}
                          {otherLedgers.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {entry.ledgerName}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.amount > 0 ? formatAmount(entry.amount) : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.amount < 0 ? formatAmount(Math.abs(entry.amount)) : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {entry.isDeemedPositive ? 'Positive' : 'Negative'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Totals */}
                    <Separator className="my-4" />
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">Total Debit</div>
                          <div className="text-2xl font-bold text-green-600">{formatAmount(totalDebit)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">Total Credit</div>
                          <div className="text-2xl font-bold text-red-600">{formatAmount(totalCredit)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">Grand Total</div>
                          <div className="text-2xl font-bold text-primary">{formatAmount(grandTotal)}</div>
                        </div>
                      </div>
                      
                      {/* Balance Validation */}
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        {/* Ledger Balance Check */}
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium">
                            Ledger Balance: {isBalanced ? 'Balanced' : 'Unbalanced'}
                          </span>
                        </div>
                        
                        {/* Party Balance Breakdown */}
                        {partyLedger && (
                          <div className="bg-muted/20 rounded-lg p-3 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Party Account Validation</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Party Amount</div>
                                <div className="font-medium">{formatAmount(partyLedgerAmount)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Inventory + Others</div>
                                <div className="font-medium">{formatAmount(inventoryPlusOthersTotal)}</div>
                                <div className="text-xs text-muted-foreground">
                                  (Inv: {formatAmount(totalInventoryValue)} + Others: {formatAmount(otherLedgersTotal)})
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${partyBalanceMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <div className="font-medium">{partyBalanceMatch ? 'Balanced' : 'Unbalanced'}</div>
                                  {!partyBalanceMatch && (
                                    <div className="text-xs text-red-600">
                                      Diff: {formatAmount(Math.abs(partyLedgerAmount - inventoryPlusOthersTotal))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Entries Tab */}
              <TabsContent value="inventory" className="space-y-4">
                {editedVoucher.inventoryEntries?.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead className="text-center">Quantity</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>HSN Code</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editedVoucher.inventoryEntries.map((item, index) => (
                               <TableRow key={item.index || index}>
                                 <TableCell className="font-medium">
                                   {item.stockItemName}
                                 </TableCell>
                                 <TableCell className="text-center">
                                   {item.billedQuantity}
                                 </TableCell>
                                 <TableCell className="text-right">
                                   ₹{item.rate?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </TableCell>
                                 <TableCell className="text-right">
                                   ₹{item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </TableCell>
                                 <TableCell>{item.unit}</TableCell>
                                 <TableCell>{item.hsnCode || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Inventory Summary */}
                      <Separator className="my-4" />
                      <div className="flex justify-end space-x-8">
                        <div className="text-sm">
                          <span className="font-medium">Total Items: </span>
                          <span>{editedVoucher.inventoryEntries.length}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Total Value: </span>
                          <span className="text-blue-600">{formatAmount(totalInventoryValue)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No inventory items in this voucher</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}