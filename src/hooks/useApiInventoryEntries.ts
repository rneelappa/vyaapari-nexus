import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tallyApiService } from '@/services/tally-api-service';

interface InventoryEntry {
  guid: string;
  company_id: string | null;
  division_id: string | null;
  item: string;
  _item: string;
  quantity: number;
  amount: number;
  godown: string | null;
  destination_godown: string | null;
  _godown: string;
  _destination_godown: string;
  tracking_number: string | null;
  name: string;
}

export const useApiInventoryEntries = () => {
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyId, divisionId } = useParams();

  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_COOLDOWN = 5000; // 5 seconds

  useEffect(() => {
    if (companyId && divisionId && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const now = Date.now();
      if (now - lastFetchTime > FETCH_COOLDOWN) {
        fetchInventoryEntries();
      }
    }
  }, [companyId, divisionId, fetchAttempts, lastFetchTime]);

  const fetchInventoryEntries = async () => {
    const now = Date.now();
    if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
      setError(`Too many failed attempts. Please refresh the page to try again.`);
      return;
    }

    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('Skipping fetch due to cooldown period');
      return;
    }

    if (!companyId || !divisionId) {
      setError('Company ID and Division ID are required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(now);
      
      console.log('Fetching inventory entries from API...');
      
      // Get vouchers that affect stock (inventory transactions)
      const response = await tallyApiService.getVouchers(companyId, divisionId, {
        limit: 500 // Reasonable limit for inventory transactions
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Filter and transform inventory-related vouchers
      const transformedData: InventoryEntry[] = response.data
        .filter((voucher: any) => {
          // Filter for vouchers that likely contain inventory data
          return voucher.stock_items || voucher.StockItems || 
                 voucher.inventory_entries || voucher.InventoryEntries ||
                 (voucher.voucher_type && isInventoryVoucherType(voucher.voucher_type));
        })
        .flatMap((voucher: any) => {
          // Extract inventory entries from each voucher
          const stockItems = voucher.stock_items || voucher.StockItems || [];
          const inventoryEntries = voucher.inventory_entries || voucher.InventoryEntries || [];
          
          const entries = [...stockItems, ...inventoryEntries];
          
          return entries.map((entry: any, index: number) => ({
            guid: entry.guid || `inv_${voucher.guid || Date.now()}_${index}`,
            company_id: companyId,
            division_id: divisionId,
            item: entry.item || entry.StockItemName || entry.name || 'Unknown Item',
            _item: entry._item || entry.item || entry.StockItemName || entry.name || 'Unknown Item',
            quantity: parseFloat(entry.quantity || entry.Quantity || '0'),
            amount: parseFloat(entry.amount || entry.Amount || entry.value || '0'),
            godown: entry.godown || entry.Godown || entry.source_godown,
            destination_godown: entry.destination_godown || entry.DestinationGodown || entry.target_godown,
            _godown: entry._godown || entry.godown || entry.Godown || 'Main Store',
            _destination_godown: entry._destination_godown || entry.destination_godown || '',
            tracking_number: entry.tracking_number || entry.TrackingNumber || entry.batch_number,
            name: entry.name || entry.batch_name || entry.BatchName || `Batch-${index + 1}`,
          }));
        });
      
      setInventoryEntries(transformedData);
      setFetchAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error('Error fetching inventory entries from API:', err);
      setFetchAttempts(prev => prev + 1);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory entries';
      setError(errorMessage);
      setInventoryEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to identify inventory voucher types
  const isInventoryVoucherType = (voucherType: string): boolean => {
    const upperType = voucherType.toUpperCase();
    return upperType.includes('STOCK') || 
           upperType.includes('INVENTORY') || 
           upperType.includes('DELIVERY') ||
           upperType.includes('RECEIPT NOTE') ||
           upperType.includes('MATERIAL') ||
           upperType.includes('TRANSFER');
  };

  const handleRefresh = () => {
    setFetchAttempts(0);
    setLastFetchTime(0);
    setError(null);
    fetchInventoryEntries();
  };

  return {
    inventoryEntries,
    loading,
    error,
    refresh: handleRefresh,
    fetchInventoryEntries
  };
};