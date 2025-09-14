import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounting">Accounting ({accountingEntries.length})</TabsTrigger>
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
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {accountingEntries.map((entry, index) => (
                      <div key={entry.guid} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{entry.ledger}</h4>
                            {entry.cost_centre && (
                              <p className="text-sm text-muted-foreground">
                                Cost Centre: {entry.cost_centre}
                              </p>
                            )}
                            {entry.cost_category && (
                              <p className="text-sm text-muted-foreground">
                                Cost Category: {entry.cost_category}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${entry.is_deemed_positive ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.is_deemed_positive ? '+' : '-'} {formatCurrency(entry.amount, entry.currency)}
                            </p>
                            {entry.amount_forex !== entry.amount && (
                              <p className="text-sm text-muted-foreground">
                                Foreign: {formatCurrency(entry.amount_forex, entry.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {entry.is_party_ledger === 1 && (
                            <Badge variant="secondary" className="text-xs">Party Ledger</Badge>
                          )}
                          {entry.amount_cleared && entry.amount_cleared > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Cleared: {formatCurrency(entry.amount_cleared, entry.currency)}
                            </Badge>
                          )}
                        </div>
                        
                        {entry.bill_allocations && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <p className="text-muted-foreground">Bill Allocations:</p>
                            <p>{entry.bill_allocations}</p>
                          </div>
                        )}
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
          <div className="grid gap-4">
            {/* Voucher Type Details */}
            {voucherType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Voucher Type Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name:</p>
                      <p className="font-medium">{voucherType.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parent:</p>
                      <p className="font-medium">{voucherType.parent || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Numbering Method:</p>
                      <p className="font-medium">{voucherType.numbering_method || 'Default'}</p>
                    </div>
                    <div className="flex gap-2">
                      {voucherType.affects_stock === 1 && (
                        <Badge variant="secondary">Stock Affecting</Badge>
                      )}
                      {voucherType.is_deemedpositive === 1 && (
                        <Badge variant="outline">Credit Nature</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Party Ledger Details */}
            {partyLedger && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Party Ledger Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name:</p>
                      <p className="font-medium">{partyLedger.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parent Group:</p>
                      <p className="font-medium">{partyLedger.parent || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Opening Balance:</p>
                      <p className="font-medium">{formatCurrency(partyLedger.opening_balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Closing Balance:</p>
                      <p className="font-medium">{formatCurrency(partyLedger.closing_balance)}</p>
                    </div>
                    {partyLedger.mailing_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mailing Name:</p>
                        <p className="font-medium">{partyLedger.mailing_name}</p>
                      </div>
                    )}
                    {partyLedger.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email:</p>
                        <p className="font-medium">{partyLedger.email}</p>
                      </div>
                    )}
                  </div>
                  {partyLedger.mailing_address && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Mailing Address:</p>
                      <p className="text-sm bg-muted p-2 rounded">{partyLedger.mailing_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Ledgers */}
            {relatedLedgers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Related Ledgers ({relatedLedgers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {relatedLedgers.map((ledger) => (
                        <div key={ledger.guid} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{ledger.name}</p>
                              <p className="text-sm text-muted-foreground">Group: {ledger.parent}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p>Opening: {formatCurrency(ledger.opening_balance)}</p>
                              <p>Closing: {formatCurrency(ledger.closing_balance)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
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
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Date:</p>
                  <p className="font-medium">{formatDate(voucher.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GUID:</p>
                  <p className="font-mono text-sm break-all">{voucher.guid}</p>
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
                <div>
                  <p className="text-sm text-muted-foreground">Persisted View:</p>
                  <p className="font-medium">{voucher.persistedview}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company ID:</p>
                  <p className="font-mono text-sm break-all">{voucher.company_id || 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Division ID:</p>
                  <p className="font-mono text-sm break-all">{voucher.division_id || 'Not Set'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Status Information</h4>
                <div className="flex gap-2">
                  <Badge variant={voucher.is_cancelled === 1 ? "destructive" : "secondary"}>
                    {voucher.is_cancelled === 1 ? "Cancelled" : "Active"}
                  </Badge>
                  <Badge variant={voucher.is_optional === 1 ? "outline" : "secondary"}>
                    {voucher.is_optional === 1 ? "Optional" : "Standard"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}