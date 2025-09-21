// Minimal VT Voucher Details Hook
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVtVoucherDetails = (voucherGuid: string) => {
  return useQuery({
    queryKey: ['vtVoucherDetails', voucherGuid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bkp_tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!voucherGuid,
  });
};

export const useVtVoucherDetailsWithRefresh = (voucherGuid: string) => {
  const queryClient = useQueryClient();
  
  const query = useVtVoucherDetails(voucherGuid);
  
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['vtVoucherDetails', voucherGuid] });
  };
  
  return {
    ...query,
    refresh
  };
};
