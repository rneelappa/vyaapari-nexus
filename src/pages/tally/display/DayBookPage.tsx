import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Filter, Calendar, FileText, Calculator, Package, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useVtTallyData } from "@/hooks/useVtTallyData";

interface DayBookEntry {
  guid: string;
  date: string | null;
  ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
  company_id: string | null;
  division_id: string | null;
}

interface VoucherEntry {
  guid: string;
  date: string | null;
  voucher_type: string | null;
  voucher_number: string | null;
  narration: string | null;
}

export default function DayBookPage() {
  const { companyId, divisionId } = useParams<{
    companyId: string;
    divisionId: string;
  }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Use VT data hooks with company and division filters
  const { 
    vouchers, 
    ledgers,
    loading, 
    error
  } = useVtTallyData(companyId, divisionId);

  // Transform VT vouchers to day book entries
  const vtDayBookEntries = useMemo(() => {
    if (!vouchers.data) return [];
    
    return vouchers.data.map((voucher): DayBookEntry => ({
      guid: voucher.guid,
      date: voucher.date,
      ledger: voucher.party_ledger_name || voucher.voucher_type || 'Unknown',
      amount: voucher.total_amount || voucher.net_amount || 0,
      amount_forex: voucher.total_amount || 0,
      currency: 'INR', // VT vouchers may not have currency field
      company_id: voucher.company_id,
      division_id: voucher.division_id,
    }));
  }, [vouchers.data]);

  // Transform VT vouchers to voucher entries
  const vtVoucherEntries = useMemo(() => {
    if (!vouchers.data) return [];
    
    return vouchers.data.map((voucher): VoucherEntry => ({
      guid: voucher.guid,
      date: voucher.date,
      voucher_type: voucher.voucher_type,
      voucher_number: voucher.voucher_number,
      narration: voucher.narration,
    }));
  }, [vouchers.data]);

  const filteredAccountingEntries = useMemo(() => {
    if (!searchTerm) return vtDayBookEntries;
    
    return vtDayBookEntries.filter(entry =>
      entry.ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.currency.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vtDayBookEntries, searchTerm]);

  const filteredVoucherEntries = useMemo(() => {
    if (!searchTerm) return vtVoucherEntries;
    
    return vtVoucherEntries.filter(entry =>
      (entry.voucher_type && entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.voucher_number && entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.narration && entry.narration.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vtVoucherEntries, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotals = () => {
    const totalDebits = filteredAccountingEntries
      .filter(entry => entry.amount > 0)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalCredits = filteredAccountingEntries
      .filter(entry => entry.amount < 0)
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

    return { totalDebits, totalCredits };
  };

  const { totalDebits, totalCredits } = calculateTotals();

  const handleRefresh = () => {
    vouchers.refetch();
    toast({
      title: "Data refreshed",
      description: "VT data has been refreshed successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Day Book (VT)</h1>
          <p className="text-muted-foreground">
            Daily transaction summary and accounting entries from VT tables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{vouchers.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              VT voucher records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredAccountingEntries.filter(e => e.amount > 0).length} entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredAccountingEntries.filter(e => e.amount < 0).length} entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDebits - totalCredits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalDebits - totalCredits))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDebits - totalCredits >= 0 ? 'Debit Balance' : 'Credit Balance'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>VT Transaction Entries</CardTitle>
          <CardDescription>
            Detailed view of all VT voucher and accounting entries
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
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>

          <Tabs defaultValue="accounting" className="w-full">
            <TabsList>
              <TabsTrigger value="accounting">Accounting Entries</TabsTrigger>
              <TabsTrigger value="vouchers">Voucher Entries</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounting" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={handleRefresh} variant="outline">
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
                        <TableHead>Running Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccountingEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No VT accounting entries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAccountingEntries.map((entry, index) => {
                          const runningBalance = filteredAccountingEntries
                            .slice(0, index + 1)
                            .reduce((sum, e) => sum + e.amount, 0);
                          
                          return (
                            <TableRow key={entry.guid}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <Calculator className="h-4 w-4 text-muted-foreground" />
                                  {entry.ledger}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={entry.amount >= 0 ? "default" : "secondary"}>
                                  {entry.amount >= 0 ? "Debit" : "Credit"}
                                </Badge>
                              </TableCell>
                              <TableCell className={`font-medium ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(entry.amount))}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{entry.currency}</Badge>
                              </TableCell>
                              <TableCell className={`font-medium ${runningBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(runningBalance))}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="vouchers" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Voucher Type</TableHead>
                      <TableHead>Voucher Number</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoucherEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No VT voucher entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoucherEntries.map((entry) => {
                        const voucherData = vouchers.data?.find(v => v.guid === entry.guid);
                        return (
                          <TableRow key={entry.guid}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {entry.voucher_type || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.voucher_number || '-'}
                            </TableCell>
                            <TableCell className="max-w-md">
                              <span className="text-sm text-muted-foreground line-clamp-2">
                                {entry.narration || 'No narration'}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-blue-600">
                              {voucherData ? formatCurrency(voucherData.total_amount || voucherData.net_amount || 0) : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}