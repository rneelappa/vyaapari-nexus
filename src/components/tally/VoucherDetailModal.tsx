import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Hash, Tag, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoucherData {
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
  basic_amount: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  final_amount: number | null;
  net_amount: number | null;
  due_date: string | null;
  exchange_rate: number | null;
}

interface AccountingEntry {
  guid: string;
  ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
  is_deemed_positive: number;
  is_party_ledger: number;
  cost_centre: string | null;
  cost_category: string | null;
}

interface VoucherDetailModalProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  onBack: () => void;
}

export function VoucherDetailModal({ voucherGuid, companyId, divisionId, onBack }: VoucherDetailModalProps) {
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVoucherDetails();
  }, [voucherGuid, companyId, divisionId]);

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch voucher header
      const { data: voucherData, error: voucherError } = await supabase
        .from('bkp_tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .maybeSingle();

      if (voucherError) throw voucherError;

      if (!voucherData) {
        throw new Error('Voucher not found');
      }

      setVoucher(voucherData);

      // Fetch accounting entries for this voucher
      const { data: entriesData, error: entriesError } = await supabase
        .from('bkp_trn_accounting')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('amount', { ascending: false });

      if (entriesError) throw entriesError;

      setAccountingEntries(entriesData || []);

    } catch (err) {
      console.error('Error fetching voucher details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch voucher details');
      toast({
        title: 'Error',
        description: 'Failed to fetch voucher details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading voucher details...</p>
        </div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Voucher</h3>
          <p className="text-muted-foreground mb-4">{error || 'Voucher not found'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const debitEntries = accountingEntries.filter(entry => entry.amount > 0);
  const creditEntries = accountingEntries.filter(entry => entry.amount < 0);

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Vouchers
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant={voucher.is_cancelled ? "destructive" : "default"}>
              {voucher.is_cancelled ? "Cancelled" : "Active"}
            </Badge>
            {voucher.is_optional && (
              <Badge variant="secondary">Optional</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Voucher Header Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Voucher Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Voucher Number
                </div>
                <p className="font-semibold">{voucher.voucher_number || '-'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Voucher Type
                </div>
                <p className="font-semibold">{voucher.voucher_type || '-'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
                <p className="font-semibold">{formatDate(voucher.date)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Party Ledger
                </div>
                <p className="font-semibold">{voucher.party_ledger_name || '-'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total Amount
                </div>
                <p className="font-semibold text-lg">{formatCurrency(voucher.total_amount)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Currency
                </div>
                <p className="font-semibold">{voucher.currency || 'INR'}</p>
              </div>
            </div>

            {voucher.narration && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Narration</div>
                  <p className="bg-muted p-3 rounded-md">{voucher.narration}</p>
                </div>
              </>
            )}

            {voucher.reference && (
              <div className="space-y-2 mt-4">
                <div className="text-sm text-muted-foreground">Reference</div>
                <p className="font-medium">{voucher.reference}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amount Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Amount Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Basic Amount</div>
                <p className="font-semibold">{formatCurrency(voucher.basic_amount)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tax Amount</div>
                <p className="font-semibold">{formatCurrency(voucher.tax_amount)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Discount</div>
                <p className="font-semibold">{formatCurrency(voucher.discount_amount)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Final Amount</div>
                <p className="font-semibold text-lg">{formatCurrency(voucher.final_amount || voucher.total_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Accounting Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {accountingEntries.length > 0 ? (
              <div className="space-y-4">
                {/* Debit Entries */}
                {debitEntries.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Debit Entries</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ledger</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Cost Centre</TableHead>
                          <TableHead>Cost Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {debitEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell className="font-medium">{entry.ledger}</TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              {formatCurrency(entry.amount)}
                            </TableCell>
                            <TableCell>{entry.cost_centre || '-'}</TableCell>
                            <TableCell>{entry.cost_category || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Credit Entries */}
                {creditEntries.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Credit Entries</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ledger</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Cost Centre</TableHead>
                          <TableHead>Cost Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell className="font-medium">{entry.ledger}</TableCell>
                            <TableCell className="text-red-600 font-semibold">
                              {formatCurrency(Math.abs(entry.amount))}
                            </TableCell>
                            <TableCell>{entry.cost_centre || '-'}</TableCell>
                            <TableCell>{entry.cost_category || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No accounting entries found for this voucher.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Created At</div>
                <p className="font-semibold">{formatDateTime(voucher.created_at)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Last Modified</div>
                <p className="font-semibold">{formatDateTime(voucher.altered_on)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Due Date</div>
                <p className="font-semibold">{formatDate(voucher.due_date)}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Exchange Rate</div>
                <p className="font-semibold">{voucher.exchange_rate || '1.0000'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}