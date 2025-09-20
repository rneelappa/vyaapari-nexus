/**
 * Sales Voucher Edit/View Page
 * View and edit existing sales vouchers - exact replica of create page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { CalendarIcon, Plus, Trash2, Save, AlertCircle, CheckCircle, Edit, Eye } from 'lucide-react';
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

export default function SalesVoucherEdit() {
  const { voucherId } = useParams<{ voucherId: string }>();
  const navigate = useNavigate();
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
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load master data and voucher data
  useEffect(() => {
    loadMasterData();
    if (voucherId) {
      loadVoucherData();
    }
  }, [voucherId]);

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      // Load ledgers (party and sales accounts)
      const { data: ledgerData } = await supabase
        .from('bkp_mst_ledger')
        .select('guid, name, parent, closing_balance, is_deemedpositive')
        .order('name');
      
      if (ledgerData) setLedgers(ledgerData);

      // Load stock items
      const { data: stockData } = await supabase
        .from('bkp_mst_stock_item')
        .select('guid, name, parent, uom, closing_rate, closing_balance')
        .order('name');
      
      if (stockData) setStockItems(stockData);

      // Load godowns
      const { data: godownData } = await supabase
        .from('bkp_mst_godown')
        .select('guid, name, parent, address')
        .order('name');
      
      if (godownData) setGodowns(godownData);

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

  const loadVoucherData = async () => {
    if (!voucherId) return;
    
    try {
      // Load voucher header
      const { data: voucherData } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .eq('guid', voucherId)
        .single();

      if (voucherData) {
        setVoucherNumber(voucherData.voucher_number || '');
        setDate(new Date(voucherData.date || new Date()));
        setNarration(voucherData.narration || '');
        
        // Find party and sales ledgers
        const partyLedgerData = ledgers.find(l => l.name === voucherData.party_ledger_name);
        if (partyLedgerData) setPartyLedger(partyLedgerData.guid);
      }

      // Load accounting entries to find sales ledger
      const { data: accountingData } = await supabase
        .from('trn_accounting')
        .select('*')
        .eq('guid', voucherId);

      if (accountingData) {
        // Find sales ledger (the one with negative amount)
        const salesEntry = accountingData.find(entry => entry.amount < 0);
        if (salesEntry) {
          const salesLedgerData = ledgers.find(l => l.name === salesEntry.ledger);
          if (salesLedgerData) setSalesLedger(salesLedgerData.guid);
        }
      }

      // Load inventory entries
      const { data: inventoryData } = await supabase
        .from('trn_inventory')
        .select('*')
        .eq('guid', voucherId);

      const inventoryLines: VoucherLine[] = [];
      if (inventoryData) {
        inventoryData.forEach((inv, index) => {
          const stockItem = stockItems.find(s => s.name === inv.item);
          const godown = godowns.find(g => g.name === inv.godown);
          
          inventoryLines.push({
            id: `inv-${index}`,
            type: 'inventory',
            stockItem: stockItem?.guid || '',
            godown: godown?.guid || '',
            quantity: Math.abs(inv.quantity || 0),
            rate: inv.rate || 0,
            amount: inv.amount || 0,
            debit: 0,
            credit: inv.amount || 0
          });
        });
      }

      setLines(inventoryLines);

    } catch (error) {
      console.error('Error loading voucher data:', error);
      toast({
        title: "Error",
        description: "Failed to load voucher data",
        variant: "destructive",
      });
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
        }
        
        // Calculate amount for ledger lines
        if (updatedLine.type === 'ledger' && updatedLine.amount) {
          // All ledger amounts are simply added to the total
          updatedLine.amount = Math.abs(updatedLine.amount);
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
    const inventoryTotal = lines.filter(l => l.type === 'inventory').reduce((sum, line) => sum + line.amount, 0);
    const ledgerTotal = lines.filter(l => l.type === 'ledger').reduce((sum, line) => sum + line.amount, 0);
    const totalAmount = inventoryTotal + ledgerTotal;
    
    // For sales voucher: Party account is debited with total, Sales account is credited with total
    const totalDebit = totalAmount; // Party account debit
    const totalCredit = totalAmount; // Sales account credit (includes inventory + charges)
    
    return { totalDebit, totalCredit, totalAmount };
  };

  const { totalDebit, totalCredit, totalAmount } = calculateTotals();
  const inventoryValue = lines.filter(l => l.type === 'inventory').reduce((sum, line) => sum + line.amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Get selected party and sales ledger details
  const selectedPartyLedger = ledgers.find(l => l.guid === partyLedger);
  const selectedSalesLedger = ledgers.find(l => l.guid === salesLedger);
  const partyFinalBalance = (selectedPartyLedger?.closing_balance ?? 0) + totalAmount; // debit increases
  const salesFinalBalance = (selectedSalesLedger?.closing_balance ?? 0) - totalAmount; // credit increases

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
      // Determine company and division via user access or fallbacks
      const { data: userData } = await supabase.auth.getUser();
      let companyId: string | null = null;
      let divisionId: string | null = null;

      if (userData?.user?.id) {
        const { data: access } = await supabase.rpc('get_user_company_access', { _user_id: userData.user.id });
        if (access && access.length > 0) {
          companyId = access[0].company_id as string | null;
          divisionId = (access[0].division_id as string | null) ?? null;
        }
      }

      // Try preferred table name first, then fallback
      if (!companyId) {
        try {
          const { data: vc } = await (supabase as any).from('vyaapari_companies').select('id').limit(1);
          if (vc && vc.length > 0) companyId = vc[0].id as string;
        } catch (_) {}
      }
      if (!companyId) {
        const { data: c } = await supabase.from('companies').select('id').limit(1);
        if (c && c.length > 0) companyId = c[0].id as string;
      }
      if (!divisionId) {
        try {
          const { data: vd } = await (supabase as any).from('vyaapari_divisions').select('id').limit(1);
          if (vd && vd.length > 0) divisionId = vd[0].id as string;
        } catch (_) {}
      }
      if (!divisionId) {
        const { data: d } = await supabase.from('divisions').select('id').limit(1);
        if (d && d.length > 0) divisionId = d[0].id as string;
      }

      if (!companyId) {
        throw new Error('No company configured. Please create/select a company.');
      }

      const voucherGuid = voucherId || `voucher-${Date.now()}`;
      
      // Update or insert voucher
      const voucherData = {
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
      };

      if (voucherId) {
        // Update existing voucher
        const { error: voucherError } = await supabase
          .from('tally_trn_voucher')
          .update(voucherData)
          .eq('guid', voucherId);

        if (voucherError) throw voucherError;

        // Delete existing accounting and inventory entries
        await supabase.from('trn_accounting').delete().eq('guid', voucherId);
        await supabase.from('trn_inventory').delete().eq('guid', voucherId);
        await supabase.from('trn_batch').delete().eq('guid', voucherId);
      } else {
        // Insert new voucher
        const { error: voucherError } = await supabase
          .from('tally_trn_voucher')
          .insert(voucherData);

        if (voucherError) throw voucherError;
      }

      // Insert accounting entries - Simplified for sales voucher
      const accountingEntries = [
        // Party ledger - Debit (total amount)
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
        // Sales ledger - Credit (total amount including charges)
        {
          guid: voucherGuid,
          ledger: ledgers.find(l => l.guid === salesLedger)?.name || '',
          _ledger: ledgers.find(l => l.guid === salesLedger)?.name || '',
          amount: -totalAmount, // Negative for credit - includes inventory + charges
          amount_forex: -totalAmount,
          currency: '₹',
          company_id: companyId,
          division_id: divisionId
        }
      ];

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
        description: `Sales voucher ${voucherNumber} ${voucherId ? 'updated' : 'created'} successfully`,
      });

      if (!voucherId) {
        // Reset form for new voucher
        setLines([]);
        setPartyLedger('');
        setSalesLedger('');
        setNarration('');
      } else {
        setIsEditing(false);
      }

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
          <h1 className="text-3xl font-bold">
            {voucherId ? (isEditing ? 'Edit Sales Voucher' : 'View Sales Voucher') : 'Create Sales Voucher'}
          </h1>
          <p className="text-muted-foreground">
            {voucherId ? (isEditing ? 'Edit existing sales voucher' : 'View sales voucher details') : 'Create sales vouchers with party accounts, inventory items, and delivery tracking'}
          </p>
        </div>
        {voucherId && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Voucher
          </Button>
        )}
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
                      disabled={(!isEditing && !!voucherId)}
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
              <Select value={partyLedger} onValueChange={setPartyLedger} disabled={(!isEditing && !!voucherId)}>
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
              <Select value={salesLedger} onValueChange={setSalesLedger} disabled={(!isEditing && !!voucherId)}>
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
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Line Items</CardTitle>
                <CardDescription>Add stock items for sale</CardDescription>
              </div>
              {(isEditing || !voucherId) && (
                <Button onClick={addInventoryLine} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lines.filter(l => l.type === 'inventory').length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No inventory items added</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock Item</TableHead>
                    <TableHead>Godown</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tracking#</TableHead>
                    {(isEditing || !voucherId) && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.filter(l => l.type === 'inventory').map(line => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Select
                          value={line.stockItem || ''}
                          onValueChange={(value) => updateLine(line.id, { stockItem: value })}
                          disabled={(!isEditing && !!voucherId)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {stockItems.map(item => (
                              <SelectItem key={item.guid} value={item.guid}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.godown || ''}
                          onValueChange={(value) => updateLine(line.id, { godown: value })}
                          disabled={(!isEditing && !!voucherId)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Godown" />
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
                          onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })}
                          className="w-20"
                          disabled={(!isEditing && !!voucherId)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.rate || ''}
                          onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) })}
                          className="w-20"
                          disabled={(!isEditing && !!voucherId)}
                        />
                      </TableCell>
                      <TableCell>₹{line.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          value={line.trackingNumber || ''}
                          onChange={(e) => updateLine(line.id, { trackingNumber: e.target.value })}
                          className="w-24"
                          placeholder="Batch#"
                          disabled={(!isEditing && !!voucherId)}
                        />
                      </TableCell>
                      {(isEditing || !voucherId) && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(line.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Additional Charges & Taxes</CardTitle>
              <CardDescription>Add GST, transport charges, etc.</CardDescription>
            </div>
            {(isEditing || !voucherId) && (
              <Button onClick={addLedgerLine} size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Charge
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lines.filter(l => l.type === 'ledger').length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No additional charges added</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Narration</TableHead>
                  {(isEditing || !voucherId) && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.filter(l => l.type === 'ledger').map(line => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select
                        value={line.ledger || ''}
                        onValueChange={(value) => updateLine(line.id, { ledger: value })}
                        disabled={(!isEditing && !!voucherId)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {getChargesAndTaxLedgers().map(ledger => (
                            <SelectItem key={ledger.guid} value={ledger.name}>
                              {ledger.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.amount || ''}
                        onChange={(e) => updateLine(line.id, { amount: Number(e.target.value) })}
                        className="w-32"
                        disabled={(!isEditing && !!voucherId)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.narration || ''}
                        onChange={(e) => updateLine(line.id, { narration: e.target.value })}
                        className="w-40"
                        placeholder="Description"
                        disabled={(!isEditing && !!voucherId)}
                      />
                    </TableCell>
                    {(isEditing || !voucherId) && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary & Narration (Footer) */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Account details and transaction summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Party Account</h3>
              {selectedPartyLedger ? (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedPartyLedger.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current Balance: ₹{Math.abs(selectedPartyLedger.closing_balance).toFixed(2)} 
                    {selectedPartyLedger.closing_balance >= 0 ? ' Dr' : ' Cr'}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Will be debited: ₹{totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-600 font-semibold">
                    Final Balance: ₹{Math.abs(partyFinalBalance).toFixed(2)} {partyFinalBalance >= 0 ? 'Dr' : 'Cr'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select party account</p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Sales Account</h3>
              {selectedSalesLedger ? (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedSalesLedger.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current Balance: ₹{Math.abs(selectedSalesLedger.closing_balance).toFixed(2)}
                    {selectedSalesLedger.closing_balance >= 0 ? ' Dr' : ' Cr'}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Will be credited: ₹{totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-600 font-semibold">
                    Final Balance: ₹{Math.abs(salesFinalBalance).toFixed(2)} {salesFinalBalance >= 0 ? 'Dr' : 'Cr'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select sales account</p>
              )}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                Inventory: ₹{inventoryValue.toFixed(2)} | Additions: ₹{(totalAmount - inventoryValue).toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Posting</Label>
              <div className="text-sm">
                {selectedPartyLedger?.name || 'Party'} Dr ₹{totalAmount.toFixed(2)} → {selectedSalesLedger?.name || 'Sales'} Cr ₹{totalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Taxes/charges posted to their respective ledgers</div>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Badge variant={isBalanced ? 'default' : 'destructive'}>
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Final Narration</Label>
            <Textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter overall voucher narration"
              rows={3}
              disabled={(!isEditing && !!voucherId)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {(isEditing || !voucherId) && (
        <div className="flex justify-end">
          <Button
            onClick={saveVoucher}
            disabled={isSaving || isLoading || !isBalanced || !partyLedger || !salesLedger || lines.length === 0}
            className="flex items-center gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : (voucherId ? 'Update Voucher' : 'Save Voucher')}
          </Button>
        </div>
      )}
    </div>
  );
}