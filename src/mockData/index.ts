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
  { id: 's1', name: 'Nelayan Andi', phone: '081234567890', address: 'Pelabuhan Kaimana' },
  { id: 's2', name: 'Nelayan Budi', phone: '081234567891', address: 'Teluk Arguni' },
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Seafood Export Co', phone: '021-555-1234', address: 'Jakarta' },
  { id: 'c2', name: 'Local Market Kaimana', phone: '021-555-9876', address: 'Kaimana Town' },
];

export const MOCK_WORKERS = [
  { id: 'w1', name: 'Rahmat Hidayat', position: 'Operator', type: 'Monthly', salary: 4500000 },
  { id: 'w2', name: 'Siti Aminah', position: 'Processing', type: 'Daily', rate: 150000 },
  { id: 'w3', name: 'Fajar Pratama', position: 'Security', type: 'Monthly', salary: 3500000 },
];

export const MOCK_RECEIVING = [
  { 
    id: 'RCV-2604-001', 
    date: '2026-04-17', 
    supplierId: 's1', 
    sourceType: 'Local',
    status: 'Posted',
    notes: 'Kualitas sangat baik',
    grandTotal: 17500000,
    createdBy: 'Tariq Tharwat',
    lines: [
      { itemId: 'i1', gradeId: 'g1', sizeId: 'sz3', quantity: 500, unit: 'kg', unitPrice: 35000, total: 17500000 }
    ]
  },
];

export const MOCK_EXPENSES = [
  { id: 'EXP-2604-001', date: '2026-04-18', category: 'Operational', status: 'Posted', grandTotal: 500000, notes: 'Pembelian Es Balok', lines: [
    { category: 'Ice', description: 'Es Balok 20 pcs', qty: 20, price: 25000, total: 500000 }
  ]},
];

export const MOCK_CASH_MOVEMENTS = [
  { id: 'CSH-001', date: '2026-04-18', type: 'IN', source: 'Customer Payment', amount: 5000000, status: 'Posted' },
  { id: 'CSH-002', date: '2026-04-18', type: 'OUT', source: 'Supplier Payment', amount: 10000000, status: 'Posted' },
];

export const MOCK_PACKING = [
  { id: 'PCK-2604-001', date: '2026-04-18', sourceItemId: 'i2', sourceQty: 100, packagingItemId: 'i4', packagingQty: 100, outputItemId: 'i3', outputQty: 98, status: 'Posted' }
];
