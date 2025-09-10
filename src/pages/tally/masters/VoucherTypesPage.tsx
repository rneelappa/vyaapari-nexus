import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, FileSignature, Calculator, Package, Settings, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VoucherType {
  guid: string;
  company_id: string | null;
  division_id: string | null;
  name: string;
  parent: string;
  _parent: string;
  numbering_method: string;
  is_deemedpositive: boolean;
  affects_stock: boolean;
}

export default function VoucherTypesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVoucherTypes();
    }
  }, [user]);

  const fetchVoucherTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('mst_vouchertype')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      const transformedData: VoucherType[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id,
        division_id: item.division_id,
        name: item.name,
        parent: item.parent,
        _parent: item._parent,
        numbering_method: item.numbering_method,
        is_deemedpositive: !!item.is_deemedpositive,
        affects_stock: !!item.affects_stock,
      }));
      
      setVoucherTypes(transformedData);
    } catch (err) {
      console.error('Error fetching voucher types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch voucher types');
      setVoucherTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoucherTypes = voucherTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.numbering_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVoucherIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'sales':
      case 'purchase':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'payment':
      case 'receipt':
        return <Calculator className="h-4 w-4 text-green-600" />;
      case 'journal':
      case 'stock journal':
        return <FileSignature className="h-4 w-4 text-purple-600" />;
      default:
        return <FileSignature className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view voucher types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voucher Types</h1>
          <p className="text-muted-foreground">
            Manage different types of vouchers and their configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVoucherTypes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Voucher Type
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher Type Configuration</CardTitle>
          <CardDescription>
            Configure voucher types, numbering methods, and transaction properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voucher types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchVoucherTypes} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher Type</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Numbering</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead>Affects Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoucherTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No voucher types found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoucherTypes.map((type) => (
                        <TableRow key={type.guid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              {getVoucherIcon(type.name)}
                              {type.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{type.parent || '-'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Settings className="h-3 w-3 text-muted-foreground" />
                              <Badge 
                                variant={type.numbering_method === "Automatic" ? "default" : "secondary"}
                              >
                                {type.numbering_method || 'Not Set'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={type.is_deemedpositive ? "default" : "secondary"}
                            >
                              {type.is_deemedpositive ? "Debit" : "Credit"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {type.affects_stock ? (
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
