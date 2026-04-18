import React from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ShoppingBag,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_ITEMS } from '../mockData';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

const MOCK_BUYER_STOCK = [
  { id: 'bs1', itemId: 'i2', qty: 300, unit: 'kg', status: 'Allocated' },
  { id: 'bs2', itemId: 'i3', qty: 150, unit: 'kg', status: 'Ready' },
];

export const BuyerView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Portal Buyer', 'Buyer Portal')} 
        subtitle={t('Pantau alokasi stok dan pesanan Anda', 'Monitor your stock allocations and orders')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-l-4 border-ocean-800">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-ocean-800" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ALOKASI ANDA', 'YOUR ALLOCATION')}</span>
          </div>
          <h3 className="text-2xl font-black text-ocean-800">450 kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('DALAM PROSES', 'IN PROGRESS')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">1 Order</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SIAP KIRIM', 'READY TO SHIP')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">150 kg</h3>
        </Card>
      </div>

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari stok alokasi...', 'Search allocations...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
          <Button variant="secondary"><Filter size={18} /> {t('Filter', 'Filter')}</Button>
        </div>

        <Table 
          data={MOCK_BUYER_STOCK}
          columns={[
            { 
              header: t('PRODUK', 'PRODUCT'), 
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
            { header: t('KUANTITAS', 'QUANTITY'), accessor: (s: any) => <span className="font-black text-ocean-800">{s.qty} {s.unit}</span>, className: 'text-right' },
            { 
              header: t('STATUS', 'STATUS'), 
              accessor: (s: any) => (
                <Badge variant={s.status === 'Ready' ? 'posted' : 'pending'}>
                  {s.status}
                </Badge>
              ), 
              className: 'text-center' 
            },
            { 
              header: '', 
              accessor: () => (
                <Button variant="secondary" className="py-1 px-3 text-xs">
                  <ShoppingBag size={14} /> {t('Tarik Stok', 'Pull Stock')}
                </Button>
              ),
              className: 'text-right'
            }
          ]}
        />
      </Card>
    </div>
  );
};
