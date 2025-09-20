import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

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

export const useVoucherTypesByCategory = () => {
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

      // Fetch voucher types - first try with company and division filters - use backup table
      let { data: voucherTypesData, error: voucherTypesError } = await supabase
        .from('bkp_mst_vouchertype')
        .select('guid, name, parent, affects_stock, company_id, division_id')
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      // If no data found with exact match, try with just company_id
      if (!voucherTypesData || voucherTypesData.length === 0) {
        const { data: companyData, error: companyError } = await supabase
          .from('bkp_mst_vouchertype')
          .select('guid, name, parent, affects_stock, company_id, division_id')
          .eq('company_id', companyId);
        
        if (!companyError) {
          voucherTypesData = companyData;
          voucherTypesError = null;
        }
      }

      // If still no data, try without any filters
      if (!voucherTypesData || voucherTypesData.length === 0) {
        const { data: allData, error: allError } = await supabase
          .from('bkp_mst_vouchertype')
          .select('guid, name, parent, affects_stock, company_id, division_id');
        
        if (!allError) {
          voucherTypesData = allData;
          voucherTypesError = null;
        }
      }

      if (voucherTypesError) throw voucherTypesError;

      // Fetch voucher counts for each type
      const voucherTypesWithCounts = await Promise.all(
        (voucherTypesData || []).map(async (vt) => {
          // Try to get count with company and division filter first - use backup table
          let { count, error: countError } = await supabase
            .from('bkp_tally_trn_voucher')
            .select('*', { count: 'exact', head: true })
            .eq('voucher_type', vt.name)
            .eq('company_id', companyId)
            .eq('division_id', divisionId);

          // If no results, try with just company_id
          if (count === 0 || countError) {
            const { count: companyCount, error: companyCountError } = await supabase
              .from('bkp_tally_trn_voucher')
              .select('*', { count: 'exact', head: true })
              .eq('voucher_type', vt.name)
              .eq('company_id', companyId);
            
            if (!companyCountError) {
              count = companyCount;
              countError = null;
            }
          }

          // If still no results, try without filters (just voucher type)
          if (count === 0 || countError) {
            const { count: allCount, error: allCountError } = await supabase
              .from('bkp_tally_trn_voucher')
              .select('*', { count: 'exact', head: true })
              .eq('voucher_type', vt.name);
            
            if (!allCountError) {
              count = allCount;
              countError = null;
            }
          }

          if (countError) {
            console.warn(`Error counting vouchers for ${vt.name}:`, countError);
          }

          return {
            ...vt,
            count: count || 0
          };
        })
      );

      setVoucherTypes(voucherTypesWithCounts);
    } catch (err) {
      console.error('Error fetching voucher types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch voucher types');
    } finally {
      setLoading(false);
    }
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