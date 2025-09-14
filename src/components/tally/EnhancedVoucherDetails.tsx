import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Receipt, 
  MapPin, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Clock,
  Hash,
  Tag,
  Briefcase,
  Target,
  Package,
  ArrowLeft,
  Database,
  BarChart3,
  Warehouse
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TallyVoucherSync } from './TallyVoucherSync';

interface VoucherDetails {
  // Basic voucher information
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  due_date?: string;
  narration?: string;
  party_ledger_name?: string;
  reference?: string;
  voucher_number_prefix?: string;
  voucher_number_suffix?: string;
  
  // Financial amounts
  basic_amount: number;
  discount_amount: number;
  total_amount: number;
  net_amount: number;
  tax_amount: number;
  final_amount: number;
  exchange_rate: number;
  currency: string;
  
  // References and notes
  order_reference?: string;
  consignment_note?: string;
  receipt_reference?: string;
  
  // Status and flags
  is_cancelled: number;
  is_optional: number;
  persistedview: number;
  
  // Audit information
  created_at: string;
  altered_on?: string;
  altered_by?: string;
  
  // Company and division
  company_id?: string;
  division_id?: string;
}

interface AccountingEntry {
  guid: string;
  ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
  is_party_ledger: number;
  is_deemed_positive: number;
  amount_cleared?: number;
  bill_allocations?: string;
  cost_category?: string;
  cost_centre?: string;
}

interface AddressDetail {
  guid: string;
  address_type: string;
  contact_person: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_line4: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
}

interface VoucherType {
  guid: string;
  name: string;
  parent: string;
  affects_stock: number;
  is_deemedpositive: number;
  numbering_method: string;
}

interface Ledger {
  guid: string;
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
  mailing_name: string;
  mailing_address: string;
  email: string;
  ledger_contact: string;
}

interface InventoryEntry {
  guid: string;
  item: string;
  quantity: number;
  rate: number;
  amount: number;
  godown?: string;
  batch?: string;
}

interface MasterDataType {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  data: any[];
}

interface EnhancedVoucherDetailsProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  onClose?: () => void;
}

export function EnhancedVoucherDetails({ 
  voucherGuid, 
  companyId, 
  divisionId, 
  onClose 
}: EnhancedVoucherDetailsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<VoucherDetails | null>(null);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [addressDetails, setAddressDetails] = useState<AddressDetail[]>([]);
  const [voucherType, setVoucherType] = useState<VoucherType | null>(null);
  const [partyLedger, setPartyLedger] = useState<Ledger | null>(null);
  const [relatedLedgers, setRelatedLedgers] = useState<Ledger[]>([]);
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  const [masterDataTypes, setMasterDataTypes] = useState<MasterDataType[]>([]);
  const [selectedMasterData, setSelectedMasterData] = useState<{ type: string; data: any } | null>(null);

  useEffect(() => {
    fetchVoucherDetails();
  }, [voucherGuid, companyId, divisionId]);

  const fetchVoucherDetails = async () => {
    setLoading(true);
    try {
      // Fetch main voucher details
      const { data: voucherData, error: voucherError } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .single();

      if (voucherError) throw voucherError;
      setVoucher(voucherData);

      // Fetch accounting entries
      const { data: accountingData, error: accountingError } = await supabase
        .from('trn_accounting')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .order('amount', { ascending: false });

      if (accountingError) {
        console.warn('Error fetching accounting entries:', accountingError);
      } else {
        setAccountingEntries(accountingData || []);
      }

      // Fetch address details
      const { data: addressData, error: addressError } = await supabase
        .from('trn_address_details')
        .select('*')
        .eq('voucher_guid', voucherGuid);

      if (addressError) {
        console.warn('Error fetching address details:', addressError);
      } else {
        setAddressDetails(addressData || []);
      }

      // Fetch voucher type details
      if (voucherData?.voucher_type) {
        const { data: typeData, error: typeError } = await supabase
          .from('mst_vouchertype')
          .select('*')
          .eq('name', voucherData.voucher_type)
          .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
          .maybeSingle();

        if (typeError) {
          console.warn('Error fetching voucher type:', typeError);
        } else {
          setVoucherType(typeData);
        }
      }

      // Fetch party ledger details
      if (voucherData?.party_ledger_name) {
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('mst_ledger')
          .select('*')
          .eq('name', voucherData.party_ledger_name)
          .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
          .maybeSingle();

        if (ledgerError) {
          console.warn('Error fetching party ledger:', ledgerError);
        } else {
          setPartyLedger(ledgerData);
        }
      }

      // Fetch related ledgers from accounting entries
      if (accountingData && accountingData.length > 0) {
        const ledgerNames = Array.from(new Set(accountingData.map(entry => entry.ledger).filter(Boolean)));
        
        if (ledgerNames.length > 0) {
          const { data: relatedLedgersData, error: relatedLedgersError } = await supabase
            .from('mst_ledger')
            .select('*')
            .in('name', ledgerNames)
            .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`);

          if (relatedLedgersError) {
            console.warn('Error fetching related ledgers:', relatedLedgersError);
          } else {
            setRelatedLedgers(relatedLedgersData || []);
          }
        }
      }

      // Fetch inventory entries (mock data - replace with actual table when available)
      setInventoryEntries([
        {
          guid: 'inv-1',
          item: 'Sample Product A',
          quantity: 10,
          rate: 100,
          amount: 1000,
          godown: 'Main Warehouse',
          batch: 'BATCH001'
        },
        {
          guid: 'inv-2', 
          item: 'Sample Product B',
          quantity: 5,
          rate: 200,
          amount: 1000,
          godown: 'Secondary Warehouse'
        }
      ]);

      // Prepare master data types
      const masterTypes: MasterDataType[] = [
        {
          type: 'voucher_type',
          label: 'Voucher Type',
          icon: FileText,
          count: voucherType ? 1 : 0,
          data: voucherType ? [voucherType] : []
        },
        {
          type: 'party_ledger',
          label: 'Party Ledger',
          icon: Users,
          count: partyLedger ? 1 : 0,
          data: partyLedger ? [partyLedger] : []
        },
        {
          type: 'related_ledgers',
          label: 'Related Ledgers',
          icon: Receipt,
          count: relatedLedgers.length,
          data: relatedLedgers
        },
        {
          type: 'addresses',
          label: 'Address Details',
          icon: MapPin,
          count: addressDetails.length,
          data: addressDetails
        }
      ];

      setMasterDataTypes(masterTypes);

    } catch (error) {
      console.error('Error fetching voucher details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voucher details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Voucher Not Found</h3>
        <p className="text-muted-foreground">The requested voucher could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            {voucher.voucher_number || 'Untitled Voucher'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {voucher.voucher_type} • {formatDate(voucher.date)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <TallyVoucherSync
            voucherGuid={voucherGuid}
            companyId={companyId}
            divisionId={divisionId}
            onSyncComplete={() => {
              // Refresh voucher data after sync
              fetchVoucherDetails();
            }}
          />
          
          {voucher.is_cancelled === 1 && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
          {voucher.is_optional === 1 && (
            <Badge variant="secondary">Optional</Badge>
          )}
          <Badge variant="outline">
            {formatCurrency(voucher.total_amount, voucher.currency)}
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounting">Accounting ({accountingEntries.length})</TabsTrigger>
          <TabsTrigger value="ledgers">Ledgers ({(partyLedger ? 1 : 0) + relatedLedgers.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory ({inventoryEntries.length})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses ({addressDetails.length})</TabsTrigger>
          <TabsTrigger value="master-data">Master Data</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Number:</span>
                  </div>
                  <span className="font-medium">{voucher.voucher_number}</span>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                  </div>
                  <span className="font-medium">{voucher.voucher_type}</span>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                  </div>
                  <span className="font-medium">{formatDate(voucher.date)}</span>
                  
                  {voucher.due_date && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Due Date:</span>
                      </div>
                      <span className="font-medium">{formatDate(voucher.due_date)}</span>
                    </>
                  )}
                  
                  {voucher.party_ledger_name && (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Party:</span>
                      </div>
                      <span className="font-medium">{voucher.party_ledger_name}</span>
                    </>
                  )}
                </div>
                
                {voucher.narration && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Narration:</p>
                    <p className="text-sm bg-muted p-2 rounded">{voucher.narration}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Basic Amount:</span>
                  <span className="font-medium">{formatCurrency(voucher.basic_amount, voucher.currency)}</span>
                  
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium">{formatCurrency(voucher.discount_amount, voucher.currency)}</span>
                  
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className="font-medium">{formatCurrency(voucher.tax_amount, voucher.currency)}</span>
                  
                  <span className="text-muted-foreground">Net Amount:</span>
                  <span className="font-medium">{formatCurrency(voucher.net_amount, voucher.currency)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">{formatCurrency(voucher.total_amount, voucher.currency)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Final Amount:</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(voucher.final_amount, voucher.currency)}</span>
                </div>
                
                {voucher.exchange_rate !== 1 && (
                  <div className="text-sm text-muted-foreground">
                    Exchange Rate: {voucher.exchange_rate} ({voucher.currency})
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* References */}
          {(voucher.reference || voucher.order_reference || voucher.consignment_note || voucher.receipt_reference) && (
            <Card>
              <CardHeader>
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {voucher.reference && (
                    <div>
                      <p className="text-muted-foreground">Reference:</p>
                      <p className="font-medium">{voucher.reference}</p>
                    </div>
                  )}
                  {voucher.order_reference && (
                    <div>
                      <p className="text-muted-foreground">Order Reference:</p>
                      <p className="font-medium">{voucher.order_reference}</p>
                    </div>
                  )}
                  {voucher.consignment_note && (
                    <div>
                      <p className="text-muted-foreground">Consignment Note:</p>
                      <p className="font-medium">{voucher.consignment_note}</p>
                    </div>
                  )}
                  {voucher.receipt_reference && (
                    <div>
                      <p className="text-muted-foreground">Receipt Reference:</p>
                      <p className="font-medium">{voucher.receipt_reference}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Accounting Entries Tab */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Accounting Entries ({accountingEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accountingEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No accounting entries found for this voucher.</p>
                </div>
              ) : (
                <>
                  {(() => {
                    // Separate party ledger from other ledgers
                    const partyLedger = accountingEntries.find(entry => entry.is_party_ledger === 1);
                    const otherLedgers = accountingEntries.filter(entry => entry.is_party_ledger !== 1);
                    
                    // Determine expected account type based on voucher type
                    const getExpectedAccountType = (voucherType: string) => {
                      switch (voucherType.toLowerCase()) {
                        case 'sales':
                        case 'sales invoice':
                          return 'Sales Account';
                        case 'purchase':
                        case 'purchase invoice':
                          return 'Purchase Account';
                        case 'payment':
                          return 'Bank/Cash Account';
                        case 'receipt':
                          return 'Bank/Cash Account';
                        case 'contra':
                          return 'Bank/Cash Account';
                        default:
                          return 'Account';
                      }
                    };
                    
                    const expectedAccountType = getExpectedAccountType(voucher.voucher_type);
                    const hasMainAccountLedger = otherLedgers.length > 0;
                    const mainAccountLedger = otherLedgers.find(ledger => 
                      ledger.ledger.toLowerCase().includes('sales') ||
                      ledger.ledger.toLowerCase().includes('purchase') ||
                      ledger.ledger.toLowerCase().includes('bank') ||
                      ledger.ledger.toLowerCase().includes('cash')
                    );
                    
                    // Calculate inventory total
                    const totalInventoryValue = inventoryEntries.reduce((sum, entry) => 
                      sum + (entry.amount || 0), 0);
                    
                    // Calculate other ledgers debits (excluding party)
                    const otherLedgerDebits = otherLedgers.reduce((sum, entry) => 
                      entry.amount > 0 ? sum + entry.amount : sum, 0);
                    
                    // Total Debit = Inventory + Other Ledger Debits (excluding party)
                    const totalDebit = totalInventoryValue + otherLedgerDebits;
                    const totalCredit = accountingEntries.reduce((sum, entry) => 
                      entry.amount < 0 ? sum + Math.abs(entry.amount) : sum, 0);
                    
                    const grandTotal = Math.max(totalDebit, totalCredit);
                    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
                    const isProperAccountingVoucher = ['sales', 'purchase', 'payment', 'receipt'].includes(voucher.voucher_type.toLowerCase());
                    const hasBothRequiredLedgers = partyLedger && hasMainAccountLedger;
                    
                    return (
                      <div className="space-y-4">
                        {/* Accounting Entries Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3 font-medium">Ledger Name</th>
                                <th className="text-right p-3 font-medium">Debit</th>
                                <th className="text-right p-3 font-medium">Credit</th>
                                <th className="text-center p-3 font-medium">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Party Ledger First */}
                              {partyLedger && (
                                <tr className="bg-blue-50 dark:bg-blue-950/30 border-b">
                                  <td className="p-3">
                                    <div className="font-bold">{partyLedger.ledger}</div>
                                    <Badge variant="default" className="text-xs mt-1">
                                      Party Account
                                    </Badge>
                                  </td>
                                  <td className="text-right p-3 font-bold">
                                    {partyLedger.amount > 0 ? formatCurrency(partyLedger.amount, partyLedger.currency) : '-'}
                                  </td>
                                  <td className="text-right p-3 font-bold">
                                    {partyLedger.amount < 0 ? formatCurrency(Math.abs(partyLedger.amount), partyLedger.currency) : '-'}
                                  </td>
                                  <td className="text-center p-3">
                                    <Badge variant="default">
                                      {partyLedger.is_deemed_positive ? 'Positive' : 'Negative'}
                                    </Badge>
                                  </td>
                                </tr>
                              )}
                              
                              {/* Missing Account Ledger Warning */}
                              {isProperAccountingVoucher && otherLedgers.length === 0 && (
                                <tr className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                  <td colSpan={4} className="p-3 text-red-700 dark:text-red-300">
                                    <div className="flex items-center gap-2">
                                      <div className="h-3 w-3 rounded-full bg-red-500" />
                                      <span>Missing {expectedAccountType} - Required for {voucher.voucher_type} voucher</span>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              
                              {/* Other Ledgers */}
                              {otherLedgers.map((entry, index) => (
                                <tr key={entry.guid} className={`border-b ${mainAccountLedger?.ledger === entry.ledger ? 'bg-green-50 dark:bg-green-950/30' : ''}`}>
                                  <td className="p-3">
                                    <div className="font-medium">{entry.ledger}</div>
                                    {mainAccountLedger?.ledger === entry.ledger && (
                                      <Badge variant="secondary" className="text-xs mt-1">
                                        Main Account
                                      </Badge>
                                    )}
                                    {entry.cost_centre && (
                                      <div className="text-sm text-muted-foreground">
                                        Cost Centre: {entry.cost_centre}
                                      </div>
                                    )}
                                  </td>
                                  <td className="text-right p-3">
                                    {entry.amount > 0 ? formatCurrency(entry.amount, entry.currency) : '-'}
                                  </td>
                                  <td className="text-right p-3">
                                    {entry.amount < 0 ? formatCurrency(Math.abs(entry.amount), entry.currency) : '-'}
                                  </td>
                                  <td className="text-center p-3">
                                    <Badge variant="outline">
                                      {entry.is_deemed_positive ? 'Positive' : 'Negative'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Totals and Validation */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Total Debit</div>
                              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebit)}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Total Credit</div>
                              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredit)}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Grand Total</div>
                              <div className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</div>
                            </div>
                          </div>
                          
                          {/* Balance Validation */}
                          <div className="border-t pt-3 space-y-3">
                            {/* Ledger Balance Check */}
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-sm font-medium">
                                Ledger Balance: {isBalanced ? 'Balanced' : 'Unbalanced'}
                              </span>
                            </div>
                            
                            {/* Accounting Structure Validation */}
                            {isProperAccountingVoucher && (
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${hasBothRequiredLedgers ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm font-medium">
                                  Accounting Structure: {hasBothRequiredLedgers ? 'Complete' : 'Incomplete'}
                                </span>
                                {!hasBothRequiredLedgers && (
                                  <span className="text-xs text-red-600">
                                    (Missing: {!partyLedger ? 'Party Account' : ''} {!hasMainAccountLedger ? expectedAccountType : ''})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledgers Tab */}
        <TabsContent value="ledgers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Associated Ledgers ({(partyLedger ? 1 : 0) + relatedLedgers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!partyLedger && relatedLedgers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ledgers associated with this voucher.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {/* Party Ledger */}
                    {partyLedger && (
                      <div className="border rounded-lg p-4 bg-primary/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">Party Ledger</h4>
                          </div>
                          <Badge variant="default">Primary</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-lg mb-2">{partyLedger.name}</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Parent Group:</span>
                                <span className="font-medium">{partyLedger.parent || 'None'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Opening Balance:</span>
                                <span className="font-medium">{formatCurrency(partyLedger.opening_balance || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Balance:</span>
                                <span className="font-medium">{formatCurrency(partyLedger.closing_balance || 0)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Contact Details</h5>
                            <div className="space-y-1 text-sm">
                              {partyLedger.mailing_name && (
                                <div>
                                  <span className="text-muted-foreground">Mailing Name:</span>
                                  <p className="font-medium">{partyLedger.mailing_name}</p>
                                </div>
                              )}
                              {partyLedger.email && (
                                <div>
                                  <span className="text-muted-foreground">Email:</span>
                                  <p className="font-medium">{partyLedger.email}</p>
                                </div>
                              )}
                              {partyLedger.ledger_contact && (
                                <div>
                                  <span className="text-muted-foreground">Contact:</span>
                                  <p className="font-medium">{partyLedger.ledger_contact}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {partyLedger.mailing_address && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-sm text-muted-foreground">Address:</span>
                            <p className="text-sm bg-muted p-2 rounded mt-1">{partyLedger.mailing_address}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Related Ledgers */}
                    {relatedLedgers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Related Ledgers ({relatedLedgers.length})
                        </h4>
                        
                        <div className="grid gap-3">
                          {relatedLedgers.map((ledger) => (
                            <div key={ledger.guid} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{ledger.name}</h5>
                                <Badge variant="outline">
                                  {accountingEntries.find(entry => entry.ledger === ledger.name)?.is_deemed_positive ? "Credit" : "Debit"}
                                </Badge>
                              </div>
                              
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Parent Group:</span>
                                  <p className="font-medium">{ledger.parent || 'None'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Opening Balance:</span>
                                  <p className="font-medium">{formatCurrency(ledger.opening_balance || 0)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Closing Balance:</span>
                                  <p className="font-medium">{formatCurrency(ledger.closing_balance || 0)}</p>
                                </div>
                              </div>
                              
                              {/* Show transaction amount for this ledger */}
                              {(() => {
                                const relatedEntry = accountingEntries.find(entry => entry.ledger === ledger.name);
                                return relatedEntry && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">Transaction Amount:</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={relatedEntry.is_deemed_positive ? "default" : "destructive"}>
                                          {relatedEntry.is_deemed_positive ? "Credit" : "Debit"}
                                        </Badge>
                                        <span className="font-medium">{formatCurrency(relatedEntry.amount, relatedEntry.currency)}</span>
                                      </div>
                                    </div>
                                    {relatedEntry.cost_centre && (
                                      <div className="mt-1 text-sm">
                                        <span className="text-muted-foreground">Cost Centre:</span>
                                        <span className="ml-2">{relatedEntry.cost_centre}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                              
                              {ledger.email && (
                                <div className="mt-2 text-sm">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="ml-2">{ledger.email}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory Entries ({inventoryEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory entries found for this voucher.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {inventoryEntries.map((entry, index) => (
                      <div key={entry.guid} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {entry.item}
                            </h4>
                            {entry.godown && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Warehouse className="h-3 w-3" />
                                Godown: {entry.godown}
                              </p>
                            )}
                            {entry.batch && (
                              <p className="text-sm text-muted-foreground">
                                Batch: {entry.batch}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(entry.amount, voucher.currency)}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.quantity} × {formatCurrency(entry.rate, voucher.currency)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <p className="font-medium">{entry.quantity}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate:</span>
                            <p className="font-medium">{formatCurrency(entry.rate, voucher.currency)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">{formatCurrency(entry.amount, voucher.currency)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Details ({addressDetails.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addressDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No address details found for this voucher.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addressDetails.map((address) => (
                    <div key={address.guid} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{address.address_type}</h4>
                        <Badge variant="outline">{address.address_type}</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Address</h5>
                          <div className="text-sm space-y-1">
                            {address.address_line1 && <p>{address.address_line1}</p>}
                            {address.address_line2 && <p>{address.address_line2}</p>}
                            {address.address_line3 && <p>{address.address_line3}</p>}
                            {address.address_line4 && <p>{address.address_line4}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Contact Information</h5>
                          <div className="text-sm space-y-1">
                            {address.contact_person && (
                              <p><span className="text-muted-foreground">Contact:</span> {address.contact_person}</p>
                            )}
                            {address.phone && (
                              <p><span className="text-muted-foreground">Phone:</span> {address.phone}</p>
                            )}
                            {address.email && (
                              <p><span className="text-muted-foreground">Email:</span> {address.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Master Data Tab */}
        <TabsContent value="master-data" className="space-y-4">
          {selectedMasterData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {selectedMasterData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Details
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMasterData(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Voucher
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {selectedMasterData.type === 'voucher_type' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{selectedMasterData.data.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parent:</span>
                          <p className="font-medium">{selectedMasterData.data.parent || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Affects Stock:</span>
                          <p className="font-medium">{selectedMasterData.data.affects_stock ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Numbering Method:</span>
                          <p className="font-medium">{selectedMasterData.data.numbering_method}</p>
                        </div>
                      </div>
                    )}
                    
                    {(selectedMasterData.type === 'party_ledger' || selectedMasterData.type === 'related_ledgers') && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{selectedMasterData.data.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parent Group:</span>
                          <p className="font-medium">{selectedMasterData.data.parent || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opening Balance:</span>
                          <p className="font-medium">{formatCurrency(selectedMasterData.data.opening_balance || 0)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Closing Balance:</span>
                          <p className="font-medium">{formatCurrency(selectedMasterData.data.closing_balance || 0)}</p>
                        </div>
                        {selectedMasterData.data.mailing_name && (
                          <div>
                            <span className="text-muted-foreground">Mailing Name:</span>
                            <p className="font-medium">{selectedMasterData.data.mailing_name}</p>
                          </div>
                        )}
                        {selectedMasterData.data.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{selectedMasterData.data.email}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedMasterData.type === 'addresses' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Address Type:</span>
                          <p className="font-medium">{selectedMasterData.data.address_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contact Person:</span>
                          <p className="font-medium">{selectedMasterData.data.contact_person}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Address:</span>
                          <p className="font-medium">
                            {[
                              selectedMasterData.data.address_line1,
                              selectedMasterData.data.address_line2,
                              selectedMasterData.data.city,
                              selectedMasterData.data.state,
                              selectedMasterData.data.pincode
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium">{selectedMasterData.data.phone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{selectedMasterData.data.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Master Data References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {masterDataTypes.map((masterType) => (
                    <div
                      key={masterType.type}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (masterType.count > 0) {
                          if (masterType.data.length === 1) {
                            setSelectedMasterData({ type: masterType.type, data: masterType.data[0] });
                          } else {
                            // For multiple records, show the first one or implement a list view
                            setSelectedMasterData({ type: masterType.type, data: masterType.data[0] });
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <masterType.icon className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{masterType.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {masterType.count} record{masterType.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant={masterType.count > 0 ? "default" : "secondary"}>
                          {masterType.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {masterDataTypes.every(type => type.count === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No master data references found for this voucher.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created At:</p>
                    <p className="font-medium">{formatDate(voucher.created_at)}</p>
                  </div>
                  {voucher.altered_on && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Modified:</p>
                      <p className="font-medium">{formatDate(voucher.altered_on)}</p>
                    </div>
                  )}
                  {voucher.altered_by && (
                    <div>
                      <p className="text-sm text-muted-foreground">Modified By:</p>
                      <p className="font-medium">{voucher.altered_by}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Status Information</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={voucher.is_cancelled === 1 ? "destructive" : "secondary"}>
                      {voucher.is_cancelled === 1 ? "Cancelled" : "Active"}
                    </Badge>
                    <Badge variant={voucher.is_optional === 1 ? "outline" : "secondary"}>
                      {voucher.is_optional === 1 ? "Optional" : "Mandatory"}
                    </Badge>
                    <Badge variant="outline">
                      Persisted View: {voucher.persistedview}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}