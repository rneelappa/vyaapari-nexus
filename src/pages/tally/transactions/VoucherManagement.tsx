import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VoucherDisplay } from '@/components/tally/VoucherDisplay';
import { VoucherDetailsView } from '@/components/tally/VoucherDetailsView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoucherEntry {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  party_ledger_name: string;
  total_amount: number;
  narration: string;
  created_at: string;
  basic_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  net_amount?: number;
  reference?: string;
  due_date?: string;
}

const VoucherManagement: React.FC = () => {
  const { companyId, divisionId } = useParams();
  const { toast } = useToast();
  
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherEntry | null>(null);
  const [voucherTypes, setVoucherTypes] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL_TYPES');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [amountFrom, setAmountFrom] = useState<string>('');
  const [amountTo, setAmountTo] = useState<string>('');

  useEffect(() => {
    if (companyId && divisionId) {
      fetchVouchers(true);
    }
  }, [companyId, divisionId]);

  useEffect(() => {
    applyFilters();
  }, [vouchers, selectedType, dateFrom, dateTo, amountFrom, amountTo]);

  const fetchVouchers = async (reset: boolean = false) => {
    if (!companyId || !divisionId) return;

    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
        setVouchers([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const pageSize = 1000;
      const from = reset ? 0 : currentPage * pageSize;
      const to = from + pageSize - 1;

      // First get total count
      if (reset) {
        const { count } = await supabase
          .from('tally_trn_voucher')
          .select('*', { count: 'exact', head: true })
          .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`);
        
        setTotalCount(count || 0);
      }
      
      const { data, error } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching vouchers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch vouchers",
          variant: "destructive"
        });
        return;
      }

      const voucherData = (data || []).map(voucher => ({
        guid: voucher.guid,
        voucher_number: voucher.voucher_number || 'N/A',
        voucher_type: voucher.voucher_type || 'Unknown',
        date: voucher.date || new Date().toISOString(),
        party_ledger_name: voucher.party_ledger_name || '',
        total_amount: voucher.total_amount || 0,
        narration: voucher.narration || '',
        created_at: voucher.created_at || new Date().toISOString(),
        basic_amount: voucher.basic_amount,
        discount_amount: voucher.discount_amount,
        tax_amount: voucher.tax_amount,
        net_amount: voucher.net_amount,
        reference: voucher.reference,
        due_date: voucher.due_date
      }));

      if (reset) {
        setVouchers(voucherData);
      } else {
        setVouchers(prev => [...prev, ...voucherData]);
      }

      // Check if there are more records
      setHasMore(voucherData.length === pageSize);
      setCurrentPage(prev => reset ? 1 : prev + 1);
      
      // Extract unique voucher types (only on reset/first load)
      if (reset) {
        const types = Array.from(new Set(voucherData.map(v => v.voucher_type))).filter(Boolean);
        setVoucherTypes(types);
      }
      
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Failed to fetch vouchers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreVouchers = () => {
    if (!loadingMore && hasMore) {
      fetchVouchers(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vouchers];

    // Type filter
    if (selectedType && selectedType !== "ALL_TYPES") {
      filtered = filtered.filter(v => v.voucher_type === selectedType);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(v => new Date(v.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(v => new Date(v.date) <= new Date(dateTo));
    }

    // Amount range filter
    if (amountFrom) {
      const minAmount = parseFloat(amountFrom);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter(v => v.total_amount >= minAmount);
      }
    }
    if (amountTo) {
      const maxAmount = parseFloat(amountTo);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter(v => v.total_amount <= maxAmount);
      }
    }

    setFilteredVouchers(filtered);
  };

  const clearFilters = () => {
    setSelectedType('ALL_TYPES');
    setDateFrom('');
    setDateTo('');
    setAmountFrom('');
    setAmountTo('');
  };

  const handleVoucherClick = (voucher: VoucherEntry) => {
    setSelectedVoucher(voucher);
  };

  const handleBack = () => {
    setSelectedVoucher(null);
  };

  const handleEdit = (voucher: VoucherEntry) => {
    toast({
      title: "Edit Voucher",
      description: `Editing functionality for ${voucher.voucher_number} will be implemented here.`
    });
  };

  const calculateTotals = () => {
    const totalAmount = filteredVouchers.reduce((sum, v) => sum + v.total_amount, 0);
    const voucherCount = filteredVouchers.length;
    const typeBreakdown = filteredVouchers.reduce((acc, v) => {
      acc[v.voucher_type] = (acc[v.voucher_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalAmount, voucherCount, typeBreakdown };
  };

  const { totalAmount, voucherCount, typeBreakdown } = calculateTotals();

  if (selectedVoucher) {
    return (
      <VoucherDetailsView
        voucher={selectedVoucher}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Voucher Management
          </h1>
          <p className="text-muted-foreground">
            Manage and view all vouchers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => fetchVouchers(true)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Voucher
          </Button>
        </div>
      </div>

      {/* Statistics Block */}
      <div className="bg-muted/30 rounded-lg px-4 py-2 border">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">{voucherCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Showing {vouchers.length} of {totalCount.toLocaleString()} total
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  notation: 'compact'
                }).format(totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">Total Amount</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs h-4">{Object.keys(typeBreakdown).length}</Badge>
            <div className="flex-1">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(typeBreakdown).slice(0, 3).map(([type, count]) => (
                  <span key={type} className="text-xs bg-background px-2 py-1 rounded border">
                    {type}: {count}
                  </span>
                ))}
                {Object.keys(typeBreakdown).length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{Object.keys(typeBreakdown).length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Block */}
      <div className="bg-muted/30 rounded-lg px-4 py-2 border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Type:</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TYPES">All Types</SelectItem>
                {voucherTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">From:</Label>
            <Input
              type="date"
              className="h-7 w-32 text-xs"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">To:</Label>
            <Input
              type="date"
              className="h-7 w-32 text-xs"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Min Amount:</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-7 w-24 text-xs"
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Max Amount:</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-7 w-24 text-xs"
              value={amountTo}
              onChange={(e) => setAmountTo(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {/* Voucher Display - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <VoucherDisplay
          vouchers={filteredVouchers}
          loading={loading}
          onVoucherClick={handleVoucherClick}
          onEdit={handleEdit}
          title="All Vouchers"
          showActions={true}
          searchable={true}
          filterable={false} // We have advanced filters above
        />
      </div>

      {/* Load More Section */}
      {hasMore && vouchers.length > 0 && (
        <div className="flex justify-center py-2">
          <Button 
            onClick={loadMoreVouchers} 
            variant="outline" 
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                Load More Vouchers
                <Badge variant="secondary" className="ml-2">
                  {vouchers.length} / {totalCount.toLocaleString()}
                </Badge>
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of Results Message */}
      {!hasMore && vouchers.length > 0 && (
        <div className="text-center py-2 text-muted-foreground">
          <p>You've reached the end of all vouchers ({totalCount.toLocaleString()} total)</p>
        </div>
      )}
    </div>
  );
};

export default VoucherManagement;