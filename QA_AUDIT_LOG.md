# QA AUDIT LOG - OPS KAIMANA (FINAL VALIDATION)

This file tracks the progress of the system validation and human-simulated testing based on the Final Testing Checklist.
**ENVIRONMENT**: https://ops-kaimana.web.app
**RULES**: Always test online, always deploy, always update GitHub.

## STATUS OVERVIEW
- **Current Phase**: Phase 1: Authentication & Role Security (COMPLETING)
- **Total Progress**: 15% (Estimated based on 17 sections)
- **Last Updated**: 2026-04-26

---

## 1. ACCESS & ROLES
- [x] Admin can access all modules.
- [x] Operator can access operational modules only.
- [x] Buyer can access only Buyer Portal.
- [x] Buyer cannot open `/stock`, `/receiving`, `/sales`, `/reports`, `/users`, `/master`.
- [x] Buyer sees only linked buyer data.
- [x] Buyer cannot select “All Buyers” or other buyers.
- [ ] Logout functionality verification (Live).

## 2. MASTER DATA
- [ ] Buyers/Partners can be created and edited.
- [ ] Suppliers can be created and edited.
- [ ] Workers can be created.
- [ ] Expense categories can be created.
- [ ] Grading profiles work.
- [ ] Size profiles work.
- [ ] Items link correctly to grading and sizing.
- [ ] No blank dropdown labels.
- [ ] No wrong auto-filled item names.
- [ ] Prices save correctly.

## 3. RECEIVING
- [ ] Create draft receiving.
- [ ] Edit draft receiving before posting.
- [ ] Post receiving.
- [ ] Receiving number generated correctly.
- [ ] Multiple lines work.
- [ ] Buyer assignment works.
- [ ] Multi-buyer split on one line works.
- [ ] Unassigned stock remains available.
- [ ] Assigned stock becomes reserved.
- [ ] Stock physicalQty increases after posting.
- [ ] reservedQty increases only for assigned quantities.
- [ ] Receiving print shows correct data.

## 4. BUYER ALLOCATION
- [ ] Allocation created from receiving.
- [ ] Allocation links to correct receiving line.
- [ ] Multi-buyer allocation creates separate allocations.
- [ ] Assigned quantity cannot exceed line quantity.
- [ ] Allocation status starts as Provisional.
- [ ] Allocation remains traceable through processing, invoice, dispatch.
- [ ] Allocation badge in receiving list shows assigned/total correctly.

## 5. SALES / INVOICE
- [ ] Auto-created buyer sales draft appears after receiving.
- [ ] Draft invoice can be posted.
- [ ] Manual sales can be created from available stock only.
- [ ] Reserved stock cannot be sold manually as free stock.
- [ ] Invoice number generated correctly.
- [ ] Invoice posting does not reduce stock.
- [ ] Invoice print shows full document number and correct items.
- [ ] Invoice status changes correctly: Draft → Posted → Paid.
- [ ] Invoice action buttons are visible and aligned.

## 6. PAYMENT
- [ ] Full payment works.
- [ ] Partial payment works.
- [ ] balanceDue updates correctly.
- [ ] amountPaid updates correctly.
- [ ] Payment status changes correctly: Unpaid / Partial / Paid.
- [ ] Payment reversal works.
- [ ] Reversal restores balance correctly.
- [ ] Payment does not affect stock.
- [ ] Payment is not counted as operating expense.
- [ ] Payment history opens without freezing.

## 7. PROCESSING
- [ ] Processing can select posted receiving.
- [ ] Processing supports multiple receiving inputs.
- [ ] Input item names show correctly.
- [ ] Actual quantity can equal invoice quantity.
- [ ] Actual quantity can be less than invoice quantity.
- [ ] Actual quantity can be more if surplus is allowed.
- [ ] Shortfall requires classification.
- [ ] Processing posts successfully.
- [ ] Raw input traceability remains clear.
- [ ] Processed output remains in stock.
- [ ] Processing does not dispatch stock.
- [ ] Allocation status updates correctly: Provisional → Confirmed.
- [ ] Adjustments/credits are created when required.
- [ ] No Firestore transaction errors.

## 8. STOCK
- [ ] physicalQty is the real warehouse quantity.
- [ ] reservedQty is buyer-reserved quantity.
- [ ] availableQty = physicalQty - reservedQty.
- [ ] Stock increases after receiving.
- [ ] Stock does not decrease after invoice.
- [ ] Stock does not decrease after payment.
- [ ] Stock remains logically correct after processing.
- [ ] Stock decreases only after dispatch.
- [ ] No negative stock.
- [ ] No double deduction.
- [ ] Low stock warning appears correctly.
- [ ] Stock movement log shows IN / OUT correctly.
- [ ] Item names are correct, not Unknown.

## 9. DISPATCH / DELIVERY
- [ ] Dispatch is separate from invoice.
- [ ] Dispatch only allowed for correct invoice/status.
- [ ] Dispatch confirmation modal details verification.
- [ ] Cancel dispatch does not change stock.
- [ ] Confirm dispatch deducts physicalQty and reservedQty.
- [ ] Only selected row is dispatched.
- [ ] Dispatch number generated correctly.
- [ ] Allocation status becomes Dispatched.
- [ ] Dispatched sale cannot be voided back without return flow.

## 10. VOID / REVERSAL
- [ ] Admin can void allowed documents.
- [ ] Operator cannot void if not allowed.
- [ ] Void receiving before processing reverses stock correctly.
- [ ] Void sale before dispatch reverses invoice/allocation safely.
- [ ] Void is blocked after dispatch/processed if required.
- [ ] Void creates audit log.
- [ ] No phantom stock after void.

## 11. REPORTS
- [ ] Receiving/Sales summary correct.
- [ ] Stock snapshot correct.
- [ ] Buyer receivables / Supplier payables correct.
- [ ] Operating expenses exclude sales receipts/supplier payments.
- [ ] CSV/PDF export works.

## 12. DASHBOARD
- [ ] Dashboard metrics accuracy (Receiving, Invoices, Balances, Stock).
- [ ] Activity feed accuracy.

## 13. PRINT / DOCUMENTS
- [ ] Receiving/Invoice/Expense/Dispatch print layout and data.
- [ ] Pagination and A4 fit.

## 14. UI STABILITY
- [ ] Numeric input behavior.
- [ ] Dropdown loading and population.
- [ ] Form resets after post.
- [ ] Row action visibility.

## 15. AUDIT LOG
- [ ] Action logging (POST, PAYMENT, VOID, DISPATCH).
- [ ] Log details (User, Time, Action, Doc).
- [ ] Audit log access restrictions.

## 16. MULTI-USER / CONCURRENCY
- [ ] Duplicate document number prevention.
- [ ] Concurrency protection for payments/stock.
- [ ] Firestore security rules enforcement.

## 17. FINAL END-TO-END SCENARIOS
- [ ] Multi-buyer split receiving.
- [ ] Full lifecycle: Receiving -> Allocation -> Invoice -> Payment -> Processing -> Dispatch.
- [ ] Shortfall/Surplus handling.
- [ ] Buyer isolation verification.

---

## EXECUTION LOG

### 2026-04-26 13:35
- Updated QA Audit Log with the full Final Testing Checklist.
- Next Step: Verify Logout functionality on live environment and start Section 2: Master Data.
