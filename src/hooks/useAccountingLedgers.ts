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
}

export const useAccountingLedgers = () => {
  const [ledgers, setLedgers] = useState<LedgerWithTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyId, divisionId } = useParams();

  // Define accounting ledger groups (these are the parent groups for accounting ledgers)
  const accountingGroups = [
    'Current Assets',
    'Fixed Assets', 
    'Current Liabilities',
    'Capital Account',
    'Loans (Liability)',
    'Bank Accounts',
    'Cash-in-Hand',
    'Sundry Debtors',
    'Sundry Creditors',
    'Sales Accounts',
    'Purchase Accounts',
    'Direct Expenses',
    'Indirect Expenses',
    'Direct Incomes',
    'Indirect Incomes'
  ];

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

      // First, let's try to fetch all ledgers without filtering to see what we have
      const { data: allLedgers, error: ledgersError } = await supabase
        .from('mst_ledger')
        .select('guid, name, parent, opening_balance, closing_balance, company_id, division_id')
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      if (ledgersError) {
        console.error('Error fetching ledgers:', ledgersError);
        throw ledgersError;
      }

      console.log('Fetched ledgers:', allLedgers?.length || 0);

      if (!allLedgers || allLedgers.length === 0) {
        // Try without company/division filter to see if there's any data
        const { data: anyLedgers, error: anyError } = await supabase
          .from('mst_ledger')
          .select('guid, name, parent, opening_balance, closing_balance, company_id, division_id')
          .limit(10);
        
        console.log('Any ledgers in database:', anyLedgers?.length || 0);
        if (anyLedgers && anyLedgers.length > 0) {
          console.log('Sample ledger:', anyLedgers[0]);
        }
      }

      // Filter accounting ledgers (those with accounting group parents)
      const accountingLedgers = (allLedgers || []).filter(ledger => 
        accountingGroups.some(group => 
          ledger.parent?.toLowerCase().includes(group.toLowerCase()) ||
          group.toLowerCase().includes(ledger.parent?.toLowerCase() || '')
        )
      );

      console.log('Accounting ledgers after filtering:', accountingLedgers.length);

      // Fetch transaction data for each ledger
      const ledgersWithTransactions = await Promise.all(
        accountingLedgers.map(async (ledger) => {
          // Get voucher count and transaction totals
          const { data: transactions, error: transError } = await supabase
            .from('trn_accounting')
            .select('amount, is_deemed_positive')
            .eq('ledger', ledger.name)
            .eq('company_id', companyId)
            .eq('division_id', divisionId);

          if (transError) {
            console.warn(`Error fetching transactions for ${ledger.name}:`, transError);
          }

          const transactionData = transactions || [];
          const voucherCount = transactionData.length;
          
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

          const netBalance = (ledger.opening_balance || 0) + totalDebit - totalCredit;

          return {
            ...ledger,
            voucher_count: voucherCount,
            total_debit: totalDebit,
            total_credit: totalCredit,
            net_balance: netBalance
          };
        })
      );

      console.log('Final ledgers with transactions:', ledgersWithTransactions.length);
      setLedgers(ledgersWithTransactions);
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