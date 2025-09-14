import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Calendar, User, Hash, DollarSign, FileEdit, Printer, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AccountingEntry {
  guid: string;
  ledger: string;
  amount: number;
  is_deemed_positive: number;
  cost_centre?: string;
  cost_category?: string;
}

interface VoucherDetailsViewProps {
  voucher: VoucherEntry;
  onBack: () => void;
  onEdit?: (voucher: VoucherEntry) => void;
}

export const VoucherDetailsView: React.FC<VoucherDetailsViewProps> = ({
  voucher,
  onBack,
  onEdit
}) => {
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccountingEntries();
  }, [voucher.guid]);

  const fetchAccountingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('trn_accounting')
        .select('*')
        .eq('voucher_guid', voucher.guid)
        .order('amount', { ascending: false });

      if (error) {
        console.error('Error fetching accounting entries:', error);
        toast({
          title: "Error",
          description: "Failed to load voucher details",
          variant: "destructive"
        });
      } else {
        setAccountingEntries(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getVoucherTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Sales': 'bg-green-100 text-green-800',
      'Purchase': 'bg-blue-100 text-blue-800',
      'Receipt': 'bg-purple-100 text-purple-800',
      'Payment': 'bg-orange-100 text-orange-800',
      'Journal': 'bg-gray-100 text-gray-800',
      'Contra': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const debitEntries = accountingEntries.filter(entry => entry.amount > 0);
  const creditEntries = accountingEntries.filter(entry => entry.amount < 0);
  const totalDebit = debitEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  const totalCredit = creditEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Voucher Details
            </h2>
            <p className="text-muted-foreground">
              {voucher.voucher_number} - {voucher.voucher_type}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(voucher)}>
              <FileEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Voucher Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Voucher Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Voucher Number</p>
              <p className="text-lg font-semibold">{voucher.voucher_number}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge 
                variant="secondary" 
                className={getVoucherTypeBadgeColor(voucher.voucher_type)}
              >
                {voucher.voucher_type}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(voucher.date)}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold text-primary flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(voucher.total_amount)}
              </p>
            </div>
          </div>
          
          {voucher.party_ledger_name && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Party</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {voucher.party_ledger_name}
                </p>
              </div>
            </>
          )}
          
          {voucher.narration && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Narration</p>
                <p className="text-base">{voucher.narration}</p>
              </div>
            </>
          )}
          
          {(voucher.reference || voucher.due_date) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voucher.reference && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Reference</p>
                    <p className="text-base">{voucher.reference}</p>
                  </div>
                )}
                {voucher.due_date && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p className="text-base">{formatDate(voucher.due_date)}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Accounting Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Debit Entries */}
              {debitEntries.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-3">Debit Entries</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ledger</TableHead>
                          <TableHead>Cost Centre</TableHead>
                          <TableHead>Cost Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {debitEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{entry.ledger}</TableCell>
                            <TableCell>{entry.cost_centre || '-'}</TableCell>
                            <TableCell>{entry.cost_category || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-green-700">
                              {formatCurrency(Math.abs(entry.amount))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Credit Entries */}
              {creditEntries.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-3">Credit Entries</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ledger</TableHead>
                          <TableHead>Cost Centre</TableHead>
                          <TableHead>Cost Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{entry.ledger}</TableCell>
                            <TableCell>{entry.cost_centre || '-'}</TableCell>
                            <TableCell>{entry.cost_category || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-red-700">
                              {formatCurrency(Math.abs(entry.amount))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Debit: {formatCurrency(totalDebit)}</p>
                    <p className="text-sm text-muted-foreground">Total Credit: {formatCurrency(totalCredit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Difference</p>
                    <p className={`text-lg font-semibold ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(totalDebit - totalCredit))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};