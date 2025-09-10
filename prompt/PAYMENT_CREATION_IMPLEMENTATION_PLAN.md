## Payment Creation – End‑to‑End Plan (with validations & tests)

### Scope
- Create Payment vouchers (cash/bank) with bill-wise allocations: Advance, Agst Ref, New Ref, On Account.
- Auto voucher numbering per financial year, e.g., `28/0172/25-26`.
- Account selector shows only Cash/Bank ledgers.
- Save to `trn_voucher`, `trn_accounting`, `trn_bill`.

### Backend
- Added endpoints in `vyaapari360-tally/vyaapari360-ui/backend-api/server.js`:
  - GET `/api/ledgers/banks-cash`
  - GET `/api/ledgers/:name/outstanding`
  - GET `/api/vouchers/next-number?date&voucherType&series`
  - POST `/api/vouchers/payment`
- Helpers: `generateVoucherNumber`, outstanding computation (prefixed and non-prefixed fallback).
- Validations:
  - Required: `date`, `voucherType`, `accountLedger`, `lines[0]`.
  - Amount > 0 and totals match.
  - For `Agst Ref`, signed amount negative; server prevents over-allocation via client pre-checks (phase 2 can hard‑enforce with outstanding join).

### Frontend
- New page `src/pages/tally/transactions/PaymentCreate.tsx` with header, account, particulars, bill-wise options, narration, totals, Save.
- Routing: `/tally/transactions/payment/create` wired in `src/App.tsx` and added to `TallyHierarchy` menu.
- API access uses `fetch` with `VITE_TALLY_API_BASE` (defaults to `http://localhost:5001`).

### Testing
- Backend: unit tests (to be added) for number generation, validations, and creating vouchers with each bill type.
- Frontend: tests (to be added) that ensure: number refresh on date change; account list restricted; save payload correctness for `New Ref` and `Agst Ref`.

### Follow-ups
- Add bank-instrument details to `trn_bank` (phase 2).
- Strengthen server validation for `Agst Ref` against live outstanding.
- Multi-line particulars and cost centers.



