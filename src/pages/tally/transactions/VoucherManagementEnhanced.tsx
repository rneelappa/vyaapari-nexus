import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Filter, 
  Activity, 
  Eye, 
  Edit, 
  Download,
  Network,
  BarChart3,
  TreePine,
  Users,
  Package,
  FileText,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from 'date-fns';
import { tallyApi, type Voucher, type CompleteVoucher, type ApiResponse } from '@/services/tallyApiService';
import { VoucherCompleteView } from '@/components/tally/VoucherCompleteView';
import { EntityRelationshipExplorer } from '@/components/tally/EntityRelationshipExplorer';
import { TransferOfMaterialsView } from '@/components/tally/TransferOfMaterialsView';

interface VoucherManagementEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function VoucherManagementEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: VoucherManagementEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [enhancedVouchers, setEnhancedVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [voucherTypeFilter, setVoucherTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'enhanced' | 'relationships' | 'monthly'>('enhanced');
  const [showVoucherDetails, setShowVoucherDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVouchersData();
  }, [companyId, divisionId, dateRange]);

  const loadVouchersData = async () => {
    try {
      setLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Loading vouchers data from API...', { fromDate, toDate });
      
      // First sync vouchers for the date range
      const syncResponse = await tallyApi.syncVouchers(companyId, divisionId, {
        fromDate,
        toDate,
        chunkDays: 7
      });

      if (!syncResponse.success) {
        throw new Error(syncResponse.error || 'Sync failed');
      }

      // Then load enhanced vouchers
      const enhancedResponse = await tallyApi.getEnhancedVouchers(companyId, divisionId, {
        fromDate,
        toDate,
        limit: 50,
        search: searchTerm,
        voucherType: voucherTypeFilter
      });

      if (!enhancedResponse.success) {
        throw new Error(enhancedResponse.error || 'Failed to load enhanced vouchers');
      }

      // Also load basic vouchers for compatibility
      const vouchersResponse = await tallyApi.getVouchers(companyId, divisionId);
      
      if (vouchersResponse.success) {
        setVouchers(vouchersResponse.data.vouchers);
      }

      setEnhancedVouchers(enhancedResponse.data);
      
      console.log(`Loaded ${enhancedResponse.data.length} enhanced vouchers`);

    } catch (error) {
      console.error('Failed to load vouchers:', error);
      toast({
        title: "Error",
        description: "Failed to load vouchers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performSync = async () => {
    try {
      setSyncLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Performing voucher sync...', { fromDate, toDate });
      
      const syncResponse = await tallyApi.syncVouchers(companyId, divisionId, {
        fromDate,
        toDate,
        chunkDays: 7
      });

      if (!syncResponse.success) {
        throw new Error(syncResponse.error || 'Sync failed');
      }

      toast({
        title: "Sync Complete",
        description: `Synced ${syncResponse.data.totalVouchers} vouchers successfully`,
      });

      // Reload data after sync
      await loadVouchersData();

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync vouchers from Tally",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const createVoucher = async (voucherData: any) => {
    try {
      const response = await tallyApi.createVoucher(companyId, divisionId, voucherData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create voucher');
      }

      toast({
        title: "Voucher Created",
        description: `Voucher ${response.data.voucherNumber} created successfully`,
      });

      setShowCreateDialog(false);
      await loadVouchersData();

    } catch (error) {
      console.error('Failed to create voucher:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create voucher",
        variant: "destructive"
      });
    }
  };

  const filteredVouchers = enhancedVouchers.filter(voucher => {
    const matchesSearch = !searchTerm || 
      voucher.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.partyLedgerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.narration.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !voucherTypeFilter || voucher.type === voucherTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const voucherTypes = [...new Set(enhancedVouchers.map(v => v.type))];

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
          <h1 className="text-2xl font-bold">Enhanced Voucher Management</h1>
          <p className="text-muted-foreground">
            Complete voucher lifecycle with relationships and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={performSync} disabled={syncLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
            {syncLoading ? 'Syncing...' : 'Sync from Tally'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Voucher
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Voucher Type Filter */}
            <select
              value={voucherTypeFilter}
              onChange={(e) => setVoucherTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              {voucherTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* View Mode */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                <TabsTrigger value="relationships">Relations</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vouchers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Vouchers ({filteredVouchers.length})
                </div>
                <Badge variant="outline">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'enhanced' && (
                  <div className="space-y-3">
                    {filteredVouchers.map(voucher => (
                      <div
                        key={voucher.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedVoucher?.id === voucher.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedVoucher(voucher)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{voucher.type} #{voucher.number}</div>
                              <div className="text-sm text-muted-foreground">
                                {voucher.date} | {voucher.partyLedgerName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{voucher.amount.toLocaleString('en-IN')}</div>
                            <div className="flex items-center space-x-1">
                              {voucher.type?.toLowerCase().includes('transfer') && 
                               voucher.type?.toLowerCase().includes('material') && (
                                <Badge variant="destructive" className="text-xs">Transfer of Materials</Badge>
                              )}
                              {(voucher as any)?.isInvoice && (
                                <Badge variant="default" className="text-xs">Invoice</Badge>
                              )}
                              {(voucher as any)?.isAccounting && (
                                <Badge variant="outline" className="text-xs">Accounting</Badge>
                              )}
                              {(voucher as any)?.isInventory && (
                                <Badge variant="secondary" className="text-xs">Inventory</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {voucher.narration && (
                          <div className="text-sm text-muted-foreground">
                            {voucher.narration}
                          </div>
                        )}

                        {/* Quick relationship info */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Network className="h-3 w-3 mr-1" />
                            {voucher.entries?.length || 0} ledgers
                          </span>
                          <span className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {voucher.inventoryEntries?.length || 0} items
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filteredVouchers.map(voucher => (
                      <div
                        key={voucher.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => setSelectedVoucher(voucher)}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-semibold">{voucher.number}</div>
                            <div className="text-sm text-muted-foreground">{voucher.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{voucher.amount.toLocaleString('en-IN')}</div>
                          <div className="text-sm text-muted-foreground">{voucher.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'relationships' && selectedVoucher && (
                  <EntityRelationshipExplorer 
                    companyId={companyId}
                    divisionId={divisionId}
                    initialEntity={{
                      type: 'voucher',
                      id: selectedVoucher.id
                    }}
                  />
                )}

                {viewMode === 'monthly' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Monthly Voucher Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Transaction patterns for selected date range
                      </p>
                    </div>
                    
                    {/* Monthly breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      {voucherTypes.slice(0, 6).map(type => {
                        const typeVouchers = filteredVouchers.filter(v => v.type === type);
                        const typeAmount = typeVouchers.reduce((sum, v) => sum + v.amount, 0);
                        
                        return (
                          <div key={type} className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {typeVouchers.length}
                            </div>
                            <div className="text-sm text-muted-foreground">{type}</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{typeAmount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Voucher Details Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Voucher Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVoucher ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedVoucher.type} #{selectedVoucher.number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVoucher.date} | {selectedVoucher.partyLedgerName}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-semibold">₹{selectedVoucher.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ledger Entries:</span>
                      <Badge variant="outline">{selectedVoucher.entries?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Inventory Entries:</span>
                      <Badge variant="outline">{selectedVoucher.inventoryEntries?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Is Invoice:</span>
                      <Badge variant={(selectedVoucher as any)?.isInvoice ? 'default' : 'secondary'}>
                        {(selectedVoucher as any)?.isInvoice ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {selectedVoucher.narration && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground">Narration:</span>
                        <p className="text-sm mt-1">{selectedVoucher.narration}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowVoucherDetails(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Complete Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      Explore Relationships
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly Context
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Voucher
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export XML
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a voucher to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Vouchers:</span>
                  <Badge variant="outline">{filteredVouchers.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount:</span>
                  <Badge variant="default">
                    ₹{filteredVouchers.reduce((sum, v) => sum + v.amount, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Voucher Types:</span>
                  <Badge variant="outline">{voucherTypes.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">With Inventory:</span>
                  <Badge variant="secondary">
                    {filteredVouchers.filter(v => (v as any)?.isInventory).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Invoices:</span>
                  <Badge variant="secondary">
                    {filteredVouchers.filter(v => (v as any)?.isInvoice).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voucher Complete Details Dialog */}
      {showVoucherDetails && selectedVoucher && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-auto">
            <div className="p-6">
              {/* Check if this is a Transfer of Materials voucher */}
              {selectedVoucher.type?.toLowerCase().includes('transfer') && 
               selectedVoucher.type?.toLowerCase().includes('material') ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Transfer of Materials Details</h2>
                    <Button onClick={() => setShowVoucherDetails(false)} variant="outline">
                      Close
                    </Button>
                  </div>
                  <TransferOfMaterialsView 
                    voucher={selectedVoucher as any}
                    onSave={(updatedVoucher) => {
                      console.log('Transfer of Materials voucher updated:', updatedVoucher);
                      // TODO: Implement save functionality
                    }}
                  />
                </div>
              ) : (
                <VoucherCompleteView
                  voucherId={selectedVoucher.id}
                  companyId={companyId}
                  divisionId={divisionId}
                  onBack={() => setShowVoucherDetails(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Voucher Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create New Voucher</h2>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
              
              {/* Voucher creation form would go here */}
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4" />
                  <p>Voucher creation form with API integration</p>
                  <p className="text-sm">Connected to Tally API for real-time creation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherManagementEnhanced;
