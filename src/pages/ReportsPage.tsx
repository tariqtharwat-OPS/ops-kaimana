import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown,
  Package, DollarSign, Download,
  ArrowDownCircle, Users,
  CreditCard, FileText, BarChart2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Card, Header, Button, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';
import { getItemLabel } from '../utils/itemMapping';

// ─── CSV Utility ───────────────────────────────────────────────────────────────
const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'financial' | 'receivables' | 'stock' | 'adj'>('financial');
  const [movementDays, setMovementDays] = useState(30);

  // Data sources
  const { data: receivings } = useMasterData('receivings', true);
  const { data: stock } = useMasterData('stock', true);
  const { data: movements } = useMasterData('stock_movements', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: expenses } = useMasterData('expenses', true);
  const { data: payments } = useMasterData('payments', true);
  const { data: adjustments } = useMasterData('adjustments', true);
  const { data: buyerCredits } = useMasterData('buyerCredits', true);
  const { data: items } = useMasterData('items', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: suppliers } = useMasterData('suppliers', true);

  const postedSales = useMemo(() => sales.filter((s: any) => s.status === 'Posted'), [sales]);
  const postedReceivings = useMemo(() => receivings.filter((r: any) => r.status === 'Posted'), [receivings]);
  const postedExpenses = useMemo(() => expenses.filter((e: any) => e.status === 'Posted'), [expenses]);

  // ── Financial KPIs ──────────────────────────────────────────────────────────
  const totalSales = useMemo(() =>
    postedSales.reduce((sum: number, s: any) => sum + (s.totalAmount || s.totalValue || 0), 0),
  [postedSales]);

  const totalPurchases = useMemo(() =>
    postedReceivings.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0),
  [postedReceivings]);

  const totalExpenses = useMemo(() =>
    postedExpenses
      .filter((e: any) => e.category !== 'supplier_payment' && e.category !== 'sales_receipt')
      .reduce((sum: number, e: any) => sum + (e.transactionType === 'Money In' ? -(e.totalAmount || 0) : (e.totalAmount || 0)), 0),
  [postedExpenses]);

  const totalPaymentsIn = useMemo(() =>
    payments.filter((p: any) => p.transactionType === 'Money In' && !p.reversed)
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
  [payments]);

  // ── Buyer Receivables ──────────────────────────────────────────────────────
  const buyerReceivables = useMemo(() => {
    const map: Record<string, { balance: number, invoiceCount: number }> = {};
    postedSales.forEach((s: any) => {
      if (!map[s.buyerId]) map[s.buyerId] = { balance: 0, invoiceCount: 0 };
      const due = s.balanceDue !== undefined ? s.balanceDue : (s.totalAmount || 0);
      if (due > 0) { map[s.buyerId].balance += due; map[s.buyerId].invoiceCount += 1; }
    });
    return Object.entries(map)
      .map(([buyerId, v]) => ({ buyerId, ...v }))
      .filter(b => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [postedSales]);

  // ── Supplier Payables ──────────────────────────────────────────────────────
  const supplierPayables = useMemo(() => {
    const map: Record<string, { balance: number, invoiceCount: number }> = {};
    postedReceivings.forEach((r: any) => {
      if (!map[r.supplierId]) map[r.supplierId] = { balance: 0, invoiceCount: 0 };
      const due = r.balanceDue !== undefined ? r.balanceDue : (r.totalAmount || 0);
      if (due > 0) { map[r.supplierId].balance += due; map[r.supplierId].invoiceCount += 1; }
    });
    return Object.entries(map)
      .map(([supplierId, v]) => ({ supplierId, ...v }))
      .filter(s => s.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [postedReceivings]);

  // ── Stock Movements ─────────────────────────────────────────────────────────
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - movementDays);
    return d;
  }, [movementDays]);

  const filteredMovements = useMemo(() =>
    movements
      .filter((m: any) => {
        const ts = m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || m.created_at || 0);
        return ts >= cutoff;
      })
      .sort((a: any, b: any) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || a.created_at || 0).getTime();
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || b.created_at || 0).getTime();
        return tB - tA;
      }),
  [movements, cutoff]);

  // ── Payment Summary ─────────────────────────────────────────────────────────
  const paymentSummary = useMemo(() => {
    const map: Record<string, { moneyIn: number, moneyOut: number }> = {};
    payments.filter((p: any) => !p.reversed).forEach((p: any) => {
      const d = p.date || p.created_at?.split('T')[0] || 'Unknown';
      if (!map[d]) map[d] = { moneyIn: 0, moneyOut: 0 };
      if (p.transactionType === 'Money In') map[d].moneyIn += p.amount || 0;
      else map[d].moneyOut += p.amount || 0;
    });
    return Object.entries(map)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
  }, [payments]);

  // ── ADJ Register ───────────────────────────────────────────────────────────
  const adjList = useMemo(() =>
    [...adjustments].sort((a: any, b: any) => {
      const dA = a.date || a.createdAt?.split?.('T')[0] || '';
      const dB = b.date || b.createdAt?.split?.('T')[0] || '';
      return dB.localeCompare(dA);
    }),
  [adjustments]);

  // ── Buyer Credit ───────────────────────────────────────────────────────────
  const buyerCreditMap = useMemo(() => {
    const map: Record<string, { available: number, used: number }> = {};
    buyerCredits.forEach((c: any) => {
      if (!map[c.buyerId]) map[c.buyerId] = { available: 0, used: 0 };
      if (c.status === 'Available') map[c.buyerId].available += c.creditAmount || 0;
      else map[c.buyerId].used += c.creditAmount || 0;
    });
    return Object.entries(map).map(([buyerId, v]) => ({ buyerId, ...v }));
  }, [buyerCredits]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const buyerName = (id: string) => buyers.find((b: any) => b.id === id)?.name || 'Unknown';
  const supplierName = (id: string) => suppliers.find((s: any) => s.id === id)?.name || 'Unknown';
  const itemName = (id: string) => {
    const it = items.find((i: any) => i.id === id);
    return it ? (it.nameEn || it.nameId || it.item_code || 'Unknown') : 'Unknown';
  };

  // ── Tab Renders ─────────────────────────────────────────────────────────────
  const renderFinancial = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('Total Penjualan', 'Total Sales'), value: totalSales, color: 'emerald', icon: <TrendingUp size={16} /> },
          { label: t('Total Pembelian', 'Total Purchases'), value: totalPurchases, color: 'ocean', icon: <ArrowDownCircle size={16} /> },
          { label: t('Biaya Operasional', 'Op. Expenses'), value: totalExpenses, color: 'red', icon: <TrendingDown size={16} /> },
          { label: t('Kas Diterima', 'Cash Received'), value: totalPaymentsIn, color: 'violet', icon: <CreditCard size={16} /> },
        ].map(({ label, value, color, icon }) => (
          <Card key={label} className={`bg-${color}-50 border-${color}-100`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black text-${color}-600 uppercase tracking-widest`}>{label}</span>
              <span className={`text-${color}-400`}>{icon}</span>
            </div>
            <p className={`text-xl font-black text-${color}-900`}>Rp {value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Piutang Pembeli', 'Buyer Receivables')}</h3>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('buyer_receivables', [
              ['Buyer', 'Balance Due', 'Open Invoices'],
              ...buyerReceivables.map(b => [buyerName(b.buyerId), b.balance, b.invoiceCount])
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={buyerReceivables} columns={[
            { header: t('PEMBELI', 'BUYER'), accessor: (b: any) => buyerName(b.buyerId), className: 'font-bold' },
            { header: t('INVOICE', 'INVOICES'), accessor: (b: any) => b.invoiceCount, className: 'text-center text-xs' },
            { header: t('SISA PIUTANG', 'BALANCE DUE'), accessor: (b: any) => `Rp ${b.balance.toLocaleString()}`, className: 'text-right font-black text-emerald-600' }
          ]} />
          {buyerReceivables.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t('Tidak ada piutang', 'No outstanding receivables')}</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Hutang Pemasok', 'Supplier Payables')}</h3>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('supplier_payables', [
              ['Supplier', 'Balance Due', 'Open Invoices'],
              ...supplierPayables.map(s => [supplierName(s.supplierId), s.balance, s.invoiceCount])
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={supplierPayables} columns={[
            { header: t('PEMASOK', 'SUPPLIER'), accessor: (s: any) => supplierName(s.supplierId), className: 'font-bold' },
            { header: t('INVOICE', 'INVOICES'), accessor: (s: any) => s.invoiceCount, className: 'text-center text-xs' },
            { header: t('SISA HUTANG', 'BALANCE DUE'), accessor: (s: any) => `Rp ${s.balance.toLocaleString()}`, className: 'text-right font-black text-red-600' }
          ]} />
          {supplierPayables.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t('Tidak ada hutang', 'No outstanding payables')}</p>}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Ringkasan Pembayaran', 'Payment Summary')}</h3>
          <Button variant="secondary" size="sm" onClick={() => downloadCsv('payment_summary', [
            ['Date', 'Money In', 'Money Out', 'Net'],
            ...paymentSummary.map(p => [p.date, p.moneyIn, p.moneyOut, p.moneyIn - p.moneyOut])
          ])}><Download size={12} /> CSV</Button>
        </div>
        <Table data={paymentSummary} columns={[
          { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
          { header: t('MASUK', 'MONEY IN'), accessor: (p: any) => p.moneyIn > 0 ? <span className="font-black text-emerald-600">+Rp {p.moneyIn.toLocaleString()}</span> : '-', className: 'text-right' },
          { header: t('KELUAR', 'MONEY OUT'), accessor: (p: any) => p.moneyOut > 0 ? <span className="font-black text-red-500">-Rp {p.moneyOut.toLocaleString()}</span> : '-', className: 'text-right' },
          { header: 'NET', accessor: (p: any) => { const net = p.moneyIn - p.moneyOut; return <span className={`font-black ${net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{net >= 0 ? '+' : ''}Rp {net.toLocaleString()}</span>; }, className: 'text-right' }
        ]} />
        {paymentSummary.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t('Tidak ada data pembayaran', 'No payment data')}</p>}
      </Card>
    </div>
  );

  const renderReceivables = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Users size={14} className="text-slate-400" /><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Kredit Buyer', 'Buyer Credit Balance')}</h3></div>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('buyer_credits', [
              ['Buyer', 'Available Credit', 'Used Credit'],
              ...buyerCreditMap.map(c => [buyerName(c.buyerId), c.available, c.used])
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={buyerCreditMap} columns={[
            { header: t('PEMBELI', 'BUYER'), accessor: (c: any) => buyerName(c.buyerId), className: 'font-bold' },
            { header: t('TERSEDIA', 'AVAILABLE'), accessor: (c: any) => <span className="font-black text-emerald-600">Rp {c.available.toLocaleString()}</span>, className: 'text-right' },
            { header: t('TERPAKAI', 'USED'), accessor: (c: any) => <span className="font-black text-slate-400">Rp {c.used.toLocaleString()}</span>, className: 'text-right' }
          ]} />
          {buyerCreditMap.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t('Tidak ada kredit buyer', 'No buyer credits')}</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400" /><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Register ADJ', 'ADJ Register')}</h3></div>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('adj_register', [
              ['ID', 'Date', 'Type', 'Buyer', 'Amount', 'Status'],
              ...adjList.map((a: any) => [a.id, a.date || '', a.type || '', buyerName(a.buyerId), a.amount || 0, a.status || ''])
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={adjList.slice(0, 20)} columns={[
            { header: 'ID', accessor: (a: any) => <span className="text-[10px] font-bold text-slate-400" title={a.id}>#{(a.id || '').substring(0, 10)}</span> },
            { header: t('TIPE', 'TYPE'), accessor: (a: any) => <Badge variant={a.type === 'CreditNote' ? 'posted' : 'pending'}>{a.type || 'ADJ'}</Badge> },
            { header: t('PEMBELI', 'BUYER'), accessor: (a: any) => buyerName(a.buyerId), className: 'font-bold text-xs' },
            { header: t('JUMLAH', 'AMOUNT'), accessor: (a: any) => `Rp ${(a.amount || 0).toLocaleString()}`, className: 'text-right font-black' }
          ]} />
          {adjList.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t('Tidak ada ADJ', 'No adjustments')}</p>}
        </Card>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-slate-500 uppercase">{t('Rentang', 'Range')}:</span>
        {[7, 14, 30, 60].map(d => (
          <button key={d} onClick={() => setMovementDays(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${movementDays === d ? 'bg-ocean-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {d}d
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Package size={14} className="text-slate-400" /><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Snapshot Stok', 'Stock Snapshot')}</h3></div>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('stock_snapshot', [
              ['Item', 'Physical', 'Reserved', 'Available'],
              ...stock.filter((s: any) => (s.physicalQty || 0) > 0).map((s: any) => [itemName(s.itemId), s.physicalQty || 0, s.reservedQty || 0, (s.physicalQty || 0) - (s.reservedQty || 0)])
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={stock.filter((s: any) => (s.physicalQty || 0) > 0)} columns={[
            { header: 'ITEM', accessor: (s: any) => getItemLabel(items.find((i: any) => i.id === s.itemId)), className: 'font-bold' },
            { header: t('FISIK', 'PHYSICAL'), accessor: (s: any) => `${(s.physicalQty || 0).toLocaleString()} kg` },
            { header: t('TERSEDIA', 'AVAIL'), accessor: (s: any) => { const av = (s.physicalQty || 0) - (s.reservedQty || 0); return <span className={`font-black ${av < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{av.toLocaleString()} kg</span>; }, className: 'text-right' }
          ]} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><BarChart2 size={14} className="text-slate-400" /><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Pergerakan Stok', 'Stock Movements')} ({movementDays}d)</h3></div>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv('stock_movements', [
              ['Time', 'Type', 'Source', 'Item', 'Qty'],
              ...filteredMovements.map((m: any) => {
                const ts = m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || m.created_at || 0);
                return [ts.toLocaleString('id-ID'), m.type, m.source || '', itemName(m.itemId), m.quantity || 0];
              })
            ])}><Download size={12} /> CSV</Button>
          </div>
          <Table data={filteredMovements.slice(0, 25)} columns={[
            { header: t('WAKTU', 'TIME'), accessor: (m: any) => { const d = m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || m.created_at || 0); return <span className="text-[10px] text-slate-400 font-bold">{d.toLocaleDateString('id-ID')}</span>; } },
            { header: t('TIPE', 'TYPE'), accessor: (m: any) => <Badge variant={m.type === 'IN' ? 'posted' : 'pending'}>{m.type}</Badge> },
            { header: 'ITEM', accessor: (m: any) => <span className="text-xs font-bold">{itemName(m.itemId)}</span> },
            { header: 'QTY', accessor: (m: any) => <span className={`font-black text-xs ${m.type === 'IN' ? 'text-emerald-600' : 'text-red-500'}`}>{m.type === 'IN' ? '+' : '-'}{m.quantity} kg</span>, className: 'text-right' }
          ]} />
          {filteredMovements.length === 0 && <p className="text-center text-slate-300 font-bold text-xs py-6">{t(`Tidak ada pergerakan dalam ${movementDays} hari`, `No movements in ${movementDays} days`)}</p>}
        </Card>
      </div>
    </div>
  );

  const TABS = [
    { key: 'financial', label: t('Finansial', 'Financial'), icon: <DollarSign size={14} /> },
    { key: 'receivables', label: t('Piutang/Kredit', 'Receivables'), icon: <Users size={14} /> },
    { key: 'stock', label: t('Stok', 'Stock & Movement'), icon: <Package size={14} /> },
    { key: 'adj', label: 'ADJ / Credits', icon: <FileText size={14} /> },
  ] as const;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header
        title={t('Pusat Laporan', 'Report Center')}
        subtitle={t('Laporan operasional dan keuangan real-time', 'Real-time operational and financial reports')}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.print()}><Download size={18} /> PDF</Button>
          </div>
        }
      />

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap print:hidden">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === tab.key ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'receivables' && renderReceivables()}
        {activeTab === 'stock' && renderStock()}
        {activeTab === 'adj' && renderReceivables()}
      </div>
    </div>
  );
};
