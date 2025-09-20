import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Package, Warehouse, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useApiInventoryEntries } from "@/hooks/useApiInventoryEntries";


export default function InventoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { inventoryEntries, loading, error, refresh } = useApiInventoryEntries();

  const filteredEntries = inventoryEntries.filter(entry =>
    entry.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.godown && entry.godown.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.tracking_number && entry.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getMovementIcon = (quantity: number) => {
    return quantity >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getMovementBadge = (quantity: number) => {
    return quantity >= 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">In</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Out</Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view inventory transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Transactions</h1>
          <p className="text-muted-foreground">
            Track stock movements, batch allocations, and inventory transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
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
          <CardTitle>Inventory Movements</CardTitle>
          <CardDescription>
            Batch-wise inventory transactions and stock transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Movements</TabsTrigger>
              <TabsTrigger value="inward">Inward</TabsTrigger>
              <TabsTrigger value="outward">Outward</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={refresh} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Batch Name</TableHead>
                        <TableHead>Movement</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>From Godown</TableHead>
                        <TableHead>To Godown</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No inventory transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                {entry.item}
                              </div>
                            </TableCell>
                            <TableCell>{entry.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getMovementIcon(entry.quantity)}
                                {getMovementBadge(entry.quantity)}
                              </div>
                            </TableCell>
                            <TableCell className={`font-medium ${entry.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatNumber(Math.abs(entry.quantity), 3)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(entry.amount)}
                            </TableCell>
                            <TableCell>
                              {entry.godown ? (
                                <div className="flex items-center space-x-1">
                                  <Warehouse className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{entry.godown}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {entry.destination_godown ? (
                                <div className="flex items-center space-x-1">
                                  <Warehouse className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{entry.destination_godown}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {entry.tracking_number ? (
                                <Badge variant="outline" className="text-xs">
                                  {entry.tracking_number}
                                </Badge>
                              ) : '-'}
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