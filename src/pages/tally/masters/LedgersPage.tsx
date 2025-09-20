import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, BookOpen, TrendingUp, TrendingDown, MapPin, CreditCard, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LedgerForm, type LedgerFormData } from '@/components/tally/master-forms/LedgerForm';
import { tallyApi, type Ledger, type ApiResponse } from "@/services/tallyApiService";

// Import useAuth and toast after debugAuth function
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// Ledger interface is now imported from tallyApiService

export default function LedgersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLedgerForEdit, setSelectedLedgerForEdit] = useState<Ledger | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLedgerForDelete, setSelectedLedgerForDelete] = useState<Ledger | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Array<{ name: string; guid: string }>>([]);

  // Add circuit breaker state
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_COOLDOWN = 5000; // 5 seconds

  useEffect(() => {
    if (user && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const now = Date.now();
      if (now - lastFetchTime > FETCH_COOLDOWN) {
        fetchLedgers();
        fetchGroups(); // Fetch groups for the form dropdown
      }
    }
  }, [user, fetchAttempts, lastFetchTime]);

  const fetchLedgers = async () => {
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
      
      console.log('Fetching ledgers from Tally API...');
      
      // Get company and division IDs (replace with actual values from context/props)
      const companyId = '629f49fb-983e-4141-8c48-e1423b39e921';
      const divisionId = '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
      
      // Fetch from Tally API with enhanced features
      const response = await tallyApi.getLedgers(companyId, divisionId, {
        page: 1,
        limit: 100,
        search: searchTerm
      });
      
      if (!response.success) {
        throw new Error(response.error || 'API call failed');
      }
      
      // Extract ledgers array from the nested data structure
      const ledgersData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any)?.ledgers || [];
      setLedgers(ledgersData);
      setFetchAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error('Error fetching ledgers:', err);
      setFetchAttempts(prev => prev + 1);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ledgers';
      setError(errorMessage);
      setLedgers([]);
      
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

  const fetchGroups = async () => {
    try {
      const response = await tallyApi.getGroups('629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd');
      if (response.success) {
        setAvailableGroups(response.data.map(group => ({ name: group.name, guid: group.guid })));
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  // CRUD operations
  const handleCreateLedger = async (data: LedgerFormData) => {
    try {
      setLoading(true);
      const response = await tallyApi.createLedger('629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Ledger created successfully",
        });
        setIsCreateDialogOpen(false);
        await fetchLedgers(); // Refresh data
      } else {
        throw new Error(response.error || 'Failed to create ledger');
      }
    } catch (err) {
      console.error('Error creating ledger:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create ledger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLedger = async (data: LedgerFormData) => {
    if (!selectedLedgerForEdit) return;
    
    try {
      setLoading(true);
      const response = await tallyApi.updateLedger('629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', selectedLedgerForEdit.guid, data);
      
      if (response.success) {
        toast({
          title: "Success", 
          description: "Ledger updated successfully",
        });
        setIsEditDialogOpen(false);
        setSelectedLedgerForEdit(null);
        await fetchLedgers(); // Refresh data
      } else {
        throw new Error(response.error || 'Failed to update ledger');
      }
    } catch (err) {
      console.error('Error updating ledger:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update ledger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLedger = async () => {
    if (!selectedLedgerForDelete) return;
    
    try {
      setLoading(true);
      const response = await tallyApi.deleteLedger('629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', selectedLedgerForDelete.guid);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Ledger deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedLedgerForDelete(null);
        await fetchLedgers(); // Refresh data
      } else {
        throw new Error(response.error || 'Failed to delete ledger');
      }
    } catch (err) {
      console.error('Error deleting ledger:', err);
      toast({
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to delete ledger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setFetchAttempts(0);
    setLastFetchTime(0);
    setError(null);
    fetchLedgers();
  };

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view ledgers.</p>
        </div>
      </div>
    );
  }

  const getDebitCreditIcon = (isDeemedPositive: boolean) => {
    return isDeemedPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ledgers</h1>
          <p className="text-muted-foreground">
            Manage individual ledger accounts in your chart of accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Ledger
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Ledger</DialogTitle>
                <DialogDescription>
                  Create a new ledger account in your chart of accounts
                </DialogDescription>
              </DialogHeader>
              <LedgerForm
                availableGroups={availableGroups}
                onSubmit={handleCreateLedger}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>
            Individual ledger accounts with balances and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ledgers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Ledgers</TabsTrigger>
              <TabsTrigger value="debtors">Sundry Debtors</TabsTrigger>
              <TabsTrigger value="creditors">Sundry Creditors</TabsTrigger>
              <TabsTrigger value="cash">Cash & Bank</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading ledgers...</p>
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
                      <TableHead>Ledger Name</TableHead>
                      <TableHead>Parent Group</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead>Opening Balance</TableHead>
                      <TableHead>Closing Balance</TableHead>
                      <TableHead>GSTN</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLedgers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">No ledgers found. Data may need to be synchronized from Tally.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLedgers.map((ledger) => (
                    <TableRow key={ledger.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{ledger.name}</div>
                            {ledger.alias && (
                              <div className="text-sm text-muted-foreground">
                                Alias: {ledger.alias}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ledger.parent}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getDebitCreditIcon(ledger.is_deemedpositive)}
                          <span className="text-sm">
                            {ledger.is_deemedpositive ? "Debit" : "Credit"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ledger.opening_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={ledger.closing_balance >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(ledger.closing_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ledger.gstn ? (
                          <Badge variant="secondary">{ledger.gstn}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {ledger.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <span>{ledger.email}</span>
                            </div>
                          )}
                          {ledger.mailing_address && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-32">{ledger.mailing_address}</span>
                            </div>
                          )}
                          {(ledger as any)?.bank_account_number && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              <span>****{(ledger as any).bank_account_number.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLedgerForEdit(ledger);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLedgerForDelete(ledger);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ledger</DialogTitle>
            <DialogDescription>
              Update ledger account information
            </DialogDescription>
          </DialogHeader>
          {selectedLedgerForEdit && (
            <LedgerForm
              initialData={{
                name: selectedLedgerForEdit.name,
                parent: selectedLedgerForEdit.parent,
                alias: selectedLedgerForEdit.alias || '',
                opening_balance: selectedLedgerForEdit.opening_balance || 0,
                credit_limit: (selectedLedgerForEdit as any).credit_limit || 0,
                credit_days: (selectedLedgerForEdit as any).credit_days || 0,
                mailing_name: (selectedLedgerForEdit as any).mailing_name || '',
                mailing_address: selectedLedgerForEdit.mailing_address || '',
                mailing_state: (selectedLedgerForEdit as any).mailing_state || '',
                mailing_country: (selectedLedgerForEdit as any).mailing_country || 'India',
                mailing_pincode: (selectedLedgerForEdit as any).mailing_pincode || '',
                email: selectedLedgerForEdit.email || '',
                it_pan: (selectedLedgerForEdit as any).it_pan || '',
                gstn: selectedLedgerForEdit.gstn || '',
                gst_registration_type: (selectedLedgerForEdit as any).gst_registration_type || '',
                bank_account_number: (selectedLedgerForEdit as any).bank_account_number || '',
                bank_ifsc: (selectedLedgerForEdit as any).bank_ifsc || '',
                bank_name: (selectedLedgerForEdit as any).bank_name || '',
                bank_branch: (selectedLedgerForEdit as any).bank_branch || '',
                ledger_contact: (selectedLedgerForEdit as any).ledger_contact || '',
                ledger_mobile: (selectedLedgerForEdit as any).ledger_mobile || '',
              }}
              availableGroups={availableGroups}
              onSubmit={handleEditLedger}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedLedgerForEdit(null);
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
            <AlertDialogTitle>Delete Ledger</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedLedgerForDelete?.name}"? This action cannot be undone and will affect all related transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedLedgerForDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLedger}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
