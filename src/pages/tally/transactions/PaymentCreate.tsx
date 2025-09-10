import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_TALLY_API_BASE || "http://localhost:5001"}${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_TALLY_API_BASE || "http://localhost:5001"}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

export default function PaymentCreate() {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [voucherType, setVoucherType] = useState<string>("Payment");
  const [series, setSeries] = useState<string>("28");
  const [voucherNo, setVoucherNo] = useState<string>("");
  const [accountLedger, setAccountLedger] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([{ ledger: "", amount: 0 }]);
  const [narration, setNarration] = useState<string>("");
  const [allocMethod, setAllocMethod] = useState<Record<number, BillAllocation["method"]>>({ 0: "On Account" });
  const [creditDays, setCreditDays] = useState<Record<number, number>>({ 0: 0 });
  const [instrumentNumber, setInstrumentNumber] = useState<string>("");
  const [instrumentDate, setInstrumentDate] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");

  const { data: banksCash } = useQuery({
    queryKey: ["banks-cash"],
    queryFn: () => apiGet<BankCashLedger[]>("/api/ledgers/banks-cash")
  });

  async function loadOutstanding(ledger: string): Promise<BillOutstanding[]> {
    if (!ledger) return [] as BillOutstanding[];
    try {
      return await apiGet<BillOutstanding[]>(`/api/ledgers/${encodeURIComponent(ledger)}/outstanding`);
    } catch (e) {
      return [] as BillOutstanding[];
    }
  }

  const { data: voucherTypes } = useQuery({
    queryKey: ["voucher-types-payment"],
    queryFn: () => apiGet<VoucherType[]>("/api/voucher-types")
  });

  const paymentVoucherTypes = useMemo(() => (voucherTypes || []).filter(v => v.name.toLowerCase().startsWith("payment")), [voucherTypes]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ voucher_number: string }>(`/api/vouchers/next-number?voucherType=${encodeURIComponent(voucherType)}&date=${encodeURIComponent(date)}&series=${encodeURIComponent(series)}`);
        setVoucherNo(data.voucher_number);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [date, voucherType, series]);

  const total = useMemo(() => lines.reduce((s, l) => s + (l.amount || 0), 0), [lines]);

  async function handleSave() {
    try {
      if (!accountLedger) throw new Error("Select Account (Cash/Bank)");
      if (!lines.length || !lines[0].ledger) throw new Error("Add at least one particulars ledger");
      if (total <= 0) throw new Error("Enter amount > 0");

      const payload: any = {
        date,
        voucherType,
        series,
        accountLedger,
        narration,
        lines: lines.map((l, idx) => {
          const method = (allocMethod[idx] || "On Account") as BillAllocation["method"];
          const cds = creditDays[idx] || 0;
          const billAlloc: BillAllocation[] = method === "On Account" ? [] : [{
            method,
            name: method === "New Ref" ? voucherNo : undefined,
            amount: l.amount,
            creditDays: method === "New Ref" ? cds : undefined
          }];
          return { ...l, billAllocations: billAlloc };
        })
      };

      if (accountLedger.toLowerCase().includes("bank")) {
        payload.bankDetails = {
          transaction_type: "Cheque",
          instrument_date: instrumentDate || null,
          instrument_number: instrumentNumber,
          bank_name: bankName,
          amount: total,
          bankers_date: null
        };
      }

      const data = await apiPost<{ guid: string; voucher_number: string }>("/api/vouchers/payment", payload);
      toast({ title: "Payment saved", description: `No: ${data.voucher_number}` });
    } catch (err: any) {
      toast({ title: "Save failed", description: String(err.message || err), variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Voucher</h1>
          <p className="text-muted-foreground">Create accounting payment voucher</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
          <CardDescription>Voucher type, number and date</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Voucher Type</Label>
            <select className="w-full border rounded p-2" value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
              {paymentVoucherTypes.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
              {paymentVoucherTypes.length === 0 && <option value="Payment">Payment</option>}
            </select>
          </div>
          <div>
            <Label>Series</Label>
            <Input value={series} onChange={(e) => setSeries(e.target.value)} />
          </div>
          <div>
            <Label>Voucher No</Label>
            <Input value={voucherNo} readOnly />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Select Cash/Bank account</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Account</Label>
            <select className="w-full border rounded p-2" value={accountLedger} onChange={(e) => setAccountLedger(e.target.value)}>
              <option value="">Select...</option>
              {(banksCash || []).map((l) => (
                <option key={l.name} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Particulars</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ledger</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((ln, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input placeholder="Ledger name" value={ln.ledger} onChange={(e) => {
                      const v = e.target.value;
                      setLines(prev => prev.map((p, i) => i === idx ? { ...p, ledger: v } : p));
                    }} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={ln.amount} onChange={(e) => {
                      const v = parseFloat(e.target.value || "0");
                      setLines(prev => prev.map((p, i) => i === idx ? { ...p, amount: v } : p));
                    }} className="text-right" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {lines.map((ln, idx) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" key={`alloc-${idx}`}>
              <div>
                <Label>Type of Ref (Line {idx + 1})</Label>
                <select className="w-full border rounded p-2" value={allocMethod[idx] || "On Account"} onChange={(e) => setAllocMethod(prev => ({ ...prev, [idx]: e.target.value as any }))}>
                  <option>On Account</option>
                  <option>New Ref</option>
                  <option>Agst Ref</option>
                  <option>Advance</option>
                </select>
              </div>
              {(allocMethod[idx] || "On Account") === "New Ref" && (
                <div>
                  <Label>Credit Days</Label>
                  <Input type="number" value={creditDays[idx] || 0} onChange={(e) => setCreditDays(prev => ({ ...prev, [idx]: parseInt(e.target.value || "0", 10) }))} />
                </div>
              )}
              {(allocMethod[idx] || "On Account") === "Agst Ref" && (
                <div className="md:col-span-2">
                  <Label>Pick Pending Bill (optional preview)</Label>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={async () => {
                      const rows = await loadOutstanding(ln.ledger);
                      const first = rows[0];
                      if (first) {
                        // For now, auto-pick the first; a full modal can replace this.
                        setAllocMethod(prev => ({ ...prev, [idx]: 'Agst Ref' } as any));
                        setLines(prev => prev.map((p, i) => i === idx ? { ...p, amount: Math.min(Math.abs(first.balance), ln.amount || 0) } : p));
                      }
                    }}
                  >Load Outstanding</Button>
                </div>
              )}
            </div>
          ))}
          <div className="mt-4">
            <Button variant="outline" onClick={() => setLines(prev => [...prev, { ledger: "", amount: 0 }])}>Add Line</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Instrument (optional)</CardTitle>
          <CardDescription>For bank accounts</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Instrument No</Label>
            <Input value={instrumentNumber} onChange={(e) => setInstrumentNumber(e.target.value)} />
          </div>
          <div>
            <Label>Instrument Date</Label>
            <Input type="date" value={instrumentDate} onChange={(e) => setInstrumentDate(e.target.value)} />
          </div>
          <div>
            <Label>Bank Name</Label>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Narration</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Total: {total.toFixed(2)}</div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}


