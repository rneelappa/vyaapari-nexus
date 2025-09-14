import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVoucherTypesByCategory } from '@/hooks/useVoucherTypesByCategory';
import { useLedgerVouchers } from '@/hooks/useLedgerVouchers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, FileText, Package, Calculator, Calendar, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function AccountingPage() {
  const { user } = useAuth();
  const { categories, loading, error, refresh } = useVoucherTypesByCategory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherType, setSelectedVoucherType] = useState<any>(null);
  const [showVoucherView, setShowVoucherView] = useState(false);
  
  const { vouchers, loading: vouchersLoading, fetchVouchersByType } = useLedgerVouchers();

  // Add state for managing collapsed months and fiscal years
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [collapsedFYs, setCollapsedFYs] = useState<Set<string>>(new Set());

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view voucher types.</p>
      </div>
    );
  }

  const handleVoucherTypeClick = async (voucherType: any) => {
    setSelectedVoucherType(voucherType);
    setShowVoucherView(true);
    await fetchVouchersByType(voucherType.name);
  };

  const handleBackToTypes = () => {
    setShowVoucherView(false);
    setSelectedVoucherType(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accounting': return <Calculator className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const toggleMonth = (monthKey: string) => {
    const newCollapsed = new Set(collapsedMonths);
    if (newCollapsed.has(monthKey)) {
      newCollapsed.delete(monthKey);
    } else {
      newCollapsed.add(monthKey);
    }
    setCollapsedMonths(newCollapsed);
  };

  const toggleFY = (fyKey: string) => {
    const newCollapsed = new Set(collapsedFYs);
    if (newCollapsed.has(fyKey)) {
      newCollapsed.delete(fyKey);
    } else {
      newCollapsed.add(fyKey);
    }
    setCollapsedFYs(newCollapsed);
  };

  // Build Monthly and Fiscal Year groups
  const monthlyGroups = (() => {
    const map = new Map<string, typeof vouchers>();
    vouchers.forEach(v => {
      const key = new Date(v.date).toISOString().slice(0,7); // YYYY-MM
      const arr = map.get(key) || [];
      arr.push(v);
      map.set(key, arr);
    });
    const result = Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: formatMonthLabel(items[0].date),
      items: items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
    // Sort by key desc (latest month first)
    result.sort((a,b) => a.key < b.key ? 1 : -1);
    return result;
  })();

  const fiscalYearGroups = (() => {
    const fyKey = (dateString: string) => {
      const d = new Date(dateString);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-12
      const startYear = m >= 4 ? y : y - 1; // FY starts in April
      const endShort = String((startYear + 1) % 100).padStart(2,'0');
      return { key: `${startYear}`, label: `FY ${startYear}-${endShort}` };
    };
    const map = new Map<string, { label: string, items: typeof vouchers }>();
    vouchers.forEach(v => {
      const { key, label } = fyKey(v.date);
      const group = map.get(key) || { label, items: [] as typeof vouchers };
      group.items.push(v);
      map.set(key, group);
    });
    const result = Array.from(map.entries()).map(([key, group]) => ({
      key,
      label: group.label,
      items: group.items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
    result.sort((a,b) => parseInt(b.key) - parseInt(a.key));
    return result;
  })();

  // If showing voucher view, render that instead
  if (showVoucherView && selectedVoucherType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToTypes}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Voucher Types
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Vouchers: {selectedVoucherType.name}</h1>
              <p className="text-muted-foreground">
                Transaction history for this voucher type
              </p>
            </div>
          </div>
          <Button onClick={refresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {vouchersLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading vouchers...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No vouchers found for this voucher type.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({vouchers.length})</TabsTrigger>
                <TabsTrigger value="monthly">Monthly ({monthlyGroups.length} months)</TabsTrigger>
                <TabsTrigger value="fy">Fiscal Year ({fiscalYearGroups.length} years)</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher #</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Narration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vouchers.map((voucher) => (
                          <TableRow key={voucher.guid}>
                            <TableCell className="font-medium">
                              {voucher.voucher_number}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {voucher.voucher_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(voucher.date)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(Math.abs(voucher.amount))}
                              </span>
                            </TableCell>
                            <TableCell>{voucher.party_ledger_name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {voucher.narration}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="mt-0">
                <div className="space-y-4">
                  {monthlyGroups.map((group) => {
                    const monthTotal = group.items.reduce((sum, voucher) => sum + Math.abs(voucher.amount), 0);
                    const isCollapsed = collapsedMonths.has(group.key);
                    
                    return (
                      <Card key={group.key}>
                        <Collapsible>
                          <CollapsibleTrigger 
                            className="w-full"
                            onClick={() => toggleMonth(group.key)}
                          >
                            <CardHeader className="hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isCollapsed ? 
                                    <ChevronRight className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                  <CardTitle className="text-left">{group.label}</CardTitle>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary">{group.items.length} vouchers</Badge>
                                  <span className="font-mono text-sm">{formatCurrency(monthTotal)}</span>
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Voucher #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Party</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.items.map((voucher) => (
                                    <TableRow key={voucher.guid}>
                                      <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                                      <TableCell>{formatDate(voucher.date)}</TableCell>
                                      <TableCell className="text-right">
                                        <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                          {formatCurrency(Math.abs(voucher.amount))}
                                        </span>
                                      </TableCell>
                                      <TableCell>{voucher.party_ledger_name}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="fy" className="mt-0">
                <div className="space-y-4">
                  {fiscalYearGroups.map((group) => {
                    const fyTotal = group.items.reduce((sum, voucher) => sum + Math.abs(voucher.amount), 0);
                    const isCollapsed = collapsedFYs.has(group.key);
                    
                    return (
                      <Card key={group.key}>
                        <Collapsible>
                          <CollapsibleTrigger 
                            className="w-full"
                            onClick={() => toggleFY(group.key)}
                          >
                            <CardHeader className="hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isCollapsed ? 
                                    <ChevronRight className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                  <CardTitle className="text-left">{group.label}</CardTitle>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary">{group.items.length} vouchers</Badge>
                                  <span className="font-mono text-sm">{formatCurrency(fyTotal)}</span>
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Voucher #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Party</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.items.map((voucher) => (
                                    <TableRow key={voucher.guid}>
                                      <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                                      <TableCell>{formatDate(voucher.date)}</TableCell>
                                      <TableCell className="text-right">
                                        <span className={voucher.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                          {formatCurrency(Math.abs(voucher.amount))}
                                        </span>
                                      </TableCell>
                                      <TableCell>{voucher.party_ledger_name}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Voucher Types</h1>
          <p className="text-muted-foreground">
            View voucher types categorized by their accounting nature
          </p>
        </div>
        <Button onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher Types Overview</CardTitle>
          <CardDescription>
            Click on any voucher type to view its transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voucher types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <Tabs defaultValue="accounting" className="w-full">
                <TabsList>
                  <TabsTrigger value="accounting" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Accounting ({categories.accounting.length})
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Inventory ({categories.inventory.length})
                  </TabsTrigger>
                  <TabsTrigger value="non-accounting" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Non-Accounting ({categories.nonAccounting.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="accounting" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Type</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead className="text-center">Stock Impact</TableHead>
                          <TableHead className="text-center">Voucher Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.accounting
                          .filter(vt => 
                            vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vt.parent.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((voucherType) => (
                          <TableRow
                            key={voucherType.guid}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleVoucherTypeClick(voucherType)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon('accounting')}
                                {voucherType.name}
                              </div>
                            </TableCell>
                            <TableCell>{voucherType.parent}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={voucherType.affects_stock ? "default" : "secondary"}>
                                {voucherType.affects_stock ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{voucherType.count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Type</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead className="text-center">Stock Impact</TableHead>
                          <TableHead className="text-center">Voucher Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.inventory
                          .filter(vt => 
                            vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vt.parent.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((voucherType) => (
                          <TableRow
                            key={voucherType.guid}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleVoucherTypeClick(voucherType)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon('inventory')}
                                {voucherType.name}
                              </div>
                            </TableCell>
                            <TableCell>{voucherType.parent}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default">Yes</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{voucherType.count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="non-accounting" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Type</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead className="text-center">Stock Impact</TableHead>
                          <TableHead className="text-center">Voucher Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.nonAccounting
                          .filter(vt => 
                            vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vt.parent.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((voucherType) => (
                          <TableRow
                            key={voucherType.guid}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleVoucherTypeClick(voucherType)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon('non-accounting')}
                                {voucherType.name}
                              </div>
                            </TableCell>
                            <TableCell>{voucherType.parent}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={voucherType.affects_stock ? "default" : "secondary"}>
                                {voucherType.affects_stock ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{voucherType.count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}