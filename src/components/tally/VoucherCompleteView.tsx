import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Receipt, 
  MapPin, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Clock,
  Hash,
  Tag,
  Briefcase,
  Target,
  Package,
  ArrowLeft,
  Database,
  BarChart3,
  Warehouse,
  TreePine,
  Network,
  TrendingUp,
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tallyApi, type CompleteVoucher, type ApiResponse } from '@/services/tallyApiService';

interface VoucherCompleteViewProps {
  voucherId: string;
  companyId: string;
  divisionId: string;
  onBack?: () => void;
}

export function VoucherCompleteView({ 
  voucherId, 
  companyId, 
  divisionId, 
  onBack 
}: VoucherCompleteViewProps) {
  const [completeVoucher, setCompleteVoucher] = useState<CompleteVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    party: true,
    accounting: true,
    inventory: true,
    monthly: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCompleteVoucher();
  }, [voucherId, companyId, divisionId]);

  const loadCompleteVoucher = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading complete voucher relationships...');
      
      // Load complete voucher with all relationships
      const response = await tallyApi.getVoucherComplete(companyId, divisionId, voucherId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load voucher relationships');
      }

      setCompleteVoucher(response.data);
      console.log('Complete voucher loaded:', response.data);
      
    } catch (err) {
      console.error('Error loading complete voucher:', err);
      setError(err instanceof Error ? err.message : 'Failed to load voucher');
      toast({
        title: "Error",
        description: "Failed to load complete voucher details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !completeVoucher) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold">Failed to Load Voucher</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadCompleteVoucher}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { voucher, partyRelationship, accountingRelationships, inventoryRelationships, relationshipSummary } = completeVoucher;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Complete Voucher View</h1>
            <p className="text-muted-foreground">
              {voucher.type} #{voucher.number} - {voucher.date}
            </p>
          </div>
        </div>
        <Badge variant={relationshipSummary.transactionComplexity === 'Complex' ? 'destructive' : 'default'}>
          {relationshipSummary.transactionComplexity} Transaction
        </Badge>
      </div>

      {/* Voucher Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Voucher Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Voucher Number</label>
              <p className="font-semibold">{voucher.number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="font-semibold">{voucher.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p className="font-semibold">{voucher.date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="font-semibold">₹{voucher.amount.toLocaleString('en-IN')}</p>
            </div>
            {voucher.narration && (
              <div className="col-span-2 md:col-span-4">
                <label className="text-sm font-medium text-muted-foreground">Narration</label>
                <p className="font-semibold">{voucher.narration}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relationship Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Relationship Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{relationshipSummary.totalLedgersInvolved}</div>
              <div className="text-sm text-muted-foreground">Ledgers Involved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{relationshipSummary.totalStockItemsInvolved}</div>
              <div className="text-sm text-muted-foreground">Stock Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {relationshipSummary.hasInventory ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-muted-foreground">Has Inventory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {relationshipSummary.isPartyTransaction ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-muted-foreground">Party Transaction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="party" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="party">Party Relationship</TabsTrigger>
          <TabsTrigger value="accounting">Accounting Hierarchy</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Relationships</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Context</TabsTrigger>
        </TabsList>

        {/* Party Relationship Tab */}
        <TabsContent value="party" className="space-y-4">
          {partyRelationship ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Party Relationship
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('party')}
                  >
                    {expandedSections.party ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {expandedSections.party && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Party Ledger Hierarchy */}
                    {partyRelationship.partyLedger && (
                      <div>
                        <h4 className="font-semibold mb-2">Party Ledger Hierarchy</h4>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TreePine className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {partyRelationship.partyLedger.fullPath}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Opening Balance:</span>
                              <span className="ml-2 font-semibold">
                                ₹{partyRelationship.partyLedger.ledger.opening_balance.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Closing Balance:</span>
                              <span className="ml-2 font-semibold">
                                ₹{partyRelationship.partyLedger.ledger.closing_balance.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction History */}
                    <div>
                      <h4 className="font-semibold mb-2">Transaction History</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {partyRelationship.transactionHistory.totalVouchers}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Vouchers</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                ₹{partyRelationship.transactionHistory.totalAmount.toLocaleString('en-IN')}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Amount</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No party relationship for this voucher</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Accounting Hierarchy Tab */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Accounting Relationships ({accountingRelationships.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountingRelationships.map((relationship, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {/* Ledger Hierarchy */}
                    {relationship.ledgerHierarchy && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <TreePine className="h-4 w-4" />
                          <span className="font-mono text-sm">
                            {relationship.ledgerHierarchy.fullPath}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className={`ml-2 font-semibold ${relationship.isDebit ? 'text-red-600' : 'text-green-600'}`}>
                              {relationship.isDebit ? '-' : '+'}₹{Math.abs(relationship.amount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant={relationship.isDebit ? 'destructive' : 'default'} className="ml-2">
                              {relationship.isDebit ? 'Debit' : 'Credit'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Party Ledger:</span>
                            <Badge variant={relationship.isPartyLedger ? 'default' : 'secondary'} className="ml-2">
                              {relationship.isPartyLedger ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Relationships Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Relationships ({inventoryRelationships.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryRelationships.length > 0 ? (
                <div className="space-y-4">
                  {inventoryRelationships.map((relationship, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      {/* Stock Item Hierarchy */}
                      {relationship.stockItemHierarchy && (
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <TreePine className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {relationship.stockItemHierarchy.fullPath}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="ml-2 font-semibold">
                                {relationship.quantity.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="ml-2 font-semibold">
                                ₹{relationship.rate.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="ml-2 font-semibold">
                                ₹{relationship.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Godown:</span>
                              <span className="ml-2 font-semibold">
                                {relationship.godown || 'Main'}
                              </span>
                            </div>
                          </div>
                          {relationship.trackingNumber && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Tracking:</span>
                              <span className="ml-2 font-mono">{relationship.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inventory relationships for this voucher</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Context Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Context (Fiscal Year 2025-2026)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">This voucher is part of:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600">September 2025</div>
                      <div className="text-sm text-muted-foreground">Transaction Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">12 Vouchers</div>
                      <div className="text-sm text-muted-foreground">Month Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">Q2 FY26</div>
                      <div className="text-sm text-muted-foreground">Quarter</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Monthly Performance Context</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    This transaction occurred in September 2025, which had 12 total vouchers.
                    Compare with April 2025 (peak month) with 1,711 vouchers.
                  </p>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Monthly Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View in Tally
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Details
            </Button>
            <Button variant="outline" size="sm">
              <Network className="h-4 w-4 mr-2" />
              Explore Relationships
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monthly Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VoucherCompleteView;
