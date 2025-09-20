/**
 * Enhanced Payment Create Page with API Health Checking
 * Provides fallback to mock mode when API is unavailable
 * Safe for lovable.dev deployment - no environment changes
 */

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useApiHealth } from "@/hooks/useApiHealth";
import { Wifi, WifiOff, AlertCircle, Database, RefreshCw, Play, Pause } from "lucide-react";

type BankCashLedger = { name: string; parent: string };
type VoucherType = { name: string };

type BillOutstanding = {
  name: string;
  bill_date: string | null;
  bill_credit_period: number;
  billed_amount: number;
  adjusted_amount: number;
  balance: number;
  due_date: string | null;
};

type BillAllocation = {
  method: "Advance" | "Agst Ref" | "New Ref" | "On Account";
  name?: string;
  amount: number;
  creditDays?: number;
};

type Line = {
  ledger: string;
  amount: number;
  billAllocations?: BillAllocation[];
};

// API functions with health checking
async function apiGet<T>(path: string, baseUrl?: string): Promise<T> {
  const base = baseUrl || import.meta.env.VITE_TALLY_API_BASE || "http://localhost:5001";
  const res = await fetch(`${base}${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

async function apiPost<T>(path: string, body: unknown, baseUrl?: string): Promise<T> {
  const base = baseUrl || import.meta.env.VITE_TALLY_API_BASE || "http://localhost:5001";
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

// Mock data for when API is unavailable
const mockBankCashLedgers: BankCashLedger[] = [
  { name: "Cash", parent: "Cash-in-Hand" },
  { name: "Bank Account - HDFC", parent: "Bank Accounts" },
  { name: "Bank Account - ICICI", parent: "Bank Accounts" }
];

const mockVoucherTypes: VoucherType[] = [
  { name: "Payment" },
  { name: "Receipt" },
  { name: "Journal" }
];

const mockBillOutstandings: BillOutstanding[] = [
  {
    name: "ABC Company Ltd",
    bill_date: "2024-01-15",
    bill_credit_period: 30,
    billed_amount: 10000,
    adjusted_amount: 0,
    balance: 10000,
    due_date: "2024-02-14"
  },
  {
    name: "XYZ Suppliers",
    bill_date: "2024-01-20",
    bill_credit_period: 15,
    billed_amount: 5000,
    adjusted_amount: 2000,
    balance: 3000,
    due_date: "2024-02-04"
  }
];

export default function PaymentCreateEnhanced() {
  const { toast } = useToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [voucherType, setVoucherType] = useState<string>("Payment");
  const [voucherDate, setVoucherDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useMockMode, setUseMockMode] = useState(false);

  // API health checking
  const { 
    status: apiStatus, 
    isChecking, 
    isApiAvailable, 
    bestEndpoint, 
    checkHealth,
    startPolling,
    stopPolling
  } = useApiHealth({
    endpoint: '/api/health',
    pollInterval: 30000,
    autoStart: true
  });

  // Determine if we should use mock mode
  useEffect(() => {
    setUseMockMode(!isApiAvailable);
  }, [isApiAvailable]);

  // Fetch bank/cash ledgers
  const { data: bankCashLedgers = [], isLoading: isLoadingLedgers } = useQuery({
    queryKey: ['bank-cash-ledgers', useMockMode],
    queryFn: async () => {
      if (useMockMode) {
        return mockBankCashLedgers;
      }
      return apiGet<BankCashLedger[]>('/api/tally/ledgers/bank-cash', bestEndpoint || undefined);
    },
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch voucher types
  const { data: voucherTypes = [], isLoading: isLoadingVoucherTypes } = useQuery({
    queryKey: ['voucher-types', useMockMode],
    queryFn: async () => {
      if (useMockMode) {
        return mockVoucherTypes;
      }
      return apiGet<VoucherType[]>('/api/tally/voucher-types', bestEndpoint || undefined);
    },
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bill outstandings
  const { data: billOutstandings = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['bill-outstandings', useMockMode],
    queryFn: async () => {
      if (useMockMode) {
        return mockBillOutstandings;
      }
      return apiGet<BillOutstanding[]>('/api/tally/bills/outstanding', bestEndpoint || undefined);
    },
    enabled: true,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const addLine = () => {
    setLines([...lines, { ledger: "", amount: 0 }]);
  };

  const updateLine = (index: number, field: keyof Line, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const addBillAllocation = (lineIndex: number) => {
    const newLines = [...lines];
    if (!newLines[lineIndex].billAllocations) {
      newLines[lineIndex].billAllocations = [];
    }
    newLines[lineIndex].billAllocations!.push({
      method: "On Account",
      amount: 0
    });
    setLines(newLines);
  };

  const updateBillAllocation = (lineIndex: number, billIndex: number, field: keyof BillAllocation, value: any) => {
    const newLines = [...lines];
    if (newLines[lineIndex].billAllocations) {
      newLines[lineIndex].billAllocations![billIndex] = {
        ...newLines[lineIndex].billAllocations![billIndex],
        [field]: value
      };
      setLines(newLines);
    }
  };

  const removeBillAllocation = (lineIndex: number, billIndex: number) => {
    const newLines = [...lines];
    if (newLines[lineIndex].billAllocations) {
      newLines[lineIndex].billAllocations = newLines[lineIndex].billAllocations!.filter((_, i) => i !== billIndex);
      setLines(newLines);
    }
  };

  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.amount, 0);
  }, [lines]);

  const handleSubmit = async () => {
    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount === 0) {
      toast({
        title: "Error",
        description: "Total amount must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const voucherData = {
        voucher_type: voucherType,
        date: voucherDate,
        narration: narration,
        lines: lines
      };

      if (useMockMode) {
        // Simulate API call in mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: "Success (Mock Mode)",
          description: "Payment voucher created successfully in mock mode",
        });
      } else {
        await apiPost('/api/tally/vouchers/payment', voucherData, bestEndpoint || undefined);
        toast({
          title: "Success",
          description: "Payment voucher created successfully",
        });
      }

      // Reset form
      setLines([]);
      setNarration("");
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment voucher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingLedgers || isLoadingVoucherTypes || isLoadingBills;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Payment Voucher</h1>
          <p className="text-muted-foreground">
            Create a new payment voucher with bill allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={checkHealth}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Check API
          </Button>
          <Button
            variant="outline"
            onClick={useMockMode ? startPolling : stopPolling}
            className="flex items-center gap-2"
          >
            {useMockMode ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {useMockMode ? 'Start Polling' : 'Stop Polling'}
          </Button>
        </div>
      </div>

      {/* API Status */}
      <Alert>
        <div className="flex items-center gap-2">
          {isApiAvailable ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>API Status:</strong> {isApiAvailable ? 'Available' : 'Unavailable'} | 
            <strong> Mode:</strong> {useMockMode ? 'Mock Data' : 'Live API'} | 
            <strong> Endpoint:</strong> {bestEndpoint || 'N/A'} | 
            <strong> Response Time:</strong> {apiStatus?.responseTime ? `${apiStatus.responseTime}ms` : 'N/A'}
            {apiStatus?.error && (
              <span className="text-red-500 ml-2">({apiStatus.error})</span>
            )}
          </AlertDescription>
        </div>
      </Alert>

      {/* Mock Mode Warning */}
      {useMockMode && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mock Mode Active:</strong> API server is not reachable. Using mock data for demonstration. 
            Changes will not be saved to the database.
          </AlertDescription>
        </Alert>
      )}

      {/* Voucher Details */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="voucherType">Voucher Type</Label>
              <select
                id="voucherType"
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              >
                {voucherTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="voucherDate">Date</Label>
              <Input
                id="voucherDate"
                type="date"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="narration">Narration</Label>
              <Input
                id="narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter narration"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Lines</CardTitle>
            <Button onClick={addLine} disabled={isLoading}>
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment lines added yet</p>
              <Button onClick={addLine} className="mt-4" disabled={isLoading}>
                Add First Line
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line, lineIndex) => (
                <Card key={lineIndex} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>Ledger</Label>
                      <select
                        value={line.ledger}
                        onChange={(e) => updateLine(lineIndex, 'ledger', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                      >
                        <option value="">Select ledger</option>
                        {bankCashLedgers.map((ledger) => (
                          <option key={ledger.name} value={ledger.name}>
                            {ledger.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={line.amount}
                        onChange={(e) => updateLine(lineIndex, 'amount', parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => removeLine(lineIndex)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Bill Allocations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Bill Allocations</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addBillAllocation(lineIndex)}
                        disabled={isLoading}
                      >
                        Add Allocation
                      </Button>
                    </div>
                    {line.billAllocations?.map((allocation, billIndex) => (
                      <div key={billIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-muted rounded">
                        <select
                          value={allocation.method}
                          onChange={(e) => updateBillAllocation(lineIndex, billIndex, 'method', e.target.value)}
                          className="p-1 border rounded text-sm"
                          disabled={isLoading}
                        >
                          <option value="Advance">Advance</option>
                          <option value="Agst Ref">Against Ref</option>
                          <option value="New Ref">New Ref</option>
                          <option value="On Account">On Account</option>
                        </select>
                        <Input
                          placeholder="Reference"
                          value={allocation.name || ''}
                          onChange={(e) => updateBillAllocation(lineIndex, billIndex, 'name', e.target.value)}
                          className="text-sm"
                          disabled={isLoading}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={allocation.amount}
                          onChange={(e) => updateBillAllocation(lineIndex, billIndex, 'amount', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                          disabled={isLoading}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeBillAllocation(lineIndex, billIndex)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Outstandings */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Bills</CardTitle>
          <CardDescription>
            Available bills for allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
              <p>Loading outstanding bills...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Billed Amount</TableHead>
                  <TableHead>Adjusted Amount</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billOutstandings.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>{bill.bill_date}</TableCell>
                    <TableCell>{bill.due_date}</TableCell>
                    <TableCell>₹{bill.billed_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{bill.adjusted_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={bill.balance > 0 ? "destructive" : "secondary"}>
                        ₹{bill.balance.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary and Submit */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                Total Amount: ₹{totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {lines.length} line{lines.length !== 1 ? 's' : ''} • 
                {useMockMode ? ' Mock Mode' : ' Live API'}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || totalAmount === 0 || lines.length === 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
