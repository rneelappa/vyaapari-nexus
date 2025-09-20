import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StockItem {
  name: string;
  parent: string;
  uom: string;
  closing_balance: number;
  closing_rate: number;
  closing_value: number;
  item_category: string;
  brand: string;
  voucher_count?: number;
}

interface InventoryFilterProps {
  companyId: string;
  divisionId: string;
  selectedItem: string | null;
  onItemSelect: (item: string | null) => void;
  totalVouchers: number;
}

export function InventoryFilter({ 
  companyId, 
  divisionId, 
  selectedItem, 
  onItemSelect,
  totalVouchers 
}: InventoryFilterProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const fetchStockItems = async () => {
    setLoading(true);
    try {
      // First get stock items from master data
      const { data: stockItemsData, error: stockItemsError } = await supabase
        .from('bkp_mst_stock_item')
        .select('name, parent, uom, closing_balance, closing_rate, closing_value, item_category, brand')
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .or(`division_id.eq.${divisionId},division_id.is.null`)
        .order('name');

      if (stockItemsError) {
        console.error('Error fetching stock items:', stockItemsError);
        return;
      }

      // Get stock-affecting voucher types
      const { data: stockVoucherTypes, error: stockTypesError } = await supabase
        .from('bkp_mst_vouchertype')
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
        .from('bkp_tally_trn_voucher')
        .select('voucher_type, party_ledger_name, narration')
        .in('voucher_type', stockTypeNames.length > 0 ? stockTypeNames : ['Sales', 'Purchase', 'Stock Journal', 'Physical Stock'])
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`);

      if (stockVouchersError) {
        console.error('Error fetching stock vouchers:', stockVouchersError);
        return;
      }

      // Count vouchers that might involve each stock item
      const itemVoucherCounts: Record<string, number> = {};
      
      (stockItemsData || []).forEach(item => {
        // Count vouchers that might involve this stock item
        // This is based on name matching in narration or party ledger
        const relatedVouchers = (stockVouchers || []).filter(voucher => {
          const voucherText = `${voucher.party_ledger_name || ''} ${voucher.narration || ''}`.toLowerCase();
          const itemName = item.name.toLowerCase();
          const itemBrand = item.brand?.toLowerCase() || '';
          const itemCategory = item.item_category?.toLowerCase() || '';
          
          return voucherText.includes(itemName) ||
                 voucherText.includes(itemName.split(' ')[0]) ||
                 (itemBrand && voucherText.includes(itemBrand)) ||
                 (itemCategory && voucherText.includes(itemCategory));
        });
        
        itemVoucherCounts[item.name] = relatedVouchers.length;
      });

      // Add voucher counts to stock items
      const itemsWithCounts = (stockItemsData || []).map(item => ({
        ...item,
        voucher_count: itemVoucherCounts[item.name] || 0
      }));

      setStockItems(itemsWithCounts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStockItems();
    }
  }, [open, companyId, divisionId]);

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const parent = item.parent || item.item_category || 'General Items';
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(item);
    return acc;
  }, {} as Record<string, StockItem[]>);

  const handleItemSelect = (itemName: string) => {
    const newSelection = selectedItem === itemName ? null : itemName;
    onItemSelect(newSelection);
    setOpen(false);
  };

  const totalFilteredVouchers = filteredItems.reduce((sum, item) => sum + (item.voucher_count || 0), 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {selectedItem ? (
              <>
                <span className="truncate">{selectedItem}</span>
                <Badge variant="secondary" className="ml-1">
                  Selected
                </Badge>
              </>
            ) : (
              'All Inventory'
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Stock Items & Inventory</h4>
            <Badge variant="outline">
              {totalFilteredVouchers} vouchers
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stock items..."
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
              {Object.entries(groupedItems).map(([parentGroup, itemsList]) => (
                <div key={parentGroup} className="mb-4">
                  <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b mb-2">
                    {parentGroup}
                  </div>
                  {itemsList.map((item) => (
                    <div
                      key={item.name}
                      className={`p-3 cursor-pointer rounded-md hover:bg-accent transition-colors ${
                        selectedItem === item.name ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleItemSelect(item.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 mb-1">
                              {item.brand && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                                  {item.brand}
                                </span>
                              )}
                              {item.item_category && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  {item.item_category}
                                </span>
                              )}
                            </div>
                            <div className="text-xs">
                              Stock: {item.closing_balance?.toFixed(2) || '0'} {item.uom}
                              {item.closing_value > 0 && (
                                <span className="ml-2">
                                  Value: ₹{item.closing_value?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {item.voucher_count || 0}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredItems.length === 0 && !loading && (
                <div className="p-4 text-center text-muted-foreground">
                  No stock items found
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Total: {totalFilteredVouchers} inventory vouchers across {filteredItems.length} items
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}