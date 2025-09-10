import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Calculator, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";

interface AccountingEntry {
  guid: string;
  date: string;
  voucher_type: string;
  voucher_number: string;
  ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
  narration: string;
  party_name: string;
}

const mockAccountingEntries: AccountingEntry[] = [
  {
    guid: "1",
    date: "2025-01-15",
    voucher_type: "Sales",
    voucher_number: "2800236/25-26",
    ledger: "LSI-MECH ENGINEERS PRIVATE LIMITED",
    amount: 150000,
    amount_forex: 0,
    currency: "INR",
    narration: "Sales of finished goods",
    party_name: "LSI-MECH ENGINEERS PRIVATE LIMITED"
  },
  {
    guid: "1",
    date: "2025-01-15",
    voucher_type: "Sales",
    voucher_number: "2800236/25-26",
    ledger: "Sales",
    amount: -150000,
    amount_forex: 0,
    currency: "INR",
    narration: "Sales of finished goods",
    party_name: "LSI-MECH ENGINEERS PRIVATE LIMITED"
  },
  {
    guid: "2",
    date: "2025-01-14",
    voucher_type: "Purchase",
    voucher_number: "2800235/25-26",
    ledger: "Steel Rod 12mm",
    amount: 50000,
    amount_forex: 0,
    currency: "INR",
    narration: "Purchase of raw materials",
    party_name: "Steel Supplier Ltd"
  },
  {
    guid: "2",
    date: "2025-01-14",
    voucher_type: "Purchase",
    voucher_number: "2800235/25-26",
    ledger: "Cash",
    amount: -50000,
    amount_forex: 0,
    currency: "INR",
    narration: "Purchase of raw materials",
    party_name: "Steel Supplier Ltd"
  }
];

export default function AccountingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountingEntries] = useState<AccountingEntry[]>(mockAccountingEntries);

  const filteredEntries = accountingEntries.filter(entry =>
    entry.ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.party_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getDebitCreditIcon = (amount: number) => {
    return amount >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getDebitCreditBadge = (amount: number) => {
    return amount >= 0 ? (
      <Badge variant="default">Debit</Badge>
    ) : (
      <Badge variant="secondary">Credit</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Transactions</h1>
          <p className="text-muted-foreground">
            View and manage double-entry accounting transactions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
          <CardDescription>
            Double-entry bookkeeping transactions with debit and credit entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounting entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="receipt">Receipt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Ledger</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => (
                    <TableRow key={`${entry.guid}-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline">{entry.voucher_type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.voucher_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          {entry.ledger}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getDebitCreditIcon(entry.amount)}
                          {getDebitCreditBadge(entry.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          entry.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(entry.amount)}
                        </span>
                        {entry.amount_forex > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(entry.amount_forex)} {entry.currency}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.party_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-48 truncate block">
                          {entry.narration}
                        </span>
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
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
