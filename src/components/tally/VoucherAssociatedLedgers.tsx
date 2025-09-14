import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Banknote,
  User
} from 'lucide-react';

interface LedgerInfo {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  opening_balance: number;
  closing_balance: number;
  is_revenue: number;
  is_deemedpositive: number;
  ledger_mobile?: string;
  email?: string;
  mailing_name?: string;
  mailing_address?: string;
  mailing_state?: string;
  mailing_country?: string;
  mailing_pincode?: string;
  gstn?: string;
  it_pan?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  credit_limit?: number;
  credit_days?: number;
  bill_credit_period?: number;
  usedInVoucher?: {
    amount: number;
    is_party_ledger: number;
  };
}

interface VoucherAssociatedLedgersProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherAssociatedLedgers({ voucherGuid, companyId, divisionId }: VoucherAssociatedLedgersProps) {
  const [loading, setLoading] = useState(true);
  const [ledgers, setLedgers] = useState<LedgerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssociatedLedgers();
  }, [voucherGuid, companyId, divisionId]);

  const fetchAssociatedLedgers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get all unique ledgers from accounting entries
      const { data: accountingData, error: accountingError } = await supabase
        .from('trn_accounting')
        .select('ledger, amount, is_party_ledger')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      if (accountingError) {
        console.error('Error fetching accounting entries:', accountingError);
        setError('Failed to fetch voucher ledgers');
        return;
      }

      if (!accountingData || accountingData.length === 0) {
        setLedgers([]);
        return;
      }

      // Get unique ledger names
      const uniqueLedgers = Array.from(
        new Map(accountingData.map(entry => [
          entry.ledger, 
          { amount: entry.amount, is_party_ledger: entry.is_party_ledger }
        ])).entries()
      );

      const ledgerNames = uniqueLedgers.map(([name]) => name);

      // Fetch detailed ledger information
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('mst_ledger')
        .select('*')
        .in('name', ledgerNames)
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      if (ledgerError) {
        console.error('Error fetching ledger details:', ledgerError);
        setError('Failed to fetch ledger details');
        return;
      }

      // Combine ledger data with voucher usage
      const enrichedLedgers = (ledgerData || []).map(ledger => ({
        ...ledger,
        usedInVoucher: uniqueLedgers.find(([name]) => name === ledger.name)?.[1]
      }));

      setLedgers(enrichedLedgers);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="h-3 w-3" />;
    if (balance < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Ledgers</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (ledgers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Associated Ledgers</h3>
          <p className="text-muted-foreground">This voucher has no associated ledgers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Ledgers</p>
                <p className="text-lg font-semibold">{ledgers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Party Ledgers</p>
                <p className="text-lg font-semibold text-blue-600">
                  {ledgers.filter(l => l.usedInVoucher?.is_party_ledger === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bank/Cash Ledgers</p>
                <p className="text-lg font-semibold text-green-600">
                  {ledgers.filter(l => l.parent.toLowerCase().includes('cash') || l.parent.toLowerCase().includes('bank')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ledgers.map((ledger) => (
          <Card key={ledger.guid} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{ledger.name}</CardTitle>
                <div className="flex gap-1">
                  {ledger.usedInVoucher?.is_party_ledger === 1 && (
                    <Badge variant="secondary" className="text-xs">
                      Party
                    </Badge>
                  )}
                  {ledger.is_revenue === 1 && (
                    <Badge variant="outline" className="text-xs">
                      Revenue
                    </Badge>
                  )}
                </div>
              </div>
              {ledger.alias && (
                <p className="text-sm text-muted-foreground">Alias: {ledger.alias}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Parent Group */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Group:</span>
                <span className="font-medium">{ledger.parent || 'N/A'}</span>
              </div>

              {/* Voucher Amount */}
              {ledger.usedInVoucher && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used Amount:</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(Math.abs(ledger.usedInVoucher.amount))}
                  </span>
                </div>
              )}

              {/* Balances */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Opening Balance:</span>
                  <div className={`flex items-center gap-1 font-medium ${getBalanceColor(ledger.opening_balance)}`}>
                    {getBalanceIcon(ledger.opening_balance)}
                    {formatCurrency(Math.abs(ledger.opening_balance))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Closing Balance:</span>
                  <div className={`flex items-center gap-1 font-medium ${getBalanceColor(ledger.closing_balance)}`}>
                    {getBalanceIcon(ledger.closing_balance)}
                    {formatCurrency(Math.abs(ledger.closing_balance))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(ledger.ledger_mobile || ledger.email) && (
                <div className="border-t pt-3 space-y-2">
                  {ledger.ledger_mobile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{ledger.ledger_mobile}</span>
                    </div>
                  )}
                  {ledger.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{ledger.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Banking Details */}
              {(ledger.bank_account_number || ledger.bank_name) && (
                <div className="border-t pt-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Banking Details
                  </div>
                  {ledger.bank_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span>{ledger.bank_name}</span>
                    </div>
                  )}
                  {ledger.bank_account_number && (
                    <div className="text-sm text-muted-foreground">
                      A/C: {ledger.bank_account_number}
                    </div>
                  )}
                  {ledger.bank_ifsc && (
                    <div className="text-sm text-muted-foreground">
                      IFSC: {ledger.bank_ifsc}
                    </div>
                  )}
                </div>
              )}

              {/* Credit Terms */}
              {(ledger.credit_limit || ledger.credit_days) && (
                <div className="border-t pt-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Credit Terms
                  </div>
                  {ledger.credit_limit && ledger.credit_limit > 0 && (
                    <div className="text-sm">
                      Limit: {formatCurrency(ledger.credit_limit)}
                    </div>
                  )}
                  {ledger.credit_days && ledger.credit_days > 0 && (
                    <div className="text-sm">
                      Days: {ledger.credit_days}
                    </div>
                  )}
                </div>
              )}

              {/* Tax Information */}
              {(ledger.gstn || ledger.it_pan) && (
                <div className="border-t pt-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tax Information
                  </div>
                  {ledger.gstn && (
                    <div className="text-sm">
                      GSTN: {ledger.gstn}
                    </div>
                  )}
                  {ledger.it_pan && (
                    <div className="text-sm">
                      PAN: {ledger.it_pan}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}