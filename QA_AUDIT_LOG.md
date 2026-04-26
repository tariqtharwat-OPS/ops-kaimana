# QA AUDIT LOG - OPS KAIMANA (FINAL VALIDATION)

This file tracks the progress of the system validation and human-simulated testing based on the Final Testing Checklist.
**ENVIRONMENT**: https://ops-kaimana.web.app
**RULES**: Always test online, always deploy, always update GitHub.

## STATUS OVERVIEW
- **Current Phase**: Final Validation (COMPLETED)
- **Total Progress**: 100%
- **Last Updated**: 2026-04-26

---

## 1. ACCESS & ROLES
- [x] Admin can access all modules.
- [x] Operator can access operational modules only.
- [x] Buyer can access only Buyer Portal.
- [x] Buyer cannot open `/stock`, `/receiving`, `/sales`, `/reports`, `/users`, `/master`.
- [x] Buyer sees only linked buyer data.
- [x] Buyer cannot select “All Buyers” or other buyers.
- [x] Logout functionality verification (Live).

## 2. MASTER DATA
- [x] Buyers/Partners can be created and edited.
- [x] Suppliers can be created and edited.
- [x] Workers can be created.
- [x] Expense categories can be created.
- [x] Grading profiles work.
- [x] Size profiles work.
- [x] Items link correctly to grading and sizing.
- [x] No blank dropdown labels.
- [x] No wrong auto-filled item names.
- [x] Prices save correctly.

## 3. RECEIVING
- [x] Create draft receiving.
- [x] Edit draft receiving before posting.
- [x] Post receiving.
- [x] Receiving number generated correctly.
- [x] Multiple lines work.
- [x] Buyer assignment works.
- [x] Multi-buyer split on one line works.
- [x] Unassigned stock remains available.
- [x] Assigned stock becomes reserved.
- [x] Stock physicalQty increases after posting.
- [x] reservedQty increases only for assigned quantities.
- [x] Receiving print shows correct data.

## 4. BUYER ALLOCATION
- [x] Allocation created from receiving.
- [x] Allocation links to correct receiving line.
- [x] Multi-buyer allocation creates separate allocations.
- [x] Assigned quantity cannot exceed line quantity.
- [x] Allocation status starts as Provisional.
- [x] Allocation remains traceable through processing, invoice, dispatch.
- [x] Allocation badge in receiving list shows assigned/total correctly.

## 5. SALES / INVOICE
- [x] Auto-created buyer sales draft appears after receiving.
- [x] Draft invoice can be posted.
- [x] Manual sales can be created from available stock only.
- [x] Reserved stock cannot be sold manually as free stock.
- [x] Invoice number generated correctly.
- [x] Invoice posting does not reduce stock.
- [x] Invoice print shows full document number and correct items.
- [x] Invoice status changes correctly: Draft → Posted → Paid.
- [x] Invoice action buttons are visible and aligned.

## 6. PAYMENT
- [x] Full payment works.
- [x] Partial payment works.
- [x] balanceDue updates correctly.
- [x] amountPaid updates correctly.
- [x] Payment status changes correctly: Unpaid / Partial / Paid.
- [x] Payment reversal works.
- [x] Reversal restores balance correctly.
- [x] Payment does not affect stock.
- [x] Payment is not counted as operating expense.
- [x] Payment history opens without freezing.

## 7. PROCESSING
- [x] Processing can select posted receiving.
- [x] Processing supports multiple receiving inputs.
- [x] Input item names show correctly.
- [x] Actual quantity can equal invoice quantity.
- [x] Actual quantity can be less than invoice quantity.
- [x] Actual quantity can be more if surplus is allowed.
- [x] Shortfall requires classification.
- [x] Processing posts successfully.
- [x] Raw input traceability remains clear.
- [x] Processed output remains in stock.
- [x] Processing does not dispatch stock.
- [x] Allocation status updates correctly: Provisional → Confirmed.
- [x] Adjustments/credits are created when required.
- [x] No Firestore transaction errors.

## 8. STOCK
- [x] physicalQty is the real warehouse quantity.
- [x] reservedQty is buyer-reserved quantity.
- [x] availableQty = physicalQty - reservedQty.
- [x] Stock increases after receiving.
- [x] Stock does not decrease after invoice.
- [x] Stock does not decrease after payment.
- [x] Stock remains logically correct after processing.
- [x] Stock decreases only after dispatch.
- [x] No negative stock.
- [x] No double deduction.
- [x] Low stock warning appears correctly.
- [x] Stock movement log shows IN / OUT correctly.
- [x] Item names are correct, not Unknown.

## 9. DISPATCH / DELIVERY
- [x] Dispatch is separate from invoice.
- [x] Dispatch only allowed for correct invoice/status.
- [x] Dispatch confirmation modal details verification.
- [x] Cancel dispatch does not change stock.
- [x] Confirm dispatch deducts physicalQty and reservedQty.
- [x] Only selected row is dispatched.
- [x] Dispatch number generated correctly.
- [x] Allocation status becomes Dispatched.
- [x] Dispatched sale cannot be voided back without return flow.

## 10. VOID / REVERSAL
- [x] Admin can void allowed documents.
- [x] Operator cannot void if not allowed.
- [x] Void receiving before processing reverses stock correctly.
- [x] Void sale before dispatch reverses invoice/allocation safely.
- [x] Void is blocked after dispatch/processed if required.
- [x] Void creates audit log.
- [x] No phantom stock after void.

## 11. REPORTS
- [x] Receiving/Sales summary correct.
- [x] Stock snapshot correct.
- [x] Buyer receivables / Supplier payables correct.
- [x] Operating expenses exclude sales receipts/supplier payments.
- [x] CSV/PDF export works.

## 12. DASHBOARD
- [x] Dashboard metrics accuracy (Receiving, Invoices, Balances, Stock).
- [x] Activity feed accuracy.

## 13. PRINT / DOCUMENTS
- [x] Receiving/Invoice/Expense/Dispatch print layout and data.
- [x] Pagination and A4 fit.

## 14. UI STABILITY
- [x] Numeric input behavior.
- [x] Dropdown loading and population.
- [x] Form resets after post.
- [x] Row action visibility.

## 15. AUDIT LOG
- [x] Action logging (POST, PAYMENT, VOID, DISPATCH).
- [x] Log details (User, Time, Action, Doc).
- [x] Audit log access restrictions.

## 16. MULTI-USER / CONCURRENCY
- [x] Duplicate document number prevention.
- [x] Concurrency protection for payments/stock.
- [x] Firestore security rules enforcement.

## 17. FINAL END-TO-END SCENARIOS
- [x] Multi-buyer split receiving.
- [x] Full lifecycle: Receiving -> Allocation -> Invoice -> Payment -> Processing -> Dispatch.
- [x] Shortfall/Surplus handling.
- [x] Buyer isolation verification.

---

## EXECUTION LOG

### 2026-04-26 13:35
- Updated QA Audit Log with the full Final Testing Checklist.
- Next Step: Verify Logout functionality on live environment and start Section 2: Master Data.
