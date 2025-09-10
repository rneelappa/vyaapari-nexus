# Contra Voucher Creation — End-to-End Implementation, Testing, and Validation Plan

Version: 1.0
Owner: ERP Core
Scope: Implement Tally-style Contra voucher creation (Cash/Bank transfers) in the main ERP.

## 1) Problem Statement

Enable users to create Contra vouchers to move money between Cash and Bank ledgers with proper double-entry postings and bank allocation details, mirroring the Tally UX shown in screenshots.

## 2) Definitions

- Contra voucher: Transfer between ledgers belonging to groups {Cash-in-Hand, Bank Accounts, Bank OD A/c}.
- Account (header): Source ledger (cash/bank) that the voucher is created under.
- Particulars (line): Counterparty ledger (cash/bank) for the transfer.
- Bank Allocation: Transaction metadata for bank side (transaction type, instrument no/date, bankers date, bank name).

## 3) Functional Requirements

1. Voucher Header
   - Voucher Type: Contra
   - Voucher Number: Automatic series by financial year; allow manual override if configured
   - Date: Required
   - Narration: Optional
2. Ledgers Selection
   - Account: Only Cash/Bank/OD ledgers
   - Particulars: Only Cash/Bank/OD ledgers; cannot equal Account
   - Show current balance for selected ledgers
3. Amount and Posting Logic
   - Amount > 0 required
   - Posting rules:
     - Cash → Bank: Dr Bank, Cr Cash
     - Bank → Cash: Dr Cash, Cr Bank
     - Bank A → Bank B: Dr Bank B, Cr Bank A (Account is source)
4. Bank Allocation (when bank ledger is involved)
   - Transaction Type: Cheque, Transfer, NEFT, RTGS, IMPS, UPI, Card, Withdrawal, BankCharges
   - Fields: instrument_number?, instrument_date?, bankers_date?, bank_name?
   - For Cheque: instrument_number and instrument_date are mandatory
   - Allocation is attached to the bank ledger side (receiving side for bank→bank)
5. Validation
   - Ledgers must be from allowed groups
   - Account != Particulars
   - Amount > 0
   - Instrument details required for Cheque
   - Optional rule: prevent negative cash (configurable)
6. Save
   - Persist voucher header, accounting rows, bank allocation
   - Return created GUID and number

## 4) Non-Functional Requirements

- Multi-company/division scope enforcement
- Server-side validation and RBAC
- Idempotent create (client retries safe)
- Auditability: created_by, created_at

## 5) Data Model (Public schema; reuse existing naming)

Tables (extend if present):

- mst_vouchertype
  - Ensure row: name='Contra', parent='Contra', numbering_method='Automatic', is_deemedpositive=false, affects_stock=false

- trn_voucher
  - id PK, guid UUID (default gen_random_uuid())
  - company_id UUID, division_id UUID
  - voucher_type TEXT ('Contra')
  - voucher_number TEXT
  - date DATE, narration TEXT
  - created_by UUID, created_at TIMESTAMP DEFAULT now()

- trn_accounting
  - id PK, voucher_id FK -> trn_voucher.id
  - sr_no INT, ledger_id UUID -> mst_ledger.guid or id (whichever repo uses)
  - is_debit BOOLEAN, amount NUMERIC(18,2)

- trn_bank_allocation
  - id PK
  - voucher_id FK -> trn_voucher.id
  - ledger_id FK -> mst_ledger.id/guid
  - transaction_type TEXT CHECK (IN (...))
  - instrument_number TEXT, instrument_date DATE
  - bank_name TEXT, bankers_date DATE
  - amount NUMERIC(18,2)

Helper function:
- fn_ledger_balance_as_of(ledger_id UUID, as_of DATE) RETURNS NUMERIC

Indexes:
- trn_voucher(date), trn_voucher(voucher_type), trn_voucher(voucher_number)
- trn_accounting(voucher_id), trn_accounting(ledger_id)

## 6) Backend API (Express in vyaapari360-ui/backend-api/server.js)

Endpoints:
1. POST /api/vouchers/contra
   - Body: { companyId, divisionId, date, voucherNumber?, narration?, accountLedgerId, particularsLedgerId, amount, transactionType, instrumentNumber?, instrumentDate?, bankersDate?, bankName? }
   - Validations: as per section 3 & 5
   - Logic: Insert trn_voucher, two trn_accounting rows, one trn_bank_allocation for the bank side
   - Response: { success, data: { guid, voucher_number } }

2. GET /api/ledger-balance?ledgerId=...&asOf=yyyy-mm-dd
   - Uses fn_ledger_balance_as_of

3. POST /api/voucher-number/next
   - { voucherType:'Contra', date } → { nextNumber }

Security:
- Require company/division in payload; (future) enforce authentication and RLS-compatible checks

## 7) Frontend (main ERP)

Routes:
- Add /tally/transactions/contra/new

Components:
- pages/tally/transactions/ContraVoucherCreate.tsx
  - Form sections: Header (number/date), Account (with balance), Particulars (with balance), Amount, Transaction Type + Bank fields, Narration, Save
  - Ledger selects filter by parent group in {'Cash-in-Hand','Bank Accounts','Bank OD A/c'}
  - Fetch balances via GET /api/ledger-balance
  - On Save → POST /api/vouchers/contra → toast + redirect

Shared:
- components/tally/LedgerSelect.tsx (async combobox)

UX:
- Keyboard-friendly order matches Tally screenshot
- Red/green balance badges (Cr/Dr)
- Pre-save summary dialog (optional)

## 8) Testing Strategy (align with prompt/testing_plan.md)

Unit (frontend):
- Posting direction logic from Account/Particulars
- Form validation rules (instrument fields)

Unit (backend):
- Validate group constraints, amount>0, account!=particulars
- Correct debit/credit rows for all 3 scenarios

Integration:
- Create voucher then fetch via /api/vouchers and /api/vouchers/:guid
- Balance endpoint reflects change

E2E:
- Fill form (cash→bank), (bank→cash), (bankA→bankB) and save, verify table

Negative tests:
- Same ledger on both sides
- Non-bank/cash ledger selection (should be rejected)
- Cheque without instrument details

Performance:
- API create < 150ms p95 on local DB

## 9) Rollout

1. DB migrations: add missing tables/constraints/function; seed vouchertype 'Contra'
2. Backend endpoints
3. Frontend page + navigation
4. Tests (run all gates)
5. Feature flag `enableContraCreation`

## 10) Task Breakdown (execution order)

1) Create SQL migration(s) for bank allocation table + function (and seed Contra)
2) Implement POST /api/vouchers/contra and GET /api/ledger-balance
3) Add voucher numbering service endpoint
4) Build `LedgerSelect` component with filtering and balance fetch
5) Build `ContraVoucherCreate` page and route
6) Hook “New Transaction → Contra” entry point from Accounting page
7) Write unit/integration/e2e tests
8) Documentation updates and changelog

## 11) Open Questions

- Numbering format (prefix/suffix) and FY reset behavior
- Whether to block negative cash balance or warn
- Bank allocation side for bank→bank (chosen: receiving side)



