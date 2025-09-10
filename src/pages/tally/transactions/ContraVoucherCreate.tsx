import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LedgerSelect } from "@/components/tally/LedgerSelect";
import { useToast } from "@/hooks/use-toast";

export default function ContraVoucherCreate() {
  const { toast } = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [voucherNumber, setVoucherNumber] = useState("");
  const [accountLedger, setAccountLedger] = useState<string | undefined>();
  const [particularsLedger, setParticularsLedger] = useState<string | undefined>();
  const [amount, setAmount] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("Transfer");
  const [instrumentNumber, setInstrumentNumber] = useState<string>("");
  const [instrumentDate, setInstrumentDate] = useState<string>("");
  const [bankersDate, setBankersDate] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [narration, setNarration] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(date && accountLedger && particularsLedger && Number(amount) > 0 && accountLedger !== particularsLedger && (!['Cheque'].includes(transactionType) || (instrumentNumber && instrumentDate)));

  async function handleSave() {
    try {
      setSaving(true);
      const body = {
        date,
        voucherNumber: voucherNumber || undefined,
        narration,
        accountLedger,
        particularsLedger,
        amount: Number(amount),
        transactionType,
        instrumentNumber: instrumentNumber || undefined,
        instrumentDate: instrumentDate || undefined,
        bankersDate: bankersDate || undefined,
        bankName: bankName || undefined
      };
      const res = await fetch('/api/vouchers/contra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Save failed');
      toast({ title: 'Contra saved', description: `Voucher No: ${data.data.voucher_number}` });
      // Reset for new entry
      setVoucherNumber("");
      setAccountLedger(undefined);
      setParticularsLedger(undefined);
      setAmount("");
      setTransactionType("Transfer");
      setInstrumentNumber("");
      setInstrumentDate("");
      setBankersDate("");
      setBankName("");
      setNarration("");
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contra Voucher</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Voucher No (auto)" value={voucherNumber} onChange={(e) => setVoucherNumber(e.target.value)} className="w-48" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <Button disabled={!canSave || saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LedgerSelect label="Account (source)" value={accountLedger} onChange={setAccountLedger} />
            <LedgerSelect label="Particulars (destination)" value={particularsLedger} onChange={setParticularsLedger} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium mb-2">Amount</div>
              <Input placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Transaction Type</div>
              <select className="w-full border rounded-md h-10 px-3" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option>Transfer</option>
                <option>NEFT</option>
                <option>RTGS</option>
                <option>IMPS</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>Card</option>
                <option>Withdrawal</option>
                <option>BankCharges</option>
              </select>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Bank Name (optional)</div>
              <Input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
          </div>

          {transactionType === 'Cheque' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Cheque No</div>
                <Input placeholder="Instrument number" value={instrumentNumber} onChange={(e) => setInstrumentNumber(e.target.value)} />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Instrument Date</div>
                <Input type="date" value={instrumentDate} onChange={(e) => setInstrumentDate(e.target.value)} />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Bankers Date</div>
                <Input type="date" value={bankersDate} onChange={(e) => setBankersDate(e.target.value)} />
              </div>
            </div>
          )}

          {transactionType !== 'Cheque' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Instrument / Reference</div>
                <Input placeholder="Optional reference" value={instrumentNumber} onChange={(e) => setInstrumentNumber(e.target.value)} />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Instrument Date</div>
                <Input type="date" value={instrumentDate} onChange={(e) => setInstrumentDate(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Narration</div>
            <Textarea placeholder="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



