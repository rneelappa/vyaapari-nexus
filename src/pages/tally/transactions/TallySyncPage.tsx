import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Download, Clock, TrendingUp, CalendarIcon, Play, Database, Package, Building2, FileText, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEnhancedTallySync } from '@/hooks/useEnhancedTallySync';
import { EnhancedProcessingView } from '@/components/tally/EnhancedProcessingView';
import { XmlDataAnalysis } from '@/components/tally/XmlDataAnalysis';

interface Voucher {
  guid: string;
  voucher_number: string;
  date: string;
  voucher_type: string;
  narration?: string;
  created_at: string;
  company_id?: string;
}

interface SyncData {
  vouchers: Voucher[];
  division: {
    name: string;
    tally_enabled: boolean;
  } | null;
  tally?: {
    requestedCompany?: string;
    url?: string;
    status?: number;
    voucherCount?: number;
    responseLength?: number;
    requestXml?: string;
    responseXml?: string;
  } | null;
  parseResults?: {
    results: {
      table: string;
      action: 'inserted' | 'updated' | 'ignored';
      guid: string;
      details?: any;
    }[];
    summary: {
      total: number;
      inserted: number;
      updated: number;
      ignored: number;
    };
  } | null;
  summary: {
    totalVouchers: number;
    dateRange: string;
    tallyVoucherCount?: number;
  };
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function TallySyncPage() {
  const { divisionId } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  
  // Enhanced sync capabilities
  const {
    isProcessing,
    currentProgress,
    allResults,
    summary: enhancedSummary,
    processXmlData,
    getRecordsByType,
    getRecordsByAction
  } = useEnhancedTallySync();
  
  const [showEnhancedProcessing, setShowEnhancedProcessing] = useState(false);

  const fetchVouchersByDateRange = async (fromDate?: Date, toDate?: Date) => {
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
      // Set default date range if not provided
      const defaultFromDate = fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const defaultToDate = toDate || new Date(); // Today
      
      const { data, error } = await supabase.functions.invoke('get-recent-vouchers', {
        body: { 
          divisionId,
          fromDate: format(defaultFromDate, 'yyyy-MM-dd'), // YYYY-MM-DD format (local)
          toDate: format(defaultToDate, 'yyyy-MM-dd')
        }
      });

      if (error) throw error;

      if (data.success) {
        setSyncData(data);
        const dateRangeText = fromDate && toDate 
          ? `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`
          : `Last day`;
        toast({
          title: "Success",
          description: `DB: ${data.summary.totalVouchers} • Tally: ${data.summary.tallyVoucherCount ?? 0}`,
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

  const fetchRecentVouchers = (dayCount: number) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - dayCount);
    
    setDateRange({ from: fromDate, to: toDate });
    fetchVouchersByDateRange(fromDate, toDate);
  };

  const handleDateRangeSearch = () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }
    
    fetchVouchersByDateRange(dateRange.from, dateRange.to);
  };

  const handleEnhancedProcessing = async () => {
    if (!syncData?.tally?.responseXml) {
      toast({
        title: "No XML Data",
        description: "Please fetch vouchers first to get XML data for processing",
        variant: "destructive",
      });
      return;
    }

    setShowEnhancedProcessing(true);
    
    try {
        await processXmlData(
        syncData.tally.responseXml,
        divisionId!,
        syncData.vouchers[0]?.company_id || null,
        (update) => {
          console.log('Progress update:', update);
        }
      );
    } catch (error) {
      console.error('Enhanced processing failed:', error);
    }
  };

  const handleSyncNow = async () => {
    if (!divisionId || !syncData?.vouchers?.length) {
      toast({
        title: "Error", 
        description: "No vouchers to sync or missing division ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Ensure we have Tally XML for enhanced upsert
      const ensureXml = async (): Promise<string | null> => {
        if (syncData?.tally?.responseXml) return syncData.tally.responseXml;
        const from = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const to = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const { data, error } = await supabase.functions.invoke('get-recent-vouchers', {
          body: { divisionId, fromDate: from, toDate: to, forceTally: true }
        });
        if (error) throw error;
        return data?.tally?.responseXml || null;
      };

      const xmlText = await ensureXml();
      if (!xmlText) {
        toast({
          title: "No Tally XML",
          description: "Could not fetch Tally vouchers XML for the selected range",
          variant: "destructive"
        });
        return;
      }

      // Run enhanced parser to upsert vouchers and all dependencies
      const { data: parseData, error: parseError } = await supabase.functions.invoke('enhanced-xml-parser', {
        body: {
          xmlText,
          divisionId,
          companyId: syncData?.vouchers?.[0]?.company_id || null,
          enableLiveUpdates: false
        }
      });
      if (parseError) throw parseError;
      if (!parseData?.success) throw new Error(parseData?.error || 'Parsing failed');

      setSyncData(prev => prev ? { ...prev, parseResults: parseData, tally: { ...(prev.tally || {}), responseXml: xmlText } } : prev);

      toast({
        title: "Sync Completed",
        description: `Inserted: ${parseData.summary.inserted}, Updated: ${parseData.summary.updated}, Masters: ${parseData.summary.created_master}`
      });

      // Refresh the voucher list
      if (dateRange.from && dateRange.to) {
        fetchVouchersByDateRange(dateRange.from, dateRange.to);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to upsert vouchers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixDbRelationships = async () => {
    if (!divisionId || !syncData?.vouchers?.length) {
      toast({
        title: "Error",
        description: "No vouchers to fix or missing division ID", 
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Re-run enhanced parser to ensure relationships and masters are created
      const ensureXml = async (): Promise<string | null> => {
        if (syncData?.tally?.responseXml) return syncData.tally.responseXml;
        const from = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const to = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const { data, error } = await supabase.functions.invoke('get-recent-vouchers', {
          body: { divisionId, fromDate: from, toDate: to, forceTally: true }
        });
        if (error) throw error;
        return data?.tally?.responseXml || null;
      };

      const xmlText = await ensureXml();
      if (!xmlText) {
        toast({ title: "No XML", description: "Cannot fix relationships without Tally XML", variant: "destructive" });
        return;
      }

      const { data: parseData, error: parseError } = await supabase.functions.invoke('enhanced-xml-parser', {
        body: {
          xmlText,
          divisionId,
          companyId: syncData?.vouchers?.[0]?.company_id || null,
          enableLiveUpdates: false
        }
      });
      if (parseError) throw parseError;
      if (!parseData?.success) throw new Error(parseData?.error || 'Fix failed');

      setSyncData(prev => prev ? { ...prev, parseResults: parseData } : prev);

      toast({
        title: "Relationships Fixed",
        description: `Masters created: ${parseData.summary.created_master}, Updated: ${parseData.summary.updated}`
      });

      if (dateRange.from && dateRange.to) {
        fetchVouchersByDateRange(dateRange.from, dateRange.to);
      }
    } catch (error: any) {
      console.error('Fix relationships error:', error);
      toast({ title: "Fix Failed", description: error.message || "Failed to fix relationships", variant: "destructive" });
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

  const getVoucherStatus = (guid: string) => {
    if (!syncData?.parseResults?.results) return null;
    const result = syncData.parseResults.results.find(r => r.guid === guid && r.table === 'tally_trn_voucher');
    return result?.action || null;
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'inserted':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'ignored':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'inserted':
        return 'Inserted';
      case 'updated':
        return 'Updated';
      case 'ignored':
        return 'Already Exists';
      default:
        return 'N/A';
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Selection</CardTitle>
          <CardDescription>
            Choose a date range to fetch vouchers or use quick options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDateRangeSearch}
                disabled={isLoading || !dateRange.from || !dateRange.to}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecentVouchers(1)}
              disabled={isLoading}
            >
              <Clock className="h-4 w-4 mr-2" />
              Last Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecentVouchers(7)}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Last Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecentVouchers(30)}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Last Month
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {syncData.summary.dateRange} • DB vouchers: {syncData.summary.totalVouchers} • Tally vouchers: {syncData.summary.tallyVoucherCount ?? 0}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="vouchers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="data-analysis">Data Analysis</TabsTrigger>
          {syncData?.parseResults && (
            <TabsTrigger value="parse-results">Parse Results</TabsTrigger>
          )}
          {showEnhancedProcessing && (
            <TabsTrigger value="enhanced-processing">Live Processing</TabsTrigger>
          )}
          <TabsTrigger value="tally">Tally Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Voucher List
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSyncNow()}
                    disabled={isLoading || !syncData?.vouchers?.length}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button
                    onClick={() => handleFixDbRelationships()}
                    disabled={isLoading || !syncData?.vouchers?.length}
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Fix DB Relationships
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Vouchers for the selected date range • 
                {syncData?.vouchers?.length ? ` ${syncData.vouchers.length} vouchers found` : ' No vouchers found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncData?.tally?.responseXml && (
                <div className="mb-4">
                  <Button
                    onClick={handleEnhancedProcessing}
                    disabled={isProcessing}
                    className="mr-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Enhanced Processing
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Process XML with master data creation and live updates
                  </span>
                </div>
              )}
              {syncData?.vouchers?.length ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voucher Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncData.vouchers.map((voucher) => {
                        const status = getVoucherStatus(voucher.guid);
                        return (
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
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(status)}>
                                {getStatusLabel(status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateTime(voucher.created_at)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {syncData ? 'No vouchers found for the selected date range.' : 'Select a date range and click Search to load vouchers.'}
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
                  Selected range
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
                <div className="text-2xl font-bold">
                  {dateRange.from && dateRange.to ? 
                    Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 
                    0
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Days in range
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data-analysis">
          <Card>
            <CardHeader>
              <CardTitle>XML Data Structure Analysis</CardTitle>
              <CardDescription>
                Comprehensive analysis of Tally XML fields and database mapping gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <XmlDataAnalysis xmlData={syncData?.tally?.responseXml} />
            </CardContent>
          </Card>
        </TabsContent>

        {syncData?.parseResults && (
          <TabsContent value="parse-results">
            <Card>
              <CardHeader>
                <CardTitle>XML Parse Results</CardTitle>
                <CardDescription>
                  Shows the results of parsing Tally XML and upserting to database tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Total Records</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-lg font-bold">{syncData.parseResults.summary.total}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Inserted</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-lg font-bold text-green-600">{syncData.parseResults.summary.inserted}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Updated</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-lg font-bold text-blue-600">{syncData.parseResults.summary.updated}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Already Exists</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-lg font-bold text-gray-600">{syncData.parseResults.summary.ignored}</CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table</TableHead>
                          <TableHead>GUID</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {syncData.parseResults.results.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.table}</TableCell>
                            <TableCell className="font-mono text-xs">{result.guid}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(result.action)}>
                                {getStatusLabel(result.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {result.details ? JSON.stringify(result.details) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showEnhancedProcessing && (
          <TabsContent value="enhanced-processing">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced XML Processing</CardTitle>
                <CardDescription>
                  Live processing with master data creation and detailed status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedProcessingView
                  isProcessing={isProcessing}
                  currentProgress={currentProgress}
                  results={allResults}
                  summary={enhancedSummary}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="tally">
          <Card>
            <CardHeader>
              <CardTitle>Tally Fallback Response</CardTitle>
              <CardDescription>Shows the exact XML sent to Tally and the raw XML response.</CardDescription>
            </CardHeader>
            <CardContent>
              {syncData?.tally ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Requested Company</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-sm text-muted-foreground">{syncData.tally.requestedCompany || '-'}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Tally URL</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-sm text-muted-foreground">{syncData.tally.url || '-'}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Status / Vouchers</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-sm text-muted-foreground">{syncData.tally.status ?? '-'} / {syncData.tally.voucherCount ?? 0}</CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Request XML</h3>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">{syncData.tally.requestXml || 'No request XML available'}</pre>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Response XML</h3>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[400px]">{syncData.tally.responseXml || 'No response XML available'}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No Tally response available. Run a search to trigger the fallback.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}