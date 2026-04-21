import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  UserPlus, 
  History, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';
import { getItemLabel, getItemCodeLabel } from '../utils/itemMapping';

export const StockPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');

  // Real data from Firestore
  const { data: stock } = useMasterData('stock', true);
  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: movements } = useMasterData('stock_movements', true);
  const { data: allocations } = useMasterData('buyerAllocations', true);

  const totalVolume = stock.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
  
  // Reserved quantity is sum of Provisional allocations
  const reservedVolume = allocations
    .filter((a: any) => a.status === 'Provisional')
    .reduce((sum: number, a: any) => sum + (a.allocatedQty || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Inventaris Stok', 'Stock Inventory')} 
        subtitle={t('Pantau ketersediaan produk di gudang', 'Monitor product availability in warehouse')}
        action={
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'available' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
            >
              {t('Tersedia', 'Available')}
            </button>
            <button 
              onClick={() => setActiveTab('assigned')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'assigned' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
            >
              {t('Alokasi Buyer', 'Assigned')}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-ocean-50/50 border-ocean-100">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-ocean-800" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TOTAL VOLUME', 'TOTAL VOLUME')}</span>
          </div>
          <h3 className="text-2xl font-black text-ocean-800">{totalVolume.toLocaleString()} kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PUTARAN STOK', 'STOCK TURNOVER')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">--</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-amber-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('STOK RENDAH', 'LOW STOCK')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stock.filter(s => s.quantity < 100).length} Items</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="text-blue-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TERPESAN', 'RESERVED')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{reservedVolume.toLocaleString()} kg</h3>
        </Card>
      </div>

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari stok...', 'Search stock...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
          <div className="flex gap-3">
             <Button variant="secondary"><History size={18} /> {t('Riwayat', 'History')}</Button>
             <Button variant="secondary"><UserPlus size={18} /> {t('Alokasi Baru', 'New Allocation')}</Button>
          </div>
        </div>

        <Table 
          data={activeTab === 'available' ? stock : allocations.filter((a: any) => a.status === 'Provisional')}
          columns={[
            { 
              header: t('BARANG', 'ITEM'), 
              accessor: (s: any) => {
                const item = items.find((i: any) => i.id === s.itemId);
                return (
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">{getItemLabel(item)}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{getItemCodeLabel(item)}</span>
                  </div>
                );
              }
            },
            { header: 'GRADE', accessor: (s: any) => grades.find((g: any) => g.id === s.gradeId)?.name || '-' },
            { header: 'SIZE', accessor: (s: any) => sizes.find((sz: any) => sz.id === s.sizeId)?.name || '-' },
            { 
              header: activeTab === 'available' ? t('TOTAL STOK', 'TOTAL STOCK') : t('ALOKASI', 'ALLOCATION'), 
              accessor: (s: any) => <span className="font-black text-slate-400">{(s.quantity || s.allocatedQty || 0).toLocaleString()} kg</span>, 
              className: 'text-right' 
            },
            ...(activeTab === 'available' ? [{
              header: t('TERSEDIA', 'AVAILABLE'),
              accessor: (s: any) => {
                const reserved = allocations
                  .filter((a: any) => 
                    a.itemId === s.itemId && 
                    (a.gradeId || null) === (s.gradeId || null) && 
                    (a.sizeId || null) === (s.sizeId || null) && 
                    a.status === 'Provisional' &&
                    a.buyerId != null
                  )
                  .reduce((sum: number, a: any) => sum + (a.allocatedQty || 0), 0);
                const available = (s.quantity || 0) - reserved;
                return <span className="font-black text-ocean-800">{available.toLocaleString()} kg</span>;
              },
              className: 'text-right'
            }] : []),
            { 
              header: t('STATUS', 'STATUS'), 
              accessor: (s: any) => (
                <Badge variant={(s.quantity || s.allocatedQty) > 500 ? 'posted' : 'pending'}>
                  {activeTab === 'available' 
                    ? (s.quantity > 500 ? t('Stok Aman', 'Good Stock') : t('Stok Rendah', 'Low Stock'))
                    : s.status}
                </Badge>
              ), 
              className: 'text-center' 
            },
            { 
              header: '', 
              accessor: () => <ChevronRight size={18} className="text-slate-200" />,
              className: 'text-right'
            }
          ]}
        />
      </Card>
      <div className="mt-20 space-y-6">
        <div className="flex items-center gap-4">
          <History className="text-slate-400" size={24} />
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('Log Pergerakan Stok', 'Stock Movement Log')}</h3>
        </div>
        
        <Card noPadding>
          <Table 
            data={movements.sort((a: any, b: any) => {
              const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || a.created_at).getTime();
              const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || b.created_at).getTime();
              return timeB - timeA;
            }).slice(0, 10)}
            columns={[
              { 
                header: t('WAKTU', 'TIME'), 
                accessor: (m: any) => {
                  const date = m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || m.created_at);
                  return date.toLocaleString('id-ID');
                }, 
                className: 'text-xs text-slate-400 font-bold' 
              },
              { header: t('TIPE', 'TYPE'), accessor: (m: any) => <Badge variant={m.type === 'IN' ? 'posted' : 'pending'}>{m.type}</Badge> },
              { header: t('SUMBER', 'SOURCE'), accessor: 'source', className: 'font-black text-slate-900 text-xs uppercase' },
              { 
                header: t('BARANG', 'ITEM'), 
                accessor: (m: any) => {
                  const item = items.find((i: any) => i.id === m.itemId);
                  return <span className="font-bold text-slate-600">{getItemLabel(item)}</span>;
                }
              },
              { header: 'GRADE', accessor: (m: any) => grades.find((g: any) => g.id === m.gradeId)?.name || '-' },
              { header: 'SIZE', accessor: (m: any) => sizes.find((sz: any) => sz.id === m.sizeId)?.name || '-' },
              { header: t('JUMLAH', 'QTY'), accessor: (m: any) => <span className={`font-black ${m.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>{m.type === 'IN' ? '+' : '-'}{m.quantity} kg</span>, className: 'text-right' }
            ]}
          />
        </Card>
      </div>
    </div>
  );
};
