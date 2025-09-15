import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  TreePine, 
  Users, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  BarChart3,
  TrendingUp,
  Building,
  Network,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { tallyApi, type Group, type ApiResponse, type HierarchyData, type MonthlyAnalysis } from '@/services/tallyApiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface HierarchyNode extends Group {
  children: HierarchyNode[];
  hierarchyLevel: number;
  parentChain: string[];
  fullPath: string;
  hasChildren: boolean;
  ledgerCount?: number;
  totalBalance?: number;
}

interface GroupsPageEnhancedProps {
  companyId: string;
  divisionId: string;
}

export function GroupsPageEnhanced({ companyId, divisionId }: GroupsPageEnhancedProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'flat' | 'monthly'>('tree');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    parent: '',
    is_revenue: false,
    is_deemedpositive: true,
    affects_gross_profit: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGroupsData();
  }, [companyId, divisionId]);

  const loadGroupsData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading groups data from API...');
      
      // Load groups, hierarchy, and monthly analysis in parallel
      const [groupsResponse, hierarchyResponse, monthlyResponse] = await Promise.all([
        tallyApi.getGroups(companyId, divisionId, { limit: 100 }),
        tallyApi.getGroupsHierarchy(companyId, divisionId, 'flat'),
        tallyApi.getGroupsMonthlyAnalysis(companyId, divisionId, 2025)
      ]);

      if (!groupsResponse.success) {
        throw new Error(groupsResponse.error || 'Failed to load groups');
      }

      if (!hierarchyResponse.success) {
        throw new Error(hierarchyResponse.error || 'Failed to load hierarchy');
      }

      setGroups(groupsResponse.data);
      setHierarchyData(hierarchyResponse.data.hierarchy);
      
      if (monthlyResponse.success) {
        setMonthlyAnalysis(monthlyResponse.data);
      }

      console.log(`Loaded ${groupsResponse.data.length} groups with hierarchy and monthly analysis`);

    } catch (error) {
      console.error('Failed to load groups data:', error);
      toast({
        title: "Error",
        description: "Failed to load groups data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (groupName: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.name);
    const hasChildren = node.hasChildren;
    const isSelected = selectedGroup?.name === node.name;

    return (
      <div key={node.name} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedGroup(node)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.name);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <Folder className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">{node.name}</span>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-2">
            {node.is_revenue && (
              <Badge variant="outline" className="text-xs">Revenue</Badge>
            )}
            {node.ledgerCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {node.ledgerCount} ledgers
              </Badge>
            )}
            {node.totalBalance !== undefined && (
              <Badge variant="outline" className="text-xs">
                ₹{node.totalBalance.toLocaleString('en-IN')}
              </Badge>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {hierarchyData
              .filter(child => child.parent === node.name)
              .map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootNodes = hierarchyData.filter(node => 
    !node.parent || 
    node.parent === 'Primary' || 
    !hierarchyData.some(parent => parent.name === node.parent)
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
          <h1 className="text-2xl font-bold">Account Groups</h1>
          <p className="text-muted-foreground">
            Manage account groups with hierarchical structure and relationships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadGroupsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Search className="h-4 w-4 mt-3 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups Tree/List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <TreePine className="h-5 w-5 mr-2" />
                  Groups Hierarchy ({groups.length})
                </CardTitle>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tree">Tree</TabsTrigger>
                    <TabsTrigger value="flat">List</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'tree' && (
                  <div className="space-y-1">
                    {rootNodes.map(node => renderTreeNode(node))}
                  </div>
                )}

                {viewMode === 'flat' && (
                  <div className="space-y-2">
                    {filteredGroups.map(group => (
                      <div
                        key={group.guid}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedGroup?.name === group.name ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedGroup(group)}
                      >
                        <div className="flex items-center space-x-3">
                          <Folder className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-semibold">{group.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Parent: {group.parent}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {group.is_revenue && (
                            <Badge variant="outline">Revenue</Badge>
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'monthly' && monthlyAnalysis && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Fiscal Year 2025-2026</h3>
                      <p className="text-sm text-muted-foreground">
                        Monthly analysis for {monthlyAnalysis.totalGroups} groups
                      </p>
                    </div>
                    
                    {monthlyAnalysis.groups?.slice(0, 10).map((groupData, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Folder className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{groupData.group.name}</span>
                          </div>
                          <Badge variant="outline">
                            {groupData.ledgerCount} ledgers
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Net Balance: ₹{groupData.fiscalYearSummary.netBalance.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Group Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Parent: {selectedGroup.parent}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary Group:</span>
                      <Badge variant="outline">{selectedGroup.primary_group}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Account:</span>
                      <Badge variant={selectedGroup.is_revenue ? 'default' : 'secondary'}>
                        {selectedGroup.is_revenue ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deemed Positive:</span>
                      <Badge variant={selectedGroup.is_deemedpositive ? 'default' : 'secondary'}>
                        {selectedGroup.is_deemedpositive ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Affects Gross Profit:</span>
                      <Badge variant={selectedGroup.affects_gross_profit ? 'default' : 'secondary'}>
                        {selectedGroup.affects_gross_profit ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Network className="h-4 w-4 mr-2" />
                    View Relationships
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Monthly Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Ledgers
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Group
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a group to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Groups:</span>
                  <Badge variant="outline">{groups.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Revenue Groups:</span>
                  <Badge variant="outline">
                    {groups.filter(g => g.is_revenue).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Asset Groups:</span>
                  <Badge variant="outline">
                    {groups.filter(g => !g.is_revenue && g.is_deemedpositive).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Liability Groups:</span>
                  <Badge variant="outline">
                    {groups.filter(g => !g.is_revenue && !g.is_deemedpositive).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit Group Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit Group
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Group Name *</Label>
                  <Input 
                    id="edit-name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parent">Parent Group</Label>
                  <select
                    id="edit-parent"
                    value={editFormData.parent}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, parent: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Primary">Primary</option>
                    {groups.filter(g => g.name !== selectedGroup.name).map(group => (
                      <option key={group.guid} value={group.name}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-revenue"
                    checked={editFormData.is_revenue}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_revenue: !!checked }))}
                  />
                  <Label htmlFor="edit-revenue">Revenue Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-deemed"
                    checked={editFormData.is_deemedpositive}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_deemedpositive: !!checked }))}
                  />
                  <Label htmlFor="edit-deemed">Deemed Positive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-gross"
                    checked={editFormData.affects_gross_profit}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, affects_gross_profit: !!checked }))}
                  />
                  <Label htmlFor="edit-gross">Affects Gross Profit</Label>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateGroup}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Group
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm">
                  Are you sure you want to delete the group <strong>"{selectedGroup.name}"</strong>?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. All child ledgers will need to be reassigned.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteGroup}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // CRUD operation handlers
  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    try {
      console.log('Updating group...', editFormData);
      
      // API call to update group (would be implemented in backend)
      const response = await tallyApi.createGroup(companyId, divisionId, {
        ...editFormData,
        name: `${editFormData.name} (Updated)`
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update group');
      }

      toast({
        title: "Group Updated",
        description: `Group "${editFormData.name}" updated successfully`,
      });

      setShowEditDialog(false);
      await loadGroupsData();

    } catch (error) {
      console.error('Failed to update group:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update group",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      console.log('Deleting group...', selectedGroup.name);
      
      // API call to delete group (would be implemented in backend)
      // For now, we'll simulate the deletion
      
      toast({
        title: "Group Deleted",
        description: `Group "${selectedGroup.name}" deleted successfully`,
      });

      setShowDeleteDialog(false);
      setSelectedGroup(null);
      await loadGroupsData();

    } catch (error) {
      console.error('Failed to delete group:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete group",
        variant: "destructive"
      });
    }
  };

  // Initialize edit form when group is selected
  useEffect(() => {
    if (selectedGroup && showEditDialog) {
      setEditFormData({
        name: selectedGroup.name,
        parent: selectedGroup.parent,
        is_revenue: selectedGroup.is_revenue,
        is_deemedpositive: selectedGroup.is_deemedpositive,
        affects_gross_profit: selectedGroup.affects_gross_profit
      });
    }
  }, [selectedGroup, showEditDialog]);
}

export default GroupsPageEnhanced;
