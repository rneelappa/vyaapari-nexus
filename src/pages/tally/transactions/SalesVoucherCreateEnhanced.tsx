import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Minus, 
  Save, 
  Calendar as CalendarIcon,
  FileText,
  Users,
  Calculator,
  Package,
  Trash2,
  Target,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Network,
  TreePine
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tallyApi, type Ledger, type StockItem, type VoucherType, type ApiResponse } from '@/services/tallyApiService';

interface LedgerEntry {
  id: string;
  ledgerName: string;
  amount: number;
  isDebit: boolean;
  ledgerHierarchy?: {
    fullPath: string;
    parent: string;
  };
}

interface InventoryEntry {
  id: string;
  stockItemName: string;
  quantity: number;
  rate: number;
  amount: number;
  godownName: string;
  stockItemHierarchy?: {
    fullPath: string;
    category: string;
  };
}

interface SalesVoucherCreateEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function SalesVoucherCreateEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: SalesVoucherCreateEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  const navigate = useNavigate();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  // Voucher basic info
  const [voucherDate, setVoucherDate] = useState<Date>(new Date());
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedgerName, setPartyLedgerName] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');
  
  // Entries
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  
  // Available data for selection
  const [availableLedgers, setAvailableLedgers] = useState<Ledger[]>([]);
  const [availableStockItems, setAvailableStockItems] = useState<StockItem[]>([]);
  const [availableVoucherTypes, setAvailableVoucherTypes] = useState<VoucherType[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLedgerSelector, setShowLedgerSelector] = useState(false);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [searchLedger, setSearchLedger] = useState('');
  const [searchStock, setSearchStock] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadMasterData();
  }, [companyId, divisionId]);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading master data for voucher creation...');
      
      // Load all master data needed for voucher creation
      const [ledgersResponse, stockItemsResponse, voucherTypesResponse] = await Promise.all([
        tallyApi.getLedgers(companyId, divisionId, { limit: 200 }),
        tallyApi.getStockItems(companyId, divisionId, { limit: 200 }),
        tallyApi.getVoucherTypes(companyId, divisionId, { affects_stock: 'true' })
      ]);

      if (ledgersResponse.success) {
        setAvailableLedgers(ledgersResponse.data);
      }

      if (stockItemsResponse.success) {
        setAvailableStockItems(stockItemsResponse.data);
      }

      if (voucherTypesResponse.success) {
        setAvailableVoucherTypes(voucherTypesResponse.data);
      }

      console.log('Master data loaded successfully');

    } catch (error) {
      console.error('Failed to load master data:', error);
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLedgerEntry = (ledger: Ledger) => {
    const newEntry: LedgerEntry = {
      id: Date.now().toString(),
      ledgerName: ledger.name,
      amount: 0,
      isDebit: false,
      ledgerHierarchy: {
        fullPath: `${ledger.parent} → ${ledger.name}`,
        parent: ledger.parent
      }
    };
    setLedgerEntries(prev => [...prev, newEntry]);
    setShowLedgerSelector(false);
  };

  const addInventoryEntry = (stockItem: StockItem) => {
    const newEntry: InventoryEntry = {
      id: Date.now().toString(),
      stockItemName: stockItem.name,
      quantity: 1,
      rate: stockItem.closing_rate,
      amount: stockItem.closing_rate,
      godownName: 'Main',
      stockItemHierarchy: {
        fullPath: `${stockItem.parent} → ${stockItem.name}`,
        category: stockItem.category
      }
    };
    setInventoryEntries(prev => [...prev, newEntry]);
    setShowStockSelector(false);
  };

  const updateLedgerEntry = (id: string, field: keyof LedgerEntry, value: any) => {
    setLedgerEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const updateInventoryEntry = (id: string, field: keyof InventoryEntry, value: any) => {
    setInventoryEntries(prev => 
      prev.map(entry => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          // Recalculate amount if quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return entry;
      })
    );
  };

  const removeLedgerEntry = (id: string) => {
    setLedgerEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const removeInventoryEntry = (id: string) => {
    setInventoryEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const calculateTotalAmount = () => {
    return ledgerEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  };

  const validateVoucher = () => {
    if (!partyLedgerName) return 'Party ledger is required';
    if (ledgerEntries.length < 2) return 'At least 2 ledger entries are required';
    
    const totalDebits = ledgerEntries.filter(e => e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalCredits = ledgerEntries.filter(e => !e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return 'Debits and credits must be equal';
    }
    
    return null;
  };

  const saveVoucher = async () => {
    const validationError = validateVoucher();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const voucherData = {
        voucherType: 'Sales',
        date: format(voucherDate, 'yyyyMMdd'),
        voucherNumber: voucherNumber || undefined,
        partyLedgerName,
        narration,
        reference,
        entries: ledgerEntries.map(entry => ({
          ledgerName: entry.ledgerName,
          amount: entry.amount,
          isDebit: entry.isDebit
        }))
      };

      console.log('Creating voucher...', voucherData);

      const response = await tallyApi.createVoucher(companyId, divisionId, voucherData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create voucher');
      }

      toast({
        title: "Voucher Created",
        description: `Sales voucher ${response.data.voucherNumber} created successfully`,
      });

      // Reset form
      setVoucherNumber('');
      setPartyLedgerName('');
      setNarration('');
      setReference('');
      setLedgerEntries([]);
      setInventoryEntries([]);

      // Navigate back or refresh
      navigate('/tally/transactions/voucher-management');

    } catch (error) {
      console.error('Failed to create voucher:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create voucher",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredLedgers = availableLedgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchLedger.toLowerCase())
  );

  const filteredStockItems = availableStockItems.filter(item =>
    item.name.toLowerCase().includes(searchStock.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold">Create Sales Voucher</h1>
          <p className="text-muted-foreground">
            Enhanced voucher creation with API integration and real-time validation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={saveVoucher} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Creating...' : 'Create Voucher'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voucher Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Voucher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(voucherDate, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={voucherDate}
                        onSelect={(date) => date && setVoucherDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="number">Voucher Number (Optional)</Label>
                  <Input
                    id="number"
                    placeholder="Auto-generated if empty"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="party">Party Ledger Name *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="party"
                    placeholder="Select party ledger..."
                    value={partyLedgerName}
                    onChange={(e) => setPartyLedgerName(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => setShowLedgerSelector(true)}>
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Reference number..."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="narration">Narration</Label>
                  <Input
                    id="narration"
                    placeholder="Voucher narration..."
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Entries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Accounting Entries ({ledgerEntries.length})
                </CardTitle>
                <Button size="sm" onClick={() => setShowLedgerSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ledgerEntries.map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Ledger</Label>
                        <div className="font-semibold">{entry.ledgerName}</div>
                        {entry.ledgerHierarchy && (
                          <div className="text-xs text-muted-foreground font-mono">
                            <TreePine className="h-3 w-3 inline mr-1" />
                            {entry.ledgerHierarchy.fullPath}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          value={entry.amount}
                          onChange={(e) => updateLedgerEntry(entry.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select
                          value={entry.isDebit ? 'debit' : 'credit'}
                          onChange={(e) => updateLedgerEntry(entry.id, 'isDebit', e.target.value === 'debit')}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="debit">Debit</option>
                          <option value="credit">Credit</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeLedgerEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {ledgerEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No accounting entries added</p>
                    <p className="text-sm">Add at least 2 entries for a valid voucher</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Entries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Inventory Entries ({inventoryEntries.length})
                </CardTitle>
                <Button size="sm" onClick={() => setShowStockSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryEntries.map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Stock Item</Label>
                        <div className="font-semibold">{entry.stockItemName}</div>
                        {entry.stockItemHierarchy && (
                          <div className="text-xs text-muted-foreground font-mono">
                            <TreePine className="h-3 w-3 inline mr-1" />
                            {entry.stockItemHierarchy.fullPath}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => updateInventoryEntry(entry.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rate</Label>
                        <Input
                          type="number"
                          value={entry.rate}
                          onChange={(e) => updateInventoryEntry(entry.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <div className="p-2 bg-muted rounded text-sm font-semibold">
                          ₹{entry.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeInventoryEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {inventoryEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inventory entries added</p>
                    <p className="text-sm">Add inventory items for sales transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Voucher Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{calculateTotalAmount().toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Ledger Entries:</span>
                    <Badge variant="outline">{ledgerEntries.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inventory Items:</span>
                    <Badge variant="outline">{inventoryEntries.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Debits:</span>
                    <span className="font-semibold text-red-600">
                      ₹{ledgerEntries.filter(e => e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Credits:</span>
                    <span className="font-semibold text-green-600">
                      ₹{ledgerEntries.filter(e => !e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Validation Status */}
                <div className="space-y-2">
                  {validateVoucher() ? (
                    <div className="flex items-center p-2 border border-red-200 rounded bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-600">{validateVoucher()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center p-2 border border-green-200 rounded bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-600">Voucher is valid</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Data Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Available Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Available Ledgers:</span>
                  <Badge variant="outline">{availableLedgers.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Available Stock Items:</span>
                  <Badge variant="outline">{availableStockItems.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Voucher Types:</span>
                  <Badge variant="outline">{availableVoucherTypes.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ledger Selector Dialog */}
      {showLedgerSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select Ledger</h2>
                <Button variant="outline" onClick={() => setShowLedgerSelector(false)}>
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Search ledgers..."
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                />
                
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredLedgers.map(ledger => (
                      <div
                        key={ledger.guid}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => addLedgerEntry(ledger)}
                      >
                        <div>
                          <div className="font-semibold">{ledger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Parent: {ledger.parent}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            ₹{ledger.closing_balance.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-muted-foreground">Balance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Item Selector Dialog */}
      {showStockSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select Stock Item</h2>
                <Button variant="outline" onClick={() => setShowStockSelector(false)}>
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Search stock items..."
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                />
                
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredStockItems.map(item => (
                      <div
                        key={item.guid}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => addInventoryEntry(item)}
                      >
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Category: {item.category} | Unit: {item.base_unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            ₹{item.closing_rate.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-muted-foreground">Rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesVoucherCreateEnhanced;
