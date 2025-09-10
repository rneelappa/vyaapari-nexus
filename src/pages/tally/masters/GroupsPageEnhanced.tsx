/**
 * Enhanced Groups Page with Mock Data Fallback
 * Demonstrates improved error handling and offline capabilities
 * Safe for lovable.dev deployment - no environment changes
 */

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Edit, Trash2, Users, TrendingUp, TrendingDown, RefreshCw, TreePine, ChevronRight, ChevronDown, Wifi, WifiOff, AlertCircle, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMasterData, useDataProviderState, useCRUD } from "@/hooks/useDataProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

interface Group {
  id: string;
  name: string;
  parent?: string;
  primary_group?: string;
  is_revenue?: boolean;
  is_deemedpositive?: boolean;
  is_reserved?: boolean;
  affects_gross_profit?: boolean;
  sort_position?: number;
  created_at: string;
  updated_at: string;
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

export default function GroupsPageEnhanced() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [retryCount, setRetryCount] = useState(0);

  // Use our enhanced data provider hooks
  const { data: groups, error, loading, refetch } = useMasterData<Group>('mst_group');
  const { create, update, remove, isSupabaseAvailable } = useCRUD('mst_group');
  const dataProviderState = useDataProviderState();

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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      form.reset();
      setSelectedGroup(null);
    }
  }, [isAddDialogOpen, isEditDialogOpen, form]);

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
      const groupData = {
        name: data.name,
        parent: data.parent || null,
        primary_group: data.primary_group,
        is_revenue: data.is_revenue || false,
        is_deemedpositive: data.is_deemedpositive || true,
        affects_gross_profit: data.affects_gross_profit || false,
        company_id: 'default'
      };

      const { data: newGroup, error: createError } = await create(groupData);
      
      if (createError) {
        throw new Error(createError);
      }

      toast({
        title: "Success",
        description: "Group created successfully",
      });
      
      setIsAddDialogOpen(false);
      form.reset();
      refetch();
    } catch (err) {
      console.error('Error creating group:', err);
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
      const groupData = {
        name: data.name,
        parent: data.parent || null,
        primary_group: data.primary_group,
        is_revenue: data.is_revenue || false,
        is_deemedpositive: data.is_deemedpositive || true,
        affects_gross_profit: data.affects_gross_profit || false,
      };

      const { data: updatedGroup, error: updateError } = await update(selectedGroup.id, groupData);
      
      if (updateError) {
        throw new Error(updateError);
      }

      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      form.reset();
      refetch();
    } catch (err) {
      console.error('Error updating group:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    try {
      const { error: deleteError } = await remove(group.id);
      
      if (deleteError) {
        throw new Error(deleteError);
      }

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      
      refetch();
    } catch (err) {
      console.error('Error deleting group:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const filteredGroups = groups?.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hierarchicalGroups = buildGroupHierarchy(filteredGroups);

  const renderGroupRow = (group: Group, level = 0) => {
    const isExpanded = expandedGroups.has(group.name);
    const hasChildren = group.children && group.children.length > 0;

    return (
      <TableRow key={group.id} className={level > 0 ? "bg-muted/50" : ""}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newExpanded = new Set(expandedGroups);
                  if (isExpanded) {
                    newExpanded.delete(group.name);
                  } else {
                    newExpanded.add(group.name);
                  }
                  setExpandedGroups(newExpanded);
                }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            {group.name}
          </div>
        </TableCell>
        <TableCell>{group.parent || "Root"}</TableCell>
        <TableCell>
          <Badge variant="outline">{group.primary_group || "N/A"}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            {group.is_revenue && <Badge variant="secondary">Revenue</Badge>}
            {group.is_deemedpositive && <Badge variant="default">Positive</Badge>}
            {group.affects_gross_profit && <Badge variant="destructive">Gross Profit</Badge>}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedGroup(group);
                form.reset({
                  name: group.name,
                  parent: group.parent || "",
                  primary_group: group.primary_group || "",
                  is_revenue: group.is_revenue || false,
                  is_deemedpositive: group.is_deemedpositive || true,
                  affects_gross_profit: group.affects_gross_profit || false,
                });
                setIsEditDialogOpen(true);
              }}
            >
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
    );
  };

  const renderTreeView = (groups: Group[], level = 0) => {
    return groups.map(group => (
      <React.Fragment key={group.id}>
        {renderGroupRow(group, level)}
        {group.children && group.children.length > 0 && 
         expandedGroups.has(group.name) && 
         renderTreeView(group.children, level + 1)}
      </React.Fragment>
    ));
  };

  if (loading && !groups) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading groups...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Manage chart of accounts groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Data Provider Status */}
      <Alert>
        <div className="flex items-center gap-2">
          {dataProviderState.isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Source:</strong> {dataProviderState.isSupabaseAvailable ? 'Live Database' : 'Mock Data'} | 
            <strong> Status:</strong> {dataProviderState.isOnline ? 'Online' : 'Offline'} | 
            <strong> Retry Count:</strong> {retryCount}
          </AlertDescription>
        </div>
      </Alert>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Error fetching groups: {error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "tree")}>
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="tree">Tree View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Groups ({filteredGroups.length})</CardTitle>
          <CardDescription>
            {dataProviderState.isMockMode ? 'Using mock data - some features may be limited' : 'Live data from database'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No groups match your search criteria." : "Get started by creating your first group."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Primary Group</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewMode === "table" 
                  ? filteredGroups.map(group => renderGroupRow(group))
                  : renderTreeView(hierarchicalGroups)
                }
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Group Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new group in the chart of accounts.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddGroup)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
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
                    <FormLabel>Parent Group (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups?.map(group => (
                          <SelectItem key={group.id} value={group.name}>
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
                    <FormLabel>Primary Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIMARY_GROUPS.map(group => (
                          <SelectItem key={group} value={group}>
                            {group}
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Revenue Group</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="affects_gross_profit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Affects Gross Profit</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditGroup)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
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
                    <FormLabel>Parent Group (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups?.filter(g => g.id !== selectedGroup?.id).map(group => (
                          <SelectItem key={group.id} value={group.name}>
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
                    <FormLabel>Primary Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIMARY_GROUPS.map(group => (
                          <SelectItem key={group} value={group}>
                            {group}
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Revenue Group</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="affects_gross_profit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Affects Gross Profit</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
