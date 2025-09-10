import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Calculator, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccountingEntry {
  guid: string;
  company_id: string | null;
  division_id: string | null;
  ledger: string;
  _ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
}

export default function AccountingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountingEntries();
  }, []);

  const fetchAccountingEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('trn_accounting')
        .select('*')
        .order('guid')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      const transformedData: AccountingEntry[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id,
        division_id: item.division_id,
        ledger: item.ledger,
        _ledger: item._ledger,
        amount: item.amount || 0,
        amount_forex: item.amount_forex || 0,
        currency: item.currency || 'INR',
      }));
      
      setAccountingEntries(transformedData);
    } catch (err) {
      console.error('Error fetching accounting entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounting entries');
      setAccountingEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = accountingEntries.filter(entry =>
    entry.ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry._ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDebitCreditIcon = (amount: number) => {
    return amount >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getDebitCreditBadge = (amount: number) => {
    return amount >= 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Debit</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Credit</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Transactions</h1>
          <p className="text-muted-foreground">
            View and manage accounting ledger entries and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAccountingEntries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
          <CardDescription>
            Ledger-wise accounting transactions and journal entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="debit">Debit Entries</TabsTrigger>
              <TabsTrigger value="credit">Credit Entries</TabsTrigger>
              <TabsTrigger value="forex">Foreign Exchange</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchAccountingEntries} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ledger</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Foreign Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No accounting entries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                {entry.ledger}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getDebitCreditIcon(entry.amount)}
                                {getDebitCreditBadge(entry.amount)}
                              </div>
                            </TableCell>
                            <TableCell className={`font-medium ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(entry.amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entry.currency}</Badge>
                            </TableCell>
                            <TableCell>
                              {entry.amount_forex !== 0 ? formatCurrency(entry.amount_forex) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}