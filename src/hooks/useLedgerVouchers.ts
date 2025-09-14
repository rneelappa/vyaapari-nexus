import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface Voucher {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  amount: number;
  narration: string;
  party_ledger_name: string;
}

export const useLedgerVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companyId, divisionId } = useParams();

  const fetchVouchersForLedger = async (ledgerName: string) => {
    if (!companyId || !divisionId) {
      setError('Company ID and Division ID are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching vouchers for ledger:', ledgerName, { companyId, divisionId });

      // Query vouchers directly from tally_trn_voucher table by party ledger name
      const { data: voucherData, error: voucherError } = await supabase
        .from('tally_trn_voucher')
        .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
        .ilike('party_ledger_name', `%${ledgerName}%`)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('date', { ascending: false });

      if (voucherError) {
        console.error('Error fetching voucher data:', voucherError);
        throw voucherError;
      }

      // If no vouchers found with company/division filters, try without them
      let finalVoucherData = voucherData || [];
      if (finalVoucherData.length === 0) {
        console.log('No vouchers found with company/division filters. Trying without filters...');
        const fallbackResp = await supabase
          .from('tally_trn_voucher')
          .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
          .ilike('party_ledger_name', `%${ledgerName}%`)
          .order('date', { ascending: false });

        if (fallbackResp.error) {
          console.warn('Fallback voucher fetch error:', fallbackResp.error);
        } else {
          finalVoucherData = fallbackResp.data || [];
        }
      }

      const formattedVouchers = finalVoucherData.map((voucher) => ({
        guid: voucher.guid,
        voucher_number: voucher.voucher_number || 'N/A',
        voucher_type: voucher.voucher_type || 'Unknown',
        date: voucher.date || new Date().toISOString(),
        amount: voucher.total_amount || 0,
        narration: voucher.narration || 'No description',
        party_ledger_name: voucher.party_ledger_name || ledgerName,
      }));

      console.log(`Found ${formattedVouchers.length} vouchers for ${ledgerName}`);
      setVouchers(formattedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchersByType = async (voucherTypeName: string) => {
    if (!companyId || !divisionId) {
      setError('Company ID and Division ID are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching vouchers for voucher type:', voucherTypeName, { companyId, divisionId });

      // First try exact match on voucher_type with company/division
      const { data: voucherData, error: voucherError } = await supabase
        .from('tally_trn_voucher')
        .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
        .eq('voucher_type', voucherTypeName)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('date', { ascending: false });

      if (voucherError) {
        console.error('Error fetching voucher data by type:', voucherError);
        throw voucherError;
      }

      let finalVoucherData = voucherData || [];

      // If none, try partial match (ILIKE) with company/division
      if (finalVoucherData.length === 0) {
        const partialResp = await supabase
          .from('tally_trn_voucher')
          .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
          .ilike('voucher_type', `%${voucherTypeName}%`)
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .order('date', { ascending: false });
        if (!partialResp.error) {
          finalVoucherData = partialResp.data || [];
        }
      }

      // If still none, try without company/division filters
      if (finalVoucherData.length === 0) {
        const fallbackResp = await supabase
          .from('tally_trn_voucher')
          .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
          .eq('voucher_type', voucherTypeName)
          .order('date', { ascending: false });
        if (!fallbackResp.error && fallbackResp.data) {
          finalVoucherData = fallbackResp.data;
        }
      }

      // If still none, try partial without filters
      if (finalVoucherData.length === 0) {
        const fallbackPartial = await supabase
          .from('tally_trn_voucher')
          .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name, company_id, division_id')
          .ilike('voucher_type', `%${voucherTypeName}%`)
          .order('date', { ascending: false });
        if (!fallbackPartial.error && fallbackPartial.data) {
          finalVoucherData = fallbackPartial.data;
        }
      }

      const formattedVouchers = finalVoucherData.map((voucher) => ({
        guid: voucher.guid,
        voucher_number: voucher.voucher_number || 'N/A',
        voucher_type: voucher.voucher_type || 'Unknown',
        date: voucher.date || new Date().toISOString(),
        amount: voucher.total_amount || 0,
        narration: voucher.narration || 'No description',
        party_ledger_name: voucher.party_ledger_name || '',
      }));

      console.log(`Found ${formattedVouchers.length} vouchers for voucher type ${voucherTypeName}`);
      setVouchers(formattedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers by type:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  return {
    vouchers,
    loading,
    error,
    fetchVouchersForLedger,
    fetchVouchersByType,
  };
};