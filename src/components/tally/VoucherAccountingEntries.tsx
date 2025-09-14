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
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Target, 
  AlertCircle,
  Calculator
} from 'lucide-react';

interface AccountingEntry {
  guid: string;
  ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
  is_party_ledger: number;
  is_deemed_positive: number;
  cost_centre?: string;
  cost_category?: string;
  bill_allocations?: string;
  voucher_date: string;
  voucher_number: string;
  voucher_type: string;
}

interface VoucherAccountingEntriesProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherAccountingEntries({ voucherGuid, companyId, divisionId }: VoucherAccountingEntriesProps) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    fetchAccountingEntries();
  }, [voucherGuid, companyId, divisionId]);

  const fetchAccountingEntries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('trn_accounting')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('ledger');

      if (error) {
        console.error('Error fetching accounting entries:', error);
        setError('Failed to fetch accounting entries');
        return;
      }

      setEntries(data || []);
      
      // Calculate totals
      const debitTotal = (data || [])
        .filter(entry => entry.is_deemed_positive === 1)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const creditTotal = (data || [])
        .filter(entry => entry.is_deemed_positive === 0)
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
      
      setTotals({ debit: debitTotal, credit: creditTotal });
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
    }).format(Math.abs(amount));
  };

  const getAmountType = (entry: AccountingEntry) => {
    return entry.is_deemed_positive === 1 ? 'debit' : 'credit';
  };

  const getAmountColor = (entry: AccountingEntry) => {
    return entry.is_deemed_positive === 1 ? 'text-green-600' : 'text-blue-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Accounting Entries</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Accounting Entries</h3>
          <p className="text-muted-foreground">This voucher has no associated accounting entries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Debits</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totals.debit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(totals.credit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entries Count</p>
                <p className="text-lg font-semibold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounting Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Accounting Entries ({entries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Foreign Amount</TableHead>
                  <TableHead>Cost Centre</TableHead>
                  <TableHead>Cost Category</TableHead>
                  <TableHead>Party</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.guid}>
                    <TableCell className="font-medium">
                      {entry.ledger}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.is_deemed_positive === 1 ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {entry.is_deemed_positive === 1 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {getAmountType(entry)}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getAmountColor(entry)}`}>
                      {formatCurrency(entry.amount, entry.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {entry.amount_forex !== entry.amount ? (
                        formatCurrency(entry.amount_forex, entry.currency)
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.cost_centre && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{entry.cost_centre}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.cost_category && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{entry.cost_category}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.is_party_ledger === 1 && (
                        <Badge variant="outline" className="text-xs">
                          Party
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Balance Validation */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Balance Check:</span>
              <div className="flex items-center gap-2">
                {Math.abs(totals.debit - totals.credit) < 0.01 ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Balanced</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">
                      Out of Balance by {formatCurrency(Math.abs(totals.debit - totals.credit))}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bill Allocations */}
          {entries.some(entry => entry.bill_allocations) && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Bill Allocations:</h4>
              <div className="space-y-2">
                {entries
                  .filter(entry => entry.bill_allocations)
                  .map((entry) => (
                    <div key={`${entry.guid}-bill`} className="p-3 bg-muted rounded-md">
                      <div className="font-medium text-sm">{entry.ledger}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.bill_allocations}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}