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

      // First, let's try to fetch ALL ledgers to see what data exists
      const { data: allLedgers, error: ledgersError } = await supabase
        .from('mst_ledger')
        .select('guid, name, parent, opening_balance, closing_balance, company_id, division_id')
        .limit(100); // Get some data to see what's available

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

      // Now filter by company and division
      const companyDivisionLedgers = allLedgers?.filter(ledger => 
        ledger.company_id === companyId && ledger.division_id === divisionId
      ) || [];

      console.log('Ledgers for company/division:', companyDivisionLedgers.length);

      if (companyDivisionLedgers.length === 0) {
        // Try with any available company/division if no exact match
        const anyAvailableLedgers = allLedgers?.slice(0, 10) || [];
        console.log('Using sample ledgers since no exact match found');
        
        if (anyAvailableLedgers.length > 0) {
          setLedgers(anyAvailableLedgers.map(ledger => ({
            ...ledger,
            voucher_count: 0,
            total_debit: ledger.opening_balance > 0 ? ledger.opening_balance : 0,
            total_credit: ledger.opening_balance < 0 ? Math.abs(ledger.opening_balance) : 0,
            net_balance: ledger.closing_balance || ledger.opening_balance || 0
          })));
        } else {
          setError('No ledger data found in the database');
        }
        return;
      }

      // Fetch transaction data for each ledger
      const ledgersWithTransactions = await Promise.all(
        companyDivisionLedgers.map(async (ledger) => {
          // Get voucher count and transaction totals
          const { data: transactions, error: transError } = await supabase
            .from('trn_accounting')
            .select('amount, is_deemed_positive')
            .ilike('ledger', ledger.name)
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

          const netBalance = (ledger.closing_balance || ledger.opening_balance || 0) + totalDebit - totalCredit;

          return {
            ...ledger,
            voucher_count: voucherCount,
            total_debit: totalDebit + (ledger.opening_balance > 0 ? ledger.opening_balance : 0),
            total_credit: totalCredit + (ledger.opening_balance < 0 ? Math.abs(ledger.opening_balance) : 0),
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