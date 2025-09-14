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
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherEntry | null>(null);
  const [voucherTypes, setVoucherTypes] = useState<string[]>([]);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL_TYPES');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [amountFrom, setAmountFrom] = useState<string>('');
  const [amountTo, setAmountTo] = useState<string>('');

  useEffect(() => {
    if (companyId && divisionId) {
      fetchVouchers();
    }
  }, [companyId, divisionId]);

  useEffect(() => {
    applyFilters();
  }, [vouchers, selectedType, dateFrom, dateTo, amountFrom, amountTo]);

  const fetchVouchers = async () => {
    if (!companyId || !divisionId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('date', { ascending: false })
        .limit(1000);

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

      setVouchers(voucherData);
      
      // Extract unique voucher types
      const types = Array.from(new Set(voucherData.map(v => v.voucher_type))).filter(Boolean);
      setVoucherTypes(types);
      
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Failed to fetch vouchers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
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
          <Button onClick={fetchVouchers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Voucher
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voucherCount}</div>
            <p className="text-xs text-muted-foreground">
              {voucherCount > 0 ? `${((voucherCount / vouchers.length) * 100).toFixed(1)}% of total` : 'No vouchers'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Filtered vouchers total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher Types</CardTitle>
            <Badge variant="secondary">{Object.keys(typeBreakdown).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(typeBreakdown).slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="truncate">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(typeBreakdown).length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{Object.keys(typeBreakdown).length - 3} more types
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Voucher Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TYPES">All Types</SelectItem>
                  {voucherTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Amount From</Label>
              <Input
                type="number"
                placeholder="0"
                value={amountFrom}
                onChange={(e) => setAmountFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Amount To</Label>
              <Input
                type="number"
                placeholder="0"
                value={amountTo}
                onChange={(e) => setAmountTo(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voucher Display */}
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
  );
};

export default VoucherManagement;