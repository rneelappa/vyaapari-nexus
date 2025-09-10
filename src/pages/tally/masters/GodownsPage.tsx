import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Warehouse, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Godown {
  guid: string;
  name: string;
  parent: string;
  address: string;
}

export default function GodownsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGodowns();
    }
  }, [user]);

  const fetchGodowns = async () => {
    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch from Supabase mst_godown table
      const { data, error } = await supabase
        .from('mst_godown')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match Godown interface
      const transformedGodowns: Godown[] = (data || []).map(item => ({
        guid: item.guid,
        name: item.name,
        parent: item.parent,
        address: item.address,
      }));
      
      setGodowns(transformedGodowns);
    } catch (err) {
      console.error('Error fetching godowns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch godowns');
      setGodowns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGodowns = godowns.filter(godown =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view godowns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Godowns</h1>
          <p className="text-muted-foreground">
            Manage warehouse locations and storage facilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchGodowns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Godown
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Locations</CardTitle>
          <CardDescription>
            Physical storage locations with stock information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search godowns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Godowns</TabsTrigger>
              <TabsTrigger value="primary">Primary</TabsTrigger>
              <TabsTrigger value="secondary">Secondary</TabsTrigger>
              <TabsTrigger value="high-value">High Value</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading godowns...</p>
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
                      <TableHead>Godown Name</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGodowns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">No godowns found. Data may need to be synchronized from Tally.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGodowns.map((godown) => (
                        <TableRow key={godown.guid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Warehouse className="h-4 w-4 text-muted-foreground" />
                              {godown.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{godown.parent}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm max-w-48 truncate">
                                {godown.address}
                              </span>
                            </div>
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
