import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Package, Scale, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StockItem {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  part_number: string;
  uom: string;
  opening_balance: number;
  closing_balance: number;
  opening_rate: number;
  closing_rate: number;
  opening_value: number;
  closing_value: number;
  gst_hsn_code: string;
  gst_rate: number;
  costing_method: string;
}

const mockStockItems: StockItem[] = [
  {
    guid: "1",
    name: "Steel Rod 12mm",
    parent: "Raw Materials",
    alias: "STEEL-12MM",
    part_number: "SR-12-001",
    uom: "KG",
    opening_balance: 1000,
    closing_balance: 750,
    opening_rate: 65.50,
    closing_rate: 68.00,
    opening_value: 65500,
    closing_value: 51000,
    gst_hsn_code: "7214",
    gst_rate: 18,
    costing_method: "FIFO"
  },
  {
    guid: "2",
    name: "Finished Product A",
    parent: "Finished Goods",
    alias: "FP-A",
    part_number: "FP-A-001",
    uom: "NOS",
    opening_balance: 50,
    closing_balance: 25,
    opening_rate: 250.00,
    closing_rate: 275.00,
    opening_value: 12500,
    closing_value: 6875,
    gst_hsn_code: "8473",
    gst_rate: 18,
    costing_method: "Weighted Average"
  },
  {
    guid: "3",
    name: "Packaging Material",
    parent: "Consumables",
    alias: "PKG-MAT",
    part_number: "PKG-001",
    uom: "MTR",
    opening_balance: 500,
    closing_balance: 300,
    opening_rate: 15.00,
    closing_rate: 16.50,
    opening_value: 7500,
    closing_value: 4950,
    gst_hsn_code: "3923",
    gst_rate: 18,
    costing_method: "FIFO"
  }
];

export default function StockItemsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStockItems();
    }
  }, [user]);

  const fetchStockItems = async () => {
    if (!user) {
      console.log('StockItemsPage: No user authenticated, skipping data fetch');
      setLoading(false);
      setStockItems(mockStockItems);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('StockItemsPage: Fetching stock items for authenticated user:', user.id);
      const { data, error } = await supabase
        .from('mst_stock_item')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('StockItemsPage: Database error:', error);
        throw error;
      }
      
      // Transform data to match interface
      const transformedData: StockItem[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent,
        alias: item.alias,
        part_number: item.part_number,
        uom: item.uom,
        costing_method: item.costing_method || 'FIFO',
        opening_balance: item.opening_balance || 0,
        closing_balance: item.closing_balance || 0,
        opening_rate: item.opening_rate || 0,
        closing_rate: item.closing_rate || 0,
        opening_value: item.opening_value || 0,
        closing_value: item.closing_value || 0,
        gst_hsn_code: item.gst_hsn_code || '',
        gst_rate: item.gst_rate || 0,
      }));
      
      setStockItems(transformedData);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock items');
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.part_number.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view stock items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Items</h1>
          <p className="text-muted-foreground">
            Manage inventory items, their specifications and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStockItems} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Stock items with quantities, rates, and GST information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="raw">Raw Materials</TabsTrigger>
              <TabsTrigger value="finished">Finished Goods</TabsTrigger>
              <TabsTrigger value="consumables">Consumables</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Stock Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>GST %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockItems.map((item) => (
                    <TableRow key={item.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{item.name}</div>
                            {item.alias && (
                              <div className="text-sm text-muted-foreground">
                                Alias: {item.alias}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.parent}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.part_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Scale className="h-3 w-3 text-muted-foreground" />
                          <span>{item.uom}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatNumber(item.closing_balance, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Opening: {formatNumber(item.opening_balance, 0)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(item.closing_rate)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Opening: {formatCurrency(item.opening_rate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(item.closing_value)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Opening: {formatCurrency(item.opening_value)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.gst_hsn_code ? (
                          <Badge variant="secondary">{item.gst_hsn_code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.gst_rate}%</Badge>
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
