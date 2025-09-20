-- Create bank allocation table for Contra and other bank-related vouchers
CREATE TABLE IF NOT EXISTS trn_bank_allocation (
  id BIGSERIAL PRIMARY KEY,
  voucher_guid VARCHAR(64) NOT NULL,
  ledger_name VARCHAR(1024) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN (
    'Cheque','Transfer','NEFT','RTGS','IMPS','UPI','Card','Withdrawal','BankCharges'
  )),
  instrument_number TEXT,
  instrument_date DATE,
  bank_name TEXT,
  bankers_date DATE,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_trn_bank_allocation_voucher_guid ON trn_bank_allocation(voucher_guid);
CREATE INDEX IF NOT EXISTS idx_trn_bank_allocation_ledger_name ON trn_bank_allocation(ledger_name);

-- Helper function to compute ledger balance as of a date using trn_accounting and trn_voucher
CREATE OR REPLACE FUNCTION fn_ledger_balance_as_of(_ledger_name TEXT, _as_of DATE)
RETURNS NUMERIC AS $$
DECLARE
  dr NUMERIC := 0;
  cr NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(CASE WHEN is_debit THEN amount ELSE 0 END),0),
         COALESCE(SUM(CASE WHEN NOT is_debit THEN amount ELSE 0 END),0)
  INTO dr, cr
  FROM trn_accounting a
  JOIN trn_voucher v ON v.guid = a.voucher_guid
  WHERE a.ledger_name = _ledger_name AND v.date <= _as_of;

  RETURN dr - cr; -- positive => Dr, negative => Cr
END;
$$ LANGUAGE plpgsql;

-- Indexes for trn_voucher if not present
CREATE INDEX IF NOT EXISTS idx_trn_voucher_date ON trn_voucher(date);
CREATE INDEX IF NOT EXISTS idx_trn_voucher_type ON trn_voucher(voucher_type);
CREATE INDEX IF NOT EXISTS idx_trn_voucher_number ON trn_voucher(voucher_number);

NOTIFY pgrst, 'reload schema';

