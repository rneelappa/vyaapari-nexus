import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  RefreshCw, 
  Package, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Activity,
  Network,
  Eye,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tallyApi, type Voucher, type ApiResponse } from '@/services/tallyApiService';

interface InventoryTransaction {
  id: string;
  voucherId: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  stockItemName: string;
  godownName: string;
  quantity: number;
  rate: number;
  amount: number;
  movementType: 'in' | 'out' | 'transfer';
  partyName: string;
  batchInfo?: {
    batchName: string;
    expiryDate: string;
    mrp: number;
  };
}

interface StockSummary {
  stockItemName: string;
  category: string;
  currentStock: number;
  stockValue: number;
  lastMovement: string;
  movementCount: number;
  averageRate: number;
}

interface InventoryPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function InventoryPageEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: InventoryPageEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [stockSummaries, setStockSummaries] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null);
  const [viewMode, setViewMode] = useState<'transactions' | 'summary' | 'movements' | 'godowns'>('transactions');
  const [stockItemFilter, setStockItemFilter] = useState('');
  const [godownFilter, setGodownFilter] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'in' | 'out' | 'transfer'>('all');
  
  const { toast } = useToast();

  useEffect(() => {
    loadInventoryData();
  }, [companyId, divisionId, dateRange]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Loading inventory data from API...', { fromDate, toDate });
      
      // Load enhanced vouchers to extract inventory transactions
      const vouchersResponse = await tallyApi.getEnhancedVouchers(companyId, divisionId, {
        fromDate,
        toDate,
        limit: 100
      });

      if (!vouchersResponse.success) {
        throw new Error(vouchersResponse.error || 'Failed to load vouchers');
      }

      // Extract inventory transactions from vouchers
      const transactions: InventoryTransaction[] = [];
      const stockMap = new Map<string, StockSummary>();

      vouchersResponse.data.forEach(voucher => {
        voucher.inventoryEntries?.forEach((entry, index) => {
          const transaction: InventoryTransaction = {
            id: `${voucher.id}-${index}`,
            voucherId: voucher.id,
            voucherNumber: voucher.number,
            voucherType: voucher.type,
            date: voucher.date,
            stockItemName: entry.stockItemName,
            godownName: entry.godownName || 'Main',
            quantity: entry.actualQuantity,
            rate: entry.rate,
            amount: entry.amount,
            movementType: voucher.type.toLowerCase().includes('sales') ? 'out' : 
                         voucher.type.toLowerCase().includes('purchase') ? 'in' : 'transfer',
            partyName: voucher.partyLedgerName
          };
          
          transactions.push(transaction);

          // Build stock summary
          if (!stockMap.has(entry.stockItemName)) {
            stockMap.set(entry.stockItemName, {
              stockItemName: entry.stockItemName,
              category: 'General', // Would get from stock item API
              currentStock: 0,
              stockValue: 0,
              lastMovement: voucher.date,
              movementCount: 0,
              averageRate: 0
            });
          }

          const summary = stockMap.get(entry.stockItemName)!;
          summary.movementCount++;
          summary.currentStock += transaction.movementType === 'in' ? entry.actualQuantity : -entry.actualQuantity;
          summary.stockValue = summary.currentStock * entry.rate;
          summary.averageRate = (summary.averageRate + entry.rate) / 2;
          summary.lastMovement = voucher.date;
        });
      });

      setInventoryTransactions(transactions);
      setStockSummaries(Array.from(stockMap.values()));

      console.log(`Loaded ${transactions.length} inventory transactions`);

    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = inventoryTransactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.stockItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStockItem = !stockItemFilter || transaction.stockItemName === stockItemFilter;
    const matchesGodown = !godownFilter || transaction.godownName === godownFilter;
    const matchesMovementType = movementTypeFilter === 'all' || transaction.movementType === movementTypeFilter;
    
    return matchesSearch && matchesStockItem && matchesGodown && matchesMovementType;
  });

  const uniqueStockItems = [...new Set(inventoryTransactions.map(t => t.stockItemName))];
  const uniqueGodowns = [...new Set(inventoryTransactions.map(t => t.godownName))];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'out': return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'transfer': return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-32 bg-muted rounded w-full mb-4"></div>
          <div className="h-48 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Inventory Management</h1>
          <p className="text-muted-foreground">
            Complete inventory transactions with movement analysis and stock tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadInventoryData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <select
              value={stockItemFilter}
              onChange={(e) => setStockItemFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Stock Items</option>
              {uniqueStockItems.slice(0, 10).map(item => (
                <option key={item} value={item}>{item.substring(0, 30)}...</option>
              ))}
            </select>

            <select
              value={godownFilter}
              onChange={(e) => setGodownFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Godowns</option>
              {uniqueGodowns.map(godown => (
                <option key={godown} value={godown}>{godown}</option>
              ))}
            </select>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="movements">Movements</TabsTrigger>
                <TabsTrigger value="godowns">Godowns</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Data ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'transactions' && (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedTransaction?.id === transaction.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getMovementIcon(transaction.movementType)}
                            <div>
                              <div className="font-semibold">{transaction.stockItemName.substring(0, 40)}...</div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.voucherType} #{transaction.voucherNumber} | {transaction.date}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getMovementColor(transaction.movementType)}`}>
                              {transaction.movementType === 'in' ? '+' : transaction.movementType === 'out' ? '-' : '±'}
                              {transaction.quantity.toLocaleString('en-IN')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ₹{transaction.amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <span>Rate: ₹{transaction.rate.toLocaleString('en-IN')}</span>
                          <span>Godown: {transaction.godownName}</span>
                          <span>Party: {transaction.partyName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'summary' && (
                  <div className="space-y-3">
                    {stockSummaries.map((summary, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold">{summary.stockItemName.substring(0, 40)}...</span>
                          </div>
                          <Badge variant={summary.currentStock > 0 ? 'default' : 'secondary'}>
                            {summary.currentStock.toLocaleString('en-IN')} units
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Stock Value:</span>
                            <div className="font-semibold">₹{summary.stockValue.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Rate:</span>
                            <div className="font-semibold">₹{summary.averageRate.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Movements:</span>
                            <div className="font-semibold">{summary.movementCount}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'movements' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Stock Movement Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Inventory movement patterns and trends
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <ArrowDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-green-600">
                          {inventoryTransactions.filter(t => t.movementType === 'in').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Stock In</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <ArrowUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-red-600">
                          {inventoryTransactions.filter(t => t.movementType === 'out').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Stock Out</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <ArrowUpDown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-blue-600">
                          {inventoryTransactions.filter(t => t.movementType === 'transfer').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Transfers</div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'godowns' && (
                  <div className="space-y-4">
                    {uniqueGodowns.map(godown => {
                      const godownTransactions = filteredTransactions.filter(t => t.godownName === godown);
                      const godownValue = godownTransactions.reduce((sum, t) => sum + t.amount, 0);
                      
                      return (
                        <div key={godown} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Warehouse className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{godown}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{godownTransactions.length} transactions</Badge>
                              <Badge variant="secondary">₹{godownValue.toLocaleString('en-IN')}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Recent activity: {godownTransactions.length > 0 ? godownTransactions[0].date : 'No activity'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTransaction ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTransaction.stockItemName.substring(0, 30)}...</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransaction.voucherType} #{selectedTransaction.voucherNumber}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-semibold">{selectedTransaction.date}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Movement:</span>
                        <div className={`font-semibold ${getMovementColor(selectedTransaction.movementType)}`}>
                          {selectedTransaction.movementType.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <div className="font-semibold">{selectedTransaction.quantity.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <div className="font-semibold">₹{selectedTransaction.rate.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-semibold">₹{selectedTransaction.amount.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Godown:</span>
                        <div className="font-semibold">{selectedTransaction.godownName}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Party Information</div>
                      <div className="font-semibold">{selectedTransaction.partyName}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Voucher
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Network className="h-4 w-4 mr-2" />
                      Stock Item Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Movement History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a transaction to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Statistics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Inventory Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Transactions:</span>
                  <Badge variant="outline">{inventoryTransactions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stock Items:</span>
                  <Badge variant="outline">{uniqueStockItems.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Godowns:</span>
                  <Badge variant="outline">{uniqueGodowns.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Value:</span>
                  <Badge variant="default">
                    ₹{inventoryTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stock In:</span>
                  <Badge variant="default" className="bg-green-600">
                    {inventoryTransactions.filter(t => t.movementType === 'in').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stock Out:</span>
                  <Badge variant="destructive">
                    {inventoryTransactions.filter(t => t.movementType === 'out').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InventoryPageEnhanced;
