import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Plus, Search, Calendar, DollarSign, Filter, X, Activity, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useExternalTallyVouchers } from "@/hooks/useExternalTallyVouchers";
import { format } from 'date-fns';

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

  // Handle filters and search
  const handleSearch = () => {
    const filters: any = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (dateFrom) filters.from = format(new Date(dateFrom), 'yyyyMMdd');
    if (dateTo) filters.to = format(new Date(dateTo), 'yyyyMMdd');
    if (voucherTypeFilter) filters.type = voucherTypeFilter;
    
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
      setShowDetailsDialog(true);
    }
  };

  // Load vouchers on component mount
  useEffect(() => {
    fetchVouchers();
    checkHealth();
  }, []);

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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Voucher Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            onClick={() => fetchVouchers()} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
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
                  />
                </div>
                <div>
                  <Label htmlFor="syncToDate">To Date</Label>
                  <Input
                    id="syncToDate"
                    type="date"
                    value={syncToDate}
                    onChange={(e) => setSyncToDate(e.target.value)}
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
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>

          {health && (
            <div className="flex items-center gap-2 ml-auto">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                API: {health.status || 'Connected'} | Vouchers: {health.totalVouchers || 0}
              </span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Page ${pagination.page} of ${pagination.pages} | Total: ${pagination.total}`
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Voucher, party, narration..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucherType">Voucher Type</Label>
                <Input
                  id="voucherType"
                  placeholder="Payment, Receipt, Sales..."
                  value={voucherTypeFilter}
                  onChange={(e) => setVoucherTypeFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voucher List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchVouchers()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : vouchers.length > 0 ? (
          <div className="space-y-4">
            {vouchers.map((voucher) => (
              <Card key={voucher.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => handleVoucherSelect(voucher)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{voucher.type}</Badge>
                        <span className="font-medium">{voucher.number}</span>
                        {voucher.isInvoice && <Badge variant="secondary">Invoice</Badge>}
                        {voucher.isModify && <Badge variant="destructive">Modified</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {voucher.date} | {voucher.partyLedgerName}
                      </p>
                      {voucher.narration && (
                        <p className="text-sm">{voucher.narration}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {voucher.entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {voucher.entries?.length || 0} entries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No vouchers found. Try syncing from Tally or adjusting your filters.</p>
              <Button 
                onClick={() => setShowSyncDialog(true)} 
                className="mt-4"
                variant="outline"
              >
                Sync from Tally
              </Button>
            </CardContent>
          </Card>
        )}
        </CardContent>
      </Card>

      {/* Voucher Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Voucher Details - {selectedVoucher?.type} {selectedVoucher?.number}</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Basic Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Date:</strong> {selectedVoucher.date}</p>
                    <p><strong>Party:</strong> {selectedVoucher.partyLedgerName}</p>
                    <p><strong>Type:</strong> {selectedVoucher.type}</p>
                    <p><strong>Number:</strong> {selectedVoucher.number}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <div className="mt-2 space-y-1">
                    <Badge variant={selectedVoucher.isInvoice ? "default" : "secondary"}>
                      {selectedVoucher.isInvoice ? "Invoice" : "Not Invoice"}
                    </Badge>
                    <Badge variant={selectedVoucher.isModify ? "destructive" : "secondary"}>
                      {selectedVoucher.isModify ? "Modified" : "Original"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedVoucher.narration && (
                <div>
                  <h4 className="font-medium">Narration</h4>
                  <p className="mt-1 text-sm">{selectedVoucher.narration}</p>
                </div>
              )}

              {selectedVoucher.entries && selectedVoucher.entries.length > 0 && (
                <div>
                  <h4 className="font-medium">Ledger Entries</h4>
                  <div className="mt-2 space-y-2">
                    {selectedVoucher.entries.map((entry: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{entry.ledgerName}</span>
                        <span className="font-medium">{entry.amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVoucher.inventoryEntries && selectedVoucher.inventoryEntries.length > 0 && (
                <div>
                  <h4 className="font-medium">Inventory Entries</h4>
                  <div className="mt-2 space-y-2">
                    {selectedVoucher.inventoryEntries.map((entry: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{entry.stockItemName}</span>
                          <span>{entry.billedQuantity} {entry.unit}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Rate: {entry.rate} | Amount: {entry.amount} | Godown: {entry.godownName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}