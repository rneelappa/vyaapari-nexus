import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Package, Warehouse, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";

interface InventoryEntry {
  guid: string;
  date: string;
  voucher_type: string;
  voucher_number: string;
  item: string;
  quantity: number;
  rate: number;
  amount: number;
  godown: string;
  tracking_number: string;
  order_number: string;
  order_duedate: string;
}

const mockInventoryEntries: InventoryEntry[] = [
  {
    guid: "1",
    date: "2025-01-15",
    voucher_type: "Sales",
    voucher_number: "2800236/25-26",
    item: "Finished Product A",
    quantity: -10,
    rate: 15000,
    amount: -150000,
    godown: "Finished Goods Store",
    tracking_number: "TRK-001",
    order_number: "SO-2025-001",
    order_duedate: "2025-01-20"
  },
  {
    guid: "2",
    date: "2025-01-14",
    voucher_type: "Purchase",
    voucher_number: "2800235/25-26",
    item: "Steel Rod 12mm",
    quantity: 1000,
    rate: 65.50,
    amount: 65500,
    godown: "Raw Material Store",
    tracking_number: "TRK-002",
    order_number: "PO-2025-001",
    order_duedate: "2025-01-15"
  },
  {
    guid: "3",
    date: "2025-01-13",
    voucher_type: "Stock Journal",
    voucher_number: "SJ-001",
    item: "Packaging Material",
    quantity: -50,
    rate: 15.00,
    amount: -750,
    godown: "Main Warehouse",
    tracking_number: "TRK-003",
    order_number: "",
    order_duedate: ""
  },
  {
    guid: "3",
    date: "2025-01-13",
    voucher_type: "Stock Journal",
    voucher_number: "SJ-001",
    item: "Packaging Material",
    quantity: 50,
    rate: 15.00,
    amount: 750,
    godown: "Finished Goods Store",
    tracking_number: "TRK-003",
    order_number: "",
    order_duedate: ""
  }
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryEntries] = useState<InventoryEntry[]>(mockInventoryEntries);

  const filteredEntries = inventoryEntries.filter(entry =>
    entry.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.godown.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getMovementIcon = (quantity: number) => {
    return quantity >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getMovementBadge = (quantity: number) => {
    return quantity >= 0 ? (
      <Badge variant="default">In</Badge>
    ) : (
      <Badge variant="secondary">Out</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Transactions</h1>
          <p className="text-muted-foreground">
            View and manage stock movement transactions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Entries</CardTitle>
          <CardDescription>
            Inventory transactions showing stock in/out movements with quantities and values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Movements</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="stock-journal">Stock Journal</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Movement</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Godown</TableHead>
                    <TableHead>Tracking</TableHead>
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
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {entry.item}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getMovementIcon(entry.quantity)}
                          {getMovementBadge(entry.quantity)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          entry.quantity >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatNumber(Math.abs(entry.quantity), 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {formatCurrency(entry.rate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          entry.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(entry.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Warehouse className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{entry.godown}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.tracking_number && (
                            <div className="text-sm font-medium">
                              {entry.tracking_number}
                            </div>
                          )}
                          {entry.order_number && (
                            <div className="text-xs text-muted-foreground">
                              Order: {entry.order_number}
                            </div>
                          )}
                          {entry.order_duedate && (
                            <div className="text-xs text-muted-foreground">
                              Due: {new Date(entry.order_duedate).toLocaleDateString()}
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
