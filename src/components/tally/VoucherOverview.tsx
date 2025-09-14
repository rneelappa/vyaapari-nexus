import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Hash, 
  Tag, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface VoucherDetails {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  due_date?: string;
  party_ledger_name?: string;
  narration?: string;
  basic_amount: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  total_amount: number;
  final_amount: number;
  currency: string;
  is_cancelled: number;
  is_optional: number;
  reference?: string;
  order_reference?: string;
  receipt_reference?: string;
  consignment_note?: string;
}

interface VoucherOverviewProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherOverview({ voucherGuid, companyId, divisionId }: VoucherOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<VoucherDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVoucherDetails();
  }, [voucherGuid, companyId, divisionId]);

  const fetchVoucherDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching voucher:', error);
        setError('Failed to fetch voucher details');
        return;
      }

      if (!data) {
        setError('Voucher not found');
        return;
      }

      setVoucher(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Voucher</h3>
          <p className="text-muted-foreground">{error || 'Voucher not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Number:</span>
              </div>
              <span className="font-medium">{voucher.voucher_number || 'N/A'}</span>
              
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
              </div>
              <span className="font-medium">{voucher.voucher_type}</span>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
              </div>
              <span className="font-medium">{formatDate(voucher.date)}</span>
              
              {voucher.due_date && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Due Date:</span>
                  </div>
                  <span className="font-medium">{formatDate(voucher.due_date)}</span>
                </>
              )}
              
              {voucher.party_ledger_name && (
                <>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Party:</span>
                  </div>
                  <span className="font-medium">{voucher.party_ledger_name}</span>
                </>
              )}
            </div>

            {voucher.narration && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-1">Narration:</div>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {voucher.narration}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Basic Amount:</span>
              <span className="font-medium">{formatCurrency(voucher.basic_amount, voucher.currency)}</span>
              
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium">{formatCurrency(voucher.discount_amount, voucher.currency)}</span>
              
              <span className="text-muted-foreground">Tax Amount:</span>
              <span className="font-medium">{formatCurrency(voucher.tax_amount, voucher.currency)}</span>
              
              <span className="text-muted-foreground">Net Amount:</span>
              <span className="font-medium">{formatCurrency(voucher.net_amount, voucher.currency)}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-base font-semibold">
                <span>Total Amount:</span>
                <span className="text-lg">{formatCurrency(voucher.total_amount, voucher.currency)}</span>
              </div>
              
              <div className="flex justify-between items-center text-base font-bold mt-2">
                <span>Final Amount:</span>
                <span className="text-lg text-primary">{formatCurrency(voucher.final_amount, voucher.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* References and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* References */}
        {(voucher.reference || voucher.order_reference || voucher.receipt_reference || voucher.consignment_note) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {voucher.reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{voucher.reference}</span>
                </div>
              )}
              {voucher.order_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Reference:</span>
                  <span className="font-medium">{voucher.order_reference}</span>
                </div>
              )}
              {voucher.receipt_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt Reference:</span>
                  <span className="font-medium">{voucher.receipt_reference}</span>
                </div>
              )}
              {voucher.consignment_note && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consignment Note:</span>
                  <span className="font-medium">{voucher.consignment_note}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={voucher.is_cancelled === 1 ? "destructive" : "secondary"}>
                {voucher.is_cancelled === 1 ? "Cancelled" : "Active"}
              </Badge>
              <Badge variant={voucher.is_optional === 1 ? "outline" : "secondary"}>
                {voucher.is_optional === 1 ? "Optional" : "Mandatory"}
              </Badge>
              <Badge variant="outline">
                {voucher.currency}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}