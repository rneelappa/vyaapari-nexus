import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Calendar, RefreshCw, FileText, Eye, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoucherDetailModal } from '@/components/tally/VoucherDetailModal';
import { VtMigrationTrigger } from "@/components/vt/VtMigrationTrigger";

interface VoucherEntry {
  guid: string;
  voucher_number: string | null;
  voucher_type: string | null;
  date: string | null;
  party_ledger_name: string | null;
  total_amount: number | null;
  narration: string | null;
  is_cancelled: number | null;
  is_optional: number | null;
  currency: string | null;
  reference: string | null;
  created_at: string | null;
  altered_on: string | null;
}

export default function DayBookVouchersPage() {
  const { companyId, divisionId } = useParams<{
    companyId: string;
    divisionId: string;
  }>();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Voucher detail view state
  const [selectedVoucherGuid, setSelectedVoucherGuid] = useState<string | null>(null);
  const [showVoucherDetails, setShowVoucherDetails] = useState(false);

  // Pagination & totals
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(200);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [aggregatedAmount, setAggregatedAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchVouchers();
  // Re-fetch whenever filters, sorting, or pagination change
  }, [companyId, divisionId, selectedVoucherType, selectedStatus, dateFrom, dateTo, searchTerm, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchTotals();
  // Totals should update with filters, not with page navigation
  }, [companyId, divisionId, selectedVoucherType, selectedStatus, dateFrom, dateTo, searchTerm]);

  const applyCommonFilters = (query: any) => {
    // Apply company and division filters if available
    if (companyId && companyId !== 'undefined') {
      query = query.eq('company_id', companyId);
    }
    if (divisionId && divisionId !== 'undefined') {
      query = query.eq('division_id', divisionId);
    }

    // Voucher type filter
    if (selectedVoucherType !== 'all') {
      query = query.eq('voucher_type', selectedVoucherType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        // Active: not cancelled
        query = query.or('is_cancelled.eq.0,is_cancelled.is.null');
      } else if (selectedStatus === 'cancelled') {
        query = query.eq('is_cancelled', 1);
      } else if (selectedStatus === 'optional') {
        query = query.eq('is_optional', 1);
      }
    }

    // Date range filter
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    // Search filter across key fields
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      query = query.or(
        `voucher_number.ilike.${term},party_ledger_name.ilike.${term},narration.ilike.${term}`
      );
    }

    return query;
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('bkp_tally_trn_voucher')
        .select('*', { count: 'exact' });

      query = applyCommonFilters(query);

      // Sorting
      const sortColumn = ['date', 'voucher_number', 'total_amount', 'voucher_type'].includes(sortBy)
        ? sortBy
        : 'date';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: false });

      // Pagination (Supabase caps results at 1000 per request)
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setVouchers((data as any) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vouchers');
      toast({
        title: 'Error',
        description: 'Failed to fetch vouchers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotals = async () => {
    try {
      let totalQuery = supabase
        .from('bkp_tally_trn_voucher')
        .select('total_amount.sum()');

      totalQuery = applyCommonFilters(totalQuery);

      const { data, error } = await totalQuery;
      if (error) throw error;

      const sum = (data && data[0] && (data[0] as any).sum) ? Number((data[0] as any).sum) : 0;
      setAggregatedAmount(sum);
    } catch (e) {
      console.warn('Failed to fetch totals, falling back to page sum');
      setAggregatedAmount(null);
    }
  };
  // Get unique voucher types for filter dropdown
  const voucherTypes = Array.from(new Set(vouchers.map(v => v.voucher_type).filter(Boolean)));

  // Filter and sort vouchers
  const filteredVouchers = vouchers
    .filter(voucher => {
      // Search filter
      const searchMatch = !searchTerm || 
        (voucher.voucher_number && voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (voucher.party_ledger_name && voucher.party_ledger_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (voucher.narration && voucher.narration.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (voucher.reference && voucher.reference.toLowerCase().includes(searchTerm.toLowerCase()));

      // Voucher type filter
      const typeMatch = selectedVoucherType === "all" || voucher.voucher_type === selectedVoucherType;

      // Status filter
      const statusMatch = selectedStatus === "all" || 
        (selectedStatus === "active" && !voucher.is_cancelled) ||
        (selectedStatus === "cancelled" && voucher.is_cancelled) ||
        (selectedStatus === "optional" && voucher.is_optional);

      // Date range filter
      const dateMatch = (!dateFrom || !voucher.date || voucher.date >= dateFrom) &&
                       (!dateTo || !voucher.date || voucher.date <= dateTo);

      return searchMatch && typeMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = a.date || "";
          bValue = b.date || "";
          break;
        case "number":
          aValue = a.voucher_number || "";
          bValue = b.voucher_number || "";
          break;
        case "amount":
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        case "type":
          aValue = a.voucher_type || "";
          bValue = b.voucher_type || "";
          break;
        default:
          aValue = a.date || "";
          bValue = b.date || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate summary statistics
  const totalVouchers = totalCount;
  const pageAmount = filteredVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);
  const totalAmount = aggregatedAmount ?? pageAmount;
  const cancelledCount = filteredVouchers.filter(v => v.is_cancelled).length;
  const activeCount = filteredVouchers.length - cancelledCount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleVoucherClick = (voucher: VoucherEntry) => {
    if (voucher.guid && companyId && divisionId) {
      setSelectedVoucherGuid(voucher.guid);
      setShowVoucherDetails(true);
    } else {
      toast({
        title: "Error",
        description: "Unable to view voucher details. Missing required information.",
        variant: "destructive",
      });
    }
  };

  const handleBackToList = () => {
    setShowVoucherDetails(false);
    setSelectedVoucherGuid(null);
  };

  const handleEdit = (voucher: VoucherEntry) => {
    // Navigate to voucher edit page
    if (voucher.guid && companyId && divisionId) {
      navigate(`/company/${companyId}/division/${divisionId}/tally/transactions/voucher-management`, {
        state: { selectedVoucherId: voucher.guid }
      });
    }
  };

  const handleDelete = (voucher: VoucherEntry) => {
    // TODO: Implement voucher deletion
    console.log('Delete voucher:', voucher);
    toast({
      title: "Feature Coming Soon",
      description: "Voucher deletion functionality will be available soon.",
    });
  };

  // If showing voucher details, render the detail view
  if (showVoucherDetails && selectedVoucherGuid && companyId && divisionId) {
    return (
      <VoucherDetailModal
        voucherGuid={selectedVoucherGuid}
        companyId={companyId}
        divisionId={divisionId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Migration Trigger */}
      {companyId && divisionId && (
        <VtMigrationTrigger 
          companyId={companyId} 
          divisionId={divisionId} 
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vouchers Day Book</h1>
          <p className="text-muted-foreground">
            Complete list of all vouchers with advanced filtering and search (VT Schema)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVouchers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVouchers}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} active, {cancelledCount} cancelled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Sum of all voucher amounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher Types</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voucherTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Different voucher types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVouchers > 0 ? Math.round((activeCount / totalVouchers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Non-cancelled vouchers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Use filters to narrow down the voucher list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedVoucherType} onValueChange={setSelectedVoucherType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {voucherTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="number-asc">Number (A-Z)</SelectItem>
                <SelectItem value="number-desc">Number (Z-A)</SelectItem>
                <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                <SelectItem value="type-asc">Type (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Entries ({filteredVouchers.length} / {totalCount})</CardTitle>
          <CardDescription>
            Complete list of vouchers with details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={fetchVouchers} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No vouchers found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVouchers.map((voucher) => (
                        <TableRow
                          key={voucher.guid}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleVoucherClick(voucher)}
                        >
                          <TableCell className="font-medium">
                            {voucher.voucher_number || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {voucher.voucher_type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(voucher.date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {voucher.party_ledger_name || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {voucher.total_amount ? formatCurrency(voucher.total_amount) : '-'}
                          </TableCell>
                          <TableCell>
                            {voucher.is_cancelled ? (
                              <Badge variant="destructive">Cancelled</Badge>
                            ) : voucher.is_optional ? (
                              <Badge variant="secondary">Optional</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {voucher.narration || 'No narration'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVoucherClick(voucher);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(voucher);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(voucher);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
                </div>
                <div className="flex items-center gap-3">
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                    <span className="text-sm">Page {page} / {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                    <Button variant="outline" disabled={page >= Math.ceil(totalCount / pageSize) || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              </div>
            </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}