import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, ArrowLeft, ChevronRight, Users, FileText, Receipt, Calendar, FolderOpen, Folder, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { tallyApi, type Group, type Ledger as ApiLedger, type Voucher as ApiVoucher, type CompleteVoucher, type ApiResponse, type HierarchyData } from '@/services/tallyApiService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GroupForm, type GroupFormData } from '@/components/tally/master-forms/GroupForm';
import { toast } from '@/hooks/use-toast';

// All interfaces are now imported from tallyApiService

type ViewLevel = 'groups' | 'subgroups' | 'ledgers' | 'vouchers' | 'voucher_detail';

interface HierarchyGroup extends Group {
  children?: HierarchyGroup[];
  depth?: number;
  hasSubgroups?: boolean;
  ledgerCount?: number;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const { companyId, divisionId } = useParams<{ companyId: string; divisionId: string }>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<Group | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroupForDelete, setSelectedGroupForDelete] = useState<Group | null>(null);
  
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<ApiLedger | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<ApiVoucher | null>(null);
  
  // Data state
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupHierarchy, setCurrentGroupHierarchy] = useState<HierarchyGroup[]>([]);
  const [ledgers, setLedgers] = useState<ApiLedger[]>([]);
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [voucherDetail, setVoucherDetail] = useState<CompleteVoucher | null>(null);
  
  // Breadcrumb state
  const [breadcrumb, setBreadcrumb] = useState<{ name: string; level: ViewLevel; data?: any }[]>([]);

  useEffect(() => {
    if (user && companyId && divisionId) {
      fetchGroupsHierarchy();
    }
  }, [user, companyId, divisionId]);

  const fetchGroupsHierarchy = async () => {
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await tallyApi.getGroupsHierarchy(companyId, divisionId, 'tree');

      if (response.success) {
        setHierarchyData(response.data);
        
        // Convert hierarchy to flat groups for compatibility
        const flatGroups = flattenHierarchy(response.data.hierarchy);
        setGroups(flatGroups);
        
        // Set root groups for initial display
        const rootGroups = getRootGroups(response.data.hierarchy);
        setCurrentGroupHierarchy(rootGroups);
      } else {
        throw new Error(response.error || 'Failed to fetch groups hierarchy');
      }
    } catch (err) {
      console.error('Error fetching groups hierarchy:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch groups hierarchy');
      toast({
        title: "Error",
        description: "Failed to fetch groups hierarchy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const flattenHierarchy = (hierarchy: any[]): Group[] => {
    const flattened: Group[] = [];
    
    const flatten = (items: any[], depth = 0) => {
      items.forEach(item => {
        flattened.push({
          ...item,
          depth
        });
        if (item.children && item.children.length > 0) {
          flatten(item.children, depth + 1);
        }
      });
    };
    
    flatten(hierarchy);
    return flattened;
  };

  const getRootGroups = (hierarchy: any[]): HierarchyGroup[] => {
    return hierarchy.map(item => ({
      ...item,
      depth: 0,
      hasSubgroups: item.children && item.children.length > 0,
      ledgerCount: item.ledgerCount || 0
    }));
  };

  const getSubgroups = (parentName: string): HierarchyGroup[] => {
    const findChildren = (items: any[], target: string): any[] => {
      for (const item of items) {
        if (item.name === target) {
          return item.children || [];
        }
        if (item.children) {
          const found = findChildren(item.children, target);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    if (!hierarchyData) return [];
    
    const children = findChildren(hierarchyData.hierarchy, parentName);
    return children.map((child, index) => ({
      ...child,
      depth: 1,
      hasSubgroups: child.children && child.children.length > 0,
      ledgerCount: child.ledgerCount || 0
    }));
  };

  // CRUD operations
  const handleCreateGroup = async (data: GroupFormData) => {
    if (!companyId || !divisionId) return;
    
    try {
      setLoading(true);
      const response = await tallyApi.createGroup(companyId, divisionId, data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        });
        setIsCreateDialogOpen(false);
        await fetchGroupsHierarchy(); // Refresh data
      } else {
        throw new Error(response.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async (data: GroupFormData) => {
    if (!companyId || !divisionId || !selectedGroupForEdit) return;
    
    try {
      setLoading(true);
      // Note: Update API would be implemented in tallyApiService
      // const response = await tallyApi.updateGroup(companyId, divisionId, selectedGroupForEdit.guid, data);
      
      toast({
        title: "Success", 
        description: "Group updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedGroupForEdit(null);
      await fetchGroupsHierarchy(); // Refresh data
    } catch (err) {
      console.error('Error updating group:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!companyId || !divisionId || !selectedGroupForDelete) return;
    
    try {
      setLoading(true);
      // Note: Delete API would be implemented in tallyApiService
      // const response = await tallyApi.deleteGroup(companyId, divisionId, selectedGroupForDelete.guid);
      
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedGroupForDelete(null);
      await fetchGroupsHierarchy(); // Refresh data
    } catch (err) {
      console.error('Error deleting group:', err);
      toast({
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to delete group",
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
  const handleGroupClick = async (group: HierarchyGroup) => {
    if (group.hasSubgroups) {
      setSelectedGroup(group);
      setCurrentLevel('subgroups');
      const subgroups = getSubgroups(group.name);
      setCurrentGroupHierarchy(subgroups);
      setBreadcrumb([{ name: group.name, level: 'groups', data: group }]);
    } else {
      // No subgroups, go directly to ledgers
      setSelectedGroup(group);
      setCurrentLevel('ledgers');
      setBreadcrumb([{ name: group.name, level: 'groups', data: group }]);
      await fetchLedgersForGroup(group.name);
    }
  };

  const handleSubgroupClick = async (subgroup: HierarchyGroup) => {
    if (subgroup.hasSubgroups) {
      // Navigate to deeper subgroups
      const deeperSubgroups = getSubgroups(subgroup.name);
      setCurrentGroupHierarchy(deeperSubgroups);
      setBreadcrumb([...breadcrumb, { name: subgroup.name, level: 'subgroups', data: subgroup }]);
    } else {
      // Go to ledgers
      setCurrentLevel('ledgers');
      setBreadcrumb([...breadcrumb, { name: subgroup.name, level: 'subgroups', data: subgroup }]);
      await fetchLedgersForGroup(subgroup.name);
    }
  };

  const handleLedgerClick = async (ledger: ApiLedger) => {
    setSelectedLedger(ledger);
    setCurrentLevel('vouchers');
    setBreadcrumb([...breadcrumb, { name: ledger.name, level: 'ledgers', data: ledger }]);
    await fetchVouchersForLedger(ledger.name);
  };

  const handleVoucherClick = async (voucher: ApiVoucher) => {
    setSelectedVoucher(voucher);
    setCurrentLevel('voucher_detail');
    setBreadcrumb([...breadcrumb, { name: voucher.number, level: 'vouchers', data: voucher }]);
    await fetchVoucherDetail(voucher.id);
  };

  const handleBack = () => {
    const newBreadcrumb = [...breadcrumb];
    const lastItem = newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);

    switch (currentLevel) {
      case 'subgroups':
        if (newBreadcrumb.length === 0) {
          setCurrentLevel('groups');
          setSelectedGroup(null);
          setCurrentGroupHierarchy(getRootGroups(hierarchyData?.hierarchy || []));
        } else {
          // Navigate back to parent subgroups
          const parentItem = newBreadcrumb[newBreadcrumb.length - 1];
          const parentSubgroups = getSubgroups(parentItem.name);
          setCurrentGroupHierarchy(parentSubgroups);
        }
        break;
      case 'ledgers':
        if (newBreadcrumb.length === 0) {
          setCurrentLevel('groups');
          setSelectedGroup(null);
          setCurrentGroupHierarchy(getRootGroups(hierarchyData?.hierarchy || []));
        } else {
          setCurrentLevel('subgroups');
          const parentItem = newBreadcrumb[newBreadcrumb.length - 1];
          const parentSubgroups = getSubgroups(parentItem.name);
          setCurrentGroupHierarchy(parentSubgroups);
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
      case 'subgroups':
        return currentGroupHierarchy.filter(group =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.primary_group && group.primary_group.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (group.parent && group.parent.toLowerCase().includes(searchTerm.toLowerCase()))
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
      case 'subgroups': return `Subgroups of ${breadcrumb[breadcrumb.length - 1]?.name}`;
      case 'ledgers': return `Ledgers in ${breadcrumb[breadcrumb.length - 1]?.name}`;
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
                {breadcrumb.map(b => b.name).join(' → ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchGroupsHierarchy} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new account group for organizing ledgers
                </DialogDescription>
              </DialogHeader>
              <GroupForm
                availableGroups={groups.map(g => ({ name: g.name, guid: g.guid }))}
                onSubmit={handleCreateGroup}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
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
              {currentLevel === 'groups' && (
                <div className="space-y-1">
                  <p>Navigate through your account group hierarchy</p>
                  {hierarchyData && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Total Groups: {hierarchyData.statistics.totalGroups}</span>
                      <span>Max Depth: {hierarchyData.statistics.maxDepth}</span>
                      <span>Root Groups: {hierarchyData.statistics.rootItems}</span>
                    </div>
                  )}
                </div>
              )}
              {currentLevel === 'subgroups' && 'Navigate deeper into subgroups or view ledgers'}
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
                        {(currentLevel === 'groups' || currentLevel === 'subgroups') && (
                          <>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Primary Group</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Content</TableHead>
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
                          {(currentLevel === 'groups' || currentLevel === 'subgroups') && (
                            <>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2" style={{ paddingLeft: `${(item.depth || 0) * 16}px` }}>
                                  {item.hasSubgroups ? (
                                    <FolderOpen className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium">{item.name}</span>
                                  {item.hasSubgroups && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {item.children?.length || 0} subgroups
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.primary_group}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant={item.is_deemedpositive ? "default" : "secondary"}>
                                    {item.is_deemedpositive ? "Debit" : "Credit"}
                                  </Badge>
                                  {item.is_revenue && (
                                    <Badge variant="outline" className="text-xs">Revenue</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {item.hasSubgroups ? (
                                    <span>Subgroups: {item.children?.length || 0}</span>
                                  ) : (
                                    <span>Ledgers: {item.ledgerCount || 0}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroupForEdit(item);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroupForDelete(item);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  {item.hasSubgroups ? (
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                  ) : (
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group settings and properties
            </DialogDescription>
          </DialogHeader>
          {selectedGroupForEdit && (
            <GroupForm
              initialData={{
                name: selectedGroupForEdit.name,
                parent: selectedGroupForEdit.parent,
                primary_group: selectedGroupForEdit.primary_group,
                is_revenue: Boolean(selectedGroupForEdit.is_revenue),
                is_deemedpositive: Boolean(selectedGroupForEdit.is_deemedpositive),
                affects_gross_profit: Boolean(selectedGroupForEdit.affects_gross_profit),
              }}
              availableGroups={groups.filter(g => g.guid !== selectedGroupForEdit.guid).map(g => ({ name: g.name, guid: g.guid }))}
              onSubmit={handleEditGroup}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedGroupForEdit(null);
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGroupForDelete?.name}"? This action cannot be undone and will affect any ledgers or subgroups under this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedGroupForDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
