import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Receipt, 
  MapPin, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Clock,
  Hash,
  Tag,
  Briefcase,
  Target,
  Package,
  ArrowLeft,
  Database,
  BarChart3,
  Warehouse,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// VT Data Layer imports
import { useVtVoucherDetailsWithRefresh } from '@/hooks/useVtVoucherDetails';
import type { 
  VtVoucher, 
  VtLedgerentries, 
  VtInventoryentries,
  VtAddressList,
  VtGstdetailsList,
  VtBillallocationsList
} from '@/types/vt';

interface MasterDataType {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  data: any[];
}

interface EnhancedVoucherDetailsProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  onClose?: () => void;
}

export function EnhancedVoucherDetails({ 
  voucherGuid, 
  companyId, 
  divisionId, 
  onClose 
}: EnhancedVoucherDetailsProps) {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [masterDataTypes, setMasterDataTypes] = useState<MasterDataType[]>([]);
  const [selectedMasterData, setSelectedMasterData] = useState<{ type: string; data: any } | null>(null);

  // Use VT data layer for comprehensive voucher details
  const {
    voucher: voucherDetails,
    stats,
    validation,
    isLoading: loading,
    error,
    isRefreshing,
    refresh
  } = useVtVoucherDetailsWithRefresh(
    voucherGuid,
    companyId,
    divisionId,
    {
      includeAccounting: true,
      includeInventory: true,
      includeAddresses: true,
      includeGST: true,
      includeBillAllocations: true,
      includeBatchDetails: true
    }
  );

  // Update master data when voucher details are loaded
  React.useEffect(() => {
    if (voucherDetails) {
      updateMasterData();
    }
  }, [voucherDetails]);

  const updateMasterData = () => {
    if (!voucherDetails) return;

    const masterTypes: MasterDataType[] = [
      {
        type: 'voucher',
        label: 'Voucher Details',
        icon: FileText,
        count: 1,
        data: [voucherDetails]
      },
      {
        type: 'accounting',
        label: 'Accounting Entries',
        icon: Receipt,
        count: voucherDetails.accounting_entries?.length || 0,
        data: voucherDetails.accounting_entries || []
      },
      {
        type: 'inventory',
        label: 'Inventory Entries',
        icon: Package,
        count: voucherDetails.inventory_entries?.length || 0,
        data: voucherDetails.inventory_entries || []
      },
      {
        type: 'address',
        label: 'Address Details',
        icon: MapPin,
        count: voucherDetails.address_details?.length || 0,
        data: voucherDetails.address_details || []
      },
      {
        type: 'gst',
        label: 'GST Details',
        icon: Receipt,
        count: voucherDetails.gst_details?.length || 0,
        data: voucherDetails.gst_details || []
      },
      {
        type: 'bills',
        label: 'Bill Allocations',
        icon: FileText,
        count: voucherDetails.bill_allocations?.length || 0,
        data: voucherDetails.bill_allocations || []
      },
      {
        type: 'batch',
        label: 'Batch Details',
        icon: Warehouse,
        count: voucherDetails.batch_details?.length || 0,
        data: voucherDetails.batch_details || []
      }
    ];

    setMasterDataTypes(masterTypes);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMasterDataTable = (type: string, data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type} data available
        </div>
      );
    }

    switch (type) {
      case 'accounting':
        return (
          <div className="space-y-3">
            {data.map((entry: VtLedgerentries, index) => (
              <div key={entry.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{entry.ledger || 'Unknown Ledger'}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.is_party_ledger ? 'Party Ledger' : 'Regular Ledger'}
                    {entry.cost_centre && ` • Cost Centre: ${entry.cost_centre}`}
                    {entry.cost_category && ` • Cost Category: ${entry.cost_category}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${(entry.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(entry.amount || 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(entry.amount || 0) >= 0 ? 'Debit' : 'Credit'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-3">
            {data.map((entry: VtInventoryentries, index) => (
              <div key={entry.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{entry.stock_item_name || 'Unknown Item'}</div>
                  <div className="text-sm text-muted-foreground">
                    Qty: {entry.actual_quantity || 0} | Rate: {formatCurrency(entry.rate || 0)}
                    {entry.godown && ` • Godown: ${entry.godown}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(entry.amount || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'address':
        return (
          <div className="space-y-3">
            {data.map((address: VtAddressList, index) => (
              <div key={address.id || index} className="p-4 border rounded-lg">
                <div className="font-medium mb-2">{address.address_type || 'Address'}</div>
                <div className="text-sm space-y-1">
                  {address.contact_person && <div>Contact: {address.contact_person}</div>}
                  {address.address_line1 && <div>{address.address_line1}</div>}
                  {address.address_line2 && <div>{address.address_line2}</div>}
                  {address.city && <div>{address.city}, {address.state} {address.pincode}</div>}
                  {address.phone && <div>Phone: {address.phone}</div>}
                  {address.email && <div>Email: {address.email}</div>}
                </div>
              </div>
            ))}
          </div>
        );

      case 'gst':
        return (
          <div className="space-y-3">
            {data.map((gst: VtGstdetailsList, index) => (
              <div key={gst.id || index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">HSN Code</div>
                    <div>{gst.hsn_code || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="font-medium">Tax Rate</div>
                    <div>{gst.tax_rate || 0}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Taxable Amount</div>
                    <div>{formatCurrency(gst.taxable_amount || 0)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Tax Amount</div>
                    <div>{formatCurrency(gst.tax_amount || 0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'bills':
        return (
          <div className="space-y-3">
            {data.map((bill: VtBillallocationsList, index) => (
              <div key={bill.id || index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Bill Name</div>
                    <div>{bill.bill_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="font-medium">Amount</div>
                    <div>{formatCurrency(bill.amount || 0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="p-3 border rounded text-sm">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Voucher Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Failed to load voucher details'}
            </p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!voucherDetails) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No voucher details found for GUID: {voucherGuid}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold">Enhanced Voucher Details (VT Schema)</h1>
            <p className="text-sm text-muted-foreground">
              {voucherDetails.voucher_number} • {formatDate(voucherDetails.date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {validation && (
            <Badge variant={validation.isValid ? "default" : "destructive"} className="flex items-center gap-1">
              {validation.isValid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {validation.isValid ? 'Valid' : 'Invalid'}
            </Badge>
          )}
          
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounting">
                Accounting ({voucherDetails.accounting_entries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="inventory">
                Inventory ({voucherDetails.inventory_entries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="address">
                Address ({voucherDetails.address_details?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="gst">
                GST ({voucherDetails.gst_details?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="bills">
                Bills ({voucherDetails.bill_allocations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="batch">
                Batch ({voucherDetails.batch_details?.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-6">
                {/* Voucher Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Voucher Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Voucher Number</div>
                        <div className="font-semibold">{voucherDetails.voucher_number || 'N/A'}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <Badge variant="outline">{voucherDetails.voucher_type || 'N/A'}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-semibold">{formatDate(voucherDetails.date)}</div>
                      </div>
                      
                      {voucherDetails.party_name && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Party</div>
                          <div className="font-semibold">{voucherDetails.party_name}</div>
                        </div>
                      )}
                      
                      {stats && (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Total Amount</div>
                            <div className="font-semibold text-lg">{formatCurrency(stats.totalAmount)}</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Balance Status</div>
                            <Badge variant={stats.isBalanced ? "default" : "destructive"}>
                              {stats.isBalanced ? 'Balanced' : 'Unbalanced'}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {voucherDetails.narration && (
                      <div className="mt-6">
                        <div className="text-sm text-muted-foreground mb-2">Narration</div>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {voucherDetails.narration}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                {stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.debitAmount)}</div>
                          <div className="text-sm text-muted-foreground">Total Debits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.creditAmount)}</div>
                          <div className="text-sm text-muted-foreground">Total Credits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{stats.entriesCount}</div>
                          <div className="text-sm text-muted-foreground">Accounting Entries</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{stats.inventoryCount}</div>
                          <div className="text-sm text-muted-foreground">Inventory Entries</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Validation Issues */}
                {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Validation Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {validation.errors.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-destructive mb-2">Errors:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {validation.errors.map((error, index) => (
                              <li key={index} className="text-destructive">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.warnings.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-yellow-600 mb-2">Warnings:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {validation.warnings.map((warning, index) => (
                              <li key={index} className="text-yellow-600">{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="accounting" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Accounting Entries ({voucherDetails.accounting_entries?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('accounting', voucherDetails.accounting_entries || [])}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Entries ({voucherDetails.inventory_entries?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('inventory', voucherDetails.inventory_entries || [])}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Details ({voucherDetails.address_details?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('address', voucherDetails.address_details || [])}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gst" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    GST Details ({voucherDetails.gst_details?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('gst', voucherDetails.gst_details || [])}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bill Allocations ({voucherDetails.bill_allocations?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('bills', voucherDetails.bill_allocations || [])}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    Batch Details ({voucherDetails.batch_details?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMasterDataTable('batch', voucherDetails.batch_details || [])}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
