import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLedgerVouchers } from '@/hooks/useLedgerVouchers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, ArrowLeft, ChevronRight, Users, FileText, Receipt, Calendar } from 'lucide-react';
import { tallyApi, type Group, type ApiResponse, type HierarchyData, type MonthlyAnalysis } from '@/services/tallyApiService';
import { toast } from '@/hooks/use-toast';

// Group interface is now imported from tallyApiService

interface Ledger {
  guid: string;
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
  company_id: string;
  division_id: string;
}

interface Voucher {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  total_amount: number;
  party_ledger_name: string;
  narration: string;
}

interface VoucherDetail {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  total_amount: number;
  party_ledger_name: string;
  narration: string;
  basic_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  reference: string;
  due_date: string;
  currency: string;
  is_cancelled: boolean;
}

type ViewLevel = 'groups' | 'subgroups' | 'ledgers' | 'vouchers' | 'voucher_detail';

export default function GroupsPage() {
  const { user } = useAuth();
  const { vouchers, loading: vouchersLoading, fetchVouchersByType, fetchVouchersForLedger } = useLedgerVouchers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  // Data state
  const [groups, setGroups] = useState<Group[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [voucherDetail, setVoucherDetail] = useState<VoucherDetail | null>(null);
  
  // Breadcrumb state
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mst_group')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedGroups: Group[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent || '',
        primary_group: item.primary_group || '',
        is_revenue: !!item.is_revenue,
        is_deemedpositive: !!item.is_deemedpositive,
        affects_gross_profit: !!item.affects_gross_profit,
        company_id: item.company_id || '',
        division_id: item.division_id || '',
      }));

      setGroups(transformedGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgersForGroup = async (groupName: string) => {
    try {
      setLoading(true);
      
      // First try exact match, then fallback to broader searches
      let { data, error } = await supabase
        .from('mst_ledger')
        .select('*')
        .eq('parent', groupName)
        .order('name');

      if (!data || data.length === 0) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('mst_ledger')
          .select('*')
          .ilike('parent', `%${groupName}%`)
          .order('name');
        
        if (!fallbackError) {
          data = fallbackData;
          error = null;
        }
      }

      if (!data || data.length === 0) {
        const { data: allData, error: allError } = await supabase
          .from('mst_ledger')
          .select('*')
          .order('name');
        
        if (!allError) {
          data = allData?.filter(ledger => 
            ledger.parent?.toLowerCase().includes(groupName.toLowerCase())
          ) || [];
        }
      }

      if (error) throw error;

      const transformedLedgers: Ledger[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent || '',
        opening_balance: item.opening_balance || 0,
        closing_balance: item.closing_balance || 0,
        company_id: item.company_id || '',
        division_id: item.division_id || '',
      }));

      setLedgers(transformedLedgers);
    } catch (err) {
      console.error('Error fetching ledgers:', err);
      toast({
        title: "Error",
        description: "Failed to fetch ledgers for this group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherDetail = async (voucherGuid: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .single();

      if (error) throw error;

      const detail: VoucherDetail = {
        guid: data.guid,
        voucher_number: data.voucher_number || '',
        voucher_type: data.voucher_type || '',
        date: data.date || '',
        total_amount: data.total_amount || 0,
        party_ledger_name: data.party_ledger_name || '',
        narration: data.narration || '',
        basic_amount: data.basic_amount || 0,
        tax_amount: data.tax_amount || 0,
        discount_amount: data.discount_amount || 0,
        final_amount: data.final_amount || 0,
        reference: data.reference || '',
        due_date: data.due_date || '',
        currency: data.currency || 'INR',
        is_cancelled: !!data.is_cancelled,
      };

      setVoucherDetail(detail);
    } catch (err) {
      console.error('Error fetching voucher detail:', err);
      toast({
        title: "Error",
        description: "Failed to fetch voucher details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleGroupClick = async (group: Group) => {
    // Check if group has children (subgroups)
    const hasSubgroups = groups.some(g => g.parent === group.name);
    
    if (hasSubgroups) {
      setSelectedGroup(group);
      setCurrentLevel('subgroups');
      setBreadcrumb([group.name]);
    } else {
      // No subgroups, go directly to ledgers
      setSelectedGroup(group);
      setCurrentLevel('ledgers');
      setBreadcrumb([group.name]);
      await fetchLedgersForGroup(group.name);
    }
  };

  const handleSubgroupClick = async (subgroup: Group) => {
    setCurrentLevel('ledgers');
    setBreadcrumb([selectedGroup?.name || '', subgroup.name]);
    await fetchLedgersForGroup(subgroup.name);
  };

  const handleLedgerClick = async (ledger: Ledger) => {
    setSelectedLedger(ledger);
    setCurrentLevel('vouchers');
    setBreadcrumb([...breadcrumb, ledger.name]);
    await fetchVouchersForLedger(ledger.name);
  };

  const handleVoucherClick = async (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setCurrentLevel('voucher_detail');
    setBreadcrumb([...breadcrumb, voucher.voucher_number]);
    await fetchVoucherDetail(voucher.guid);
  };

  const handleBack = () => {
    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);

    switch (currentLevel) {
      case 'subgroups':
        setCurrentLevel('groups');
        setSelectedGroup(null);
        break;
      case 'ledgers':
        if (breadcrumb.length === 2) {
          setCurrentLevel('subgroups');
        } else {
          setCurrentLevel('groups');
          setSelectedGroup(null);
        }
        break;
      case 'vouchers':
        setCurrentLevel('ledgers');
        setSelectedLedger(null);
        break;
      case 'voucher_detail':
        setCurrentLevel('vouchers');
        setSelectedVoucher(null);
        setVoucherDetail(null);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter data based on current level
  const getFilteredData = () => {
    switch (currentLevel) {
      case 'groups':
        return groups.filter(g => !g.parent || g.parent === '').filter(group =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.primary_group.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'subgroups':
        return groups.filter(g => g.parent === selectedGroup?.name).filter(group =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'ledgers':
        return ledgers.filter(ledger =>
          ledger.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'vouchers':
        return vouchers.filter(voucher =>
          voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.voucher_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.party_ledger_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return [];
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view groups.</p>
      </div>
    );
  }

  const getTitle = () => {
    switch (currentLevel) {
      case 'groups': return 'Account Groups';
      case 'subgroups': return `Subgroups of ${selectedGroup?.name}`;
      case 'ledgers': return `Ledgers in ${breadcrumb[breadcrumb.length - 1]}`;
      case 'vouchers': return `Vouchers for ${selectedLedger?.name}`;
      case 'voucher_detail': return `Voucher Details: ${selectedVoucher?.voucher_number}`;
      default: return 'Account Groups';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentLevel !== 'groups' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{getTitle()}</h1>
            {breadcrumb.length > 0 && (
              <p className="text-muted-foreground">
                {breadcrumb.join(' → ')}
              </p>
            )}
          </div>
        </div>
        <Button onClick={fetchGroups} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Voucher Detail View */}
      {currentLevel === 'voucher_detail' && voucherDetail && (
        <Card>
          <CardHeader>
            <CardTitle>Voucher Details</CardTitle>
            <CardDescription>Complete information for voucher {voucherDetail.voucher_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Voucher Number</label>
                  <p className="text-lg font-semibold">{voucherDetail.voucher_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p><Badge variant="outline">{voucherDetail.voucher_type}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{formatDate(voucherDetail.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Party</label>
                  <p>{voucherDetail.party_ledger_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <p>{voucherDetail.reference || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Basic Amount</label>
                  <p className="text-lg">{formatCurrency(voucherDetail.basic_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tax Amount</label>
                  <p className="text-lg">{formatCurrency(voucherDetail.tax_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discount</label>
                  <p className="text-lg">{formatCurrency(voucherDetail.discount_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Final Amount</label>
                  <p className="text-xl font-bold">{formatCurrency(voucherDetail.final_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <Badge variant={voucherDetail.is_cancelled ? "destructive" : "default"}>
                      {voucherDetail.is_cancelled ? "Cancelled" : "Active"}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
            {voucherDetail.narration && (
              <div className="mt-6">
                <label className="text-sm font-medium text-muted-foreground">Narration</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{voucherDetail.narration}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Views */}
      {currentLevel !== 'voucher_detail' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentLevel === 'groups' && <Users className="h-5 w-5" />}
              {currentLevel === 'subgroups' && <Users className="h-5 w-5" />}
              {currentLevel === 'ledgers' && <FileText className="h-5 w-5" />}
              {currentLevel === 'vouchers' && <Receipt className="h-5 w-5" />}
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {currentLevel === 'groups' && 'Click on a group to view subgroups or ledgers'}
              {currentLevel === 'subgroups' && 'Click on a subgroup to view its ledgers'}
              {currentLevel === 'ledgers' && 'Click on a ledger to view its vouchers'}
              {currentLevel === 'vouchers' && 'Click on a voucher to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${currentLevel}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {currentLevel === 'groups' && (
                          <>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Primary Group</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Action</TableHead>
                          </>
                        )}
                        {currentLevel === 'subgroups' && (
                          <>
                            <TableHead>Subgroup Name</TableHead>
                            <TableHead>Primary Group</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Action</TableHead>
                          </>
                        )}
                        {currentLevel === 'ledgers' && (
                          <>
                            <TableHead>Ledger Name</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead className="text-right">Opening Balance</TableHead>
                            <TableHead className="text-right">Closing Balance</TableHead>
                            <TableHead>Action</TableHead>
                          </>
                        )}
                        {currentLevel === 'vouchers' && (
                          <>
                            <TableHead>Voucher #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Action</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredData().map((item: any) => (
                        <TableRow 
                          key={item.guid} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            if (currentLevel === 'groups') handleGroupClick(item);
                            else if (currentLevel === 'subgroups') handleSubgroupClick(item);
                            else if (currentLevel === 'ledgers') handleLedgerClick(item);
                            else if (currentLevel === 'vouchers') handleVoucherClick(item);
                          }}
                        >
                          {currentLevel === 'groups' && (
                            <>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.primary_group}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.is_deemedpositive ? "default" : "secondary"}>
                                  {item.is_deemedpositive ? "Debit" : "Credit"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.is_revenue ? "default" : "secondary"}>
                                  {item.is_revenue ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <ChevronRight className="h-4 w-4" />
                              </TableCell>
                            </>
                          )}
                          {currentLevel === 'subgroups' && (
                            <>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.primary_group}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.is_deemedpositive ? "default" : "secondary"}>
                                  {item.is_deemedpositive ? "Debit" : "Credit"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <ChevronRight className="h-4 w-4" />
                              </TableCell>
                            </>
                          )}
                          {currentLevel === 'ledgers' && (
                            <>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>{item.parent}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.opening_balance)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.closing_balance)}</TableCell>
                              <TableCell>
                                <ChevronRight className="h-4 w-4" />
                              </TableCell>
                            </>
                          )}
                          {currentLevel === 'vouchers' && (
                            <>
                              <TableCell className="font-medium">{item.voucher_number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.voucher_type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {formatDate(item.date)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={item.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(Math.abs(item.amount))}
                                </span>
                              </TableCell>
                              <TableCell>{item.party_ledger_name}</TableCell>
                              <TableCell>
                                <ChevronRight className="h-4 w-4" />
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
