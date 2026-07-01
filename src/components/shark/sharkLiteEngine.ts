import type { SharkLiteContext, SharkLiteRecord, SharkPrompt } from './sharkLiteTypes';

export const SHARK_LITE_PROMPTS: SharkPrompt[] = [
  { id: 'today', label: 'Apa yang terjadi hari ini?', question: 'Apa yang terjadi hari ini?', roles: ['Admin', 'Operator', 'Buyer'] },
  { id: 'control', label: 'Is this mini plant under control?', question: 'Is this mini plant under control?', roles: ['Admin', 'Operator'] },
  { id: 'watch', label: 'Apa risiko yang harus diperhatikan?', question: 'Apa risiko yang harus diperhatikan?', roles: ['Admin', 'Operator'] },
  { id: 'investor', label: 'Explain this system to an investor.', question: 'Explain this system to an investor.', roles: ['Admin', 'Operator', 'Buyer'] },
  { id: 'receiving', label: 'Summarize receiving.', question: 'Summarize receiving.', roles: ['Admin'] },
  { id: 'stock', label: 'Ringkas stock saat ini.', question: 'Ringkas stock saat ini.', roles: ['Admin'] },
  { id: 'processing', label: 'Summarize processing.', question: 'Summarize processing.', roles: ['Admin'] },
  { id: 'reports', label: 'Summarize reports.', question: 'Summarize reports.', roles: ['Admin'] },
  { id: 'audit', label: 'Summarize audit activity.', question: 'Summarize audit activity.', roles: ['Admin'] },
  { id: 'mismatch', label: 'Are there any data mismatches?', question: 'Are there any data mismatches?', roles: ['Admin'] },
  { id: 'master-incomplete', label: 'What master data is incomplete?', question: 'What master data is incomplete?', roles: ['Admin'] },
  { id: 'supplier-contact', label: 'Which suppliers miss phone/WA?', question: 'Which suppliers are missing phone or WhatsApp?', roles: ['Admin'] },
  { id: 'product-quality', label: 'Which products need better data?', question: 'Which products are missing scientific name, grade, or size?', roles: ['Admin', 'Operator'] },
  { id: 'traceability', label: 'Explain IN/OUT traceability.', question: 'Explain IN/OUT traceability.', roles: ['Admin', 'Operator'] },
  { id: 'demo-risk', label: 'What is risky before demo?', question: 'What is risky before a serious demo?', roles: ['Admin'] },
  { id: 'language-hygiene', label: 'Any language/data hygiene issues?', question: 'Are there language or data hygiene issues?', roles: ['Admin'] },
  { id: 'buyer-allocation-admin', label: 'Which buyer has allocation?', question: 'Which buyer has allocation?', roles: ['Admin'] },
  { id: 'operator-receiving', label: 'What receiving activity happened today?', question: 'What receiving activity happened today?', roles: ['Operator'] },
  { id: 'operator-stock', label: 'What stock changed?', question: 'What stock changed?', roles: ['Operator'] },
  { id: 'operator-processing', label: 'What processing happened?', question: 'What processing happened?', roles: ['Operator'] },
  { id: 'operator-incomplete', label: 'What operational data is incomplete?', question: 'What operational data is incomplete?', roles: ['Operator'] },
  { id: 'operator-posting', label: 'What should I check before posting?', question: 'What should I check before posting?', roles: ['Operator'] },
  { id: 'operator-note', label: 'Prepare a receiving note as text only.', question: 'Prepare a receiving note as text only.', roles: ['Operator'] },
  { id: 'buyer-allocation', label: 'Apa allocation saya?', question: 'Apa allocation saya?', roles: ['Buyer'] },
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
    `Penerimaan / Receiving: ${posted} posted, ${drafts} draft.`,
    `Hari ini / Today posted quantity: ${kg(todayPostedQty)}.`,
    today.length > 0 ? `Records hari ini: ${today.length}.` : 'No receiving records dated today are visible to this role.',
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
    `Stock fisik / Physical: ${kg(physical)}.`,
    `Reserved: ${kg(reserved)}.`,
    `Available: ${kg(physical - reserved)}.`,
    `Low stock items: ${low.length}.`,
    `Latest movement:\n${recentText}`,
  ].join('\n');
}

function summarizeProcessing(ctx: SharkLiteContext) {
  const posted = countPosted(ctx.processing);
  const drafts = countDraft(ctx.processing);
  const today = todayRecords(ctx, ctx.processing);
  const output = totalQty(ctx.processing.map((record) => ({ quantity: record.totalOutput || record.totalActual || record.totalInput || 0 })));

  return [
    `Processing: ${posted} posted, ${drafts} draft.`,
    `Records hari ini / today: ${today.length}.`,
    `Visible processed quantity: ${kg(output)}.`,
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

function hasArabicText(value: unknown) {
  return /[\u0600-\u06FF]/.test(JSON.stringify(value || ''));
}

function masterDataQuality(ctx: SharkLiteContext) {
  const suppliersMissing = ctx.suppliers.filter((supplier) => !(supplier.phone || supplier.whatsapp));
  const buyersMissingContact = ctx.buyers.filter((buyer) => !(buyer.phone || buyer.whatsapp || buyer.pic));
  const buyersMissingUser = ctx.buyers.filter((buyer) => !ctx.users.some((user) => user.linkedBuyerId === buyer.id || buyer.linkedUserId === user.id));
  const productsMissing = ctx.items.filter((item) => !(item.scientificName && (item.defaultGrade || item.gradeProfileId) && (item.sizeRange || item.sizeProfileId)));
  const languageIssues = [...ctx.suppliers, ...ctx.buyers, ...ctx.items, ...ctx.expenses].filter(hasArabicText);

  return [
    `Master data readiness:`,
    `Suppliers missing phone/WhatsApp: ${suppliersMissing.length}.`,
    `Buyers missing contact/PIC: ${buyersMissingContact.length}.`,
    `Buyers missing linked user: ${buyersMissingUser.length}.`,
    `Products missing scientific name / grade / size: ${productsMissing.length}.`,
    `Language hygiene warnings: ${languageIssues.length}.`,
  ].join('\n');
}

function supplierContactGaps(ctx: SharkLiteContext) {
  const missing = ctx.suppliers.filter((supplier) => !(supplier.phone || supplier.whatsapp)).slice(0, 8);
  if (missing.length === 0) return 'All visible suppliers have phone or WhatsApp recorded.';
  return missing.map((supplier) => `${supplier.name || supplier.id}: missing phone/WhatsApp.`).join('\n');
}

function productDataGaps(ctx: SharkLiteContext) {
  const missing = ctx.items.filter((item) => !(item.scientificName && (item.defaultGrade || item.gradeProfileId) && (item.sizeRange || item.sizeProfileId))).slice(0, 8);
  if (missing.length === 0) return 'Product master data looks ready: scientific name, grade, and size are filled for visible products.';
  return missing.map((item) => `${itemName(ctx, item.id)}: add scientific name, grade, or size range.`).join('\n');
}

function explainTraceability(ctx: SharkLiteContext) {
  const recent = [...ctx.stockMovements].sort((a, b) => Number(b.timestamp?.seconds || 0) - Number(a.timestamp?.seconds || 0)).slice(0, 4);
  const movementLines = recent.length
    ? recent.map((move) => `${move.type || 'MOVE'} ${kg(Number(move.quantity || 0))} ${itemName(ctx, move.itemId)} from ${move.source || 'Not recorded yet'}.`).join('\n')
    : 'No recent movement is visible.';

  return [
    'IN/OUT traceability explains why stock changed.',
    'IN usually comes from receiving or processing output. OUT usually comes from sales/dispatch, processing input, or adjustment.',
    `Recent movement:\n${movementLines}`,
    'If a source document is missing, the UI shows Belum tercatat / Not recorded yet instead of breaking old records.',
  ].join('\n');
}

function demoRisk(ctx: SharkLiteContext) {
  return [
    'Before a serious demo, check:',
    masterDataQuality(ctx),
    `Draft receiving documents: ${countDraft(ctx.receivings)}.`,
    `Data mismatches: ${findMismatches(ctx)}`,
  ].join('\n');
}

function investorExplanation(ctx: SharkLiteContext) {
  if (ctx.currentUser.role === 'Buyer') {
    return 'Buyer Portal ini hanya menampilkan allocation milik akun Anda: product, quantity, dan status. It proves OPS Kaimana can expose a safe customer-facing view without revealing internal receiving, stock, users, supplier costs, or audit data.';
  }

  return [
    'OPS Kaimana is a live seafood mini-plant system, not a generic ERP screen.',
    'It connects penerimaan/receiving, processing, stock movement, sales/dispatch, reports, audit log, and buyer allocation.',
    'Investor signal: posting receiving updates stock, processing creates movement, reports update, and audit records the action.',
    'Shark Lite is demo intelligence: rule-based, read-only, no Gemini, no backend actions.',
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
    `Risiko / Watchlist:`,
    `Receiving drafts: ${drafts}.`,
    `Unpaid supplier receiving: ${unpaidReceiving}.`,
    `Low stock items: ${lowStock}.`,
    `Data check: ${mismatches}`,
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
      ? 'Akun buyer Anda hanya melihat allocation milik Anda.'
      : `Your buyer account is linked to ${buyerName(ctx, ctx.currentUser.linkedBuyerId)}.`,
    `Total allocation terlihat / visible: ${kg(total)}.`,
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
    if (/(supplier|cost|margin|profit|stock|receiving|processing|audit|user|all buyer|other buyer|purchase|internal)/i.test(normalized)) {
      return 'Maaf, informasi tersebut adalah data internal operasional. Anda hanya dapat melihat allocation dan informasi transaksi milik Anda.';
    }
    if (normalized.includes('provisional')) return 'Provisional berarti allocation sudah tercatat dari receiving, tetapi belum final untuk dispatch/shipment. It is visible to you, but not yet final shipped quantity.';
    if (normalized.includes('only my own') || normalized.includes('see only') || normalized.includes('security')) return 'Yes. In Buyer mode, Shark Lite only uses your linked buyer allocation and buyer-safe records. It does not read admin users, receiving, processing, audit log, supplier payables, or other buyers.';
    if (normalized.includes('portal') || normalized.includes('explain')) return investorExplanation(ctx);
    return buyerAllocation(ctx);
  }

  if (normalized.includes('master data') || normalized.includes('incomplete')) return masterDataQuality(ctx);
  if (normalized.includes('supplier') && (normalized.includes('phone') || normalized.includes('whatsapp') || normalized.includes('wa'))) return supplierContactGaps(ctx);
  if (normalized.includes('scientific') || normalized.includes('products need') || normalized.includes('missing scientific') || normalized.includes('better data')) return productDataGaps(ctx);
  if (normalized.includes('traceability') || normalized.includes('in/out') || normalized.includes('movement happened') || normalized.includes('stock movement')) return explainTraceability(ctx);
  if (normalized.includes('serious demo') || normalized.includes('risky before') || normalized.includes('demo risk')) return demoRisk(ctx);
  if (normalized.includes('language') || normalized.includes('hygiene')) return masterDataQuality(ctx);
  if (normalized.includes('investor') || normalized.includes('explain this system')) return investorExplanation(ctx);
  if (normalized.includes('under control') || normalized.includes('mini plant')) return `${summarizeStock(ctx)}\n\n${managementWatch(ctx)}`;
  if (normalized.includes('management') || normalized.includes('watch') || normalized.includes('risiko') || normalized.includes('diperhatikan')) return managementWatch(ctx);
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
  if (normalized.includes('receiving') || normalized.includes('today') || normalized.includes('hari ini') || normalized.includes('terjadi')) return `${summarizeReceiving(ctx)}\n\n${summarizeStock(ctx)}`;

  if (role === 'Operator') {
    return 'I can help with receiving, processing, stock, and operational reports. Try: "What receiving activity happened today?", "What stock changed?", or "What should I check before posting?"';
  }

  return 'I can summarize receiving, stock, processing, reports, audit activity, buyer allocation, and data mismatches. Shark Lite is rule-based demo mode and does not call Gemini or write data.';
}

export function welcomeMessage(ctx: SharkLiteContext): string {
  if (ctx.currentUser.role === 'Buyer') {
    return 'Shark Lite - Demo Intelligence siap dalam buyer-safe mode. I can explain your own allocation and portal only.';
  }

  if (ctx.currentUser.role === 'Operator') {
    return 'Shark Lite - Demo Intelligence siap untuk operations. I can summarize receiving, processing, stock, and reports without writing data.';
  }

  return 'Shark Lite - Demo Intelligence siap untuk Admin. I can summarize operations, reports, audit activity, and data checks without writing data.';
}
