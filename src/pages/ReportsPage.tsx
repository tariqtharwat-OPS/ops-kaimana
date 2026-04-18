import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, 
  Users, Package, DollarSign, Download, 
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Card, Header, Button, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

type ReportType = 'operational' | 'financial' | 'labor';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ReportType>('operational');
  

  // Data
  const { data: receivings } = useMasterData('receivings', true);
  const { data: processing } = useMasterData('processing', true);
  const { data: stock } = useMasterData('stock', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: expenses } = useMasterData('expenses', true);
  const { data: items } = useMasterData('items', true);
  
  const { data: buyers } = useMasterData('buyers', true);
  const { data: workers } = useMasterData('workers', true);

  // Stats
  const stats = useMemo(() => {
    const totalSales = sales.filter(s => s.status === 'Posted').reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const totalExpenses = expenses.filter(e => e.status === 'Posted').reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const totalQtyIn = receivings.filter(r => r.status === 'Posted').reduce((sum, r) => sum + (r.lines || []).reduce((s: number, l: any) => s + l.quantity, 0), 0);
    const totalQtyOut = sales.filter(s => s.status === 'Posted').reduce((sum, s) => sum + (s.lines || []).reduce((s: number, l: any) => s + l.quantity, 0), 0);
    
    return { totalSales, totalExpenses, totalQtyIn, totalQtyOut, profit: totalSales - totalExpenses };
  }, [sales, expenses, receivings]);

  const renderOperational = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Ringkasan Stok', 'Stock Summary')}</h3>
          <Package className="text-slate-300" size={16} />
        </div>
        <Table 
          data={stock}
          columns={[
            { header: 'ITEM', accessor: (s: any) => items.find(i => i.id === s.itemId)?.name || 'Unknown' },
            { header: 'QTY', accessor: (s: any) => `${s.quantity} kg`, className: 'font-bold' },
            { header: 'STATUS', accessor: (s: any) => <Badge variant={s.quantity > 0 ? 'posted' : 'draft'}>{s.quantity > 0 ? 'In Stock' : 'Empty'}</Badge> }
          ]}
        />
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Kinerja Produksi', 'Production Yield')}</h3>
          <TrendingUp className="text-slate-300" size={16} />
        </div>
        <Table 
          data={processing.filter(p => p.status === 'Posted').slice(0, 5)}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date' },
            { header: t('RENDEMEN', 'YIELD'), accessor: (p: any) => `${p.yield?.toFixed(2)}%`, className: 'font-bold text-emerald-600' }
          ]}
        />
      </Card>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">CASH IN (SALES)</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-900">Rp {stats.totalSales.toLocaleString()}</p>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">CASH OUT (EXPENSES)</span>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-900">Rp {stats.totalExpenses.toLocaleString()}</p>
        </Card>
        <Card className="bg-ocean-50 border-ocean-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-ocean-600 uppercase tracking-widest">NET MARGIN</span>
            <DollarSign size={16} className="text-ocean-500" />
          </div>
          <p className="text-2xl font-black text-ocean-900">Rp {stats.profit.toLocaleString()}</p>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Daftar Penjualan', 'Sales / Revenue List')}</h3>
        </div>
        <Table 
          data={sales.filter(s => s.status === 'Posted')}
          columns={[
            { header: 'DATE', accessor: 'date' },
            { header: 'BUYER', accessor: (s: any) => buyers.find(b => b.id === s.buyerId)?.name || '--' },
            { header: 'AMOUNT', accessor: (s: any) => `Rp ${s.totalValue?.toLocaleString()}`, className: 'font-bold' }
          ]}
        />
      </Card>
    </div>
  );

  const renderLabor = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Daftar Pekerja Aktif', 'Active Workers')}</h3>
          <Users className="text-slate-300" size={16} />
        </div>
        <Table 
          data={workers}
          columns={[
            { header: 'NAME', accessor: 'name', className: 'font-bold' },
            { header: 'POSITION', accessor: 'position' },
            { header: 'WAGE TYPE', accessor: 'wageType' }
          ]}
        />
      </Card>
      <Card className="bg-slate-50 flex items-center justify-center p-20 border-2 border-dashed border-slate-200">
         <div className="text-center space-y-4">
           <UserCheck size={48} className="text-slate-200 mx-auto" />
           <p className="text-sm font-black text-slate-300 uppercase tracking-widest">{t('Modul Payroll Siap Dikonfigurasi', 'Payroll Module Ready for Config')}</p>
         </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header 
        title={t('Pusat Laporan', 'Report Center')} 
        subtitle={t('Analisis data operasional dan finansial terintegrasi', 'Integrated operational and financial data analysis')}
        action={
          <div className="flex gap-2">
            <Button variant="secondary"><Download size={18} /> CSV</Button>
            <Button variant="secondary"><Download size={18} /> PDF</Button>
          </div>
        }
      />

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('operational')}
          className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'operational' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {t('Operasional', 'Operational')}
        </button>
        <button onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'financial' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}>
          {t('Finansial', 'Financial')}
        </button>
        <button onClick={() => setActiveTab('labor')}
          className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'labor' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}>
          {t('Pekerja', 'Labor')}
        </button>
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'operational' && renderOperational()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'labor' && renderLabor()}
      </div>
    </div>
  );
};

