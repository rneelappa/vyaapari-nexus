import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, BookOpen, TrendingUp, TrendingDown, MapPin, CreditCard, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Ledger {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  opening_balance: number;
  closing_balance: number;
  is_revenue: boolean;
  is_deemedpositive: boolean;
  gstn: string;
  email: string;
  mailing_address: string;
  bank_account_number: string;
}

export default function LedgersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLedgers();
    }
  }, [user]);

  const fetchLedgers = async () => {
    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch from Supabase mst_ledger table
      const { data, error } = await supabase
        .from('mst_ledger')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match Ledger interface
      const transformedLedgers: Ledger[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent,
        alias: item.alias,
        opening_balance: item.opening_balance || 0,
        closing_balance: item.closing_balance || 0,
        is_revenue: !!item.is_revenue,
        is_deemedpositive: !!item.is_deemedpositive,
        gstn: item.gstn || '',
        email: item.email || '',
        mailing_address: item.mailing_address || '',
        bank_account_number: item.bank_account_number || '',
      }));
      
      setLedgers(transformedLedgers);
    } catch (err) {
      console.error('Error fetching ledgers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ledgers');
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view ledgers.</p>
        </div>
      </div>
    );
  }

  const getDebitCreditIcon = (isDeemedPositive: boolean) => {
    return isDeemedPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ledgers</h1>
          <p className="text-muted-foreground">
            Manage individual ledger accounts in your chart of accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLedgers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Ledger
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>
            Individual ledger accounts with balances and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ledgers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Ledgers</TabsTrigger>
              <TabsTrigger value="debtors">Sundry Debtors</TabsTrigger>
              <TabsTrigger value="creditors">Sundry Creditors</TabsTrigger>
              <TabsTrigger value="cash">Cash & Bank</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading ledgers...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ledger Name</TableHead>
                      <TableHead>Parent Group</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead>Opening Balance</TableHead>
                      <TableHead>Closing Balance</TableHead>
                      <TableHead>GSTN</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLedgers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">No ledgers found. Data may need to be synchronized from Tally.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLedgers.map((ledger) => (
                    <TableRow key={ledger.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{ledger.name}</div>
                            {ledger.alias && (
                              <div className="text-sm text-muted-foreground">
                                Alias: {ledger.alias}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ledger.parent}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getDebitCreditIcon(ledger.is_deemedpositive)}
                          <span className="text-sm">
                            {ledger.is_deemedpositive ? "Debit" : "Credit"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ledger.opening_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={ledger.closing_balance >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(ledger.closing_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ledger.gstn ? (
                          <Badge variant="secondary">{ledger.gstn}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {ledger.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <span>{ledger.email}</span>
                            </div>
                          )}
                          {ledger.mailing_address && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-32">{ledger.mailing_address}</span>
                            </div>
                          )}
                          {ledger.bank_account_number && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              <span>****{ledger.bank_account_number.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
