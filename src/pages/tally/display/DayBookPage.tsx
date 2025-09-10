import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Filter, Calendar, FileText, Calculator, Package } from "lucide-react";

interface DayBookEntry {
  date: string;
  voucher_type: string;
  voucher_number: string;
  party_name: string;
  narration: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
}

const mockDayBookEntries: DayBookEntry[] = [
  {
    date: "2025-01-15",
    voucher_type: "Sales",
    voucher_number: "2800236/25-26",
    party_name: "LSI-MECH ENGINEERS PRIVATE LIMITED",
    narration: "Sales of finished goods",
    debit_amount: 150000,
    credit_amount: 0,
    balance: 150000
  },
  {
    date: "2025-01-15",
    voucher_type: "Sales",
    voucher_number: "2800236/25-26",
    party_name: "LSI-MECH ENGINEERS PRIVATE LIMITED",
    narration: "Sales of finished goods",
    debit_amount: 0,
    credit_amount: 150000,
    balance: 0
  },
  {
    date: "2025-01-14",
    voucher_type: "Purchase",
    voucher_number: "2800235/25-26",
    party_name: "Steel Supplier Ltd",
    narration: "Purchase of raw materials",
    debit_amount: 50000,
    credit_amount: 0,
    balance: 50000
  },
  {
    date: "2025-01-14",
    voucher_type: "Purchase",
    voucher_number: "2800235/25-26",
    party_name: "Steel Supplier Ltd",
    narration: "Purchase of raw materials",
    debit_amount: 0,
    credit_amount: 50000,
    balance: 0
  },
  {
    date: "2025-01-13",
    voucher_type: "Payment",
    voucher_number: "PAY-001",
    party_name: "Electricity Board",
    narration: "Monthly electricity bill payment",
    debit_amount: 15000,
    credit_amount: 0,
    balance: 15000
  },
  {
    date: "2025-01-13",
    voucher_type: "Payment",
    voucher_number: "PAY-001",
    party_name: "Electricity Board",
    narration: "Monthly electricity bill payment",
    debit_amount: 0,
    credit_amount: 15000,
    balance: 0
  }
];

export default function DayBookPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dayBookEntries] = useState<DayBookEntry[]>(mockDayBookEntries);

  const filteredEntries = dayBookEntries.filter(entry =>
    entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.narration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getVoucherTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sales':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'purchase':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'payment':
        return <Calculator className="h-4 w-4 text-red-600" />;
      case 'receipt':
        return <Calculator className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Day Book</h1>
          <p className="text-muted-foreground">
            Chronological record of all accounting transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Day Book Entries</CardTitle>
          <CardDescription>
            Complete chronological listing of all accounting transactions with running balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search day book entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                className="w-40"
                defaultValue="2025-01-01"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                className="w-40"
                defaultValue="2025-01-31"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
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
                    <TableHead>Voucher Type</TableHead>
                    <TableHead>Voucher Number</TableHead>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead className="text-right">Debit Amount</TableHead>
                    <TableHead className="text-right">Credit Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => (
                    <TableRow key={`${entry.date}-${entry.voucher_number}-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getVoucherTypeIcon(entry.voucher_type)}
                          <Badge variant="outline">{entry.voucher_type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {entry.voucher_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.party_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-48 truncate block">
                          {entry.narration}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit_amount > 0 ? (
                          <span className="font-medium text-green-600">
                            {formatCurrency(entry.debit_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit_amount > 0 ? (
                          <span className="font-medium text-red-600">
                            {formatCurrency(entry.credit_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          entry.balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(entry.balance)}
                        </span>
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
