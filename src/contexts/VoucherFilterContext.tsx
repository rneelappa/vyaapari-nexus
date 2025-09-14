// VoucherFilterContext v2.0 - Force refresh
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FilteredOptions {
  ledgers: Array<{ name: string; parent: string; voucher_count: number; opening_balance?: number; closing_balance?: number }>;
  voucherTypes: Array<{ name: string; parent: string; voucher_count: number; affects_stock?: number; is_deemedpositive?: number }>;
  godowns: Array<{ name: string; parent: string; voucher_count: number }>;
  inventoryItems: Array<{ name: string; parent: string; voucher_count: number }>;
}

export interface FilterState {
  selectedGroup: string | null;
  selectedLedger: string | null;
  selectedVoucherType: string | null;
  selectedGodown: string | null;
  selectedInventoryItem: string | null;
  dateFrom: string;
  dateTo: string;
  amountFrom: string;
  amountTo: string;
}

interface VoucherFilterContextType {
  filters: FilterState;
  filteredOptions: FilteredOptions;
  loading: boolean;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  refreshOptions: () => void;
}

const VoucherFilterContext = createContext<VoucherFilterContextType | undefined>(undefined);

interface VoucherFilterProviderProps {
  children: ReactNode;
  companyId: string;
  divisionId: string;
}

const initialFilters: FilterState = {
  selectedGroup: null,
  selectedLedger: null,
  selectedVoucherType: null,
  selectedGodown: null,
  selectedInventoryItem: null,
  dateFrom: '',
  dateTo: '',
  amountFrom: '',
  amountTo: '',
};

const initialOptions: FilteredOptions = {
  ledgers: [],
  voucherTypes: [],
  godowns: [],
  inventoryItems: [],
};

export function VoucherFilterProvider({ children, companyId, divisionId }: VoucherFilterProviderProps) {
  console.log('VoucherFilterProvider rendering with:', { companyId, divisionId });
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filteredOptions, setFilteredOptions] = useState<FilteredOptions>(initialOptions);
  const [loading, setLoading] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Clear dependent filters when parent filter changes
      if (key === 'selectedGroup') {
        newFilters.selectedLedger = null;
        newFilters.selectedVoucherType = null;
        newFilters.selectedGodown = null;
        newFilters.selectedInventoryItem = null;
      } else if (key === 'selectedLedger') {
        newFilters.selectedVoucherType = null;
        newFilters.selectedGodown = null;
        newFilters.selectedInventoryItem = null;
      } else if (key === 'selectedVoucherType') {
        newFilters.selectedGodown = null;
        newFilters.selectedInventoryItem = null;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const fetchFilteredOptions = async () => {
    if (!companyId || !divisionId) return;
    
    setLoading(true);
    try {
      // Build base query conditions
      const companyCondition = `and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`;
      
      // Fetch ledgers based on selected group
      let ledgerQuery = supabase
        .from('mst_ledger')
        .select('name, parent, opening_balance, closing_balance');
      
      if (filters.selectedGroup) {
        ledgerQuery = ledgerQuery.eq('parent', filters.selectedGroup);
      }
      
      const { data: ledgersData } = await ledgerQuery
        .or(companyCondition)
        .order('name');

      // Get voucher counts for ledgers
      const ledgerNames = (ledgersData || []).map(l => l.name);
      let voucherCountsQuery = supabase
        .from('tally_trn_voucher')
        .select('party_ledger_name, voucher_type, guid')
        .or(companyCondition);

      if (ledgerNames.length > 0) {
        voucherCountsQuery = voucherCountsQuery.in('party_ledger_name', ledgerNames);
      }

      const { data: voucherData } = await voucherCountsQuery;

      // Count vouchers by ledger
      const ledgerCounts = (voucherData || []).reduce((acc, voucher) => {
        const ledger = voucher.party_ledger_name;
        if (ledger) {
          acc[ledger] = (acc[ledger] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const ledgersWithCounts = (ledgersData || []).map(ledger => ({
        name: ledger.name,
        parent: ledger.parent,
        opening_balance: ledger.opening_balance,
        closing_balance: ledger.closing_balance,
        voucher_count: ledgerCounts[ledger.name] || 0
      }));

      // Fetch voucher types based on selected ledger
      let voucherTypesData: any[] = [];
      if (filters.selectedLedger) {
        const { data } = await supabase
          .from('tally_trn_voucher')
          .select('voucher_type')
          .eq('party_ledger_name', filters.selectedLedger)
          .or(companyCondition);
        
        const uniqueTypes = Array.from(new Set((data || []).map(v => v.voucher_type))).filter(Boolean);
        
        // Get master data for these types
        if (uniqueTypes.length > 0) {
          const { data: masterTypes } = await supabase
            .from('mst_vouchertype')
            .select('name, parent, affects_stock, is_deemedpositive')
            .in('name', uniqueTypes)
            .or(companyCondition);

          voucherTypesData = (masterTypes || []).map(type => ({
            name: type.name,
            parent: type.parent,
            affects_stock: type.affects_stock,
            is_deemedpositive: type.is_deemedpositive,
            voucher_count: (data || []).filter(v => v.voucher_type === type.name).length
          }));
        }
      } else if (filters.selectedGroup) {
        // Get voucher types used by any ledger in the selected group
        const groupLedgerNames = ledgersWithCounts.map(l => l.name);
        if (groupLedgerNames.length > 0) {
          const { data } = await supabase
            .from('tally_trn_voucher')
            .select('voucher_type')
            .in('party_ledger_name', groupLedgerNames)
            .or(companyCondition);

          const uniqueTypes = Array.from(new Set((data || []).map(v => v.voucher_type))).filter(Boolean);
          
          if (uniqueTypes.length > 0) {
            const { data: masterTypes } = await supabase
              .from('mst_vouchertype')
              .select('name, parent, affects_stock, is_deemedpositive')
              .in('name', uniqueTypes)
              .or(companyCondition);

            voucherTypesData = (masterTypes || []).map(type => ({
              name: type.name,
              parent: type.parent,
              affects_stock: type.affects_stock,
              is_deemedpositive: type.is_deemedpositive,
              voucher_count: (data || []).filter(v => v.voucher_type === type.name).length
            }));
          }
        }
      } else {
        // Get all voucher types
        const { data: allTypes } = await supabase
          .from('mst_vouchertype')
          .select('name, parent, affects_stock, is_deemedpositive')
          .or(companyCondition);

        const { data: allVouchers } = await supabase
          .from('tally_trn_voucher')
          .select('voucher_type')
          .or(companyCondition);

        const typeCounts = (allVouchers || []).reduce((acc, voucher) => {
          const type = voucher.voucher_type;
          if (type) {
            acc[type] = (acc[type] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        voucherTypesData = (allTypes || []).map(type => ({
          name: type.name,
          parent: type.parent,
          affects_stock: type.affects_stock,
          is_deemedpositive: type.is_deemedpositive,
          voucher_count: typeCounts[type.name] || 0
        }));
      }

      // Fetch godowns based on selected filters
      let godownsData: any[] = [];
      if (filters.selectedVoucherType || filters.selectedLedger || filters.selectedGroup) {
        // Get stock-affecting vouchers only
        let stockVoucherQuery = supabase
          .from('tally_trn_voucher')
          .select('party_ledger_name, voucher_type, narration')
          .or(companyCondition);

        if (filters.selectedVoucherType) {
          stockVoucherQuery = stockVoucherQuery.eq('voucher_type', filters.selectedVoucherType);
        }
        if (filters.selectedLedger) {
          stockVoucherQuery = stockVoucherQuery.eq('party_ledger_name', filters.selectedLedger);
        }

        const { data: stockVouchers } = await stockVoucherQuery;
        
        // Get all godowns and match with voucher data
        const { data: allGodowns } = await supabase
          .from('mst_godown')
          .select('name, parent, address, godown_type')
          .or(companyCondition);

        godownsData = (allGodowns || []).map(godown => ({
          name: godown.name,
          parent: godown.parent,
          voucher_count: (stockVouchers || []).filter(v => 
            v.narration?.toLowerCase().includes(godown.name.toLowerCase()) ||
            v.party_ledger_name?.toLowerCase().includes(godown.name.toLowerCase())
          ).length
        })).filter(g => g.voucher_count > 0);
      }

      // Fetch inventory items based on selected filters
      let inventoryData: any[] = [];
      if (filters.selectedVoucherType || filters.selectedLedger || filters.selectedGroup) {
        // Similar logic for inventory items
        const { data: allItems } = await supabase
          .from('mst_stock_item')
          .select('name, parent, uom, item_category')
          .or(companyCondition);

        let itemVoucherQuery = supabase
          .from('tally_trn_voucher')
          .select('party_ledger_name, voucher_type, narration')
          .or(companyCondition);

        if (filters.selectedVoucherType) {
          itemVoucherQuery = itemVoucherQuery.eq('voucher_type', filters.selectedVoucherType);
        }
        if (filters.selectedLedger) {
          itemVoucherQuery = itemVoucherQuery.eq('party_ledger_name', filters.selectedLedger);
        }

        const { data: itemVouchers } = await itemVoucherQuery;

        inventoryData = (allItems || []).map(item => ({
          name: item.name,
          parent: item.parent,
          voucher_count: (itemVouchers || []).filter(v =>
            v.narration?.toLowerCase().includes(item.name.toLowerCase()) ||
            v.party_ledger_name?.toLowerCase().includes(item.name.toLowerCase())
          ).length
        })).filter(i => i.voucher_count > 0);
      }

      setFilteredOptions({
        ledgers: ledgersWithCounts,
        voucherTypes: voucherTypesData,
        godowns: godownsData,
        inventoryItems: inventoryData,
      });

    } catch (error) {
      console.error('Error fetching filtered options:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOptions = () => {
    fetchFilteredOptions();
  };

  useEffect(() => {
    fetchFilteredOptions();
  }, [companyId, divisionId, filters.selectedGroup, filters.selectedLedger, filters.selectedVoucherType]);

  return (
    <VoucherFilterContext.Provider
      value={{
        filters,
        filteredOptions,
        loading,
        updateFilter,
        clearFilters,
        refreshOptions,
      }}
    >
      {children}
    </VoucherFilterContext.Provider>
  );
}

export function useVoucherFilter() {
  console.log('useVoucherFilter called');
  const context = useContext(VoucherFilterContext);
  console.log('context:', context);
  if (context === undefined) {
    console.error('useVoucherFilter must be used within a VoucherFilterProvider');
    throw new Error('useVoucherFilter must be used within a VoucherFilterProvider');
  }
  return context;
}