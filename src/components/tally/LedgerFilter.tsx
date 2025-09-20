import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useVoucherFilter } from '@/contexts/VoucherFilterContext';

interface Ledger {
  name: string;
  parent: string;
  opening_balance?: number;
  closing_balance?: number;
  voucher_count?: number;
}

interface LedgerFilterProps {
  selectedLedger: string | null;
  onLedgerChange: (ledger: string | null) => void;
}

export function LedgerFilter({ selectedLedger, onLedgerChange }: LedgerFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { filteredOptions, loading, filters } = useVoucherFilter();

  const filteredLedgers = filteredOptions.ledgers.filter(ledger =>
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
    const newSelection = selectedLedger === ledgerName ? null : ledgerName;
    onLedgerChange(newSelection);
    setOpen(false);
  };

  // Show dependency info in the button
  const getButtonText = () => {
    if (selectedLedger) return selectedLedger;
    if (filters.selectedGroup) return `Ledgers in ${filters.selectedGroup}`;
    return 'All Ledgers';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <span className="flex items-center gap-2">
            <span className="truncate">{getButtonText()}</span>
            {selectedLedger && (
              <Badge variant="secondary" className="ml-1">
                Selected
              </Badge>
            )}
            {filters.selectedGroup && (
              <Badge variant="outline" className="ml-1 text-xs">
                Filtered
              </Badge>
            )}
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
                        selectedLedger === ledger.name ? 'bg-accent' : ''
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
                         <Badge variant="outline" className="ml-2">
                           {ledger.voucher_count || 0}
                         </Badge>
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
  );
}