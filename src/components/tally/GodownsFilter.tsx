import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, Search, Warehouse } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Godown {
  name: string;
  parent: string;
  address: string;
  godown_type: string;
  capacity: number;
  capacity_unit: string;
  voucher_count?: number;
}

interface GodownsFilterProps {
  companyId: string;
  divisionId: string;
  selectedGodown: string | null;
  onGodownSelect: (godown: string | null) => void;
  totalVouchers: number;
}

export function GodownsFilter({ 
  companyId, 
  divisionId, 
  selectedGodown, 
  onGodownSelect,
  totalVouchers 
}: GodownsFilterProps) {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const fetchGodowns = async () => {
    setLoading(true);
    try {
      // First get godowns from master data
      const { data: godownsData, error: godownsError } = await supabase
        .from('mst_godown')
        .select('name, parent, address, godown_type, capacity, capacity_unit')
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .or(`division_id.eq.${divisionId},division_id.is.null`)
        .order('name');

      if (godownsError) {
        console.error('Error fetching godowns:', godownsError);
        return;
      }

      // Get stock-affecting voucher types
      const { data: stockVoucherTypes, error: stockTypesError } = await supabase
        .from('mst_vouchertype')
        .select('name')
        .eq('affects_stock', 1)
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .or(`division_id.eq.${divisionId},division_id.is.null`);

      if (stockTypesError) {
        console.error('Error fetching stock voucher types:', stockTypesError);
        return;
      }

      const stockTypeNames = (stockVoucherTypes || []).map(t => t.name);

      // Get vouchers that affect stock/inventory
      const { data: stockVouchers, error: stockVouchersError } = await supabase
        .from('tally_trn_voucher')
        .select('voucher_type, party_ledger_name')
        .in('voucher_type', stockTypeNames.length > 0 ? stockTypeNames : ['Sales', 'Purchase', 'Stock Journal', 'Physical Stock'])
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`);

      if (stockVouchersError) {
        console.error('Error fetching stock vouchers:', stockVouchersError);
        return;
      }

      // For demonstration, we'll assign vouchers to godowns based on location/name similarity
      // In a real scenario, this would be through proper inventory allocation tables
      const godownVoucherCounts: Record<string, number> = {};
      
      (godownsData || []).forEach(godown => {
        // Count vouchers that might be related to this godown
        // This is a simplified approach - in reality you'd have proper inventory allocation tables
        const relatedVouchers = (stockVouchers || []).filter(voucher => {
          const voucherLocation = voucher.party_ledger_name?.toLowerCase() || '';
          const godownName = godown.name.toLowerCase();
          const godownAddress = godown.address?.toLowerCase() || '';
          
          return voucherLocation.includes(godownName.split(' ')[0]) ||
                 godownAddress.includes(voucherLocation) ||
                 (godown.godown_type && voucherLocation.includes(godown.godown_type.toLowerCase()));
        });
        
        godownVoucherCounts[godown.name] = relatedVouchers.length;
      });

      // Add voucher counts to godowns
      const godownsWithCounts = (godownsData || []).map(godown => ({
        ...godown,
        voucher_count: godownVoucherCounts[godown.name] || 0
      }));

      setGodowns(godownsWithCounts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGodowns();
    }
  }, [open, companyId, divisionId]);

  const filteredGodowns = godowns.filter(godown =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.godown_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedGodowns = filteredGodowns.reduce((acc, godown) => {
    const parent = godown.parent || godown.godown_type || 'General Godowns';
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(godown);
    return acc;
  }, {} as Record<string, Godown[]>);

  const handleGodownSelect = (godownName: string) => {
    const newSelection = selectedGodown === godownName ? null : godownName;
    onGodownSelect(newSelection);
    setOpen(false);
  };

  const totalFilteredVouchers = filteredGodowns.reduce((sum, godown) => sum + (godown.voucher_count || 0), 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <span className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            {selectedGodown ? (
              <>
                <span className="truncate">{selectedGodown}</span>
                <Badge variant="secondary" className="ml-1">
                  Selected
                </Badge>
              </>
            ) : (
              'All Godowns'
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Godowns & Inventory</h4>
            <Badge variant="outline">
              {totalFilteredVouchers} vouchers
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search godowns..."
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
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedGodowns).map(([parentGroup, godownsList]) => (
                <div key={parentGroup} className="mb-4">
                  <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b mb-2">
                    {parentGroup}
                  </div>
                  {godownsList.map((godown) => (
                    <div
                      key={godown.name}
                      className={`p-3 cursor-pointer rounded-md hover:bg-accent transition-colors ${
                        selectedGodown === godown.name ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleGodownSelect(godown.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{godown.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {godown.address && (
                              <div className="truncate">{godown.address}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {godown.godown_type && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  {godown.godown_type}
                                </span>
                              )}
                              {godown.capacity > 0 && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                  {godown.capacity} {godown.capacity_unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {godown.voucher_count || 0}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredGodowns.length === 0 && !loading && (
                <div className="p-4 text-center text-muted-foreground">
                  No godowns found
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Total: {totalFilteredVouchers} inventory vouchers across {filteredGodowns.length} godowns
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}