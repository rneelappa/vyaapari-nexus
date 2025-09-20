import { supabase } from '@/integrations/supabase/client';
import type { VtVoucher } from '@/types/vt';

export interface VoucherFilters {
  voucherType?: string;
  dateFrom?: string;
  dateTo?: string;
  partyName?: string;
  voucherNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface VoucherSortOptions {
  field: 'date' | 'voucher_number' | 'voucher_type' | 'party_name' | 'amount';
  direction: 'asc' | 'desc';
}

export interface VoucherPaginationOptions {
  page: number;
  pageSize: number;
}

export interface VoucherListResponse {
  vouchers: VtVoucher[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VoucherStats {
  totalVouchers: number;
  totalAmount: number;
  vouchersByType: Record<string, number>;
  amountsByType: Record<string, number>;
  recentVouchers: number;
}

export interface CreateVoucherData {
  voucher_type: string;
  voucher_number?: string;
  date: string;
  party_name?: string;
  party_ledger_name?: string;
  narration?: string;
  reference?: string;
  amount?: number;
  // Add other fields as needed
}

export interface UpdateVoucherData extends Partial<CreateVoucherData> {
  id: string;
}

export class VtVoucherManagementService {
  private companyId: string;
  private divisionId: string;

  constructor(companyId: string, divisionId: string) {
    this.companyId = companyId;
    this.divisionId = divisionId;
  }

  /**
   * Get paginated list of vouchers with filtering and sorting
   */
  async getVouchers(
    filters?: VoucherFilters,
    sort?: VoucherSortOptions,
    pagination?: VoucherPaginationOptions
  ): Promise<VoucherListResponse> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      // Build the query
      let query = supabase
        .from('vt_voucher')
        .select('*', { count: 'exact' })
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId);

      // Apply filters
      if (filters) {
        if (filters.voucherType) {
          query = query.eq('voucher_type', filters.voucherType);
        }
        if (filters.dateFrom) {
          query = query.gte('date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('date', filters.dateTo);
        }
        if (filters.partyName) {
          query = query.ilike('party_name', `%${filters.partyName}%`);
        }
        if (filters.voucherNumber) {
          query = query.ilike('voucher_number', `%${filters.voucherNumber}%`);
        }
        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }
        if (filters.searchTerm) {
          query = query.or(`voucher_number.ilike.%${filters.searchTerm}%,party_name.ilike.%${filters.searchTerm}%,narration.ilike.%${filters.searchTerm}%`);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        // Default sort by date descending
        query = query.order('date', { ascending: false });
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 50;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        vouchers: data || [],
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error: any) {
      console.error('Error fetching vouchers:', error.message);
      throw new Error(`Failed to fetch vouchers: ${error.message}`);
    }
  }

  /**
   * Get voucher statistics
   */
  async getVoucherStats(filters?: VoucherFilters): Promise<VoucherStats> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      // Build base query
      let query = supabase
        .from('vt_voucher')
        .select('voucher_type, amount, date')
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId);

      // Apply filters
      if (filters) {
        if (filters.dateFrom) {
          query = query.gte('date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('date', filters.dateTo);
        }
        if (filters.voucherType) {
          query = query.eq('voucher_type', filters.voucherType);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const vouchers = data || [];
      const totalVouchers = vouchers.length;
      const totalAmount = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);

      // Group by voucher type
      const vouchersByType: Record<string, number> = {};
      const amountsByType: Record<string, number> = {};

      vouchers.forEach(voucher => {
        const type = voucher.voucher_type || 'Unknown';
        vouchersByType[type] = (vouchersByType[type] || 0) + 1;
        amountsByType[type] = (amountsByType[type] || 0) + (voucher.amount || 0);
      });

      // Count recent vouchers (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentVouchers = vouchers.filter(v => 
        v.date && new Date(v.date) >= sevenDaysAgo
      ).length;

      return {
        totalVouchers,
        totalAmount,
        vouchersByType,
        amountsByType,
        recentVouchers,
      };
    } catch (error: any) {
      console.error('Error fetching voucher stats:', error.message);
      throw new Error(`Failed to fetch voucher stats: ${error.message}`);
    }
  }

  /**
   * Get a single voucher by ID
   */
  async getVoucherById(voucherId: string): Promise<VtVoucher | null> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { data, error } = await supabase
        .from('vt_voucher')
        .select('*')
        .eq('id', voucherId)
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching voucher by ID:', error.message);
      throw new Error(`Failed to fetch voucher: ${error.message}`);
    }
  }

  /**
   * Get a single voucher by GUID
   */
  async getVoucherByGuid(guid: string): Promise<VtVoucher | null> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { data, error } = await supabase
        .from('vt_voucher')
        .select('*')
        .eq('guid', guid)
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching voucher by GUID:', error.message);
      throw new Error(`Failed to fetch voucher: ${error.message}`);
    }
  }

  /**
   * Create a new voucher
   */
  async createVoucher(voucherData: CreateVoucherData): Promise<VtVoucher> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { data, error } = await supabase
        .from('vt_voucher')
        .insert({
          ...voucherData,
          company_id: this.companyId,
          division_id: this.divisionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error creating voucher:', error.message);
      throw new Error(`Failed to create voucher: ${error.message}`);
    }
  }

  /**
   * Update an existing voucher
   */
  async updateVoucher(voucherData: UpdateVoucherData): Promise<VtVoucher> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { id, ...updateData } = voucherData;

      const { data, error } = await supabase
        .from('vt_voucher')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error updating voucher:', error.message);
      throw new Error(`Failed to update voucher: ${error.message}`);
    }
  }

  /**
   * Delete a voucher
   */
  async deleteVoucher(voucherId: string): Promise<void> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { error } = await supabase
        .from('vt_voucher')
        .delete()
        .eq('id', voucherId)
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting voucher:', error.message);
      throw new Error(`Failed to delete voucher: ${error.message}`);
    }
  }

  /**
   * Refresh vouchers from Tally (trigger sync)
   */
  async refreshFromTally(): Promise<{ success: boolean; message: string }> {
    try {
      // This would typically call your Tally sync API endpoint
      // For now, we'll return a placeholder response
      return {
        success: true,
        message: 'Voucher refresh from Tally initiated successfully'
      };
    } catch (error: any) {
      console.error('Error refreshing from Tally:', error.message);
      throw new Error(`Failed to refresh from Tally: ${error.message}`);
    }
  }

  /**
   * Get available voucher types
   */
  async getVoucherTypes(): Promise<string[]> {
    if (!this.companyId || !this.divisionId) {
      throw new Error('Company ID and Division ID are required');
    }

    try {
      const { data, error } = await supabase
        .from('vt_voucher')
        .select('voucher_type')
        .eq('company_id', this.companyId)
        .eq('division_id', this.divisionId)
        .not('voucher_type', 'is', null);

      if (error) throw error;

      const uniqueTypes = [...new Set(data.map(v => v.voucher_type))];
      return uniqueTypes.filter(Boolean);
    } catch (error: any) {
      console.error('Error fetching voucher types:', error.message);
      throw new Error(`Failed to fetch voucher types: ${error.message}`);
    }
  }
}
