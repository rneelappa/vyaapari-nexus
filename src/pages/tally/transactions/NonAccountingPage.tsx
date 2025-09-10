import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, FileText, Calendar, Settings, Users, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NonAccountingEntry {
  guid: string;
  company_id: string | null;
  division_id: string | null;
  date: string | null;
  voucher_type: string | null;
  voucher_number: string | null;
  narration: string | null;
}

export default function NonAccountingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [nonAccountingEntries, setNonAccountingEntries] = useState<NonAccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNonAccountingEntries();
  }, []);

  const fetchNonAccountingEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tally_trn_voucher')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      const transformedData: NonAccountingEntry[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id,
        division_id: item.division_id,
        date: item.date,
        voucher_type: item.voucher_type,
        voucher_number: item.voucher_number,
        narration: item.narration,
      }));
      
      setNonAccountingEntries(transformedData);
    } catch (err) {
      console.error('Error fetching non-accounting entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch non-accounting entries');
      setNonAccountingEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = nonAccountingEntries.filter(entry =>
    (entry.voucher_type && entry.voucher_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.voucher_number && entry.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.narration && entry.narration.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getVoucherTypeIcon = (type: string | null) => {
    if (!type) return <FileText className="h-4 w-4 text-muted-foreground" />;
    
    switch (type.toLowerCase()) {
      case 'memo':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'contra':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'debit note':
      case 'credit note':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Non-Accounting Transactions</h1>
          <p className="text-muted-foreground">
            View memorandums, voucher references, and non-financial entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNonAccountingEntries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher References</CardTitle>
          <CardDescription>
            Non-accounting vouchers, memos, and reference documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="memo">Memo</TabsTrigger>
              <TabsTrigger value="contra">Contra</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchNonAccountingEntries} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Voucher Type</TableHead>
                        <TableHead>Voucher Number</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No non-accounting entries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getVoucherTypeIcon(entry.voucher_type)}
                                <Badge variant="outline">
                                  {entry.voucher_type || 'Unknown'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.voucher_number || '-'}
                            </TableCell>
                            <TableCell className="max-w-md">
                              <span className="text-sm text-muted-foreground line-clamp-2">
                                {entry.narration || 'No narration'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
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
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}