import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, 
  Package, DollarSign, Download, 
  ArrowDownCircle, Users, Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Card, Header, Button, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';
import { getItemLabel } from '../utils/itemMapping';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'financial' | 'operational'>('financial');
  
  // Data
  const { data: receivings } = useMasterData('receivings', true);
  const { data: stock } = useMasterData('stock', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: adjustments } = useMasterData('adjustments', true);
  const { data: expenses } = useMasterData('expenses', true);
  const { data: items } = useMasterData('items', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: suppliers } = useMasterData('suppliers', true);

  // Derived Data
  const postedSales = useMemo(() => sales.filter((s: any) => s.status === 'Posted'), [sales]);
  const postedReceivings = useMemo(() => receivings.filter((r: any) => r.status === 'Posted'), [receivings]);
  const postedExpenses = useMemo(() => expenses.filter((e: any) => e.status === 'Posted'), [expenses]);

  // Financial Summaries
  const totalSales = useMemo(() => {
    const salesBase = postedSales.reduce((sum, s) => sum + (s.totalAmount || s.totalValue || 0), 0);
    const adjTotal = adjustments.reduce((sum, a: any) => sum + (a.type === 'Credit' ? -a.amount : a.amount), 0);
    return salesBase + adjTotal;
  }, [postedSales, adjustments]);

  const totalPurchases = postedReceivings.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalExpenses = postedExpenses
    .filter((e: any) => e.category !== 'supplier_payment' && e.category !== 'sales_receipt')
    .reduce((sum, e) => sum + (e.transactionType === 'Money In' ? -(e.totalAmount || 0) : (e.totalAmount || 0)), 0);

  // Receivables & Payables
  const buyerReceivables = useMemo(() => {
    const balances: Record<string, number> = {};
    
    // Add sales balances
    postedSales.forEach(sale => {
      if (!balances[sale.buyerId]) balances[sale.buyerId] = 0;
      balances[sale.buyerId] += (sale.balanceDue !== undefined ? sale.balanceDue : (sale.totalAmount || sale.totalValue || 0));
    });

    // Add adjustment balances
    adjustments.forEach((adj: any) => {
      if (!balances[adj.buyerId]) balances[adj.buyerId] = 0;
      balances[adj.buyerId] += (adj.type === 'Credit' ? -adj.amount : adj.amount);
    });

    return Object.entries(balances)
      .map(([buyerId, balance]) => ({ buyerId, balance }))
      .filter(b => b.balance > 1); // Ignore small rounding or negative (credit) balances for this specific table
  }, [postedSales, adjustments]);

  const supplierPayables = useMemo(() => {
    const balances = postedReceivings.reduce((acc, rec) => {
      if (!acc[rec.supplierId]) acc[rec.supplierId] = 0;
      acc[rec.supplierId] += (rec.balanceDue !== undefined ? rec.balanceDue : rec.totalAmount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(balances)
      .map(([supplierId, balance]) => ({ supplierId, balance: balance as number }))
      .filter(s => s.balance > 0);
  }, [postedReceivings]);

  // Daily Movement
  const dailyMovement = useMemo(() => {
    const movement: Record<string, { in: number, out: number }> = {};
    postedReceivings.forEach(r => {
      if (!movement[r.date]) movement[r.date] = { in: 0, out: 0 };
      movement[r.date].in += r.totalQty || 0;
    });
    postedSales.forEach(s => {
      if (!movement[s.date]) movement[s.date] = { in: 0, out: 0 };
      movement[s.date].out += s.totalQty || 0;
    });
    return Object.entries(movement)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [postedReceivings, postedSales]);

  const renderFinancial = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Total Penjualan', 'Total Sales')}</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-900">Rp {totalSales.toLocaleString()}</p>
        </Card>
        <Card className="bg-ocean-50 border-ocean-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-ocean-600 uppercase tracking-widest">{t('Total Pembelian', 'Total Purchases')}</span>
            <ArrowDownCircle size={16} className="text-ocean-500" />
          </div>
          <p className="text-2xl font-black text-ocean-900">Rp {totalPurchases.toLocaleString()}</p>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t('Biaya Operasional', 'Operating Expenses')}</span>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-900">Rp {totalExpenses.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Piutang Pembeli', 'Buyer Receivables')}</h3>
            <Users className="text-slate-300" size={16} />
          </div>
          <Table 
            data={buyerReceivables}
            columns={[
              { header: t('PEMBELI', 'BUYER'), accessor: (b: any) => buyers.find((x: any) => x.id === b.buyerId)?.name || 'Unknown', className: 'font-bold' },
              { header: t('SISA PIUTANG', 'BALANCE DUE'), accessor: (b: any) => `Rp ${b.balance.toLocaleString()}`, className: 'text-right font-black text-emerald-600' }
            ]}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Hutang Pemasok', 'Supplier Payables')}</h3>
            <Users className="text-slate-300" size={16} />
          </div>
          <Table 
            data={supplierPayables}
            columns={[
              { header: t('PEMASOK', 'SUPPLIER'), accessor: (s: any) => suppliers.find((x: any) => x.id === s.supplierId)?.name || 'Unknown', className: 'font-bold' },
              { header: t('SISA HUTANG', 'BALANCE DUE'), accessor: (s: any) => `Rp ${s.balance.toLocaleString()}`, className: 'text-right font-black text-red-600' }
            ]}
          />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Buku Kas / Pengeluaran', 'Cash Book / Expenses')}</h3>
          <DollarSign className="text-slate-300" size={16} />
        </div>
        <Table 
          data={postedExpenses.filter((e: any) => e.category !== 'supplier_payment' && e.category !== 'sales_receipt').slice(0, 10)} 
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date' },
            { header: t('KATEGORI', 'CATEGORY'), accessor: (e: any) => e.category ? e.category.replace('_', ' ').toUpperCase() : '--' },
            { header: t('TIPE', 'TYPE'), accessor: (e: any) => <Badge variant={e.transactionType === 'Money In' ? 'posted' : 'draft'}>{e.transactionType}</Badge> },
            { header: t('JUMLAH', 'AMOUNT'), accessor: (e: any) => `Rp ${(e.totalAmount || 0).toLocaleString()}`, className: 'text-right font-bold' }
          ]}
        />
      </Card>
    </div>
  );

  const renderOperational = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Ringkasan Stok', 'Stock Snapshot')}</h3>
          <Package className="text-slate-300" size={16} />
        </div>
        <Table 
          data={stock.filter((s: any) => (s.physicalQty || s.quantity) > 0)}
          columns={[
            { header: 'ITEM', accessor: (s: any) => getItemLabel(items.find((i: any) => i.id === s.itemId)) },
            { header: 'FISIK', accessor: (s: any) => `${(s.physicalQty || s.quantity || 0).toLocaleString()} kg`, className: 'font-bold' },
            { header: 'TERSEDIA', accessor: (s: any) => `${((s.physicalQty || s.quantity || 0) - (s.reservedQty || 0)).toLocaleString()} kg`, className: 'font-black text-emerald-600' },
          ]}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Pergerakan Harian', 'Daily Movement Report')}</h3>
          <Calendar className="text-slate-300" size={16} />
        </div>
        <Table 
          data={dailyMovement}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('MASUK', 'IN (KG)'), accessor: (m: any) => m.in > 0 ? <span className="text-emerald-600 font-black">+{m.in} kg</span> : '-', className: 'text-right' },
            { header: t('KELUAR', 'OUT (KG)'), accessor: (m: any) => m.out > 0 ? <span className="text-red-600 font-black">-{m.out} kg</span> : '-', className: 'text-right' }
          ]}
        />
      </Card>
    </div>
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const rows = [['DATE', 'SOURCE', 'ITEM', 'QTY', 'AMOUNT']];
      postedSales.forEach(s => {
        (s.lines || []).forEach((l: any) => {
          const it = items.find((i: any) => i.id === l.itemId);
          const itemName = getItemLabel(it);
          rows.push([s.date, 'Sales', itemName, l.quantity, l.quantity * l.pricePerKg]);
        });
      });
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `kaimana_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 print:p-0">
      <Header 
        title={t('Pusat Laporan', 'Report Center')} 
        subtitle={t('Laporan Minimum Operasional', 'Minimum Operational Reports')}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" onClick={() => handleExport('csv')}><Download size={18} /> CSV</Button>
            <Button variant="secondary" onClick={() => handleExport('pdf')}><Download size={18} /> PDF</Button>
          </div>
        }
      />

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit print:hidden">
        <button onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'financial' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {t('Finansial', 'Financial')}
        </button>
        <button onClick={() => setActiveTab('operational')}
          className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'operational' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {t('Operasional', 'Operational')}
        </button>
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'operational' && renderOperational()}
      </div>
    </div>
  );
};
