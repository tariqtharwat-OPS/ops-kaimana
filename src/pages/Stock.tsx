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
import { MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../mockData';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

const MOCK_STOCK = [
  { id: 'st1', itemId: 'i1', gradeId: 'g1', sizeId: 'sz2', qty: 1200, unit: 'kg', buyerId: null },
  { id: 'st2', itemId: 'i2', gradeId: 'g1', sizeId: 'sz3', qty: 300, unit: 'kg', buyerId: 'b1' },
];

export const StockPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');

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
          <h3 className="text-2xl font-black text-ocean-800">1,500 kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PUTARAN STOK', 'STOCK TURNOVER')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">4.2x</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-amber-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('STOK RENDAH', 'LOW STOCK')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">2 Items</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="text-blue-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TERPESAN', 'RESERVED')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">300 kg</h3>
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
          data={MOCK_STOCK.filter(s => activeTab === 'available' ? !s.buyerId : s.buyerId)}
          columns={[
            { 
              header: t('BARANG', 'ITEM'), 
              accessor: (s: any) => {
                const item = MOCK_ITEMS.find(i => i.id === s.itemId);
                return (
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">{t(item?.nameId || '', item?.nameEn || '')}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item?.item_code}</span>
                  </div>
                );
              }
            },
            { header: 'GRADE', accessor: (s: any) => MOCK_GRADES.find(g => g.id === s.gradeId)?.name },
            { header: 'SIZE', accessor: (s: any) => MOCK_SIZES.find(sz => sz.id === s.sizeId)?.name },
            { header: t('KUANTITAS', 'QUANTITY'), accessor: (s: any) => <span className="font-black text-ocean-800">{s.qty} {s.unit}</span>, className: 'text-right' },
            { 
              header: t('STATUS', 'STATUS'), 
              accessor: (s: any) => (
                <Badge variant={s.qty > 500 ? 'posted' : 'pending'}>
                  {s.qty > 500 ? t('Stok Aman', 'Good Stock') : t('Stok Rendah', 'Low Stock')}
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
    </div>
  );
};
