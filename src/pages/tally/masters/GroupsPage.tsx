import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Users, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TallyApiService, { TallyGroup } from "@/services/tally-api";

interface Group extends TallyGroup {
  // Additional UI-specific properties can be added here
}

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from Tally API
      const response = await TallyApiService.getGroups({ limit: 100 });
      
      if (response.success) {
        setGroups(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      
      // Fallback to empty array if API fails
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.primary_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDebitCreditIcon = (isDeemedPositive: boolean) => {
    return isDeemedPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
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

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">Error: {error}</div>
                  <Button onClick={fetchGroups} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Parent Group</TableHead>
                    <TableHead>Primary Group</TableHead>
                    <TableHead>Nature</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Affects P&L</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
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
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
