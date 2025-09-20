import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  RefreshCw, 
  Calculator, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  ChevronRight,
  TreePine,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Network,
  Target,
  Activity,
  Eye,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tallyApi, type Voucher, type ApiResponse, type MonthlyAnalysis } from '@/services/tallyApiService';

interface AccountingEntry {
  voucherId: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  ledgerName: string;
  amount: number;
  isDebit: boolean;
  isPartyLedger: boolean;
  ledgerHierarchy?: {
    fullPath: string;
    level: number;
    parentChain: string[];
  };
}

interface LedgerSummary {
  ledgerName: string;
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  netAmount: number;
  hierarchy?: {
    fullPath: string;
    level: number;
  };
  monthlyBreakup: Array<{
    month: string;
    entries: number;
    amount: number;
  }>;
}

interface AccountingPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function AccountingPageEnhanced({ 
  companyId: propCompanyId, 
  divisionId: propDivisionId 
}: AccountingPageEnhancedProps) {
  const { companyId: paramCompanyId, divisionId: paramDivisionId } = useParams<{ 
    companyId: string; 
    divisionId: string; 
  }>();
  
  const companyId = propCompanyId || paramCompanyId || '629f49fb-983e-4141-8c48-e1423b39e921';
  const divisionId = propDivisionId || paramDivisionId || '37f3cc0c-58ad-4baf-b309-360116ffc3cd';
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [ledgerSummaries, setLedgerSummaries] = useState<LedgerSummary[]>([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedger, setSelectedLedger] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [viewMode, setViewMode] = useState<'entries' | 'ledgers' | 'hierarchy' | 'monthly'>('entries');
  const [expandedLedgers, setExpandedLedgers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadAccountingData();
  }, [companyId, divisionId, dateRange]);

  const loadAccountingData = async () => {
    try {
      setLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyyMMdd');
      const toDate = format(dateRange.to, 'yyyyMMdd');
      
      console.log('Loading accounting data from API...', { fromDate, toDate });
      
      // Load vouchers and related data
      const [vouchersResponse, ledgersResponse, monthlyResponse] = await Promise.all([
        tallyApi.getEnhancedVouchers(companyId, divisionId, { fromDate, toDate, limit: 100 }),
        tallyApi.getLedgers(companyId, divisionId, { limit: 200 }),
        tallyApi.getLedgersMonthlyAnalysis(companyId, divisionId, 2025)
      ]);

      if (!vouchersResponse.success) {
        throw new Error(vouchersResponse.error || 'Failed to load vouchers');
      }

      setVouchers(vouchersResponse.data);

      // Build accounting entries from voucher data
      const entries: AccountingEntry[] = [];
      vouchersResponse.data.forEach(voucher => {
        voucher.entries?.forEach(entry => {
          entries.push({
            voucherId: voucher.id,
            voucherNumber: voucher.number,
            voucherType: voucher.type,
            date: voucher.date,
            ledgerName: entry.ledgerName,
            amount: entry.amount,
            isDebit: entry.isDebit,
            isPartyLedger: entry.isPartyledger,
            ledgerHierarchy: {
              fullPath: `Group → ${entry.ledgerName}`, // Would get from hierarchy API
              level: 2,
              parentChain: ['Group']
            }
          });
        });
      });

      setAccountingEntries(entries);

      // Build ledger summaries
      const ledgerMap = new Map<string, LedgerSummary>();
      entries.forEach(entry => {
        if (!ledgerMap.has(entry.ledgerName)) {
          ledgerMap.set(entry.ledgerName, {
            ledgerName: entry.ledgerName,
            totalEntries: 0,
            totalDebit: 0,
            totalCredit: 0,
            netAmount: 0,
            hierarchy: entry.ledgerHierarchy,
            monthlyBreakup: []
          });
        }

        const summary = ledgerMap.get(entry.ledgerName)!;
        summary.totalEntries++;
        if (entry.isDebit) {
          summary.totalDebit += Math.abs(entry.amount);
        } else {
          summary.totalCredit += Math.abs(entry.amount);
        }
        summary.netAmount = summary.totalDebit - summary.totalCredit;
      });

      setLedgerSummaries(Array.from(ledgerMap.values()));

      if (monthlyResponse.success) {
        setMonthlyAnalysis(monthlyResponse.data);
      }

      console.log(`Loaded ${entries.length} accounting entries from ${vouchersResponse.data.length} vouchers`);

    } catch (error) {
      console.error('Failed to load accounting data:', error);
      toast({
        title: "Error",
        description: "Failed to load accounting data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLedgerExpansion = (ledgerName: string) => {
    setExpandedLedgers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ledgerName)) {
        newSet.delete(ledgerName);
      } else {
        newSet.add(ledgerName);
      }
      return newSet;
    });
  };

  const filteredEntries = accountingEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.ledgerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.voucherType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLedger = !selectedLedger || entry.ledgerName === selectedLedger;
    
    return matchesSearch && matchesLedger;
  });

  const filteredLedgers = ledgerSummaries.filter(ledger =>
    !searchTerm || ledger.ledgerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueLedgers = [...new Set(accountingEntries.map(e => e.ledgerName))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-32 bg-muted rounded w-full mb-4"></div>
          <div className="h-48 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Accounting Transactions</h1>
          <p className="text-muted-foreground">
            Accounting entries with complete hierarchy and relationship mapping
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAccountingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Ledger Filter */}
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Ledgers</option>
              {uniqueLedgers.map(ledger => (
                <option key={ledger} value={ledger}>{ledger}</option>
              ))}
            </select>

            {/* View Mode */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="entries">Entries</TabsTrigger>
                <TabsTrigger value="ledgers">Ledgers</TabsTrigger>
                <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounting Data */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Accounting Entries ({filteredEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'entries' && (
                  <div className="space-y-2">
                    {filteredEntries.map((entry, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Calculator className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{entry.ledgerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {entry.voucherType} #{entry.voucherNumber} | {entry.date}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${entry.isDebit ? 'text-red-600' : 'text-green-600'}`}>
                              {entry.isDebit ? '-' : '+'}₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge variant={entry.isDebit ? 'destructive' : 'default'} className="text-xs">
                                {entry.isDebit ? 'Debit' : 'Credit'}
                              </Badge>
                              {entry.isPartyLedger && (
                                <Badge variant="outline" className="text-xs">Party</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {entry.ledgerHierarchy && (
                          <div className="text-xs text-muted-foreground font-mono">
                            <TreePine className="h-3 w-3 inline mr-1" />
                            {entry.ledgerHierarchy.fullPath}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'ledgers' && (
                  <div className="space-y-3">
                    {filteredLedgers.map((ledger, index) => (
                      <div key={index} className="border rounded-lg">
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted"
                          onClick={() => toggleLedgerExpansion(ledger.ledgerName)}
                        >
                          <div className="flex items-center space-x-3">
                            {expandedLedgers.has(ledger.ledgerName) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-semibold">{ledger.ledgerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {ledger.totalEntries} entries
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${ledger.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{Math.abs(ledger.netAmount).toLocaleString('en-IN')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Net {ledger.netAmount >= 0 ? 'Credit' : 'Debit'}
                            </div>
                          </div>
                        </div>

                        {expandedLedgers.has(ledger.ledgerName) && (
                          <div className="border-t p-3 bg-muted/50">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Total Debit:</span>
                                <div className="font-semibold text-red-600">
                                  ₹{ledger.totalDebit.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total Credit:</span>
                                <div className="font-semibold text-green-600">
                                  ₹{ledger.totalCredit.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Entries:</span>
                                <div className="font-semibold">
                                  {ledger.totalEntries}
                                </div>
                              </div>
                            </div>
                            {ledger.hierarchy && (
                              <div className="mt-2 text-xs text-muted-foreground font-mono">
                                <TreePine className="h-3 w-3 inline mr-1" />
                                {ledger.hierarchy.fullPath}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'hierarchy' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Ledger Hierarchy View</h3>
                      <p className="text-sm text-muted-foreground">
                        Accounting entries organized by ledger hierarchy
                      </p>
                    </div>
                    
                    {/* Group by hierarchy level */}
                    {[1, 2, 3].map(level => {
                      const levelLedgers = filteredLedgers.filter(l => l.hierarchy?.level === level);
                      if (levelLedgers.length === 0) return null;
                      
                      return (
                        <div key={level} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Level {level} Ledgers</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {levelLedgers.map((ledger, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="font-semibold">{ledger.ledgerName}</span>
                                <span className="text-sm">
                                  ₹{Math.abs(ledger.netAmount).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'monthly' && monthlyAnalysis && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Monthly Accounting Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Fiscal Year 2025-2026 | {monthlyAnalysis.totalLedgers} ledgers analyzed
                      </p>
                    </div>
                    
                    {((monthlyAnalysis as any)?.ledgers || []).slice(0, 10).map((ledgerData: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{ledgerData.ledger.name}</span>
                          </div>
                          <Badge variant="outline">
                            {ledgerData.fiscalYearSummary.activeMonths} active months
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Vouchers:</span>
                            <div className="font-semibold">
                              {ledgerData.fiscalYearSummary.totalVouchers}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Amount:</span>
                            <div className="font-semibold">
                              ₹{ledgerData.fiscalYearSummary.totalAmount.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Peak Month:</span>
                            <div className="font-semibold">
                              {ledgerData.fiscalYearSummary.peakMonth?.month || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Accounting Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {filteredEntries.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {uniqueLedgers.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Ledgers</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      ₹{filteredEntries.reduce((sum, e) => sum + Math.abs(e.amount), 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Debit vs Credit</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Debits:</span>
                      <span className="font-semibold text-red-600">
                        ₹{filteredEntries.filter(e => e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Credits:</span>
                      <span className="font-semibold text-green-600">
                        ₹{filteredEntries.filter(e => !e.isDebit).reduce((sum, e) => sum + Math.abs(e.amount), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Network className="h-4 w-4 mr-2" />
                    Explore Relationships
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Monthly Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <TreePine className="h-4 w-4 mr-2" />
                    Hierarchy View
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AccountingPageEnhanced;
