import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { tallyApiService } from '@/services/tally-api-service';

interface Voucher {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  amount: number;
  narration: string;
  party_ledger_name: string;
}

export const useApiLedgerVouchers = () => {
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

      console.log('Fetching vouchers for ledger from API:', ledgerName, { companyId, divisionId });

      const response = await tallyApiService.getVouchers(companyId, divisionId, {
        search: ledgerName,
        limit: 1000
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const formattedVouchers: Voucher[] = response.data
        .filter((voucher: any) => {
          // Filter vouchers that contain the ledger name in party name or other relevant fields
          const partyName = voucher.party_ledger_name || voucher.PartyLedgerName || '';
          return partyName.toLowerCase().includes(ledgerName.toLowerCase());
        })
        .map((voucher: any) => ({
          guid: voucher.guid || voucher.GUID || `v_${Date.now()}_${Math.random()}`,
          voucher_number: voucher.voucher_number || voucher.VoucherNumber || 'N/A',
          voucher_type: voucher.voucher_type || voucher.VoucherTypeName || 'Unknown',
          date: voucher.date || voucher.Date || new Date().toISOString(),
          amount: parseFloat(voucher.amount || voucher.Amount || '0'),
          narration: voucher.narration || voucher.Narration || 'No description',
          party_ledger_name: voucher.party_ledger_name || voucher.PartyLedgerName || '',
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`Found ${formattedVouchers.length} vouchers for ${ledgerName}`);
      setVouchers(formattedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers from API:', err);
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

      console.log('Fetching vouchers for voucher type from API:', voucherTypeName, { companyId, divisionId });

      const response = await tallyApiService.getVouchers(companyId, divisionId, {
        search: voucherTypeName,
        limit: 1000
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const formattedVouchers: Voucher[] = response.data
        .filter((voucher: any) => {
          // Filter vouchers that match the voucher type
          const voucherType = voucher.voucher_type || voucher.VoucherTypeName || '';
          return voucherType.toLowerCase().includes(voucherTypeName.toLowerCase()) ||
                 voucherType === voucherTypeName;
        })
        .map((voucher: any) => ({
          guid: voucher.guid || voucher.GUID || `v_${Date.now()}_${Math.random()}`,
          voucher_number: voucher.voucher_number || voucher.VoucherNumber || 'N/A',
          voucher_type: voucher.voucher_type || voucher.VoucherTypeName || 'Unknown',
          date: voucher.date || voucher.Date || new Date().toISOString(),
          amount: parseFloat(voucher.amount || voucher.Amount || '0'),
          narration: voucher.narration || voucher.Narration || 'No description',
          party_ledger_name: voucher.party_ledger_name || voucher.PartyLedgerName || '',
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`Found ${formattedVouchers.length} vouchers for voucher type ${voucherTypeName}`);
      setVouchers(formattedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers by type from API:', err);
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