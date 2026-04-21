# OPS-KAIMANA — MASTER EXECUTION PLAN
**Single Source of Truth | Version 2.0 | April 2026**
> This file supersedes all previous plan files. All execution must follow this file only.
> Every completed item must be marked `[x]`. Before any change, re-read this file first.

---

## SECTION 1 — CURRENT SYSTEM CONDITION

### Architecture
- React + TypeScript (Vite), TailwindCSS
- Firebase Firestore (NoSQL), Firebase Auth (role-based)
- No global state manager — `useMasterData` hook (Firestore `onSnapshot`) per page
- `masterDataService.ts` — generic CRUD
- `transactionService.ts` — atomic Firestore transactions for posting

### Firestore Collections (Active)
`items` | `suppliers` | `buyers` | `grade_profiles` | `size_profiles` | `grades` | `sizes` | `expense_categories` | `workers` | `receivings` | `processing` | `sales` | `expenses` | `stock` | `stock_movements`

### Module Status
| Module | File | Data | Status |
|---|---|---|---|
| Master Data | `MasterData.tsx` | Firestore | **READY FOR SIMULATION** (Items: Tuna, Dapa Dapa, Test Item) |
| Receiving | `ReceivingPage.tsx` | Firestore | Core OK; buyer assign MISSING; no doc numbering |
| Processing | `ProcessingPage.tsx` | Firestore | Core OK; uses invoiceQty not actualQty; no buyer settle |
| Packing | `PackingPage.tsx` | **MOCK** | Dead — not connected to Firestore |
| Sales | `SalesPage.tsx` | Firestore | Core OK; grade/size not filtered by item |
| Money Journal | `ExpensesPage.tsx` | Firestore | Payments pollute expenses; no doc numbering |
| Reports | `ReportsPage.tsx` | Firestore | Working but shallow |
| Print | `PrintPage.tsx` | Firestore | Item name resolves `.name` (wrong field) |
| Stock | `Stock.tsx` | Firestore | Field names wrong (snake vs camel); buyer tab empty |
| Buyer View | `BuyerView.tsx` | **MOCK** | Static fake data — completely broken |

---

## SECTION 2 — CRITICAL BUGS (Must Fix Before Features)

| ID | Bug | File | Severity |
|---|---|---|---|
| B1 | `Stock.tsx` reads `item_id`/`grade_id`/`size_id` but stock docs use camelCase | `Stock.tsx` | CRITICAL |
| B2 | `PrintPage.tsx` resolves `item.name` — field doesn't exist (should be `nameEn`) | `PrintPage.tsx` | HIGH |
| B3 | Sales dropdowns show ALL grades/sizes (not filtered by item) | `SalesPage.tsx` | HIGH |
| B4 | Processing posts `invoiceQty` to stock deduction instead of `actualQty` | `ProcessingPage.tsx` | HIGH |
| B5 | Payments written to `expenses` collection — pollutes Money Journal | `transactionService.ts` | HIGH |
| B6 | No protection against re-processing same receiving invoice | `ProcessingPage.tsx` | MEDIUM |
| B7 | Inactive items/grades/sizes appear in transaction dropdowns | All transaction pages | MEDIUM |
| B8 | `PackingPage` uses MOCK data — no Firestore connection | `PackingPage.tsx` | HIGH |
| B9 | `BuyerView` uses MOCK data — portal non-functional | `BuyerView.tsx` | HIGH |
| B10 | `stock_movements` sorted by `created_at` but field is `timestamp` | `Stock.tsx` | LOW |

---

## SECTION 3 — TARGET SYSTEM DESIGN

### 3.1 Document Numbering Rules
All documents must have human-readable auto-generated IDs at creation time.

| Type | Format | Example |
|---|---|---|
| Receiving | `R-DD-MM-###` | `R-21-04-001` |
| Sales | `S-DD-MM-###` | `S-21-04-003` |
| Expenses/Journal | `E-DD-MM-###` | `E-21-04-002` |
| Processing | `P-DD-MM-###` | `P-21-04-001` |
| Packing | `PK-DD-MM-###` | `PK-21-04-001` |
| Payment | `PAY-DD-MM-###` | `PAY-21-04-005` |
| Adjustment | `ADJ-DD-MM-###` | `ADJ-21-04-001` |

**Generation logic**: On create, query count of same-day docs of same type → pad to 3 digits.
Must be done INSIDE the Firestore transaction to prevent duplicates.

---

### 3.2 Master Data Rules

**Items**
- Fields: `item_code`, `nameEn`, `nameId`, `category` (Raw/Semi/Finished/Packaging), `hasGrade`, `gradeProfileId`, `sizeProfileId`, `pricingMatrix`, `active_status`
- Only `active_status: true` items appear in transaction dropdowns
- `pricingMatrix`: `{ [gradeId]: { [sizeId]: price } }` — used as price suggestion only

**Grade Profiles & Size Profiles**
- Profiles are REUSABLE across multiple items
- Example: "Ikan Dasar" size profile → used by Tuna, Marlin, Grouper
- Creating/editing a profile affects all items linked to it
- Admin can add/remove options from a profile; changes reflect everywhere

**Buyers**
- Fields: `name`, `phone`, `address`, `active_status`, `notes`
- Have financial stats derived from sales invoices (not stored on buyer doc)

**Admin Powers on Master Data**
- Full Create / Edit / Deactivate / Delete
- Delete is blocked if item is referenced by any posted transaction
- Deactivate hides from dropdowns but keeps history

---

### 3.3 Receiving Module

**Purpose**: Record fish arriving from suppliers. Immediately assign quantities to buyers per size.

**Header fields**: `docId` (R-DD-MM-###), `date`, `supplierId`, `vehicleNo`, `notes`, `status` (Draft/Posted), `totalQty`, `totalAmount`, `paymentStatus`, `amountPaid`, `balanceDue`, `paymentHistory[]`

**Line fields**: `{ itemId, gradeId, sizeId, quantity, pricePerKg, buyerAllocations[] }`

**`buyerAllocations[]` per line**:
```
[
  { buyerId: 'b1', allocatedQty: 200 },
  { buyerId: 'b2', allocatedQty: 150 },
  { buyerId: null, allocatedQty: 50 }   // unassigned pool
]
```
- Sum of `buyerAllocations[].allocatedQty` MUST equal `line.quantity`
- Partial allocation is allowed — remainder goes to unassigned pool

**Buyer Invoice at Receiving**:
- When a receiving is Posted AND a line has buyer allocations → system auto-generates a **Buyer Allocation Invoice** (`buyerAllocations` collection)
- This is NOT a final sales invoice — it is a pre-invoice / allocation record
- It tracks: `receivingId`, `receivingLineIdx`, `buyerId`, `itemId`, `gradeId`, `sizeId`, `allocatedQty`, `pricePerKg`, `invoicedAmount`, `status: Provisional`

**POST action**:
1. Set `receivings/{id}.status = Posted`
2. For each line: `stock/{key}.quantity += line.quantity` (full quantity enters stock)
3. For each buyer allocation: create `buyerAllocations/{auto}` doc
4. Create `stock_movements` (type: IN, source: Receiving)
5. Set `paymentStatus = Unpaid`, `balanceDue = totalAmount`

---

### 3.4 Processing Module

**Purpose**: Confirm actual quantities after processing/sorting. Reconcile with buyer allocations.

**Header fields**: `docId` (P-DD-MM-###), `date`, `notes`, `selectedReceivings[]`, `status`, `totalInput`, `totalActual`

**Line fields**: `{ receivingId, receivingLineIdx, itemId, gradeId, sizeId, invoiceQty, actualQty, shortfallReason }`

**POST action**:
1. Deduct stock by `actualQty` (NOT invoiceQty)
2. Mark `receivings/{id}.processedAt = timestamp` to prevent re-processing
3. For each line with buyer allocation:
   - Find matching `buyerAllocations` doc (by receivingId + lineIdx + buyerId)
   - Compare `actualQty` vs `allocatedQty`
   - If `actualQty >= allocatedQty`: buyer gets full amount — allocation fulfilled
   - If `actualQty < allocatedQty`: shortfall → create credit record

**Settlement Logic**:
```
For each buyer allocation after processing:

  if actual >= invoiced:
    buyer owes original invoiced amount (no change)
    mark allocationStatus = Fulfilled

  if actual < invoiced:
    shortfall = invoiced - actual
    creditAmount = shortfall * pricePerKg
    create buyerCredits/{auto}: { buyerId, receivingId, amount: creditAmount, status: Available }
    mark allocationStatus = ShortfallSettled

  if actual > invoiced:
    surplus = actual - invoiced
    extraAmount = surplus * pricePerKg
    mark allocationStatus = Surplus
    buyer owes original + extra → update buyer allocation invoice
```

---

### 3.5 Stock Module

**Stock Key**: `${itemId}_${gradeId || 'no'}_${sizeId || 'no'}` — immutable format

**Stock doc fields** (camelCase — must match transactionService):
`itemId`, `gradeId`, `sizeId`, `quantity`, `lastUpdated`

**NO `buyerId` field on stock docs** — buyer association is via `buyerAllocations` collection

**"Reserved" quantity** = sum of allocatedQty in `buyerAllocations` docs with `status: Provisional` for that item/grade/size

**Stock page tabs**:
- Available: all stock with `quantity > 0`
- By Buyer: derived view grouping `buyerAllocations` by buyer

**Stock movements**: `{ type: IN/OUT, source: Receiving/Processing/Sales/Packing/Adjustment, docId, itemId, gradeId, sizeId, quantity, timestamp }`

---

### 3.6 Sales Module

**Purpose**: Dispatch stock to buyer. Creates accounts receivable.

**Header fields**: `docId` (S-DD-MM-###), `date`, `buyerId`, `vehicleNo`, `notes`, `status`, `totalQty`, `totalValue`, `paymentStatus`, `amountPaid`, `balanceDue`, `paymentHistory[]`, `linkedAllocationIds[]`

**Line fields**: `{ itemId, gradeId, sizeId, quantity, pricePerKg }`

**Rules**:
- Grades/sizes filtered by item's profile (same as Receiving)
- Real-time available stock shown per line
- Cannot post if qty > available stock
- `linkedAllocationIds[]` links sales invoice to buyer allocation records (traceability)

**POST action**:
1. Deduct stock by `quantity` per line
2. Update linked `buyerAllocations` status to `Dispatched`
3. Set `paymentStatus = Unpaid`, `balanceDue = totalValue`
4. Create `stock_movements` (OUT)

---

### 3.7 Payments Module

**Separate `payments` collection** (NOT `expenses`):
```
payments/{PAY-DD-MM-###}: {
  id, date, invoiceId, invoiceType (sales|receivings),
  amount, buyerId?, supplierId?,
  transactionType (Money In | Money Out),
  reversed, reversalId?, created_at
}
```

Invoice updated atomically: `amountPaid += amount`, `balanceDue -= amount`, `paymentStatus = Paid|Partial|Unpaid`

**Buyer Credits** can be applied as payment on future sales invoices.

---

### 3.8 Money Journal (Expenses)

**`expenses` collection = operational cash entries ONLY**

No auto-generated payment entries here. Manual entries only.

Line fields: `{ categoryId, description, qty, amount }`
Doc fields: `docId` (E-DD-MM-###), `date`, `reference`, `supplierId?`, `transactionType` (Money In|Out), `status`, `totalAmount`

---

### 3.9 Packing Module

**Purpose**: Convert semi-finished items into packaged finished goods.

Doc fields: `docId` (PK-DD-MM-###), `date`, `sourceItemId`, `sourceGradeId`, `sourceSizeId`, `sourceQty`, `packagingItemId`, `packagingQty`, `outputItemId`, `outputGradeId`, `outputSizeId`, `outputQty`, `notes`, `status`

POST action: deduct source + packaging, add output, 3 stock_movements entries.

---

### 3.10 Buyer Portal (BuyerView)

- Reads from `buyerAllocations` filtered by `buyerId = auth.linkedBuyerId`
- Reads from `sales` filtered by `buyerId = auth.linkedBuyerId`
- Shows: allocated qty (Provisional), dispatched (Dispatched), credit balance
- No mock data — fully live

---

### 3.11 Reports

- Financial: Total Sales, Total Purchases, Total Expenses, Net
- Receivables: per buyer (from `sales.balanceDue`)
- Payables: per supplier (from `receivings.balanceDue`)
- Stock snapshot: from `stock` collection
- Daily movement: from `stock_movements`
- Buyer allocation summary: from `buyerAllocations`
- Credits outstanding: from `buyerCredits`

---

### 3.12 Print Module

Supported types: `receivings`, `sales`, `expenses`

Fix: item name → `item.nameEn || item.nameId || item.item_code`

---

### 3.13 Admin Override Powers

| Action | Condition | Allowed |
|---|---|---|
| Edit Draft document | Any | Yes |
| Edit Posted document | Admin only | Yes (with audit log) |
| Cancel/Void Posted document | Admin only | Yes — reverses stock, marks Voided |
| Delete Draft | Admin/Operator | Yes |
| Delete Posted | Admin only | No (void only) |
| Reverse payment | Admin only | Yes |
| Override buyer allocation | Admin only | Yes |
| Edit master data | Admin only | Yes |
| Delete master data | Admin only | Blocked if referenced by posted docs |

Voiding a posted Receiving:
- Reverses all stock movements from that doc
- Marks any linked `buyerAllocations` as Voided
- Marks doc as `status: Voided`

---

## SECTION 4 — DATA FLOW MAP

```
SUPPLIER → [RECEIVING] → stock{+qty} + buyerAllocations{Provisional}
                ↓
           [PROCESSING] → stock{-actualQty} + settlement comparison
                               ↓
                      buyerCredits (if shortfall)
                      buyerAllocations{Fulfilled|ShortfallSettled|Surplus}
                ↓
           [PACKING] → stock{transform}
                ↓
           [SALES] → stock{-qty} + buyerAllocations{Dispatched}
                ↓
           [PAYMENT] → payments{} + invoice.balanceDue{-amount}
                ↓
           [REPORTS] ← all collections
```

---

## SECTION 5 — NEW COLLECTIONS REQUIRED

| Collection | Purpose |
|---|---|
| `payments` | All payment records (replaces payments in `expenses`) |
| `buyerAllocations` | Per-line buyer assignment from Receiving |
| `buyerCredits` | Credit balances from processing shortfalls |

---

---

## SECTION 3-A - REFINED DEFINITIONS

### 3-A.1 Buyer Allocation Record vs Sales Invoice - CRITICAL DISTINCTION

These are two completely different objects. Never confuse them.

| Property | buyerAllocations record | Sales Invoice (sales collection) |
|---|---|---|
| Created when | Receiving is Posted | User creates a sale manually |
| Financial impact | NONE - informational only | YES - creates accounts receivable |
| Stock impact | NONE - stock stays in pool | YES - deducts stock on POST |
| Buyer owes money? | NO | YES - creates balanceDue |
| Doc number | None (Firestore auto-ID) | S-DD-MM-### |
| Purpose | Reserve quantity for a buyer | Bill buyer and release stock |
| Status flow | Provisional to Fulfilled/ShortfallSettled/Surplus/Voided | Draft to Posted to Paid |

RULE: A buyerAllocations record is a reservation note only. It records the intent to sell a quantity to a buyer from a specific receiving batch. It does NOT generate any payable or receivable. Financial obligation is created only when a sales document is Posted.

---

### 3-A.2 Settlement Document (ADJ - Adjustment)

When Processing confirms actual quantities that differ from buyer allocations, the system generates formal settlement documents in the adjustments collection.

ADJ document schema:
  adjustments/{ADJ-DD-MM-###}: {
    id, type (CreditNote or DebitNote), date,
    buyerId, receivingId, processingId, linkedAllocationId,
    itemId, gradeId, sizeId,
    qty,            - quantity difference (always positive)
    pricePerKg,
    amount,         - qty * pricePerKg, rounded to 0 decimals (IDR integer)
    reason (ProcessingShortfall or ProcessingSurplus),
    status: Posted, createdAt
  }

CreditNote (actual < allocated): buyer overpaid in advance. Credit returned.
  Also creates buyerCredits/{auto} with creditAmount usable against future sales invoices.

DebitNote (actual > allocated): buyer receives more than expected. Buyer owes more.
  Treated as additional charge on next sales invoice to this buyer.

Financial effect:
  CreditNote reduces buyer next sales invoice balanceDue when credit is applied.
  DebitNote increases buyer outstanding balance for this batch.

---

### 3-A.3 Available Stock Logic (Exact Formula)

For a given (itemId, gradeId, sizeId):

  stockKey    = itemId + _ + (gradeId or no) + _ + (sizeId or no)
  totalStock  = stock[stockKey].quantity

  reservedQty = SUM of buyerAllocations[].allocatedQty
                  WHERE itemId  == target.itemId
                  AND   gradeId == target.gradeId
                  AND   sizeId  == target.sizeId
                  AND   status  == Provisional
                  AND   buyerId != null    (null = unassigned, does not reduce available)

  availableQty = totalStock - reservedQty

Rules:
  availableQty is the ONLY value shown in Sales as the sellable ceiling.
  Sales POST is BLOCKED if line.quantity > availableQty.
  Unassigned allocation (buyerId null) does NOT reduce availableQty.
  Stock page shows both totalStock and availableQty per row.

---

### 3-A.4 Exact Allocation Algorithm in Processing (Deterministic)

When actualQty differs from invoiceQty, use floor-then-remainder distribution:

EXAMPLE:
  line.invoiceQty = 500 kg
  line.actualQty  = 460 kg
  allocations:
    B1: allocatedQty = 300  (ratio = 0.60)
    B2: allocatedQty = 150  (ratio = 0.30)
    null: allocatedQty = 50 (ratio = 0.10, unassigned)

STEP 1 - Compute share ratio per allocation:
  ratio = allocatedQty / invoiceQty (full float, no rounding)

STEP 2 - Apply ratio to actualQty, FLOOR to 1 decimal:
  floored = floor(actualQty * ratio * 10) / 10
  B1:   floor(460 * 0.60 * 10) / 10 = 276.0 kg
  B2:   floor(460 * 0.30 * 10) / 10 = 138.0 kg
  null: floor(460 * 0.10 * 10) / 10 =  46.0 kg
  sumFloored = 460.0 kg

STEP 3 - Compute remainder:
  remainder = actualQty - sumFloored (in 0.1 kg units)

STEP 4 - Distribute remainder if > 0:
  Assign 0.1 kg at a time, sorted by allocatedQty descending, until remainder = 0.

OUTPUT: B1=276.0, B2=138.0, null=46.0

SETTLEMENT per non-null buyer:
  B1: 276.0 - 300.0 = -24.0 kg shortfall
      creditAmount = round(24.0 * pricePerKg, 0)
      Create CreditNote ADJ + buyerCredits entry
  B2: 138.0 - 150.0 = -12.0 kg shortfall
      creditAmount = round(12.0 * pricePerKg, 0)
      Create CreditNote ADJ + buyerCredits entry

---

### 3-A.5 Rounding and Precision Rules

These rules apply everywhere. No exceptions.

  qty (kg)          : 1 decimal    - Math.round(value * 10) / 10
  pricePerKg        : 0 decimals   - Math.round(value)
  lineTotal         : 0 decimals   - Math.round(qty * pricePerKg)
  totalAmount/Value : 0 decimals   - SUM of rounded lineTotals
  balanceDue        : 0 decimals   - integer IDR
  amountPaid        : 0 decimals   - integer IDR
  creditAmount      : 0 decimals   - integer IDR
  surplusAmount     : 0 decimals   - integer IDR
  Allocation ratio  : full float   - internal only, never stored or displayed
  Floor qty unit    : 0.1 kg       - floor(value * 10) / 10

Utility functions to create in src/utils/precision.ts:
  roundQty(value): number   - returns qty to 1 decimal
  roundAmount(value): number - returns IDR amount to 0 decimals

Display rules:
  Quantities: always show 1 decimal (276.0 kg)
  Amounts: IDR with thousand separators, no decimal (Rp 9,660,000)

---

## SECTION 6 - FILE-LEVEL IMPLEMENTATION PLAN

Execute in order. Mark [x] when step is fully complete and verified.

### STEP 1 - Document Number Generator + Rounding Utilities
Status: [ ] | Files: src/utils/docNumbering.ts (NEW), src/utils/precision.ts (NEW)
- generateDocId(prefix, date): query same-prefix+date count, pad to 3 digits
- MUST run inside runTransaction to prevent duplicates
- roundQty(value): Math.round(value * 10) / 10
- roundAmount(value): Math.round(value)

### STEP 2 - Fix Stock.tsx Field Names (Bugs B1, B10)
Status: [ ] | Files: src/pages/Stock.tsx
- s.item_id to s.itemId, s.grade_id to s.gradeId, s.size_id to s.sizeId
- Same for movement log fields
- Sort movements by m.timestamp not m.created_at
- Assigned tab: derive from buyerAllocations collection
- Show totalStock and availableQty per row (compute reservedQty from Provisional allocations)

### STEP 3 - Fix PrintPage Item Name (Bug B2)
Status: [ ] | Files: src/pages/PrintPage.tsx
- item.name to item.nameEn || item.nameId || item.item_code || Unknown

### STEP 4 - Fix Sales Dropdown Filtering (Bug B3)
Status: [ ] | Files: src/pages/transactions/SalesPage.tsx
- Add getFilteredGrades(itemId) and getFilteredSizes(itemId) helpers
- Replace global grades.map/sizes.map with filtered versions
- Show availableQty per line (totalStock - reservedQty)
- Block POST if line.quantity > availableQty

### STEP 5 - Fix Processing actualQty (Bug B4)
Status: [ ] | Files: src/pages/transactions/ProcessingPage.tsx
- inputs: lines.map(l => ({...l, quantity: l.actualQty}))

### STEP 6 - Separate Payments Collection (Bug B5)
Status: [ ] | Files: transactionService.ts, firestore.rules
- recordPayment and reversePayment write to payments collection with PAY-DD-MM-### ID
- Remove writes to expenses in both methods
- Add Firestore rule for /payments/{id}
- Migration note: old entries stay in expenses as legacy

### STEP 7 - Prevent Double-Processing (Bug B6)
Status: [ ] | Files: transactionService.ts, ProcessingPage.tsx
- postProcessing: transaction.update(receivingRef, { processedAt: serverTimestamp() })
- ProcessingPage: filter receivings where status=Posted AND processedAt is undefined

### STEP 8 - Document Numbering on All Forms
Status: [ ] | Files: ReceivingPage.tsx, SalesPage.tsx, ExpensesPage.tsx, masterDataService.ts
- Add createWithId(collection, id, data) to masterDataService using setDoc
- Call generateDocId before save in each form

### STEP 9 - Buyer Allocation UI at Receiving (Features F3, F4)
Status: [ ] | Files: ReceivingPage.tsx, transactionService.ts
- UI per line: expandable Assign Buyers section with [Buyer dropdown][Qty][Remove] rows
- Shows unassigned remainder = line.quantity - sum(allocations). Validates remainder >= 0
- postReceiving creates buyerAllocations/{auto} per non-null buyer:
  { receivingId, receivingLineIdx, buyerId, itemId, gradeId, sizeId,
    allocatedQty, pricePerKg, invoicedAmount=roundAmount(qty*price), status:Provisional }
- NOTE: invoicedAmount is informational only. Not a financial receivable.

### STEP 10 - Processing Settlement (Features F5, F6)
Status: [ ] | Files: transactionService.ts
Inside postProcessing, after stock deduction:
1. Load buyerAllocations for each line by receivingId + receivingLineIdx
2. Apply floor+remainder algorithm from Section 3-A.4 to get actualQty per buyer
3. For each non-null buyer: compare actualQty vs allocatedQty
4. Create adjustments/{ADJ-DD-MM-###} (CreditNote or DebitNote)
5. If shortfall: also create buyerCredits/{auto} with status:Available
6. Update buyerAllocations status: Fulfilled/ShortfallSettled/Surplus
7. Use roundQty() and roundAmount() for all calculations

### STEP 11 - Connect PackingPage to Firestore (Bug B8)
Status: [ ] | Files: PackingPage.tsx, transactionService.ts
- Remove all mockData imports
- Add useMasterData hooks, form state, handleSave(isPost)
- Add postPacking: 3 stock ops + 3 movements

### STEP 12 - Fix BuyerView Live Data (Bug B9)
Status: [ ] | Files: BuyerView.tsx, AuthContext.tsx
- Remove MOCK_BUYER_STOCK
- Load buyerAllocations, sales, buyerCredits filtered by currentUser.linkedBuyerId
- AuthContext must expose linkedBuyerId from users/{uid} Firestore doc

### STEP 13 - Filter Inactive Items in Dropdowns (Bug B7)
Status: [ ] | Files: ReceivingPage.tsx, SalesPage.tsx, ProcessingPage.tsx
- useMasterData('items', true) to useMasterData('items') (active only)

### STEP 14 - Firestore Rules for New Collections
Status: [ ] | Files: firestore.rules
- Add rules for payments, buyerAllocations, buyerCredits, adjustments
- Buyer role: read own buyerAllocations where buyerId == linkedBuyerId

### STEP 15 - Admin Void on Posted Documents (Feature F7)
Status: [ ] | Files: ReceivingPage.tsx, SalesPage.tsx, transactionService.ts
- Admin-only Void button on Posted records
- voidDocument: reverse stock movements, mark allocations Voided, set status:Voided
- Safety: block if stock would go negative after reversal

### STEP 16 - Reports Enhancement (Feature F8)
Status: [ ] | Files: ReportsPage.tsx
- Payment summary from payments collection
- Buyer allocation summary from buyerAllocations
- Credits outstanding from buyerCredits
- ADJ summary from adjustments

---

## SECTION 7 - ACCEPTANCE CRITERIA

| ID | Criterion | Status |
|---|---|---|
| AC-01 | Receiving saves with R-DD-MM-### ID | [ ] |
| AC-02 | Receiving POST adds stock with camelCase keys | [ ] |
| AC-03 | Buyer allocation UI works per line at Receiving | [ ] |
| AC-04 | buyerAllocations docs created on POST - NOT financial invoices | [ ] |
| AC-05 | Processing deducts actualQty from stock | [ ] |
| AC-06 | Settlement creates ADJ document (CreditNote or DebitNote) | [ ] |
| AC-07 | buyerCredits created on shortfall with correct IDR amount | [ ] |
| AC-08 | Same receiving cannot be processed twice | [ ] |
| AC-09 | Sales grade/size dropdowns filtered by item profile | [ ] |
| AC-10 | Sales availableQty = totalStock - reservedQty shown per line | [ ] |
| AC-11 | Sales POST blocks if qty exceeds availableQty | [ ] |
| AC-12 | Payments write to payments collection only | [ ] |
| AC-13 | Money Journal shows manual operational entries only | [ ] |
| AC-14 | PackingPage connected to Firestore, mock removed | [ ] |
| AC-15 | BuyerView shows live data per authenticated buyer | [ ] |
| AC-16 | Stock page shows totalStock and availableQty per row | [ ] |
| AC-17 | Print invoices show nameEn not Unknown Item | [ ] |
| AC-18 | All docs use prefix-DD-MM-### format | [ ] |
| AC-19 | Inactive items absent from all transaction dropdowns | [ ] |
| AC-20 | One size profile usable across multiple items | [ ] |
| AC-21 | Admin can void posted docs with stock reversal | [ ] |
| AC-22 | Firestore rules cover payments, buyerAllocations, buyerCredits, adjustments | [ ] |
| AC-23 | All qty stored and displayed to 1 decimal | [ ] |
| AC-24 | All IDR amounts stored as integers (0 decimal) | [ ] |
| AC-25 | Allocation algorithm is deterministic - same input, same output | [ ] |

---

## SECTION 8 - REGRESSION RISKS

| Risk | Severity | Mitigation |
|---|---|---|
| Stock key format changed | CRITICAL | IMMUTABLE: itemId_gradeId-or-no_sizeId-or-no |
| postReceiving logic broken | CRITICAL | Extend only, never refactor existing logic |
| Payments split orphans old expenses entries | MEDIUM | Reports query both during transition |
| Doc numbering race condition | MEDIUM | Generate inside runTransaction only |
| Admin void reverses already-offset movements | HIGH | Check stock will not go negative before executing |
| BuyerView: linkedBuyerId missing from user doc | MEDIUM | Verify field in users/{uid} before Step 12 |
| Rounding inconsistency across modules | MEDIUM | Use centralized roundQty() and roundAmount() only |
| Allocation algorithm non-deterministic | LOW | Algorithm is pure function, no side effects |

---

## SECTION 9 - EXECUTION CHECKLIST

Mark [x] when FULLY complete and verified. Never mark done without testing.

Bug Fixes - Do First:
- [x] B1 - Stock.tsx field names (Step 2)
- [x] B2 - PrintPage item name (Step 3)
- [x] B3 - Sales dropdown filtering (Step 4)
- [x] B4 - Processing actualQty (Step 5)
- [x] B5 - Payments to own collection (Step 6)
- [x] B6 - Block double processing (Step 7)
- [x] B7 - Filter inactive dropdowns (Step 13)
- [x] B8 - PackingPage to Firestore (Step 11)
- [x] B9 - BuyerView live data (Step 12)
- [x] B10 - Movements sort field (Step 2)

New Features - After All Bugs Fixed:
- [x] F1 - Doc numbering + rounding utilities (Step 1)
- [x] F2 - Doc IDs on all forms (Step 8)
- [ ] F3 - Buyer allocation UI at Receiving (Step 9)
- [x] F4 - buyerAllocations on POST (Step 9)
- [x] F5 - Settlement ADJ document on Processing POST (Step 10)
- [x] F6 - buyerCredits on shortfall (Step 10)
- [x] F7 - Admin void/cancel (Step 15)
- [ ] F8 - Reports enhancement (Step 16)
- [x] F9 - Firestore rules for 4 new collections (Step 14)

Final Verification:
- [ ] V1 - All 25 acceptance criteria passed
- [x] V2 - No mockData imports in any transaction page
- [x] V3 - All print invoices show correct item names
- [x] V4 - Stock movements log correctly for all modules
- [x] V5 - Buyer portal shows real live data
- [ ] V6 - ADJ documents visible in Reports

---

## SECTION 10 - FILE REFERENCE MAP

| File | Role | Risk |
|---|---|---|
| transactionService.ts | Atomic stock ops | HIGH - extend only |
| masterDataService.ts | Generic CRUD | LOW - add createWithId |
| src/utils/docNumbering.ts | Doc ID generator | NEW |
| src/utils/precision.ts | roundQty, roundAmount | NEW |
| ReceivingPage.tsx | Receiving form+list | MEDIUM |
| ProcessingPage.tsx | Processing form+list | MEDIUM |
| SalesPage.tsx | Sales form+list | LOW |
| PackingPage.tsx | Packing form+list | HIGH - full rewrite |
| ExpensesPage.tsx | Money journal | LOW |
| BuyerView.tsx | Buyer portal | HIGH - full rewrite |
| Stock.tsx | Stock display | LOW - field fixes + availableQty |
| PrintPage.tsx | Print invoices | LOW - one field fix |
| ReportsPage.tsx | Reports | MEDIUM |
| MasterData.tsx | Admin master data | MEDIUM |
| firestore.rules | Security | MEDIUM |

---

## SECTION 11 - NEW COLLECTIONS SUMMARY

| Collection | Purpose | Created by |
|---|---|---|
| payments | Payment records, separate from expenses | transactionService.recordPayment |
| buyerAllocations | Reservation notes per receiving line | transactionService.postReceiving |
| buyerCredits | Credit balances from shortfalls | transactionService.postProcessing |
| adjustments | Formal ADJ settlement documents | transactionService.postProcessing |

---

END OF MASTER EXECUTION PLAN v2.1
Last updated: 2026-04-21
Single source of truth. Do not create other plan files.
Before any code change: re-read this file. After completing any step: mark it [x] here.
