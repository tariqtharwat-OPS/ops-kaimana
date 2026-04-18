# 🔴 OPS KAIMANA — FULL SYSTEM BLUEPRINT (STRICT BUILD SPEC)

---

# 1. EXECUTION PRINCIPLES

- **Simplicity**: Minimal, clean, and beautiful UI. Calm colors and easy for operators.
- **Operational Focus**: Designed for real plant workflows, not generic ERP.
- **UI-First Validation**: Build → Show → Wait for approval before any backend/database locking.

---

# 2. USER MODEL & ROLES

## User Fields
- `user_id`
- `full_name`
- `position` (Job Title, e.g., "Plant Manager")
- `role`
- `language` (ID / EN)

## Roles & Permissions
- **Admin**: Full system access.
- **Manager**: Operations management and posting permissions.
- **Operator**: Daily data entry (Receiving, Processing, Packing, Dispatch).
- **Finance**: Sales and Expenses management.
- **Buyer (NEW)**: Read-only access. Can **ONLY** see stock assigned specifically to them.

---

# 3. CORE MODULE SPECIFICATIONS

## 3.1 RECEIVING (Multi-line Document)
**Header**:
- `receiving_number` (Auto-gen)
- `date` (Default today, editable)
- `supplier` (Select from Master or Inline Add)
- `notes`
- `status` (Draft / Posted)

**Line Items Table**:
- `fish_type` (Select from Item Master)
- `name_id` / `name_en` (Auto-filled)
- `grade` (Select from Grade Master)
- `size` (Select from Size Master)
- `quantity`
- `unit`
- `unit_price`
- `total` (Auto-calc)

**Rules**:
- Supports multiple lines per document.
- Grand totals calculated automatically.
- No free-text for Grade/Size.

---

## 3.2 PROCESSING (Transformation Logic)
**Logic**: Input (Mixed) → Output (Sorted by Size/Grade).
**Example**: Input 1000kg Mixed Fish → Output 200kg S, 500kg M, 250kg L, 50kg Waste.

**UI View**:
- **Input Section**: Select Batch/Item, Grade, and Quantity.
- **Output Table**: Add multiple rows for different sizes/grades.
- **Comparison Area**: Total Input vs Total Output + Waste, showing Yield %.

---

## 3.3 PACKING
- Process semi-finished items into finished products.
- Must include a **Stock Sidebar** showing available semi-finished items and packaging materials.

---

## 3.4 STOCK STRUCTURE (Selling Focus)
- Stock is tracked by **(Item + Grade + Size)**.
- Reflects the structure used for **Sales**, not just receiving.
- **Buyer Assignment**: Stock can be assigned to a specific Buyer or left unassigned. Buyers only see their assigned stock.

---

## 3.5 EXPENSES (Multi-line Document)
- Header: Doc No, Date, Category.
- Lines Table: Item/Description, Qty, Price, Total.
- Printable A4 layout required.

---

## 3.6 SALES & MONEY FLOW
- Sell to Buyers.
- Track money received from Buyers (AR).
- Track money paid to Suppliers (AP).

---

# 4. TECHNICAL STANDARDS

- **Dropdown Rule**: All Fish, Grades, and Sizes MUST come from Master Data. No free text.
- **Bilingual**: Indonesia-first wording with English toggle support throughout.
- **Top Bar**: Must show "Welcome, {Name}" and {Name} + {Position}.
- **Printing**: All documents must be clean, A4, invoice-style.

---

# 5. WORKFLOW PHASE: UI VALIDATION

1.  **Rebuild UI according to this blueprint**.
2.  **Use Mock Data** only.
3.  **Present screenshots and walkthrough for approval**.
4.  **DO NOT** proceed to backend or final DB design until UI is approved.
