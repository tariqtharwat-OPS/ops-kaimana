export const MOCK_GRADES = [
  { id: 'g1', name: 'Grade A' },
  { id: 'g2', name: 'Grade B' },
  { id: 'g3', name: 'Grade C' },
];

export const MOCK_SIZES = [
  { id: 'sz1', name: 'Small (2-3kg)' },
  { id: 'sz2', name: 'Medium (3-5kg)' },
  { id: 'sz3', name: 'Large (5-10kg)' },
  { id: 'sz4', name: 'Extra Large (>10kg)' },
];

export const MOCK_ITEMS = [
  { id: 'i1', item_code: 'FT-TUNA-WH', nameId: 'Ikan Tuna Utuh', nameEn: 'Whole Tuna', category: 'Raw', default_unit: 'kg', active_status: true },
  { id: 'i2', item_code: 'FT-TUNA-LN', nameId: 'Tuna Loin', nameEn: 'Tuna Loin', category: 'Semi', default_unit: 'kg', active_status: true },
  { id: 'i3', item_code: 'FT-TUNA-SK', nameId: 'Tuna Saku', nameEn: 'Tuna Saku', category: 'Finished', default_unit: 'kg', active_status: true },
  { id: 'i4', item_code: 'PK-VAC-1KG', nameId: 'Plastik Vakum 1kg', nameEn: 'Vacuum Bag 1kg', category: 'Packaging', default_unit: 'pcs', active_status: true },
  { id: 'i5', item_code: 'PK-BOX-CRT', nameId: 'Box Karton', nameEn: 'Carton Box', category: 'Packaging', default_unit: 'pcs', active_status: true },
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
  { 
    id: 'RCV-2604-001', 
    date: '2026-04-17', 
    supplierId: 's1', 
    sourceType: 'Local',
    status: 'Posted',
    notes: 'Morning catch',
    grandTotal: 17500000,
    createdBy: 'u1',
    lines: [
      { itemId: 'i1', gradeId: 'g1', sizeId: 'sz3', quantity: 500, unit: 'kg', unitPrice: 35000, total: 17500000 }
    ]
  },
  { 
    id: 'RCV-2604-002', 
    date: '2026-04-17', 
    supplierId: 's2', 
    sourceType: 'Local',
    status: 'Draft',
    notes: 'Afternoon catch',
    grandTotal: 7000000,
    createdBy: 'u1',
    lines: [
      { itemId: 'i1', gradeId: 'g2', sizeId: 'sz2', quantity: 200, unit: 'kg', unitPrice: 35000, total: 7000000 }
    ]
  },
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
