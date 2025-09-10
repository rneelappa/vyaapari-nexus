import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Users, TrendingUp, TrendingDown, RefreshCw, TreePine, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TallyApiService, { TallyGroup } from "@/services/tally-api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingErrorState } from "@/components/common/LoadingErrorState";

// Group Form Schema
const groupFormSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  parent: z.string().optional(),
  primary_group: z.string().min(1, "Primary group is required"),
  is_revenue: z.boolean().optional(),
  is_deemedpositive: z.boolean().optional(),
  affects_gross_profit: z.boolean().optional(),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

interface Group extends TallyGroup {
  children?: Group[];
  level?: number;
}

// Primary groups for dropdown
const PRIMARY_GROUPS = [
  "Assets (Current)",
  "Assets (Fixed)",
  "Liabilities (Current)",
  "Liabilities",
  "Income (Direct)",
  "Income (Indirect)", 
  "Expenses (Direct)",
  "Expenses (Indirect)",
];

export default function GroupsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      parent: "",
      primary_group: "",
      is_revenue: false,
      is_deemedpositive: true,
      affects_gross_profit: false,
    },
  });

  // Add circuit breaker state
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_COOLDOWN = 5000; // 5 seconds

  useEffect(() => {
    if (user && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const now = Date.now();
      if (now - lastFetchTime > FETCH_COOLDOWN) {
        fetchGroups();
      }
    }
  }, [user, fetchAttempts, lastFetchTime]);

  const fetchGroups = async () => {
    // Circuit breaker: prevent too many rapid calls
    const now = Date.now();
    if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
      setError(`Too many failed attempts. Please refresh the page to try again.`);
      return;
    }

    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('Skipping fetch due to cooldown period');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(now);
      
      console.log('Fetching groups from Supabase...');
      
      // Fetch groups from Supabase with timeout
      const { data, error } = await supabase
        .from('mst_group')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match Group interface
      const transformedGroups: Group[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id || '',
        division_id: item.division_id || '',
        name: item.name,
        parent: item.parent,
        _parent: item._parent,
        primary_group: item.primary_group,
        is_revenue: !!item.is_revenue,
        is_deemedpositive: !!item.is_deemedpositive,
        is_reserved: !!item.is_reserved,
        affects_gross_profit: !!item.affects_gross_profit,
        sort_position: item.sort_position,
        created_at: new Date().toISOString(), // Set current timestamp as fallback
      }));
      
      setGroups(transformedGroups);
      setFetchAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error('Error fetching groups:', err);
      setFetchAttempts(prev => prev + 1);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(errorMessage);
      setGroups([]);
      
      // Don't show destructive toasts for permission errors as they spam the UI
      if (!errorMessage.includes('permission denied')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setFetchAttempts(0);
    setLastFetchTime(0);
    setError(null);
    fetchGroups();
  };

  const buildGroupHierarchy = (groups: Group[]): Group[] => {
    const groupMap = new Map<string, Group>();
    const rootGroups: Group[] = [];

    // Create map of all groups
    groups.forEach(group => {
      groupMap.set(group.name, { ...group, children: [], level: 0 });
    });

    // Build hierarchy
    groups.forEach(group => {
      if (group.parent && group.parent !== group.name && groupMap.has(group.parent)) {
        const parent = groupMap.get(group.parent)!;
        const child = groupMap.get(group.name)!;
        child.level = (parent.level || 0) + 1;
        parent.children!.push(child);
      } else {
        const rootGroup = groupMap.get(group.name)!;
        rootGroups.push(rootGroup);
      }
    });

    return rootGroups.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleAddGroup = async (data: GroupFormData) => {
    try {
      const { error } = await supabase
        .from('mst_group')
        .insert({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          primary_group: data.primary_group,
          is_revenue: data.is_revenue ? 1 : 0,
          is_deemedpositive: data.is_deemedpositive ? 1 : 0,
          affects_gross_profit: data.affects_gross_profit ? 1 : 0,
          guid: crypto.randomUUID(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setIsAddDialogOpen(false);
      form.reset();
      fetchGroups();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = async (data: GroupFormData) => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('mst_group')
        .update({
          name: data.name,
          parent: data.parent || '',
          _parent: data.parent || '',
          primary_group: data.primary_group,
          is_revenue: data.is_revenue ? 1 : 0,
          is_deemedpositive: data.is_deemedpositive ? 1 : 0,
          affects_gross_profit: data.affects_gross_profit ? 1 : 0,
        })
        .eq('guid', selectedGroup.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      form.reset();
      fetchGroups();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    try {
      const { error } = await supabase
        .from('mst_group')
        .delete()
        .eq('guid', group.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      fetchGroups();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    form.reset({
      name: group.name,
      parent: group.parent,
      primary_group: group.primary_group,
      is_revenue: !!group.is_revenue,
      is_deemedpositive: !!group.is_deemedpositive,
      affects_gross_profit: !!group.affects_gross_profit,
    });
    setIsEditDialogOpen(true);
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.primary_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hierarchicalGroups = buildGroupHierarchy(filteredGroups);

  const getDebitCreditIcon = (isDeemedPositive: boolean) => {
    return isDeemedPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const renderTreeNode = (group: Group, level: number = 0) => {
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedGroups.has(group.name);
    
    return (
      <div key={group.guid}>
        <TableRow className="hover:bg-muted/50">
          <TableCell className="font-medium">
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleGroupExpansion(group.name)}
                  className="p-1 hover:bg-accent rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{group.name}</span>
            </div>
          </TableCell>
          <TableCell>{group.parent}</TableCell>
          <TableCell>
            <Badge variant="outline">{group.primary_group}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-1">
              {getDebitCreditIcon(group.is_deemedpositive)}
              <span className="text-sm">
                {group.is_deemedpositive ? "Debit" : "Credit"}
              </span>
            </div>
          </TableCell>
          <TableCell>
            {group.is_revenue ? (
              <Badge variant="default">Yes</Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
            )}
          </TableCell>
          <TableCell>
            {group.affects_gross_profit ? (
              <Badge variant="default">Yes</Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
            )}
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => openEditDialog(group)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Group</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{group.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteGroup(group)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && group.children?.map(child => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view groups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Manage chart of accounts groups and their hierarchy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchGroups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant={viewMode === "tree" ? "default" : "outline"} 
            onClick={() => setViewMode(viewMode === "tree" ? "table" : "tree")}
          >
            <TreePine className="h-4 w-4 mr-2" />
            {viewMode === "tree" ? "Table View" : "Tree View"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
                <DialogDescription>
                  Create a new accounting group. Groups organize your chart of accounts.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddGroup)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter group name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent group (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.guid} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primary_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Group *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIMARY_GROUPS.map((primaryGroup) => (
                              <SelectItem key={primaryGroup} value={primaryGroup}>
                                {primaryGroup}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_revenue"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>Revenue Group</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_deemedpositive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>Debit Nature</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="affects_gross_profit"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Affects Gross Profit</FormLabel>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Group</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Groups</CardTitle>
          <CardDescription>
            Hierarchical structure of account groups in your chart of accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error: {error}</div>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={fetchAttempts >= MAX_FETCH_ATTEMPTS}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {fetchAttempts >= MAX_FETCH_ATTEMPTS ? 'Max attempts reached' : 'Try Again'}
              </Button>
              {fetchAttempts >= MAX_FETCH_ATTEMPTS && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please refresh the page to try again
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Parent Group</TableHead>
                    <TableHead>Primary Group</TableHead>
                    <TableHead>Nature</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Affects P&L</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewMode === "tree" ? (
                    hierarchicalGroups.map(group => renderTreeNode(group, 0))
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.guid}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {group.name}
                          </div>
                        </TableCell>
                        <TableCell>{group.parent}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{group.primary_group}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getDebitCreditIcon(group.is_deemedpositive)}
                            <span className="text-sm">
                              {group.is_deemedpositive ? "Debit" : "Credit"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {group.is_revenue ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {group.affects_gross_profit ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(group)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Group</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{group.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteGroup(group)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group details. Make sure to maintain proper hierarchy.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditGroup)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent group (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups
                          .filter(g => g.name !== selectedGroup?.name) // Prevent self-reference
                          .map((group) => (
                            <SelectItem key={group.guid} value={group.name}>
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primary_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Group *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIMARY_GROUPS.map((primaryGroup) => (
                          <SelectItem key={primaryGroup} value={primaryGroup}>
                            {primaryGroup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_revenue"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Revenue Group</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_deemedpositive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Debit Nature</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="affects_gross_profit"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Affects Gross Profit</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Group</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
