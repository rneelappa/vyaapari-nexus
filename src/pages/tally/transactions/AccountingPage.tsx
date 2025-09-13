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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Calculator, TrendingUp, TrendingDown, RefreshCw, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// TEMPORARY DEBUG CODE - Remove after testing
async function debugAuth() {
  console.log('[DEBUG] AccountingPage - Checking authentication status...');
  
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  console.log('[DEBUG] AccountingPage - Session:', session, 'Error:', sessionError);
  
  const { data: user, error: userError } = await supabase.auth.getUser();
  console.log('[DEBUG] AccountingPage - User:', user, 'Error:', userError);
  
  if (!session?.session) {
    console.error('[DEBUG] AccountingPage - No session found - user not authenticated');
  } else {
    console.log('[DEBUG] AccountingPage - Access token:', session.session.access_token?.substring(0, 20) + '...');
  }
  
  if (!user?.user) {
    console.error('[DEBUG] AccountingPage - No user found - user not authenticated');
  }
  
  // Test a simple query with explicit auth header
  if (session?.session?.access_token) {
    try {
      console.log('[DEBUG] Testing authenticated query...');
      const response = await fetch(`https://hycyhnjsldiokfkpqzoz.supabase.co/rest/v1/companies?select=id,name&limit=1`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3lobmpzbGRpb2tma3Bxem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NzQyMzksImV4cCI6MjA3MzA1MDIzOX0.pYalSrD_FP8tRY-bPCfFGbXavUq0eGwRmQUCIPnPxNk',
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

// Form Schema
const accountingFormSchema = z.object({
  ledger: z.string().min(1, "Ledger is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  amount_forex: z.number().optional(),
  currency: z.string().min(1, "Currency is required"),
});

type AccountingFormData = z.infer<typeof accountingFormSchema>;

interface AccountingEntry {
  guid: string;
  company_id: string | null;
  division_id: string | null;
  ledger: string;
  _ledger: string;
  amount: number;
  amount_forex: number;
  currency: string;
}

export default function AccountingPage() {
  console.log('[DEBUG] AccountingPage component rendering...');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [availableLedgers, setAvailableLedgers] = useState<string[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<Array<{guid: string, name: string, parent: string}>>([]);

  console.log('[DEBUG] Creating form instances...');
  
  const addFormInstance = useForm<AccountingFormData>({
    resolver: zodResolver(accountingFormSchema),
    defaultValues: {
      ledger: "",
      amount: 0,
      amount_forex: 0,
      currency: "INR",
    },
  });

  console.log('[DEBUG] addFormInstance created:', addFormInstance);

  const editFormInstance = useForm<AccountingFormData>({
    resolver: zodResolver(accountingFormSchema),
    defaultValues: {
      ledger: "",
      amount: 0,
      amount_forex: 0,
      currency: "INR",
    },
  });

  console.log('[DEBUG] editFormInstance created:', editFormInstance);
  // Add circuit breaker state
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_COOLDOWN = 5000; // 5 seconds

  // Fetch available ledgers and voucher types for the forms
  useEffect(() => {
    const fetchLedgersAndVoucherTypes = async () => {
      try {
        // Fetch ledgers
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('mst_ledger')
          .select('name')
          .order('name');
        
        if (ledgerError) throw ledgerError;
        
        const ledgerNames = ledgerData?.map(ledger => ledger.name) || [];
        setAvailableLedgers(ledgerNames);

        // Fetch voucher types
        const { data: voucherData, error: voucherError } = await supabase
          .from('mst_vouchertype')
          .select('guid, name, parent')
          .order('name');
        
        if (voucherError) throw voucherError;
        
        setVoucherTypes(voucherData || []);
      } catch (err) {
        console.error('Error fetching ledgers and voucher types:', err);
      }
    };
    
    if (user) {
      fetchLedgersAndVoucherTypes();
    }
  }, [user]);

  useEffect(() => {
    if (user && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const now = Date.now();
      if (now - lastFetchTime > FETCH_COOLDOWN) {
        fetchAccountingEntries();
      }
    }
  }, [user, fetchAttempts, lastFetchTime]);

  const fetchAccountingEntries = async () => {
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
      
      console.log('Fetching accounting entries from Supabase...');
      
      const { data, error } = await supabase
        .from('trn_accounting')
        .select('*')
        .order('guid')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      const transformedData: AccountingEntry[] = (data || []).map(item => ({
        guid: item.guid,
        company_id: item.company_id,
        division_id: item.division_id,
        ledger: item.ledger,
        _ledger: item._ledger,
        amount: item.amount || 0,
        amount_forex: item.amount_forex || 0,
        currency: item.currency || 'INR',
      }));
      
      setAccountingEntries(transformedData);
      setFetchAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error('Error fetching accounting entries:', err);
      setFetchAttempts(prev => prev + 1);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounting entries';
      setError(errorMessage);
      setAccountingEntries([]);
      
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
    fetchAccountingEntries();
  };

  // CRUD Operations
  const handleAddEntry = async (data: AccountingFormData) => {
    try {
      const { error } = await supabase
        .from('trn_accounting')
        .insert({
          guid: crypto.randomUUID(),
          ledger: data.ledger,
          _ledger: data.ledger,
          amount: data.amount,
          amount_forex: data.amount_forex || data.amount,
          currency: data.currency,
          company_id: null, // You might want to set this based on current company
          division_id: null, // You might want to set this based on current division
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Accounting entry created successfully",
      });

      setIsAddDialogOpen(false);
      addFormInstance.reset();
      fetchAccountingEntries();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create entry",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = async (data: AccountingFormData) => {
    if (!selectedEntry) return;

    try {
      const { error } = await supabase
        .from('trn_accounting')
        .update({
          ledger: data.ledger,
          _ledger: data.ledger,
          amount: data.amount,
          amount_forex: data.amount_forex || data.amount,
          currency: data.currency,
        })
        .eq('guid', selectedEntry.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Accounting entry updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedEntry(null);
      editFormInstance.reset();
      fetchAccountingEntries();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update entry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (entry: AccountingEntry) => {
    try {
      const { error } = await supabase
        .from('trn_accounting')
        .delete()
        .eq('guid', entry.guid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Accounting entry deleted successfully",
      });

      fetchAccountingEntries();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  const handleVoucherTypeClick = (voucherType: {guid: string, name: string, parent: string}) => {
    if (voucherType.name.toLowerCase() === 'sales' || voucherType.parent.toLowerCase() === 'sales') {
      // Navigate to Sales Voucher Create page
      navigate('/tally/transactions/sales/create');
    } else {
      // Open the default Add Transaction dialog for other voucher types
      setIsAddDialogOpen(true);
    }
  };

  const openEditDialog = (entry: AccountingEntry) => {
    console.log('[DEBUG] openEditDialog called with entry:', entry);
    console.log('[DEBUG] editFormInstance available:', !!editFormInstance);
    setSelectedEntry(entry);
    editFormInstance.reset({
      ledger: entry.ledger,
      amount: Math.abs(entry.amount), // Always positive in forms, sign is handled separately
      amount_forex: entry.amount_forex,
      currency: entry.currency,
    });
    setIsEditDialogOpen(true);
  };

  const filteredEntries = accountingEntries.filter(entry =>
    entry.ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry._ledger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDebitCreditIcon = (amount: number) => {
    return amount >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getDebitCreditBadge = (amount: number) => {
    return amount >= 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Debit</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Credit</Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view accounting transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Transactions</h1>
          <p className="text-muted-foreground">
            View and manage accounting ledger entries and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border border-border shadow-md z-50">
              {voucherTypes.map((voucherType) => (
                <DropdownMenuItem 
                  key={voucherType.guid}
                  onClick={() => handleVoucherTypeClick(voucherType)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{voucherType.name}</span>
                    {voucherType.parent && (
                      <span className="text-xs text-muted-foreground">{voucherType.parent}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {voucherTypes.length === 0 && (
                <DropdownMenuItem disabled>
                  No voucher types available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Create a new accounting entry. Enter the ledger details and amount.
                </DialogDescription>
              </DialogHeader>
              <Form {...addFormInstance}>
                <form onSubmit={addFormInstance.handleSubmit(handleAddEntry)} className="space-y-4">
                  <FormField
                    control={addFormInstance.control}
                    name="ledger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ledger *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ledger" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableLedgers.map((ledger, index) => (
                              <SelectItem key={`add-ledger-${index}-${ledger}`} value={ledger}>
                                {ledger}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addFormInstance.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Enter amount" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addFormInstance.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addFormInstance.control}
                    name="amount_forex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foreign Exchange Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Enter forex amount (optional)" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Entry</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
          <CardDescription>
            Ledger-wise accounting transactions and journal entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="debit">Debit Entries</TabsTrigger>
              <TabsTrigger value="credit">Credit Entries</TabsTrigger>
              <TabsTrigger value="forex">Foreign Exchange</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">Error: {error}</div>
                  <Button onClick={fetchAccountingEntries} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ledger</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Foreign Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No accounting entries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.guid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                {entry.ledger}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getDebitCreditIcon(entry.amount)}
                                {getDebitCreditBadge(entry.amount)}
                              </div>
                            </TableCell>
                            <TableCell className={`font-medium ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(entry.amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entry.currency}</Badge>
                            </TableCell>
                            <TableCell>
                              {entry.amount_forex !== 0 ? formatCurrency(entry.amount_forex) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
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
                                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this accounting entry for "{entry.ledger}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteEntry(entry)}>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the accounting entry details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editFormInstance}>
            <form onSubmit={editFormInstance.handleSubmit(handleEditEntry)} className="space-y-4">
              <FormField
                control={editFormInstance.control}
                name="ledger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ledger *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ledger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableLedgers.map((ledger, index) => (
                          <SelectItem key={`edit-ledger-${index}-${ledger}`} value={ledger}>
                            {ledger}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editFormInstance.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Enter amount" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editFormInstance.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editFormInstance.control}
                name="amount_forex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foreign Exchange Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Enter forex amount (optional)" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Entry</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}