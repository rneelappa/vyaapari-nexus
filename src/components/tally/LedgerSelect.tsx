import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LedgerOption {
  name: string;
  parent: string; // group name
}

interface LedgerSelectProps {
  label: string;
  value?: string;
  onChange: (ledgerName: string) => void;
}

export function LedgerSelect({ label, value, onChange }: LedgerSelectProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<LedgerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<{ amount: number; nature: "Dr" | "Cr" } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/ledgers/banks-cash`)
      .then(r => r.json())
      .then(res => {
        if (!active) return;
        const data = (res?.data || []).map((r: any) => ({ name: r.name, parent: r.parent }));
        setOptions(data);
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!value) {
      setBalance(null);
      return;
    }
    const asOf = new Date().toISOString().slice(0, 10);
    fetch(`/api/ledger-balance?ledgerName=${encodeURIComponent(value)}&asOf=${asOf}`)
      .then(r => r.json())
      .then(res => {
        if (!active) return;
        const b = Number(res?.data?.balance || 0);
        const nature = b >= 0 ? "Dr" : "Cr";
        setBalance({ amount: Math.abs(b), nature });
      })
      .catch(() => setBalance(null));
    return () => {
      active = false;
    };
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <Input
        placeholder="Search cash/bank ledgers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-56 overflow-auto border rounded-md">
        {loading ? (
          <div className="p-3 text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">No results</div>
        ) : (
          filtered.map((o) => (
            <button
              key={o.name}
              className={cn(
                "w-full text-left px-3 py-2 border-b hover:bg-accent",
                value === o.name && "bg-accent"
              )}
              onClick={() => onChange(o.name)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{o.name}</div>
                <Badge variant="outline">{o.parent}</Badge>
              </div>
            </button>
          ))
        )}
      </div>
      {value && balance && (
        <div className="text-xs text-muted-foreground">
          Current balance: <span className={balance.nature === "Dr" ? "text-green-600" : "text-red-600"}>
            {balance.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {balance.nature}
          </span>
        </div>
      )}
    </div>
  );
}



