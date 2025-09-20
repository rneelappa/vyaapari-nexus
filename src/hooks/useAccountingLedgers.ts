import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface LedgerData {
  guid: string;
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
  company_id: string;
  division_id: string;
}

interface LedgerWithTransactions extends LedgerData {
  voucher_count: number;
  total_debit: number;
  total_credit: number;
  net_balance: number;
  latest_voucher_date: string | null;
}

export const useAccountingLedgers = () => {
  const [ledgers, setLedgers] = useState<LedgerWithTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyId, divisionId } = useParams();

  useEffect(() => {
    fetchAccountingLedgers();
  }, [companyId, divisionId]);

  const fetchAccountingLedgers = async () => {
    if (!companyId || !divisionId) {
      setError('Company ID and Division ID are required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching ledgers for:', { companyId, divisionId });

      // Fetch ALL ledgers (remove limit) - use backup table
      const { data: allLedgers, error: ledgersError } = await supabase
        .from('bkp_mst_ledger')
        .select('guid, name, parent, opening_balance, closing_balance, company_id, division_id');

      if (ledgersError) {
        console.error('Error fetching ledgers:', ledgersError);
        throw ledgersError;
      }

      console.log('Total ledgers in database:', allLedgers?.length || 0);
      if (allLedgers && allLedgers.length > 0) {
        console.log('Sample ledgers:', allLedgers.slice(0, 3));
        console.log('Company IDs found:', [...new Set(allLedgers.map(l => l.company_id))]);
        console.log('Division IDs found:', [...new Set(allLedgers.map(l => l.division_id))]);
      }

      // Filter by company and division
      const companyDivisionLedgers = allLedgers?.filter(ledger => 
        ledger.company_id === companyId && ledger.division_id === divisionId
      ) || [];

      console.log('Ledgers for company/division:', companyDivisionLedgers.length);

      if (companyDivisionLedgers.length === 0) {
        // Use all available ledgers as fallback
        const availableLedgers = allLedgers || [];
        console.log('Using all available ledgers since no exact match found');
        
        if (availableLedgers.length > 0) {
          setLedgers(availableLedgers.map(ledger => ({
            ...ledger,
            voucher_count: 0,
            total_debit: ledger.opening_balance > 0 ? ledger.opening_balance : 0,
            total_credit: ledger.opening_balance < 0 ? Math.abs(ledger.opening_balance) : 0,
            net_balance: ledger.closing_balance || ledger.opening_balance || 0,
            latest_voucher_date: null
          })));
        } else {
          setError('No ledger data found in the database');
        }
        return;
      }

      // Fetch transaction data for each ledger with latest voucher date
      const ledgersWithTransactions = await Promise.all(
        companyDivisionLedgers.map(async (ledger) => {
          // Get voucher count, transaction totals, and latest voucher date - use backup table
          const { data: transactions, error: transError } = await supabase
            .from('bkp_trn_accounting')
            .select('amount, is_deemed_positive, voucher_date')
            .ilike('ledger', `%${ledger.name}%`)
            .eq('company_id', companyId)
            .eq('division_id', divisionId)
            .order('voucher_date', { ascending: false });

          if (transError) {
            console.warn(`Error fetching transactions for ${ledger.name}:`, transError);
          }

          const transactionData = transactions || [];
          const voucherCount = transactionData.length;
          const latestVoucherDate = transactionData.length > 0 ? transactionData[0]?.voucher_date : null;
          
          // Calculate debit and credit totals
          let totalDebit = 0;
          let totalCredit = 0;
          
          transactionData.forEach(trans => {
            const amount = trans.amount || 0;
            if (amount >= 0) {
              totalDebit += amount;
            } else {
              totalCredit += Math.abs(amount);
            }
          });

          const netBalance = (ledger.closing_balance || ledger.opening_balance || 0) + totalDebit - totalCredit;

          return {
            ...ledger,
            voucher_count: voucherCount,
            total_debit: totalDebit + (ledger.opening_balance > 0 ? ledger.opening_balance : 0),
            total_credit: totalCredit + (ledger.opening_balance < 0 ? Math.abs(ledger.opening_balance) : 0),
            net_balance: netBalance,
            latest_voucher_date: latestVoucherDate
          };
        })
      );

      // Sort by latest voucher date (most recent first)
      const sortedLedgers = ledgersWithTransactions.sort((a, b) => {
        if (!a.latest_voucher_date && !b.latest_voucher_date) return 0;
        if (!a.latest_voucher_date) return 1;
        if (!b.latest_voucher_date) return -1;
        return new Date(b.latest_voucher_date).getTime() - new Date(a.latest_voucher_date).getTime();
      });

      console.log('Final ledgers with transactions:', sortedLedgers.length);
      setLedgers(sortedLedgers);
    } catch (err) {
      console.error('Error fetching accounting ledgers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounting ledgers');
    } finally {
      setLoading(false);
    }
  };

  return {
    ledgers,
    loading,
    error,
    refresh: fetchAccountingLedgers
  };
};