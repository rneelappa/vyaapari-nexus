import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Ledger {
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
}

// Original interface for ContraVoucherCreate compatibility
interface LedgerSelectProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function LedgerSelect({ label, value, onChange }: LedgerSelectProps) {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { companyId, divisionId } = useParams();

  const fetchLedgers = async () => {
    if (!companyId || !divisionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mst_ledger')
        .select('name, parent, opening_balance, closing_balance')
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .or(`division_id.eq.${divisionId},division_id.is.null`)
        .order('name');

      if (error) {
        console.error('Error fetching ledgers:', error);
        return;
      }

      setLedgers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLedgers();
    }
  }, [open, companyId, divisionId]);

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLedgers = filteredLedgers.reduce((acc, ledger) => {
    const parent = ledger.parent || 'Ungrouped';
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(ledger);
    return acc;
  }, {} as Record<string, Ledger[]>);

  const handleLedgerSelect = (ledgerName: string) => {
    onChange(ledgerName);
    setOpen(false);
  };

  return (
    <div>
      <div className="text-sm font-medium mb-2">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between w-full">
            <span className="truncate">
              {value || 'Select Ledger'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ledgers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-80">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedLedgers).map(([parentGroup, groupLedgers]) => (
                  <div key={parentGroup} className="mb-4">
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b mb-2">
                      {parentGroup}
                    </div>
                    {groupLedgers.map((ledger) => (
                      <div
                        key={ledger.name}
                        className={`p-2 cursor-pointer rounded-md hover:bg-accent transition-colors ${
                          value === ledger.name ? 'bg-accent' : ''
                        }`}
                        onClick={() => handleLedgerSelect(ledger.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{ledger.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Balance: ₹{ledger.closing_balance?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {filteredLedgers.length === 0 && !loading && (
                  <div className="p-4 text-center text-muted-foreground">
                    No ledgers found
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}