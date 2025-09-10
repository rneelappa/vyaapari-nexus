import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Target, Building, Users, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// TEMPORARY DEBUG CODE - Remove after testing
async function debugAuth() {
  console.log('[DEBUG] CostCentersPage - Checking authentication status...');
  
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  console.log('[DEBUG] CostCentersPage - Session:', session, 'Error:', sessionError);
  
  const { data: user, error: userError } = await supabase.auth.getUser();
  console.log('[DEBUG] CostCentersPage - User:', user, 'Error:', userError);
  
  if (!session?.session) {
    console.error('[DEBUG] CostCentersPage - No session found - user not authenticated');
  } else {
    console.log('[DEBUG] CostCentersPage - Access token:', session.session.access_token?.substring(0, 20) + '...');
  }
  
  if (!user?.user) {
    console.error('[DEBUG] CostCentersPage - No user found - user not authenticated');
  }
  
  // Test a simple query with explicit auth header
  if (session?.session?.access_token) {
    try {
      console.log('[DEBUG] Testing authenticated query...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/companies?select=id,name&limit=1`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Accept-Profile': 'public'
        }
      });
      console.log('[DEBUG] Test query response:', response.status, await response.text());
    } catch (error) {
      console.error('[DEBUG] Test query failed:', error);
    }
  }
}

// Run debug immediately
debugAuth();

interface CostCenter {
  guid: string;
  name: string;
  parent: string;
  category: string;
}

export default function CostCentersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add circuit breaker state
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_COOLDOWN = 5000; // 5 seconds

  useEffect(() => {
    if (user && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const now = Date.now();
      if (now - lastFetchTime > FETCH_COOLDOWN) {
        fetchCostCenters();
      }
    }
  }, [user, fetchAttempts, lastFetchTime]);

  const fetchCostCenters = async () => {
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

    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(now);
      
      console.log('Fetching cost centers from Supabase...');
      
      // Fetch from Supabase mst_cost_centre table
      const { data, error } = await supabase
        .from('mst_cost_centre')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match CostCenter interface
      const transformedCenters: CostCenter[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent,
        category: item.category,
      }));
      
      setCostCenters(transformedCenters);
      setFetchAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error('Error fetching cost centers:', err);
      setFetchAttempts(prev => prev + 1);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cost centers';
      setError(errorMessage);
      setCostCenters([]);
      
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
    fetchCostCenters();
  };

  const filteredCostCenters = costCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view cost centers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cost Centers</h1>
          <p className="text-muted-foreground">
            Manage cost centers for expense allocation and tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Center
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Center Management</CardTitle>
          <CardDescription>
            Organizational units for cost allocation and budget tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Centers</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
              <TabsTrigger value="administration">Administration</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="active">Active Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading cost centers...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cost Center</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCostCenters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">No cost centers found. Data may need to be synchronized from Tally.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCostCenters.map((center) => (
                        <TableRow key={center.guid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              {center.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline">{center.parent}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {center.category}
                            </Badge>
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
                      ))
                    )}
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
