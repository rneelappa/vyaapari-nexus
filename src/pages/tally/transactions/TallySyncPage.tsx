import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Download, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface Voucher {
  guid: string;
  voucher_number: string;
  date: string;
  voucher_type: string;
  narration?: string;
  created_at: string;
}

interface SyncData {
  vouchers: Voucher[];
  division: {
    name: string;
    tally_enabled: boolean;
  } | null;
  summary: {
    totalVouchers: number;
    dateRange: string;
  };
}

export default function TallySyncPage() {
  const { divisionId } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [days, setDays] = useState(1);

  const fetchRecentVouchers = async (dayCount: number = 1) => {
    if (!divisionId) {
      toast({
        title: "Error",
        description: "Division ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-recent-vouchers', {
        body: { 
          divisionId,
          days: dayCount 
        }
      });

      if (error) throw error;

      if (data.success) {
        setSyncData(data);
        setDays(dayCount);
        toast({
          title: "Success",
          description: `Found ${data.summary.totalVouchers} vouchers from the last ${dayCount} day(s)`,
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vouchers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVoucherTypeBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sales':
        return 'default';
      case 'purchase':
        return 'secondary';
      case 'payment':
        return 'outline';
      case 'receipt':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tally Sync</h1>
          <p className="text-muted-foreground">
            View and sync vouchers between your system and Tally
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchRecentVouchers(1)}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Last Day
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchRecentVouchers(7)}
            disabled={isLoading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Last Week
          </Button>
          <Button
            onClick={() => fetchRecentVouchers(days)}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {syncData?.division && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Division: {syncData.division.name}
              <Badge variant={syncData.division.tally_enabled ? 'default' : 'secondary'}>
                {syncData.division.tally_enabled ? 'Tally Enabled' : 'Tally Disabled'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {syncData.summary.dateRange} • {syncData.summary.totalVouchers} vouchers found
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="vouchers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vouchers">Recent Vouchers</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <CardTitle>Voucher List</CardTitle>
              <CardDescription>
                Vouchers created in the last {days} day(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncData?.vouchers?.length ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voucher Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncData.vouchers.map((voucher) => (
                        <TableRow key={voucher.guid}>
                          <TableCell className="font-medium">
                            {voucher.voucher_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getVoucherTypeBadgeVariant(voucher.voucher_type)}>
                              {voucher.voucher_type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(voucher.date)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {voucher.narration || '-'}
                          </TableCell>
                          <TableCell>{formatDateTime(voucher.created_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {syncData ? 'No vouchers found for the selected period.' : 'Click refresh to load vouchers.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncData?.summary.totalVouchers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last {days} day(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Division Status</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncData?.division?.tally_enabled ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tally integration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Date Range</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{days}</div>
                <p className="text-xs text-muted-foreground">
                  Days analyzed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}