import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, RefreshCw, FileText, TrendingUp, TrendingDown, DollarSign, Eye, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccountingLedgers } from "@/hooks/useAccountingLedgers";
import { useLedgerVouchers } from "@/hooks/useLedgerVouchers";

export default function AccountingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLedger, setSelectedLedger] = useState<string | null>(null);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  
  // Use the accounting ledgers hook
  const { ledgers, loading, error, refresh } = useAccountingLedgers();
  
  // Use the voucher hook
  const { vouchers, loading: vouchersLoading, fetchVouchersForLedger } = useLedgerVouchers();

  const handleCreateTransaction = (ledgerName: string) => {
    const pathParts = location.pathname.split('/');
    const divisionIndex = pathParts.indexOf('division');
    const companyIndex = pathParts.indexOf('company');
    
    if (divisionIndex > -1 && companyIndex > -1 && pathParts[divisionIndex + 1] && pathParts[companyIndex + 1]) {
      const divisionId = pathParts[divisionIndex + 1];
      const companyId = pathParts[companyIndex + 1];
      // For now, show a message since we don't have specific forms for each ledger
      toast({
        title: "Create Transaction",
        description: `Create transaction for ${ledgerName} - Feature coming soon`,
      });
    }
  };

  const handleLedgerClick = async (ledgerName: string) => {
    setSelectedLedger(ledgerName);
    setIsVoucherDialogOpen(true);
    await fetchVouchersForLedger(ledgerName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Build Monthly and Fiscal Year groups
  const monthlyGroups = (() => {
    const map = new Map<string, typeof vouchers>();
    vouchers.forEach(v => {
      const key = new Date(v.date).toISOString().slice(0,7); // YYYY-MM
      const arr = map.get(key) || [];
      arr.push(v);
      map.set(key, arr);
    });
    const result = Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: formatMonthLabel(items[0].date),
      items: items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
    // Sort by key desc (latest month first)
    result.sort((a,b) => a.key < b.key ? 1 : -1);
    return result;
  })();

  const fiscalYearGroups = (() => {
    const fyKey = (dateString: string) => {
      const d = new Date(dateString);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-12
      const startYear = m >= 4 ? y : y - 1; // FY starts in April
      const endShort = String((startYear + 1) % 100).padStart(2,'0');
      return { key: `${startYear}`, label: `FY ${startYear}-${endShort}` };
    };
    const map = new Map<string, { label: string, items: typeof vouchers }>();
    vouchers.forEach(v => {
      const { key, label } = fyKey(v.date);
      const group = map.get(key) || { label, items: [] as typeof vouchers };
      group.items.push(v);
      map.set(key, group);
    });
    const result = Array.from(map.entries()).map(([key, group]) => ({
      key,
      label: group.label,
      items: group.items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
    result.sort((a,b) => parseInt(b.key) - parseInt(a.key));
    return result;
  })();

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceIcon = (balance: number) => {
    return balance >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getBalanceBadge = (balance: number) => {
    return balance >= 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Dr {formatCurrency(Math.abs(balance))}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Cr {formatCurrency(Math.abs(balance))}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view accounting ledgers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Ledgers</h1>
          <p className="text-muted-foreground">
            View ledger balances, transaction counts, and debit/credit totals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
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

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={refresh} 
              className="mt-2"
              disabled={loading}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading accounting ledgers...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Accounting Ledgers
              <Badge variant="secondary" className="ml-auto">
                {filteredLedgers.length} ledgers
              </Badge>
            </CardTitle>
            <CardDescription>
              Ledger balances with debit/credit totals and transaction counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLedgers.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-medium">
                    {searchTerm ? 'No ledgers match your search.' : 'No accounting ledgers found.'}
                  </p>
                  {!searchTerm && (
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      <p>This could mean:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>No ledger data exists for this company/division</li>
                        <li>Ledgers may exist but don't match accounting categories</li>
                        <li>Check the browser console for debugging information</li>
                      </ul>
                    </div>
                  )}
                </div>
                <Button onClick={refresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Data
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ledger Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Debit Total</TableHead>
                    <TableHead className="text-right">Credit Total</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead className="text-right">Vouchers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgers.map((ledger) => (
                    <TableRow 
                      key={ledger.guid}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleLedgerClick(ledger.name)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getBalanceIcon(ledger.net_balance)}
                          {ledger.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {ledger.parent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">
                          {formatCurrency(ledger.total_debit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-600 font-medium">
                          {formatCurrency(ledger.total_credit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getBalanceBadge(ledger.net_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={ledger.voucher_count > 0 ? "default" : "secondary"}
                          className={ledger.voucher_count > 0 ? "bg-blue-100 text-blue-800" : ""}
                        >
                          {ledger.voucher_count.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateTransaction(ledger.name);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Transaction
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Voucher Dialog */}
      <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vouchers for {selectedLedger}
            </DialogTitle>
            <DialogDescription>
              All vouchers and transactions for this ledger
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            {vouchersLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading vouchers...</span>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vouchers found for this ledger.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="fy">Fiscal Year</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voucher #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>Narration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vouchers.map((voucher) => (
                        <TableRow key={voucher.guid}>
                          <TableCell className="font-medium">
                            {voucher.voucher_number}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {voucher.voucher_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(voucher.date)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(Math.abs(voucher.amount))}
                            </span>
                          </TableCell>
                          <TableCell>{voucher.party_ledger_name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {voucher.narration}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="monthly" className="mt-0">
                  {monthlyGroups.map((group) => (
                    <div key={group.key} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">{group.label}</h3>
                        <Badge variant="secondary">{group.items.length} vouchers</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Voucher #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((voucher) => (
                            <TableRow key={voucher.guid}>
                              <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{voucher.voucher_type}</Badge>
                              </TableCell>
                              <TableCell>{formatDate(voucher.date)}</TableCell>
                              <TableCell className="text-right">
                                <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(Math.abs(voucher.amount))}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="fy" className="mt-0">
                  {fiscalYearGroups.map((group) => (
                    <div key={group.key} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">{group.label}</h3>
                        <Badge variant="secondary">{group.items.length} vouchers</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Voucher #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((voucher) => (
                            <TableRow key={voucher.guid}>
                              <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{voucher.voucher_type}</Badge>
                              </TableCell>
                              <TableCell>{formatDate(voucher.date)}</TableCell>
                              <TableCell className="text-right">
                                <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(Math.abs(voucher.amount))}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}