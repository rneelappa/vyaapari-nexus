import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApiVoucherTypesByCategory } from '@/hooks/useApiVoucherTypesByCategory';
import { useApiLedgerVouchers } from '@/hooks/useApiLedgerVouchers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, FileText, Calendar, ArrowLeft } from 'lucide-react';

export default function NonAccountingPage() {
  const { user } = useAuth();
  const { categories, loading, error, refresh } = useApiVoucherTypesByCategory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherType, setSelectedVoucherType] = useState<any>(null);
  const [showVoucherView, setShowVoucherView] = useState(false);
  
  const { vouchers, loading: vouchersLoading, fetchVouchersByType } = useApiLedgerVouchers();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter voucher types based on search term
  const filteredNonAccountingTypes = categories.nonAccounting.filter(vt =>
    vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vt.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Non-accounting transaction history for this voucher type
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Non-Accounting Voucher Types</h1>
          <p className="text-muted-foreground">
            View non-accounting voucher types and their transaction history
          </p>
        </div>
        <Button onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Non-Accounting Voucher Types</CardTitle>
          <CardDescription>
            Voucher types that don't directly affect accounting ledgers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search non-accounting voucher types..."
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
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={refresh} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Detailed View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredNonAccountingTypes.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No non-accounting voucher types found matching your search.
                      </div>
                    ) : (
                      filteredNonAccountingTypes.map((voucherType) => (
                        <Card
                          key={voucherType.guid}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleVoucherTypeClick(voucherType)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm">{voucherType.name}</CardTitle>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {voucherType.count}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Parent: {voucherType.parent}</p>
                              <p className="text-xs text-muted-foreground">
                                {voucherType.count} voucher{voucherType.count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Type</TableHead>
                          <TableHead>Parent Category</TableHead>
                          <TableHead className="text-right">Voucher Count</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNonAccountingTypes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No non-accounting voucher types found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredNonAccountingTypes.map((voucherType) => (
                            <TableRow
                              key={voucherType.guid}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleVoucherTypeClick(voucherType)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  {voucherType.name}
                                </div>
                              </TableCell>
                              <TableCell>{voucherType.parent}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline">
                                  {voucherType.count}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  Non-Accounting
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
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