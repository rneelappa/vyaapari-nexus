/**
 * Sales Voucher Creation Page
 * Creates sales vouchers with party account, sales account, inventory items, and delivery tracking
 * Ensures debit equals credit for balanced vouchers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface VoucherLine {
  id: string;
  type: 'party' | 'sales' | 'inventory' | 'ledger';
  ledger?: string;
  stockItem?: string;
  godown?: string;
  quantity?: number;
  rate?: number;
  amount: number;
  debit: number;
  credit: number;
  narration?: string;
  trackingNumber?: string;
}

interface LedgerOption {
  guid: string;
  name: string;
  parent: string;
  closing_balance: number;
  is_deemedpositive: number;
}

interface StockItemOption {
  guid: string;
  name: string;
  parent: string;
  uom: string;
  closing_rate: number;
  closing_balance: number;
}

interface GodownOption {
  guid: string;
  name: string;
  parent: string;
  address: string;
}

export default function SalesVoucherCreate() {
  const { toast } = useToast();
  
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedger, setPartyLedger] = useState('');
  const [salesLedger, setSalesLedger] = useState('');
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<VoucherLine[]>([]);
  
  // Data state
  const [ledgers, setLedgers] = useState<LedgerOption[]>([]);
  const [stockItems, setStockItems] = useState<StockItemOption[]>([]);
  const [godowns, setGodowns] = useState<GodownOption[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<any[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load master data
  useEffect(() => {
    loadMasterData();
    generateVoucherNumber();
  }, []);

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      // Load ledgers (party and sales accounts)
      const { data: ledgerData } = await supabase
        .from('mst_ledger')
        .select('guid, name, parent, closing_balance, is_deemedpositive')
        .order('name');
      
      if (ledgerData) setLedgers(ledgerData);

      // Load stock items
      const { data: stockData } = await supabase
        .from('mst_stock_item')
        .select('guid, name, parent, uom, closing_rate, closing_balance')
        .order('name');
      
      if (stockData) setStockItems(stockData);

      // Load godowns
      const { data: godownData } = await supabase
        .from('mst_godown')
        .select('guid, name, parent, address')
        .order('name');
      
      if (godownData) setGodowns(godownData);

      // Load voucher types
      const { data: voucherTypeData } = await supabase
        .from('mst_vouchertype')
        .select('guid, name, parent')
        .eq('parent', 'Sales')
        .order('name');
      
      if (voucherTypeData) setVoucherTypes(voucherTypeData);

    } catch (error) {
      console.error('Error loading master data:', error);
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateVoucherNumber = async () => {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get last voucher number for current period
      const { data } = await supabase
        .from('trn_voucher')
        .select('voucher_number')
        .like('voucher_number', `%/${year}%`)
        .order('voucher_number', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].voucher_number;
        const numberPart = lastNumber.split('/')[0];
        nextNumber = parseInt(numberPart) + 1;
      }

      setVoucherNumber(`${String(nextNumber).padStart(4, '0')}/${month}${year.toString().slice(-2)}`);
    } catch (error) {
      console.error('Error generating voucher number:', error);
    }
  };

  const addInventoryLine = () => {
    const newLine: VoucherLine = {
      id: Date.now().toString(),
      type: 'inventory',
      quantity: 1,
      rate: 0,
      amount: 0,
      debit: 0,
      credit: 0
    };
    setLines([...lines, newLine]);
  };

  const addLedgerLine = () => {
    const newLine: VoucherLine = {
      id: Date.now().toString() + '-ledger',
      type: 'ledger',
      amount: 0,
      debit: 0,
      credit: 0
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<VoucherLine>) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, ...updates };
        
        // Calculate amount for inventory lines
        if (updatedLine.type === 'inventory' && updatedLine.quantity && updatedLine.rate) {
          updatedLine.amount = updatedLine.quantity * updatedLine.rate;
          updatedLine.credit = updatedLine.amount; // Sales inventory credited
          updatedLine.debit = 0; // No debit for inventory lines in sales
        }
        
        // Handle ledger line calculations
        if (updatedLine.type === 'ledger' && updatedLine.amount) {
          // For sales voucher: most additional charges are debited (increase receivable)
          // GST accounts are usually credited (tax liability)
          const isGstAccount = updatedLine.ledger?.includes('GST');
          if (isGstAccount) {
            updatedLine.credit = Math.abs(updatedLine.amount);
            updatedLine.debit = 0;
          } else {
            // Other charges like cutting, loading etc. are usually debited 
            updatedLine.debit = Math.abs(updatedLine.amount);
            updatedLine.credit = 0;
          }
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const calculateTotals = () => {
    const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0);
    const inventoryTotal = lines.filter(l => l.type === 'inventory').reduce((sum, line) => sum + line.amount, 0);
    const ledgerTotal = lines.filter(l => l.type === 'ledger').reduce((sum, line) => sum + line.amount, 0);
    
    // For sales voucher: Party account is debited (including additional charges), Sales account + taxes are credited
    const totalDebit = inventoryTotal + lines.filter(l => l.type === 'ledger' && l.debit > 0).reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = inventoryTotal + lines.filter(l => l.type === 'ledger' && l.credit > 0).reduce((sum, line) => sum + line.credit, 0);
    
    return { totalDebit, totalCredit, totalAmount: inventoryTotal + ledgerTotal };
  };

  const { totalDebit, totalCredit, totalAmount } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const saveVoucher = async () => {
    if (!partyLedger || !salesLedger || lines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and add at least one line item",
        variant: "destructive",
      });
      return;
    }

    if (!isBalanced) {
      toast({
        title: "Validation Error", 
        description: "Debit and Credit amounts must be equal",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get current company and division from the authenticated user's profile or use first available
      const { data: companies } = await supabase.from('companies').select('id').limit(1);
      const { data: divisions } = await supabase.from('divisions').select('id').limit(1);
      
      const companyId = companies?.[0]?.id || 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1';
      const divisionId = divisions?.[0]?.id || 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4';

      // Insert main voucher with all required fields
      const voucherGuid = `voucher-${Date.now()}`;
      const { data: voucherData, error: voucherError } = await supabase
        .from('trn_voucher')
        .insert({
          guid: voucherGuid,
          voucher_number: voucherNumber,
          date: format(date, 'yyyy-MM-dd'),
          narration: narration || '',
          voucher_type: 'SALES',
          _voucher_type: 'SALES',
          party_name: ledgers.find(l => l.guid === partyLedger)?.name || '',
          _party_name: ledgers.find(l => l.guid === partyLedger)?.name || '',
          place_of_supply: 'Local',
          reference_number: '',
          is_invoice: 1,
          is_accounting_voucher: 1,
          is_inventory_voucher: 1,
          is_order_voucher: 0,
          company_id: companyId,
          division_id: divisionId
        })
        .select()
        .single();

      if (voucherError) {
        console.error('Voucher error:', voucherError);
        throw voucherError;
      }

      // Insert accounting entries
      const accountingEntries = [
        // Party ledger - Debit (total amount including all charges)
        {
          guid: voucherGuid,
          ledger: ledgers.find(l => l.guid === partyLedger)?.name || '',
          _ledger: ledgers.find(l => l.guid === partyLedger)?.name || '',
          amount: totalAmount, // Total including inventory + additional charges
          amount_forex: totalAmount,
          currency: '₹',
          company_id: companyId,
          division_id: divisionId
        },
        // Sales ledger - Credit (inventory value only)
        {
          guid: voucherGuid,
          ledger: ledgers.find(l => l.guid === salesLedger)?.name || '',
          _ledger: ledgers.find(l => l.guid === salesLedger)?.name || '',
          amount: -lines.filter(l => l.type === 'inventory').reduce((sum, line) => sum + line.amount, 0), // Negative for credit
          amount_forex: -lines.filter(l => l.type === 'inventory').reduce((sum, line) => sum + line.amount, 0),
          currency: '₹',
          company_id: companyId,
          division_id: divisionId
        }
      ];

      // Add ledger entries (taxes, charges, etc.)
      lines.filter(l => l.type === 'ledger' && l.ledger && l.amount > 0).forEach(line => {
        accountingEntries.push({
          guid: voucherGuid,
          ledger: line.ledger,
          _ledger: line.ledger,
          amount: line.credit > 0 ? -line.amount : line.amount, // Negative if credit, positive if debit
          amount_forex: line.credit > 0 ? -line.amount : line.amount,
          currency: '₹',
          company_id: companyId,
          division_id: divisionId
        });
      });

      const { error: accountingError } = await supabase
        .from('trn_accounting')
        .insert(accountingEntries);

      if (accountingError) {
        console.error('Accounting error:', accountingError);
        throw accountingError;
      }

      // Insert inventory entries
      for (const line of lines.filter(l => l.type === 'inventory')) {
        if (line.stockItem && line.quantity && line.rate) {
          const { error: inventoryError } = await supabase
            .from('trn_inventory')
            .insert({
              guid: voucherGuid,
              item: stockItems.find(s => s.guid === line.stockItem)?.name || '',
              _item: stockItems.find(s => s.guid === line.stockItem)?.name || '',
              godown: godowns.find(g => g.guid === line.godown)?.name || '',
              _godown: godowns.find(g => g.guid === line.godown)?.name || '',
              quantity: -line.quantity, // Negative for outward sale
              rate: line.rate,
              amount: line.amount,
              additional_amount: 0,
              discount_amount: 0,
              company_id: companyId,
              division_id: divisionId
            });

          if (inventoryError) {
            console.error('Inventory error:', inventoryError);
            throw inventoryError;
          }

          // Insert batch tracking if tracking number provided
          if (line.trackingNumber) {
            await supabase
              .from('trn_batch')
              .insert({
                guid: voucherGuid,
                name: line.trackingNumber,
                item: stockItems.find(s => s.guid === line.stockItem)?.name || '',
                _item: stockItems.find(s => s.guid === line.stockItem)?.name || '',
                godown: godowns.find(g => g.guid === line.godown)?.name || '',
                _godown: godowns.find(g => g.guid === line.godown)?.name || '',
                quantity: -line.quantity,
                amount: line.amount,
                tracking_number: line.trackingNumber,
                company_id: companyId,
                division_id: divisionId
              });
          }
        }
      }

      toast({
        title: "Success",
        description: `Sales voucher ${voucherNumber} created successfully`,
      });

      // Reset form
      setLines([]);
      setPartyLedger('');
      setSalesLedger('');
      setNarration('');
      generateVoucherNumber();

    } catch (error) {
      console.error('Error saving voucher:', error);
      toast({
        title: "Error",
        description: `Failed to save Voucher (SALES): ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPartyLedgers = () => ledgers.filter(l => 
    l.parent?.toLowerCase().includes('sundry debtor') || 
    l.parent?.toLowerCase().includes('customer') ||
    l.parent?.toLowerCase().includes('party')
  );

  const getSalesLedgers = () => ledgers.filter(l => 
    l.parent?.toLowerCase().includes('sales') ||
    l.parent?.toLowerCase().includes('income') ||
    l.parent?.toLowerCase().includes('revenue')
  );

  const getChargesAndTaxLedgers = () => ledgers.filter(l => 
    l.name.includes('GST') || 
    l.name.includes('CHARGES') || 
    l.name.includes('Duties') ||
    l.parent.includes('Duties') ||
    l.parent.includes('Sales') ||
    l.parent.includes('Expenses') ||
    l.parent.includes('Finance Cost')
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Sales Voucher</h1>
          <p className="text-muted-foreground">
            Create sales vouchers with party accounts, inventory items, and delivery tracking
          </p>
        </div>
        <Button
          onClick={saveVoucher}
          disabled={isSaving || isLoading || !isBalanced}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Voucher'}
        </Button>
      </div>

      {/* Balance Status */}
      <Alert className={isBalanced ? 'border-green-500' : 'border-red-500'}>
        {isBalanced ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              {isBalanced ? 'Voucher is balanced' : 'Debit and Credit must be equal'}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span>Debit: ₹{totalDebit.toFixed(2)}</span>
              <span>Credit: ₹{totalCredit.toFixed(2)}</span>
              <span>Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voucher Details */}
        <Card>
          <CardHeader>
            <CardTitle>Voucher Details</CardTitle>
            <CardDescription>Basic voucher information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Voucher Number</Label>
                <Input value={voucherNumber} disabled />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Party Account</Label>
              <Select value={partyLedger} onValueChange={setPartyLedger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select party account" />
                </SelectTrigger>
                <SelectContent>
                  {getPartyLedgers().map(ledger => (
                    <SelectItem key={ledger.guid} value={ledger.guid}>
                      {ledger.name} - ₹{ledger.closing_balance?.toFixed(2) || '0.00'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sales Account</Label>
              <Select value={salesLedger} onValueChange={setSalesLedger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sales account" />
                </SelectTrigger>
                <SelectContent>
                  {getSalesLedgers().map(ledger => (
                    <SelectItem key={ledger.guid} value={ledger.guid}>
                      {ledger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Narration</Label>
              <Textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter narration"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Voucher Summary</CardTitle>
            <CardDescription>Financial summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge variant={isBalanced ? 'default' : 'destructive'}>
                  {isBalanced ? 'Balanced' : 'Unbalanced'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Debit</Label>
                <div className="text-lg">₹{totalDebit.toFixed(2)}</div>
              </div>
              <div className="space-y-2">
                <Label>Total Credit</Label>
                <div className="text-lg">₹{totalCredit.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Line Items</Label>
              <div className="text-lg">{lines.length} items</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Line Items</CardTitle>
              <CardDescription>Add products with godown and delivery tracking</CardDescription>
            </div>
            <Button onClick={addInventoryLine} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.filter(l => l.type === 'inventory').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items added. Click "Add Item" to start.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock Item</TableHead>
                  <TableHead>Godown</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.filter(l => l.type === 'inventory').map(line => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select
                        value={line.stockItem || ''}
                        onValueChange={(value) => updateLine(line.id, { stockItem: value })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockItems.map(item => (
                            <SelectItem key={item.guid} value={item.guid}>
                              {item.name} ({item.uom})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.godown || ''}
                        onValueChange={(value) => updateLine(line.id, { godown: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select godown" />
                        </SelectTrigger>
                        <SelectContent>
                          {godowns.map(godown => (
                            <SelectItem key={godown.guid} value={godown.guid}>
                              {godown.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.quantity || ''}
                        onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.rate || ''}
                        onChange={(e) => updateLine(line.id, { rate: parseFloat(e.target.value) || 0 })}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{line.amount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.trackingNumber || ''}
                        onChange={(e) => updateLine(line.id, { trackingNumber: e.target.value })}
                        placeholder="Tracking #"
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Additional Ledger Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Additional Charges & Taxes</CardTitle>
              <CardDescription>Add GST, cutting charges, loading charges, and other ledger entries</CardDescription>
            </div>
            <Button onClick={addLedgerLine} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Ledger Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.filter(l => l.type === 'ledger').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No additional charges added. Click "Add Ledger Entry" to add taxes, charges, etc.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.filter(l => l.type === 'ledger').map(line => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select
                        value={line.ledger || ''}
                        onValueChange={(value) => updateLine(line.id, { ledger: value })}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select ledger account" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {/* GST Accounts */}
                          <SelectItem value="CGST">CGST (Central GST)</SelectItem>
                          <SelectItem value="SGST">SGST (State GST)</SelectItem>
                          <SelectItem value="IGST">IGST (Integrated GST)</SelectItem>
                          
                          {/* Common Charges */}
                          <SelectItem value="CUTTING CHARGES">CUTTING CHARGES</SelectItem>
                          <SelectItem value="LOADING CHARGES">LOADING CHARGES</SelectItem>
                          <SelectItem value="FREIGHT CHARGES-EXPS">FREIGHT CHARGES</SelectItem>
                          <SelectItem value="COURIER CHARGES">COURIER CHARGES</SelectItem>
                          
                          {/* Other Common Ledgers from Database */}
                          {ledgers
                            .filter(l => 
                              l.name.includes('GST') || 
                              l.name.includes('CHARGES') || 
                              l.name.includes('Duties') ||
                              l.parent.includes('Duties') ||
                              l.parent.includes('Sales') ||
                              l.parent.includes('Expenses')
                            )
                            .map(ledger => (
                              <SelectItem key={ledger.guid} value={ledger.name}>
                                {ledger.name} ({ledger.parent})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.amount || ''}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          updateLine(line.id, { amount });
                        }}
                        className="w-28"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">₹{line.debit.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">₹{line.credit.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.narration || ''}
                        onChange={(e) => updateLine(line.id, { narration: e.target.value })}
                        placeholder="Description"
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}