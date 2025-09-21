/**
 * VT Voucher Detail Hook
 * 
 * Hook for fetching and managing VT voucher details
 */

import { useState, useEffect } from 'react';
import { VtVoucherDetailService, type VtVoucherDetail } from '@/services/vt-voucher-detail';

export interface UseVtVoucherDetailResult {
  voucher: VtVoucherDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useVtVoucherDetail(
  voucherGuid: string | null,
  companyId: string,
  divisionId: string
): UseVtVoucherDetailResult {
  const [voucher, setVoucher] = useState<VtVoucherDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoucherDetail = async () => {
    if (!voucherGuid) {
      setVoucher(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const voucherDetail = await VtVoucherDetailService.getVoucherDetail(
        voucherGuid,
        companyId,
        divisionId
      );

      if (voucherDetail) {
        setVoucher(voucherDetail);
      } else {
        setError('Voucher not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voucher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherDetail();
  }, [voucherGuid, companyId, divisionId]);

  const refresh = () => {
    fetchVoucherDetail();
  };

  return {
    voucher,
    loading,
    error,
    refresh
  };
}