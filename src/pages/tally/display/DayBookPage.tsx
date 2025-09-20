import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Calendar, RefreshCw, FileText, Eye, Edit, Trash2, ArrowLeft, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VtMigrationTrigger } from "@/components/vt/VtMigrationTrigger";

interface DayBookEntry {
  guid: string;
  date: string | null;
  ledger: string | null;
  voucher_type: string | null;
  voucher_number: string | null;
  amount: number | null;
  amount_forex: number | null;
  currency: string | null;
  company_id: string | null;
  division_id: string | null;
  cost_centre: string | null;
  cost_category: string | null;
  voucher_guid: string | null;
  is_deemed_positive: number | null;
  is_party_ledger: number | null;
}

export default function DayBookPage() {
  const { companyId, divisionId } = useParams<{
    companyId: string;
    divisionId: string;
  }>();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<DayBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLedger, setSelectedLedger] = useState<string>("all");
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination & totals
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(200);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [aggregatedAmount, setAggregatedAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [companyId, divisionId, selectedLedger, selectedVoucherType, dateFrom, dateTo, searchTerm, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchTotals();
  }, [companyId, divisionId, selectedLedger, selectedVoucherType, dateFrom, dateTo, searchTerm]);

  const applyCommonFilters = (query: any) => {
    // Apply company and division filters if available
    if (companyId && companyId !== 'undefined') {
      query = query.eq('company_id', companyId);
    }
    if (divisionId && divisionId !== 'undefined') {
      query = query.eq('division_id', divisionId);
    }

    // Ledger filter
    if (selectedLedger !== 'all') {
      query = query.eq('ledger', selectedLedger);
    }

    // Voucher type filter
    if (selectedVoucherType !== 'all') {
      query = query.eq('voucher_type', selectedVoucherType);
    }

    // Date range filter
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    // Search filter across key fields
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      query = query.or(
        `ledger.ilike.${term},voucher_number.ilike.${term},cost_centre.ilike.${term},cost_category.ilike.${term}`
      );
    }

    return query;
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('bkp_trn_accounting')
        .select('*', { count: 'exact' });

      query = applyCommonFilters(query);

      // Sorting
      const sortColumn = ['date', 'ledger', 'amount', 'voucher_type'].includes(sortBy)
        ? sortBy
        : 'date';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: false });

      // Pagination
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setEntries((data as any) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching accounting entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounting entries');
      toast({
        title: 'Error',
        description: 'Failed to fetch day book entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotals = async () => {
    try {
      let totalQuery = supabase
        .from('bkp_trn_accounting')
        .select('amount.sum()');

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

  // Get unique ledgers and voucher types for filter dropdowns
  const uniqueLedgers = Array.from(new Set(entries.map(e => e.ledger).filter(Boolean)));
  const uniqueVoucherTypes = Array.from(new Set(entries.map(e => e.voucher_type).filter(Boolean)));

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      // Search filter
      const searchMatch = !searchTerm || 
        (entry.ledger && entry.ledger.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.voucher_number && entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.cost_centre && entry.cost_centre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.cost_category && entry.cost_category.toLowerCase().includes(searchTerm.toLowerCase()));

      // Ledger filter
      const ledgerMatch = selectedLedger === "all" || entry.ledger === selectedLedger;

      // Voucher type filter
      const typeMatch = selectedVoucherType === "all" || entry.voucher_type === selectedVoucherType;

      // Date range filter
      const dateMatch = (!dateFrom || !entry.date || entry.date >= dateFrom) &&
                       (!dateTo || !entry.date || entry.date <= dateTo);

      return searchMatch && ledgerMatch && typeMatch && dateMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = a.date || "";
          bValue = b.date || "";
          break;
        case "ledger":
          aValue = a.ledger || "";
          bValue = b.ledger || "";
          break;
        case "amount":
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case "voucher_type":
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
  const totalEntries = totalCount;
  const pageAmount = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAmount = aggregatedAmount ?? pageAmount;
  const debitEntries = filteredEntries.filter(e => (e.amount || 0) > 0);
  const creditEntries = filteredEntries.filter(e => (e.amount || 0) < 0);
  const totalDebits = debitEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCredits = Math.abs(creditEntries.reduce((sum, e) => sum + (e.amount || 0), 0));

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
          <h1 className="text-3xl font-bold">Day Book</h1>
          <p className="text-muted-foreground">
            Daily accounting entries with advanced filtering and search (VT Schema)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEntries} disabled={loading}>
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
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {debitEntries.length} debits, {creditEntries.length} credits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              Positive amounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              Negative amounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDebits - totalCredits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalDebits - totalCredits))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDebits - totalCredits >= 0 ? 'Debit Balance' : 'Credit Balance'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Use filters to narrow down the accounting entries list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedLedger} onValueChange={setSelectedLedger}>
              <SelectTrigger>
                <SelectValue placeholder="All Ledgers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ledgers</SelectItem>
                {uniqueLedgers.map(ledger => (
                  <SelectItem key={ledger} value={ledger}>{ledger}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedVoucherType} onValueChange={setSelectedVoucherType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueVoucherTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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
                <SelectItem value="ledger-asc">Ledger (A-Z)</SelectItem>
                <SelectItem value="ledger-desc">Ledger (Z-A)</SelectItem>
                <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                <SelectItem value="voucher_type-asc">Type (A-Z)</SelectItem>
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

      {/* Accounting Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Showing ${filteredEntries.length} of ${totalEntries} entries`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button onClick={fetchEntries} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Ledger</TableHead>
                    <TableHead>Voucher Type</TableHead>
                    <TableHead>Voucher No.</TableHead>
                    <TableHead>Debit/Credit</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Cost Centre</TableHead>
                    <TableHead>Cost Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No accounting entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.guid}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.ledger || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.voucher_type || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.voucher_number || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={(entry.amount || 0) >= 0 ? "default" : "secondary"}>
                            {(entry.amount || 0) >= 0 ? "Debit" : "Credit"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${(entry.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(entry.amount || 0))}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.cost_centre || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.cost_category || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Page {page} of {Math.ceil(totalCount / pageSize)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}