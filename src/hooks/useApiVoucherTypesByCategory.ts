import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tallyApiService } from '@/services/tally-api-service';

interface VoucherType {
  guid: string;
  name: string;
  parent: string;
  affects_stock: number;
  company_id: string;
  division_id: string;
}

interface VoucherTypeWithCount extends VoucherType {
  count: number;
}

interface CategorizedVoucherTypes {
  accounting: VoucherTypeWithCount[];
  nonAccounting: VoucherTypeWithCount[];
  inventory: VoucherTypeWithCount[];
}

export const useApiVoucherTypesByCategory = () => {
  const [voucherTypes, setVoucherTypes] = useState<VoucherTypeWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyId, divisionId } = useParams();

  // Define the accounting parent categories
  const accountingParents = [
    'Journal', 
    'Payment', 
    'Receipt', 
    'Contra', 
    'Sales', 
    'Purchase', 
    'Credit Note', 
    'Debit Note'
  ];

  useEffect(() => {
    fetchVoucherTypesWithCounts();
  }, [companyId, divisionId]);

  const fetchVoucherTypesWithCounts = async () => {
    if (!companyId || !divisionId) {
      setError('Company ID and Division ID are required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching voucher types from API...');
      
      // First, get all voucher types from API
      const voucherTypesResponse = await tallyApiService.getVouchers(companyId, divisionId);
      
      if (voucherTypesResponse.error) {
        throw new Error(voucherTypesResponse.error);
      }

      // Extract unique voucher types and their metadata
      const voucherTypeMap = new Map<string, VoucherType>();
      const voucherTypeCounts = new Map<string, number>();

      voucherTypesResponse.data.forEach((voucher: any) => {
        const voucherTypeName = voucher.voucher_type || voucher.VoucherTypeName;
        
        if (voucherTypeName) {
          // Count vouchers by type
          voucherTypeCounts.set(voucherTypeName, (voucherTypeCounts.get(voucherTypeName) || 0) + 1);
          
          // Store unique voucher type info
          if (!voucherTypeMap.has(voucherTypeName)) {
            voucherTypeMap.set(voucherTypeName, {
              guid: voucher.guid || `vt_${voucherTypeName}`,
              name: voucherTypeName,
              parent: voucher.parent || inferParentFromName(voucherTypeName),
              affects_stock: voucher.affects_stock || (isInventoryType(voucherTypeName) ? 1 : 0),
              company_id: companyId,
              division_id: divisionId
            });
          }
        }
      });

      // Convert to array with counts
      const voucherTypesWithCounts: VoucherTypeWithCount[] = Array.from(voucherTypeMap.values()).map(vt => ({
        ...vt,
        count: voucherTypeCounts.get(vt.name) || 0
      }));

      setVoucherTypes(voucherTypesWithCounts);
    } catch (err) {
      console.error('Error fetching voucher types from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch voucher types');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to infer parent category from voucher type name
  const inferParentFromName = (name: string): string => {
    const upperName = name.toUpperCase();
    
    if (upperName.includes('JOURNAL')) return 'Journal';
    if (upperName.includes('PAYMENT')) return 'Payment';
    if (upperName.includes('RECEIPT')) return 'Receipt';
    if (upperName.includes('CONTRA')) return 'Contra';
    if (upperName.includes('SALES')) return 'Sales';
    if (upperName.includes('PURCHASE')) return 'Purchase';
    if (upperName.includes('CREDIT')) return 'Credit Note';
    if (upperName.includes('DEBIT')) return 'Debit Note';
    
    // Default to non-accounting
    return 'Other';
  };

  // Helper function to determine if voucher type affects stock
  const isInventoryType = (name: string): boolean => {
    const upperName = name.toUpperCase();
    return upperName.includes('STOCK') || 
           upperName.includes('INVENTORY') || 
           upperName.includes('DELIVERY') ||
           upperName.includes('RECEIPT NOTE') ||
           upperName.includes('MATERIAL');
  };

  const categorizeVoucherTypes = (): CategorizedVoucherTypes => {
    const accounting = voucherTypes.filter(vt => 
      accountingParents.includes(vt.parent) && vt.affects_stock !== 1
    );
    
    const nonAccounting = voucherTypes.filter(vt => 
      !accountingParents.includes(vt.parent) && vt.affects_stock !== 1
    );
    
    const inventory = voucherTypes.filter(vt => 
      vt.affects_stock === 1
    );

    // Sort by count in descending order
    const sortByCount = (a: VoucherTypeWithCount, b: VoucherTypeWithCount) => b.count - a.count;

    return {
      accounting: accounting.sort(sortByCount),
      nonAccounting: nonAccounting.sort(sortByCount),
      inventory: inventory.sort(sortByCount)
    };
  };

  const categories = categorizeVoucherTypes();

  return {
    voucherTypes,
    categories,
    loading,
    error,
    refresh: fetchVoucherTypesWithCounts
  };
};