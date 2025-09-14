import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Plus, Search, Calendar, DollarSign, Filter, X, Activity, RotateCcw, Eye, Edit, Download, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useExternalTallyVouchers } from "@/hooks/useExternalTallyVouchers";
import { format } from 'date-fns';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdvancedVoucherDetails } from "@/components/tally/AdvancedVoucherDetails";
import { InventoryTest } from "@/components/tally/InventoryTest";

// Define VoucherEntry interface for external API
interface VoucherEntry {
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
  entries: any[];
  inventoryEntries: any[];
}

export default function VoucherManagement() {
  const { companyId, divisionId } = useParams<{ companyId: string; divisionId: string }>();
  const { toast } = useToast();
  
  const {
    vouchers,
    loading,
    error,
    pagination,
    health,
    fetchVouchers,
    getVoucher,
    updateVoucher,
    syncFromTally,
    exportVoucherXml,
    checkHealth
  } = useExternalTallyVouchers(companyId || 'SKM', divisionId || 'MAIN');

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncFromDate, setSyncFromDate] = useState('');
  const [syncToDate, setSyncToDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoucher, setEditedVoucher] = useState<VoucherEntry | null>(null);

  // Format helper functions
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

  // Handle filters and search
  const handleSearch = () => {
    const filters: any = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (dateFrom) filters.from = format(new Date(dateFrom), 'yyyyMMdd');
    if (dateTo) filters.to = format(new Date(dateTo), 'yyyyMMdd');
    const type = voucherTypeFilter && voucherTypeFilter !== 'ALL' ? voucherTypeFilter : '';
    if (type) filters.type = type;
    
    fetchVouchers(filters);
  };

  const handleSync = async () => {
    if (!syncFromDate || !syncToDate) {
      toast({
        title: "Error",
        description: "Please select both from and to dates for sync",
        variant: "destructive"
      });
      return;
    }

    const fromFormatted = format(new Date(syncFromDate), 'yyyyMMdd');
    const toFormatted = format(new Date(syncToDate), 'yyyyMMdd');
    
    await syncFromTally(fromFormatted, toFormatted);
    setShowSyncDialog(false);
  };

  const handleVoucherSelect = async (voucher: VoucherEntry) => {
    const details = await getVoucher(voucher.id);
    if (details) {
      setSelectedVoucher(details);
      setEditedVoucher(details);
      setShowDetailsDialog(true);
    }
  };

  const handleVoucherUpdate = async () => {
    if (!editedVoucher || !selectedVoucher) return;
    
    const result = await updateVoucher(selectedVoucher.id, {
      narration: editedVoucher.narration,
      entries: editedVoucher.entries
    });
    
    if (result) {
      setSelectedVoucher(result);
      setEditedVoucher(result);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Voucher updated successfully"
      });
    }
  };

  const handleExportXml = async (voucherId: string) => {
    const xmlData = await exportVoucherXml(voucherId);
    if (xmlData) {
      const blob = new Blob([xmlData], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voucher-${voucherId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePageChange = (newPage: number) => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (dateFrom) filters.from = format(new Date(dateFrom), 'yyyyMMdd');
    if (dateTo) filters.to = format(new Date(dateTo), 'yyyyMMdd');
    const type = voucherTypeFilter && voucherTypeFilter !== 'ALL' ? voucherTypeFilter : '';
    if (type) filters.type = type;
    
    fetchVouchers({ ...filters, page: newPage });
  };

  // Load vouchers on component mount
  useEffect(() => {
    fetchVouchers();
    checkHealth();
  }, [fetchVouchers, checkHealth]);

  // Auto-search on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || dateFrom || dateTo || voucherTypeFilter) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dateFrom, dateTo, voucherTypeFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setVoucherTypeFilter('');
    fetchVouchers();
  };

  if (!companyId || !divisionId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Company ID and Division ID are required to view vouchers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-subtle">
      {/* Header Section */}
      <Card className="shadow-medium border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              Voucher Management
              <Badge variant="outline" className="ml-2">
                {pagination.total} vouchers
              </Badge>
            </CardTitle>
            
            {/* Tally Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              health?.success 
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            }`}>
              <Activity className={`h-4 w-4 ${health?.success ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${
                health?.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                Tally {health?.success ? 'Online' : 'Offline'} | {health?.storage?.totalVouchers || 0} vouchers
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Debug/Test Section */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-sm">
              🔧 Enhanced API & Inventory Testing
            </summary>
            <div className="mt-4">
              <InventoryTest 
                companyId={companyId || 'SKM'} 
                divisionId={divisionId || 'MAIN'} 
              />
            </div>
          </details>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              onClick={() => fetchVouchers()} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="transition-smooth"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary-hover">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sync from Tally
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sync from Tally ERP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="syncFromDate">From Date</Label>
                    <Input
                      id="syncFromDate"
                      type="date"
                      value={syncFromDate}
                      onChange={(e) => setSyncFromDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="syncToDate">To Date</Label>
                    <Input
                      id="syncToDate"
                      type="date"
                      value={syncToDate}
                      onChange={(e) => setSyncToDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleSync} disabled={loading} className="w-full">
                    {loading ? 'Syncing...' : 'Start Sync'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="transition-smooth"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>

            <div className="flex-1" />

            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `Page ${pagination.page} of ${pagination.pages} | Total: ${pagination.total}`
              )}
            </div>
          </div>

          {/* Filters */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Vouchers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Number, party, narration..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voucherType">Voucher Type</Label>
                  <Select value={voucherTypeFilter} onValueChange={setVoucherTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="Payment">Payment</SelectItem>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                      <SelectItem value="Journal">Journal</SelectItem>
                      <SelectItem value="Contra">Contra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voucher List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-8 text-center">
                <p className="text-destructive mb-4 font-medium">{error}</p>
                <Button onClick={() => fetchVouchers()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : vouchers.length > 0 ? (
            <div className="space-y-3">
              {vouchers.map((voucher) => {
                const totalAmount = voucher.entries?.reduce((sum, entry) => sum + Math.abs(entry.amount || 0), 0) || 0;
                const hasInventory = voucher.inventoryEntries?.length > 0;
                
                return (
                  <Card 
                    key={voucher.id} 
                    className="cursor-pointer hover:shadow-medium transition-smooth border border-border/50 hover:border-primary/20" 
                    onClick={() => handleVoucherSelect(voucher)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={voucher.type === 'Payment' ? 'default' : 
                                     voucher.type === 'Sales' ? 'secondary' : 
                                     voucher.type === 'Purchase' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {voucher.type}
                            </Badge>
                            <span className="font-semibold text-foreground">{voucher.number}</span>
                            {voucher.isInvoice && <Badge variant="outline" className="text-xs">Invoice</Badge>}
                            {voucher.isModify && <Badge variant="destructive" className="text-xs">Modified</Badge>}
                            {voucher.isDeleted && <Badge variant="destructive" className="text-xs">Deleted</Badge>}
                            {hasInventory && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {voucher.inventoryEntries.length} items
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(voucher.date)}
                            </span>
                            {voucher.partyLedgerName && (
                              <span className="font-medium text-foreground">
                                {voucher.partyLedgerName}
                              </span>
                            )}
                          </div>
                          
                          {voucher.narration && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {voucher.narration}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right space-y-1 ml-4">
                          <p className="font-semibold text-lg text-foreground">
                            {formatAmount(totalAmount)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{voucher.entries?.length || 0} entries</span>
                            {voucher.inventoryEntries?.length > 0 && (
                              <span>• {voucher.inventoryEntries.length} items</span>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoucherSelect(voucher);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportXml(voucher.id);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No vouchers found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try syncing from Tally or adjusting your search filters
                </p>
                <Button 
                  onClick={() => setShowSyncDialog(true)} 
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sync from Tally
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {vouchers.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vouchers
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voucher Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline">{selectedVoucher?.type}</Badge>
                Voucher #{selectedVoucher?.number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleVoucherUpdate} disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => selectedVoucher && handleExportXml(selectedVoucher.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export XML
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="font-medium">{formatDate(selectedVoucher.date)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <p className="font-medium">{selectedVoucher.type}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Number</Label>
                      <p className="font-medium">{selectedVoucher.number}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Party</Label>
                      <p className="font-medium">{selectedVoucher.partyLedgerName || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Narration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Narration</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedVoucher?.narration || ''}
                      onChange={(e) => setEditedVoucher(prev => prev ? {...prev, narration: e.target.value} : null)}
                      placeholder="Enter narration..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {selectedVoucher.narration || 'No narration'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Ledger Entries */}
              {selectedVoucher.entries && selectedVoucher.entries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ledger Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {(() => {
                       // Separate entries by source type
                       const mainLedgerEntries = selectedVoucher.entries.filter((e: any) => !e.source || e.source === 'main_ledger');
                       const inventoryEntries = selectedVoucher.entries.filter((e: any) => e.source === 'inventory_accounting');
                       
                       const party = mainLedgerEntries.find((e: any) => e.isPartyLedger || e.ledgerName === selectedVoucher.partyLedgerName);
                       const otherMainLedgers = mainLedgerEntries.filter((e: any) => !(e.isPartyLedger || e.ledgerName === selectedVoucher.partyLedgerName));
                       
                       // Calculate totals based on new structure
                       const inventoryAccountingDebit = inventoryEntries.reduce((s: number, e: any) => e.amount > 0 ? s + e.amount : s, 0);
                       const inventoryAccountingCredit = inventoryEntries.reduce((s: number, e: any) => e.amount < 0 ? s + Math.abs(e.amount) : s, 0);
                       
                       const mainLedgerDebit = mainLedgerEntries.reduce((s: number, e: any) => e.amount > 0 ? s + e.amount : s, 0);
                       const mainLedgerCredit = mainLedgerEntries.reduce((s: number, e: any) => e.amount < 0 ? s + Math.abs(e.amount) : s, 0);
                       
                       // Total Debit = All debit entries from both sources
                       const totalDebit = inventoryAccountingDebit + mainLedgerDebit;
                       const totalCredit = inventoryAccountingCredit + mainLedgerCredit;
                      
                       const grandTotal = Math.max(totalDebit, totalCredit);
                       const totalInventoryValue = inventoryAccountingDebit; // For compatibility
                       const otherLedgersTotal = otherMainLedgers.reduce((s: number, e: any) => s + Math.abs(e.amount || 0), 0);
                       const partyAmount = party ? Math.abs(party.amount || 0) : 0;
                       const inventoryPlusOthers = totalInventoryValue + otherLedgersTotal;
                       const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

                       const t = (selectedVoucher.type || '').toLowerCase();
                       const expectedAccountType = t.includes('sales') ? 'Sales Account' : t.includes('purchase') ? 'Purchase Account' : (t.includes('payment') || t.includes('receipt') || t.includes('contra')) ? 'Bank/Cash Account' : 'Account';
                       const needsTwoLedgers = ['sales','purchase','payment','receipt'].some(k => t.includes(k));
                       const mainAccount = otherMainLedgers.find((e: any) => {
                         const name = (e.ledgerName || '').toLowerCase();
                         return name.includes('sales') || name.includes('purchase') || name.includes('bank') || name.includes('cash');
                       });
                      const hasBothRequiredLedgers = !!party && otherMainLedgers.length > 0;
                      const partyBalanceMatch = Math.abs(partyAmount - inventoryPlusOthers) < 0.01;

                      return (
                        <div className="space-y-3">
                          {/* Party first */}
                          {party && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-border">
                              <div className="flex-1">
                                <p className="font-semibold">{party.ledgerName}</p>
                                <Badge variant="default" className="text-xs mt-1">Party Account</Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatAmount(Math.abs(party.amount || 0))}</p>
                                <p className="text-xs text-muted-foreground">{(party.amount || 0) > 0 ? 'Debit' : 'Credit'}</p>
                              </div>
                            </div>
                          )}

                          {/* Warning if main account missing */}
                          {needsTwoLedgers && otherMainLedgers.length === 0 && (
                            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                              Missing {expectedAccountType} - required for {selectedVoucher.type} voucher
                            </div>
                          )}

                          {/* Other ledgers */}
                          {otherMainLedgers.map((entry: any, index: number) => (
                            <div key={index} className={`flex items-center justify-between p-3 rounded-lg bg-muted ${mainAccount && mainAccount.ledgerName === entry.ledgerName ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}>
                              <div className="flex-1">
                                 <p className="font-medium">
                                   {entry.ledgerName}
                                   {mainAccount && mainAccount.ledgerName === entry.ledgerName && (
                                     <Badge variant="secondary" className="ml-2 text-xs">Main Account</Badge>
                                   )}
                                 </p>
                                 <Badge variant="outline" className="text-xs mt-1">
                                   {entry.source === 'inventory_accounting' ? 'Inventory Accounting' : 'Main Ledger'}
                                 </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatAmount(Math.abs(entry.amount || 0))}</p>
                                <p className="text-xs text-muted-foreground">{(entry.amount || 0) > 0 ? 'Debit' : 'Credit'}</p>
                              </div>
                            </div>
                           ))}

                           {/* Inventory Accounting Entries */}
                           {inventoryEntries.length > 0 && (
                             <>
                               <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Inventory Accounting Entries</div>
                               {inventoryEntries.map((entry: any, index: number) => (
                                 <div key={`inv-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                   <div className="flex-1">
                                     <p className="font-medium">{entry.ledgerName}</p>
                                     <Badge variant="outline" className="text-xs mt-1">Inventory Accounting</Badge>
                                   </div>
                                   <div className="text-right">
                                     <p className="font-semibold">{formatAmount(Math.abs(entry.amount || 0))}</p>
                                     <p className="text-xs text-muted-foreground">{(entry.amount || 0) > 0 ? 'Debit' : 'Credit'}</p>
                                   </div>
                                 </div>
                               ))}
                             </>
                           )}

                           <Separator />
                          {/* Totals */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-sm text-muted-foreground">Total Debit</div>
                              <div className="text-xl font-semibold">{formatAmount(totalDebit)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Total Credit</div>
                              <div className="text-xl font-semibold">{formatAmount(totalCredit)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Grand Total</div>
                              <div className="text-xl font-semibold text-primary">{formatAmount(grandTotal)}</div>
                            </div>
                          </div>

                          {/* Validation */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-sm">Ledger Balance: {isBalanced ? 'Balanced' : 'Unbalanced'}</span>
                            </div>
                            {party && (
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${partyBalanceMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm">Party vs Inventory+Others: {partyBalanceMatch ? 'Balanced' : 'Mismatch'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}


              {/* Inventory Entries */}
              {selectedVoucher.inventoryEntries && selectedVoucher.inventoryEntries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Inventory Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedVoucher.inventoryEntries.map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{item.stockItemName}</p>
                            <p className="font-semibold">{formatAmount(item.amount || 0)}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <span>Qty: {item.billedQuantity} {item.unit}</span>
                            <span>Rate: {formatAmount(item.rate || 0)}</span>
                            <span>Godown: {item.godownName}</span>
                            <span>Stock ID: {item.stockItemId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}