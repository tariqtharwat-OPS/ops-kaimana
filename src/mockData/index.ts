export const MOCK_USERS = [
  { id: 'u1', name: 'Admin Kaimana', role: 'Admin', email: 'admin@kaimana.com', isActive: true },
  { id: 'u2', name: 'Manager Budi', role: 'Manager', email: 'manager@kaimana.com', isActive: true },
  { id: 'u3', name: 'Operator Siti', role: 'Operator', email: 'siti@kaimana.com', isActive: true },
  { id: 'u4', name: 'Finance Yudi', role: 'Finance', email: 'yudi@kaimana.com', isActive: true },
];

export const MOCK_ITEMS = [
  { id: 'i1', nameId: 'Ikan Tuna Utuh', nameEn: 'Whole Tuna', category: 'Raw', unit: 'kg', isActive: true },
  { id: 'i2', nameId: 'Tuna Loin', nameEn: 'Tuna Loin', category: 'Semi', unit: 'kg', isActive: true },
  { id: 'i3', nameId: 'Tuna Saku', nameEn: 'Tuna Saku', category: 'Finished', unit: 'kg', isActive: true },
  { id: 'i4', nameId: 'Plastik Vakum 1kg', nameEn: 'Vacuum Bag 1kg', category: 'Packaging', unit: 'pcs', isActive: true },
  { id: 'i5', nameId: 'Box Karton', nameEn: 'Carton Box', category: 'Packaging', unit: 'pcs', isActive: true },
];

export const MOCK_SUPPLIERS = [
  { id: 's1', name: 'Nelayan A', phone: '081234567890', address: 'Pelabuhan 1' },
  { id: 's2', name: 'Nelayan B', phone: '081234567891', address: 'Pelabuhan 2' },
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Restoran Seafood', phone: '021-555-1234', address: 'Jakarta' },
  { id: 'c2', name: 'Supermarket Segar', phone: '021-555-9876', address: 'Surabaya' },
];

export const MOCK_STOCK = [
  { itemId: 'i1', qty: 1500, avgCost: 35000, updatedAt: '2026-04-17T08:00:00Z' },
  { itemId: 'i2', qty: 500, avgCost: 55000, updatedAt: '2026-04-17T08:00:00Z' },
  { itemId: 'i3', qty: 200, avgCost: 75000, updatedAt: '2026-04-17T08:00:00Z' },
  { itemId: 'i4', qty: 5000, avgCost: 500, updatedAt: '2026-04-17T08:00:00Z' },
  { itemId: 'i5', qty: 1000, avgCost: 2000, updatedAt: '2026-04-17T08:00:00Z' },
];

export const MOCK_RECEIVING = [
  { id: 'RCV-2604-001', date: '2026-04-17', supplierId: 's1', itemId: 'i1', quantity: 500, unitPrice: 35000, totalPrice: 17500000, notes: 'Morning catch', status: 'Posted' },
  { id: 'RCV-2604-002', date: '2026-04-17', supplierId: 's2', itemId: 'i1', quantity: 200, unitPrice: 35000, totalPrice: 7000000, notes: 'Afternoon catch', status: 'Draft' },
];

export const MOCK_PROCESSING = [
  { id: 'PRC-2604-001', date: '2026-04-17', inputItemId: 'i1', inputQty: 100, outputItemId: 'i2', outputQty: 60, wasteQty: 40, status: 'Posted' },
];

export const MOCK_PACKING = [
  { id: 'PCK-2604-001', date: '2026-04-17', sourceItemId: 'i2', sourceQty: 50, packagingItemId: 'i4', packagingQty: 50, outputItemId: 'i3', outputQty: 50, status: 'Posted' },
];

export const MOCK_SALES = [
  { id: 'INV-2604-001', date: '2026-04-17', customerId: 'c1', itemId: 'i3', qty: 20, price: 90000, total: 1800000, status: 'Posted' },
];

export const MOCK_DISPATCH = [
  { id: 'DSP-2604-001', salesId: 'INV-2604-001', date: '2026-04-17', itemId: 'i3', qty: 20, status: 'Posted' },
];

export const MOCK_EXPENSES = [
  { id: 'EXP-2604-001', date: '2026-04-17', category: 'Operational', amount: 500000, notes: 'Ice blocks', status: 'Posted' },
];
