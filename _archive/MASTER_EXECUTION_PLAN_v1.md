# 🔴 OPS KAIMANA — FULL SYSTEM BLUEPRINT (STRICT BUILD SPEC)

---

# 1. EXECUTION PRINCIPLES (PHASE: FUNCTIONAL ACTIVATION)

- **UI Baseline LOCKED**: All current UI design, layout, and structure are approved and frozen. No major redesigns.
- **Data Integrity**: Transitioning from mock data to real Firestore implementation.
- **Stock Engine Accuracy**: Logic-first approach for stock transformations and financial tracking.

---

# 2. USER MODEL & ROLES

## User Fields
- `user_id` (Firestore ID)
- `full_name`
- `position` (e.g., "Plant Manager")
- `role` (Admin / Manager / Operator / Finance / Buyer)
- `language` (ID / EN)
- `active_status` (Boolean)

## Roles & Permissions
- **Admin**: Full system access.
- **Manager**: Operations management and posting permissions.
- **Operator**: Daily data entry.
- **Finance**: Sales and Expenses.
- **Buyer**: Read-only access to assigned stock ONLY.

---

# 3. CORE MODULE SPECIFICATIONS

## 3.1 MASTER DATA (The Foundation)
Modules must support Create / Edit / Activate-Deactivate:
1.  **Items**: Fish types (name_id, name_en, code, category).
2.  **Grades**: Quality levels.
3.  **Sizes**: Sorting sizes.
4.  **Suppliers**: Name, contact, address.
5.  **Buyers**: Name, contact.
6.  **Expense Categories**: Grouping for expenses.
7.  **Workers**: Name, type (Monthly/Daily), salary/rate.

---

## 3.2 TRANSACTIONAL MODULES

### RECEIVING (Stock IN)
- Header + Multi-line items.
- Rules: Connect to Items, Grades, Sizes, and Supplier masters.
- Posting logic triggers Stock IN.

### PROCESSING (Transformation)
- Input: Mixed items from stock.
- Output: Multiple sorted sizes/grades.
- Real-time yield and waste calculation.

### STOCK ENGINE
- Key: `(item_id + grade_id + size_id)`.
- No negative stock allowed.
- Tracks movements (IN / OUT / TRANSFORM / ADJUST).

---

# 4. DATABASE SCHEMA (FIRESTORE)

Collections:
- `users`, `items`, `grades`, `sizes`, `suppliers`, `buyers`, `workers`, `expense_categories`
- `receivings`, `processing_runs`, `packing_runs`
- `stock`, `stock_movements`
- `expenses`, `sales`, `dispatches`
- `payments_in`, `payments_out`

---

# 5. WORKFLOW PHASE: FUNCTIONAL IMPLEMENTATION (CURRENT)

1.  **Firestore Initialization**: Define schema and setup config.
2.  **Master Data Activation**: Enable real CRUD for all master modules.
3.  **Dropdown Connectivity**: Replace mock data hooks with real Firestore listeners.
4.  **Transaction Integration**: Activate Receiving and Processing with real stock logic.
5.  **Money Flow**: Implement Payments and Expense tracking.

---

**STATUS**: UI Baseline APPROVED. Proceeding to Firestore and Master Data Activation.
