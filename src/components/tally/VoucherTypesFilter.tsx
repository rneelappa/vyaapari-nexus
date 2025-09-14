import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useVoucherFilter } from '@/contexts/VoucherFilterContext';

interface VoucherType {
  name: string;
  parent: string;
  affects_stock?: number;
  is_deemedpositive?: number;
  voucher_count?: number;
}

interface VoucherTypesFilterProps {
  companyId: string;
  divisionId: string;
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  totalVouchers: number;
}

export function VoucherTypesFilter({ 
  companyId, 
  divisionId, 
  selectedType, 
  onTypeSelect,
  totalVouchers 
}: VoucherTypesFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { filteredOptions, loading, filters } = useVoucherFilter();

  const filteredTypes = filteredOptions.voucherTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTypes = filteredTypes.reduce((acc, type) => {
    const parent = type.parent || 'Base Types';
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(type);
    return acc;
  }, {} as Record<string, VoucherType[]>);

  const handleTypeSelect = (typeName: string) => {
    const newSelection = selectedType === typeName ? null : typeName;
    onTypeSelect(newSelection);
    setOpen(false);
  };

  const totalFilteredVouchers = filteredTypes.reduce((sum, type) => sum + (type.voucher_count || 0), 0);

  const getButtonText = () => {
    if (selectedType) return selectedType;
    if (filters.selectedLedger) return `Types for ${filters.selectedLedger}`;
    if (filters.selectedGroup) return `Types for ${filters.selectedGroup}`;
    return 'All Voucher Types';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="truncate">{getButtonText()}</span>
            {selectedType && (
              <Badge variant="secondary" className="ml-1">
                Selected
              </Badge>
            )}
            {(filters.selectedLedger || filters.selectedGroup) && (
              <Badge variant="outline" className="ml-1 text-xs">
                Filtered
              </Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Voucher Types</h4>
            <Badge variant="outline">
              {totalFilteredVouchers} vouchers
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search voucher types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedTypes).map(([parentGroup, typesList]) => (
                <div key={parentGroup} className="mb-4">
                  <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b mb-2">
                    {parentGroup}
                  </div>
                  {typesList.map((type) => (
                    <div
                      key={type.name}
                      className={`p-3 cursor-pointer rounded-md hover:bg-accent transition-colors ${
                        selectedType === type.name ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleTypeSelect(type.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{type.name}</div>
                           <div className="text-sm text-muted-foreground">
                             {type.parent && `Parent: ${type.parent}`}
                           </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {type.voucher_count || 0}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredTypes.length === 0 && !loading && (
                <div className="p-4 text-center text-muted-foreground">
                  No voucher types found
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Total: {totalFilteredVouchers} vouchers across {filteredTypes.length} types
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}