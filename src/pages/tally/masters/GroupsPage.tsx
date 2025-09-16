import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, ArrowLeft, ChevronRight, Users, FileText, Receipt, Calendar } from 'lucide-react';
import { tallyApi, type Group, type Ledger as ApiLedger, type Voucher as ApiVoucher, type CompleteVoucher, type ApiResponse } from '@/services/tallyApiService';
import { toast } from '@/hooks/use-toast';

// All interfaces are now imported from tallyApiService

type ViewLevel = 'groups' | 'subgroups' | 'ledgers' | 'vouchers' | 'voucher_detail';

export default function GroupsPage() {
  const { user } = useAuth();
  const { companyId, divisionId } = useParams<{ companyId: string; divisionId: string }>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<ApiLedger | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<ApiVoucher | null>(null);
  
  // Data state
  const [groups, setGroups] = useState<Group[]>([]);
  const [ledgers, setLedgers] = useState<ApiLedger[]>([]);
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [voucherDetail, setVoucherDetail] = useState<CompleteVoucher | null>(null);
  
  // Breadcrumb state
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  useEffect(() => {
    if (user && companyId && divisionId) {
      fetchGroups();
    }
  }, [user, companyId, divisionId]);

  const fetchGroups = async () => {
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await tallyApi.getGroups(companyId, divisionId);

      if (response.success) {
        setGroups(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch groups');
      }
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
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      
      const response = await tallyApi.getLedgers(companyId, divisionId, { parent: groupName });

      if (response.success) {
        setLedgers(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch ledgers');
      }
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

  const fetchVouchersForLedger = async (ledgerName: string) => {
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      
      const response = await tallyApi.getEnhancedVouchers(companyId, divisionId, { search: ledgerName });

      if (response.success) {
        setVouchers(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch vouchers');
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      toast({
        title: "Error",
        description: "Failed to fetch vouchers for this ledger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherDetail = async (voucherId: string) => {
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      
      const response = await tallyApi.getVoucherComplete(companyId, divisionId, voucherId);

      if (response.success) {
        setVoucherDetail(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch voucher details');
      }
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

  const handleLedgerClick = async (ledger: ApiLedger) => {
    setSelectedLedger(ledger);
    setCurrentLevel('vouchers');
    setBreadcrumb([...breadcrumb, ledger.name]);
    await fetchVouchersForLedger(ledger.name);
  };

  const handleVoucherClick = async (voucher: ApiVoucher) => {
    setSelectedVoucher(voucher);
    setCurrentLevel('voucher_detail');
    setBreadcrumb([...breadcrumb, voucher.number]);
    await fetchVoucherDetail(voucher.id);
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
          voucher.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.partyLedgerName.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!companyId || !divisionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Company and Division IDs are required.</p>
      </div>
    );
  }

  const getTitle = () => {
    switch (currentLevel) {
      case 'groups': return 'Account Groups';
      case 'subgroups': return `Subgroups of ${selectedGroup?.name}`;
      case 'ledgers': return `Ledgers in ${breadcrumb[breadcrumb.length - 1]}`;
      case 'vouchers': return `Vouchers for ${selectedLedger?.name}`;
      case 'voucher_detail': return `Voucher Details: ${selectedVoucher?.number}`;
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voucher Details</CardTitle>
              <CardDescription>Complete information for voucher {voucherDetail.voucher.number}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Voucher Number</label>
                    <p className="text-lg font-semibold">{voucherDetail.voucher.number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p><Badge variant="outline">{voucherDetail.voucher.type}</Badge></p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p>{formatDate(voucherDetail.voucher.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Party</label>
                    <p>{voucherDetail.voucher.partyLedgerName}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="text-xl font-bold">{formatCurrency(voucherDetail.voucher.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ledgers Involved</label>
                    <p className="text-lg">{voucherDetail.relationshipSummary.totalLedgersInvolved}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stock Items</label>
                    <p className="text-lg">{voucherDetail.relationshipSummary.totalStockItemsInvolved}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Complexity</label>
                    <p>
                      <Badge variant={voucherDetail.relationshipSummary.transactionComplexity === 'Complex' ? "secondary" : "default"}>
                        {voucherDetail.relationshipSummary.transactionComplexity}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              {voucherDetail.voucher.narration && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-muted-foreground">Narration</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{voucherDetail.voucher.narration}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accounting Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Accounting Entries</CardTitle>
              <CardDescription>Double-entry accounting breakdown for this voucher</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ledger</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voucherDetail.voucher.entries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.ledgerName}</TableCell>
                        <TableCell>
                          {entry.isDebit ? formatCurrency(entry.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {!entry.isDebit ? formatCurrency(entry.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.isPartyledger ? "default" : "secondary"}>
                            {entry.isPartyledger ? 'Party' : 'Regular'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Entries (if any) */}
          {voucherDetail.voucher.inventoryEntries && voucherDetail.voucher.inventoryEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Entries</CardTitle>
                <CardDescription>Stock movement details for this voucher</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Godown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voucherDetail.voucher.inventoryEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.stockItemName}</TableCell>
                          <TableCell>{entry.actualQuantity}</TableCell>
                          <TableCell>{formatCurrency(entry.rate)}</TableCell>
                          <TableCell>{formatCurrency(entry.amount)}</TableCell>
                          <TableCell>{entry.godownName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
                              <TableCell className="font-medium">{item.number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.type}</Badge>
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
                              <TableCell>{item.partyLedgerName}</TableCell>
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
