# 🔴 OPS KAIMANA — FULL SYSTEM BLUEPRINT (STRICT BUILD SPEC)

---

# 0. EXECUTION MODE

You are building a **real production plant operations system**.

STRICT RULE:
- Do NOT assume
- Do NOT simplify
- Do NOT invent

If anything is unclear → STOP & ASK

---

# 1. SYSTEM OVERVIEW

Single plant system to manage:

- Receiving
- Processing
- Packing
- Stock
- Expenses
- Sales
- Dispatch
- Reporting

---

# 2. CORE PRINCIPLE

Every physical movement MUST create:
- stock movement
- audit trail

---

# 3. LANGUAGE SYSTEM

## Supported Languages
- Bahasa Indonesia (default)
- English

## Implementation
Each UI text must support:
- label_id
- label_en

---

# 4. ROLES & PERMISSIONS

## Roles
- Admin
- Manager
- Operator
- Finance

## Permissions Matrix

| Action | Admin | Manager | Operator | Finance |
|--------|------|--------|---------|---------|
| View All | ✔ | ✔ | ✔ | ✔ |
| Create Receiving | ✔ | ✔ | ✔ | ✖ |
| Post Receiving | ✔ | ✔ | ✖ | ✖ |
| Processing | ✔ | ✔ | ✔ | ✖ |
| Packing | ✔ | ✔ | ✔ | ✖ |
| Sales | ✔ | ✔ | ✖ | ✔ |
| Dispatch | ✔ | ✔ | ✔ | ✖ |
| Expenses | ✔ | ✔ | ✖ | ✔ |
| Adjustments | ✔ | ✔ | ✖ | ✖ |
| Reports | ✔ | ✔ | ✔ | ✔ |

---

# 5. DATABASE (FIRESTORE STRUCTURE)

## users
- user_id
- name
- role
- email
- is_active

## items
- item_id
- name_id
- name_en
- category (raw / semi / finished / packaging)
- unit
- is_active

## stock_balances
- item_id
- qty
- avg_cost
- updated_at

## stock_movements
- movement_id
- item_id
- type (IN / OUT)
- qty
- cost
- reference_type
- reference_id
- created_at

## stock_batches
- batch_id
- item_id
- qty
- cost
- source
- created_at

---

# 6. SCREEN SPECIFICATIONS

## RECEIVING

Fields:
- date (required)
- supplier (required)
- item (required)
- quantity (required, >0)
- unit_price (required)
- total_price (auto)
- notes
- status (draft / posted)

Actions:
- Save Draft
- Post
- Print

Rules:
- On post: stock IN, batch created

---

## PROCESSING

Fields:
- date
- input_item
- input_batch
- input_qty

Outputs:
- output_item
- output_qty

Waste:
- waste_qty

Rules:
- On post: consume input, create output

---

## PACKING

Fields:
- source_item
- source_qty
- packaging_item
- packaging_qty
- output_item
- output_qty

---

## SALES

Fields:
- date
- customer
- item
- qty
- price
- total

Rule:
- No stock movement

---

## DISPATCH

Fields:
- sales_id
- item
- qty

Rule:
- Reduces stock

---

## EXPENSES

Fields:
- date
- category
- amount
- notes

---

# 7. STOCK RULES

- No negative stock
- All movements tracked

---

# 8. COST

Weighted average cost

---

# 9. WORKFLOW

Receiving → Processing → Packing → Sales → Dispatch

---

# 10. PRINT

Documents:
- Receiving
- Expense
- Sales
- Dispatch

A4 format required

---

# 11. REPORTS

- Receiving
- Processing
- Stock
- Sales
- Expenses

---

# 12. VALIDATION

Block:
- negative stock
- invalid processing
- invalid dispatch

---

# 🔴 FINAL RULE

If anything unclear → STOP
