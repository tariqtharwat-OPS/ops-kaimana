import type { SharkLiteContext, SharkLiteRecord, SharkPrompt } from './sharkLiteTypes';

export const SHARK_LITE_PROMPTS: SharkPrompt[] = [
  { id: 'today', label: 'What happened today?', question: 'What happened today?', roles: ['Admin', 'Operator', 'Buyer'] },
  { id: 'control', label: 'Is this mini plant under control?', question: 'Is this mini plant under control?', roles: ['Admin', 'Operator'] },
  { id: 'watch', label: 'What should management watch?', question: 'What should management watch?', roles: ['Admin', 'Operator'] },
  { id: 'investor', label: 'Explain this system to an investor.', question: 'Explain this system to an investor.', roles: ['Admin', 'Operator', 'Buyer'] },
  { id: 'receiving', label: 'Summarize receiving.', question: 'Summarize receiving.', roles: ['Admin'] },
  { id: 'stock', label: 'Summarize stock.', question: 'Summarize stock.', roles: ['Admin'] },
  { id: 'processing', label: 'Summarize processing.', question: 'Summarize processing.', roles: ['Admin'] },
  { id: 'reports', label: 'Summarize reports.', question: 'Summarize reports.', roles: ['Admin'] },
  { id: 'audit', label: 'Summarize audit activity.', question: 'Summarize audit activity.', roles: ['Admin'] },
  { id: 'mismatch', label: 'Are there any data mismatches?', question: 'Are there any data mismatches?', roles: ['Admin'] },
  { id: 'buyer-allocation-admin', label: 'Which buyer has allocation?', question: 'Which buyer has allocation?', roles: ['Admin'] },
  { id: 'operator-receiving', label: 'What receiving activity happened today?', question: 'What receiving activity happened today?', roles: ['Operator'] },
  { id: 'operator-stock', label: 'What stock changed?', question: 'What stock changed?', roles: ['Operator'] },
  { id: 'operator-processing', label: 'What processing happened?', question: 'What processing happened?', roles: ['Operator'] },
  { id: 'operator-posting', label: 'What should I check before posting?', question: 'What should I check before posting?', roles: ['Operator'] },
  { id: 'operator-note', label: 'Prepare a receiving note as text only.', question: 'Prepare a receiving note as text only.', roles: ['Operator'] },
  { id: 'buyer-allocation', label: 'What is my allocation?', question: 'What is my allocation?', roles: ['Buyer'] },
  { id: 'buyer-provisional', label: 'What does provisional mean?', question: 'What does provisional mean?', roles: ['Buyer'] },
  { id: 'buyer-scope', label: 'Can I see only my own allocation?', question: 'Can I see only my own allocation?', roles: ['Buyer'] },
  { id: 'buyer-portal', label: 'Explain my buyer portal.', question: 'Explain my buyer portal.', roles: ['Buyer'] },
];

const money = (value: number) => `Rp ${Math.round(value || 0).toLocaleString('id-ID')}`;
const kg = (value: number) => `${(value || 0).toLocaleString('id-ID')} kg`;
const countPosted = (records: SharkLiteRecord[]) => records.filter((record) => record.status === 'Posted').length;
const countDraft = (records: SharkLiteRecord[]) => records.filter((record) => record.status === 'Draft').length;
const totalQty = (records: SharkLiteRecord[]) => records.reduce((sum, record) => sum + Number(record.totalQty || record.quantity || record.allocatedQty || record.actualQty || 0), 0);
const totalAmount = (records: SharkLiteRecord[]) => records.reduce((sum, record) => sum + Number(record.totalAmount || record.balanceDue || 0), 0);

function itemName(ctx: SharkLiteContext, itemId?: string) {
  const item = ctx.items.find((entry) => entry.id === itemId);
  return item?.nameId || item?.nameEn || item?.name || item?.item_code || itemId || 'Unknown item';
}

function buyerName(ctx: SharkLiteContext, buyerId?: string) {
  if (ctx.currentUser.role === 'Buyer') return 'your linked buyer account';
  const buyer = ctx.buyers.find((entry) => entry.id === buyerId);
  return buyer?.name || buyerId || 'Unknown buyer';
}

function todayRecords(ctx: SharkLiteContext, records: SharkLiteRecord[]) {
  return records.filter((record) => record.date === ctx.today);
}

function summarizeReceiving(ctx: SharkLiteContext) {
  const today = todayRecords(ctx, ctx.receivings);
  const posted = countPosted(ctx.receivings);
  const drafts = countDraft(ctx.receivings);
  const todayPostedQty = totalQty(today.filter((record) => record.status === 'Posted'));

  return [
    `Receiving is active. There are ${posted} posted receiving documents and ${drafts} draft receiving documents.`,
    `Today posted receiving quantity: ${kg(todayPostedQty)}.`,
    today.length > 0 ? `Today has ${today.length} receiving records.` : 'No receiving records dated today are visible to this role.',
  ].join('\n');
}

function summarizeStock(ctx: SharkLiteContext) {
  const physical = ctx.stock.reduce((sum, stock) => sum + Number(stock.physicalQty || stock.quantity || 0), 0);
  const reserved = ctx.stock.reduce((sum, stock) => sum + Number(stock.reservedQty || 0), 0);
  const low = ctx.stock.filter((stock) => {
    const available = Number(stock.physicalQty || 0) - Number(stock.reservedQty || 0);
    return available > 0 && available < 50;
  });
  const recent = [...ctx.stockMovements].sort((a, b) => {
    const aTime = Number(a.timestamp?.seconds || 0);
    const bTime = Number(b.timestamp?.seconds || 0);
    return bTime - aTime;
  }).slice(0, 3);

  const recentText = recent.length
    ? recent.map((move) => `${move.type || 'MOVE'} ${kg(Number(move.quantity || 0))} ${itemName(ctx, move.itemId)} from ${move.source || 'System'}`).join('\n')
    : 'No recent stock movement is visible.';

  return [
    `Physical stock: ${kg(physical)}.`,
    `Reserved stock: ${kg(reserved)}.`,
    `Available stock: ${kg(physical - reserved)}.`,
    `Low stock items: ${low.length}.`,
    `Recent movement:\n${recentText}`,
  ].join('\n');
}

function summarizeProcessing(ctx: SharkLiteContext) {
  const posted = countPosted(ctx.processing);
  const drafts = countDraft(ctx.processing);
  const today = todayRecords(ctx, ctx.processing);
  const output = totalQty(ctx.processing.map((record) => ({ quantity: record.totalOutput || record.totalActual || record.totalInput || 0 })));

  return [
    `Processing has ${posted} posted records and ${drafts} draft records.`,
    `Today processing records visible: ${today.length}.`,
    `Total processed quantity visible: ${kg(output)}.`,
  ].join('\n');
}

function summarizeReports(ctx: SharkLiteContext) {
  const postedReceivings = ctx.receivings.filter((record) => record.status === 'Posted');
  const postedSales = ctx.sales.filter((record) => record.status === 'Posted');
  const postedExpenses = ctx.expenses.filter((record) => record.status === 'Posted');

  return [
    `Total purchases: ${money(totalAmount(postedReceivings))}.`,
    `Total posted sales: ${money(totalAmount(postedSales))}.`,
    `Posted operational expenses: ${money(totalAmount(postedExpenses))}.`,
    `Open supplier payable is visible through receiving balances; open buyer receivable is visible through sales balances.`,
  ].join('\n');
}

function summarizeAudit(ctx: SharkLiteContext) {
  const recent = [...ctx.auditLog].sort((a, b) => {
    const aTime = Number(a.timestamp?.seconds || 0);
    const bTime = Number(b.timestamp?.seconds || 0);
    return bTime - aTime;
  }).slice(0, 5);

  if (recent.length === 0) return 'No audit activity is visible right now.';

  return recent.map((entry) => `${entry.action || 'ACTION'} ${entry.collection || ''} ${entry.docId ? `#${entry.docId}` : ''}`).join('\n');
}

function summarizeBuyerAllocations(ctx: SharkLiteContext) {
  const allocations = ctx.buyerAllocations;
  if (allocations.length === 0) return 'No buyer allocations are visible for this scope.';

  const byBuyer = allocations.reduce<Record<string, number>>((acc, allocation) => {
    const key = allocation.buyerId || 'unknown';
    acc[key] = (acc[key] || 0) + Number(allocation.actualQty || allocation.allocatedQty || 0);
    return acc;
  }, {});

  return Object.entries(byBuyer)
    .map(([buyerId, quantity]) => `${buyerName(ctx, buyerId)} has ${kg(quantity)} allocated.`)
    .join('\n');
}

function findMismatches(ctx: SharkLiteContext) {
  const notes: string[] = [];
  const physical = ctx.stock.reduce((sum, stock) => sum + Number(stock.physicalQty || 0), 0);
  const reserved = ctx.stock.reduce((sum, stock) => sum + Number(stock.reservedQty || 0), 0);
  const postedReceivingWithoutMovement = ctx.receivings.filter((receiving) => {
    if (receiving.status !== 'Posted') return false;
    return !ctx.stockMovements.some((move) => move.docId === receiving.id && move.source === 'Receiving');
  });
  const overReserved = ctx.stock.filter((stock) => Number(stock.reservedQty || 0) > Number(stock.physicalQty || 0));
  const allocationsWithoutBuyer = ctx.buyerAllocations.filter((allocation) => !ctx.buyers.some((buyer) => buyer.id === allocation.buyerId));

  if (reserved > physical) notes.push(`Reserved stock ${kg(reserved)} is higher than physical stock ${kg(physical)}.`);
  if (postedReceivingWithoutMovement.length > 0) notes.push(`${postedReceivingWithoutMovement.length} posted receiving records do not show a matching receiving stock movement.`);
  if (overReserved.length > 0) notes.push(`${overReserved.length} stock lines are over-reserved.`);
  if (allocationsWithoutBuyer.length > 0) notes.push(`${allocationsWithoutBuyer.length} allocations point to a missing buyer record.`);

  return notes.length ? notes.join('\n') : 'No obvious mismatch detected from the visible frontend data.';
}

function investorExplanation(ctx: SharkLiteContext) {
  if (ctx.currentUser.role === 'Buyer') {
    return 'This Buyer Portal shows only your own allocation data: allocated product, quantity, and status. It proves the system can expose a safe customer-facing view without revealing internal receiving, stock, users, supplier costs, or audit data.';
  }

  return [
    'OPS Kaimana is a live seafood operations platform, not a generic ERP demo.',
    'It connects receiving, processing, stock movement, sales/dispatch, reports, audit log, and buyer allocation.',
    'The important investor signal is traceability: a receiving post updates stock, processing creates movement, reports update, and audit records the action.',
    'Shark Lite is a rule-based demo intelligence layer. It explains the current operation without Gemini, backend calls, or operational writes.',
  ].join('\n');
}

function managementWatch(ctx: SharkLiteContext) {
  const drafts = countDraft(ctx.receivings);
  const lowStock = ctx.stock.filter((stock) => {
    const available = Number(stock.physicalQty || 0) - Number(stock.reservedQty || 0);
    return available > 0 && available < 50;
  }).length;
  const unpaidReceiving = ctx.receivings.filter((record) => record.status === 'Posted' && record.paymentStatus !== 'Paid').length;
  const mismatches = findMismatches(ctx);

  return [
    `Watch receiving drafts: ${drafts}.`,
    `Watch unpaid supplier receiving: ${unpaidReceiving}.`,
    `Watch low stock items: ${lowStock}.`,
    `Data checks: ${mismatches}`,
  ].join('\n');
}

function buyerAllocation(ctx: SharkLiteContext) {
  const allocations = ctx.buyerAllocations;
  const total = allocations.reduce((sum, allocation) => sum + Number(allocation.actualQty || allocation.allocatedQty || 0), 0);
  const provisional = allocations.filter((allocation) => allocation.status === 'Provisional').length;
  const confirmed = allocations.filter((allocation) => allocation.status === 'Confirmed').reduce((sum, allocation) => sum + Number(allocation.actualQty || 0), 0);

  if (allocations.length === 0) {
    return 'I do not see an allocation for your buyer account yet. This view is still secure: it is not showing other buyer, receiving, or admin data.';
  }

  const lines = allocations.slice(0, 5).map((allocation) => {
    return `${itemName(ctx, allocation.itemId)}: ${kg(Number(allocation.actualQty || allocation.allocatedQty || 0))}, status ${allocation.status || 'Unknown'}.`;
  });

  return [
    ctx.currentUser.role === 'Buyer'
      ? 'Your buyer account is linked and scoped to your own buyer record.'
      : `Your buyer account is linked to ${buyerName(ctx, ctx.currentUser.linkedBuyerId)}.`,
    `Total visible allocation: ${kg(total)}.`,
    `Provisional allocation lines: ${provisional}. Confirmed quantity: ${kg(confirmed)}.`,
    ...lines,
  ].join('\n');
}

function operatorPostingChecklist() {
  return [
    'Before posting receiving, check these fields:',
    '1. Supplier is correct.',
    '2. Date and vehicle number are correct.',
    '3. Item, grade, size, quantity, and price per kg are correct.',
    '4. Buyer allocation does not exceed the line quantity.',
    '5. Zero price is intentional if it appears.',
    '6. Notes are clear enough for audit.',
  ].join('\n');
}

function receivingNote(ctx: SharkLiteContext) {
  const today = todayRecords(ctx, ctx.receivings).filter((record) => record.status === 'Posted');
  const qty = totalQty(today);

  return [
    'Receiving note draft - text only:',
    `Today the Kaimana operation posted ${today.length} receiving record(s), totaling ${kg(qty)}.`,
    'The operator should confirm supplier, item, grade/size, quantity, price per kg, and buyer allocation before posting.',
    'This note is not saved anywhere by Shark Lite.',
  ].join('\n');
}

export function answerSharkLite(question: string, ctx: SharkLiteContext): string {
  const normalized = question.toLowerCase();
  const role = ctx.currentUser.role;

  if (role === 'Buyer') {
    if (normalized.includes('provisional')) return 'Provisional means the allocation exists from receiving, but it is not yet confirmed as ready after processing or dispatch flow. It is visible to you, but it is not a final shipped quantity.';
    if (normalized.includes('only my own') || normalized.includes('see only') || normalized.includes('security')) return 'Yes. In Buyer mode, Shark Lite only uses your linked buyer allocation and buyer-safe records. It does not read admin users, receiving, processing, audit log, supplier payables, or other buyers.';
    if (normalized.includes('portal') || normalized.includes('explain')) return investorExplanation(ctx);
    return buyerAllocation(ctx);
  }

  if (normalized.includes('investor') || normalized.includes('explain this system')) return investorExplanation(ctx);
  if (normalized.includes('under control') || normalized.includes('mini plant')) return `${summarizeStock(ctx)}\n\n${managementWatch(ctx)}`;
  if (normalized.includes('management') || normalized.includes('watch')) return managementWatch(ctx);
  if (normalized.includes('mismatch')) return findMismatches(ctx);
  if (normalized.includes('buyer') && normalized.includes('allocation')) return summarizeBuyerAllocations(ctx);
  if (normalized.includes('audit')) {
    if (role !== 'Admin') return 'Audit activity is admin-only. I can help with receiving, processing, stock, and operational reports for your role.';
    return summarizeAudit(ctx);
  }
  if (normalized.includes('report')) return summarizeReports(ctx);
  if (normalized.includes('stock changed')) return summarizeStock(ctx);
  if (normalized.includes('stock')) return summarizeStock(ctx);
  if (normalized.includes('processing') || normalized.includes('production')) return summarizeProcessing(ctx);
  if (normalized.includes('before posting') || normalized.includes('check before posting')) return operatorPostingChecklist();
  if (normalized.includes('receiving note')) return receivingNote(ctx);
  if (normalized.includes('receiving') || normalized.includes('today')) return `${summarizeReceiving(ctx)}\n\n${summarizeStock(ctx)}`;

  if (role === 'Operator') {
    return 'I can help with receiving, processing, stock, and operational reports. Try: "What receiving activity happened today?", "What stock changed?", or "What should I check before posting?"';
  }

  return 'I can summarize receiving, stock, processing, reports, audit activity, buyer allocation, and data mismatches. Shark Lite is rule-based demo mode and does not call Gemini or write data.';
}

export function welcomeMessage(ctx: SharkLiteContext): string {
  if (ctx.currentUser.role === 'Buyer') {
    return 'Shark Lite - Demo Intelligence is ready in buyer-safe mode. I can explain your allocation and portal only.';
  }

  if (ctx.currentUser.role === 'Operator') {
    return 'Shark Lite - Demo Intelligence is ready for operations. I can summarize receiving, processing, stock, and reports without writing data.';
  }

  return 'Shark Lite - Demo Intelligence is ready for Admin. I can summarize operations, reports, audit activity, and data checks without writing data.';
}
