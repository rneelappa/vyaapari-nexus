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

      console.log('Fetching vouchers for ledger:', ledgerName);

      // Fetch vouchers from trn_accounting table
      const { data: accountingData, error: accountingError } = await supabase
        .from('trn_accounting')
        .select('voucher_guid, voucher_number, voucher_type, voucher_date, amount')
        .ilike('ledger', ledgerName)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('voucher_date', { ascending: false });

      if (accountingError) {
        console.error('Error fetching accounting data:', accountingError);
        throw accountingError;
      }

      // Get unique voucher GUIDs to fetch full voucher details
      const allGuids = accountingData?.map(item => item.voucher_guid) || [];
      const voucherGuids = [...new Set(allGuids.filter(guid => guid !== null && guid !== undefined))];
      
      if (voucherGuids.length === 0) {
        setVouchers([]);
        return;
      }

      // Fetch full voucher details
      const { data: voucherData, error: voucherError } = await supabase
        .from('tally_trn_voucher')
        .select('guid, voucher_number, voucher_type, date, total_amount, narration, party_ledger_name')
        .in('guid', voucherGuids)
        .order('date', { ascending: false });

      if (voucherError) {
        console.warn('Error fetching voucher details:', voucherError);
        // Fallback to accounting data
        const fallbackVouchers = accountingData?.map(item => ({
          guid: item.voucher_guid || crypto.randomUUID(),
          voucher_number: item.voucher_number || 'N/A',
          voucher_type: item.voucher_type || 'Unknown',
          date: item.voucher_date || new Date().toISOString(),
          amount: item.amount || 0,
          narration: `Transaction for ${ledgerName}`,
          party_ledger_name: ledgerName
        })) || [];
        
        setVouchers(fallbackVouchers);
        return;
      }

      const formattedVouchers = voucherData?.map(voucher => ({
        guid: voucher.guid,
        voucher_number: voucher.voucher_number || 'N/A',
        voucher_type: voucher.voucher_type || 'Unknown',
        date: voucher.date || new Date().toISOString(),
        amount: voucher.total_amount || 0,
        narration: voucher.narration || 'No description',
        party_ledger_name: voucher.party_ledger_name || ledgerName
      })) || [];

      setVouchers(formattedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  return {
    vouchers,
    loading,
    error,
    fetchVouchersForLedger
  };
};