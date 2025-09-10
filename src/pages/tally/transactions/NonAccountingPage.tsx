import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, FileText, Calendar, Settings, Users } from "lucide-react";

interface NonAccountingEntry {
  guid: string;
  date: string;
  voucher_type: string;
  voucher_number: string;
  narration: string;
  party_name: string;
  reference_number: string;
  reference_date: string;
  is_invoice: boolean;
  is_order_voucher: boolean;
}

const mockNonAccountingEntries: NonAccountingEntry[] = [
  {
    guid: "1",
    date: "2025-01-15",
    voucher_type: "Memo",
    voucher_number: "MEMO-001",
    narration: "Internal memo for stock adjustment",
    party_name: "",
    reference_number: "REF-001",
    reference_date: "2025-01-15",
    is_invoice: false,
    is_order_voucher: false
  },
  {
    guid: "2",
    date: "2025-01-14",
    voucher_type: "Contra",
    voucher_number: "CONTRA-001",
    narration: "Transfer between bank accounts",
    party_name: "",
    reference_number: "CHQ-123456",
    reference_date: "2025-01-14",
    is_invoice: false,
    is_order_voucher: false
  },
  {
    guid: "3",
    date: "2025-01-13",
    voucher_type: "Order",
    voucher_number: "ORD-001",
    narration: "Purchase order for raw materials",
    party_name: "Steel Supplier Ltd",
    reference_number: "PO-2025-001",
    reference_date: "2025-01-13",
    is_invoice: false,
    is_order_voucher: true
  },
  {
    guid: "4",
    date: "2025-01-12",
    voucher_type: "Rejections In",
    voucher_number: "REJ-001",
    narration: "Return of defective goods",
    party_name: "LSI-MECH ENGINEERS PRIVATE LIMITED",
    reference_number: "RET-001",
    reference_date: "2025-01-12",
    is_invoice: false,
    is_order_voucher: false
  }
];

export default function NonAccountingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [nonAccountingEntries] = useState<NonAccountingEntry[]>(mockNonAccountingEntries);

  const filteredEntries = nonAccountingEntries.filter(entry =>
    entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVoucherTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'memo':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'contra':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'order':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'rejections in':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Non-Accounting Transactions</h1>
          <p className="text-muted-foreground">
            View and manage non-accounting vouchers and reference documents
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Non-Accounting Entries</CardTitle>
          <CardDescription>
            Reference vouchers, memos, orders, and other non-accounting transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search non-accounting entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="memo">Memo</TabsTrigger>
              <TabsTrigger value="contra">Contra</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="rejections">Rejections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher Type</TableHead>
                    <TableHead>Voucher Number</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
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
                        <span className="text-sm">
                          {entry.party_name || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {entry.reference_number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.reference_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.is_invoice && (
                            <Badge variant="default" className="text-xs">Invoice</Badge>
                          )}
                          {entry.is_order_voucher && (
                            <Badge variant="secondary" className="text-xs">Order</Badge>
                          )}
                          {!entry.is_invoice && !entry.is_order_voucher && (
                            <Badge variant="outline" className="text-xs">Reference</Badge>
                          )}
                        </div>
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
