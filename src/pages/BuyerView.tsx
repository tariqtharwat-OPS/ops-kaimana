import React from 'react';
import { 
  Package, 
  Filter, 
  ShoppingBag,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

export const BuyerView: React.FC = () => {
  const { t } = useLanguage();
  const { data: items } = useMasterData('items', true);
  const { data: allocations } = useMasterData('buyerAllocations', true);
  const { data: buyers } = useMasterData('buyers', true);
  
  const [selectedBuyerId, setSelectedBuyerId] = React.useState('');

  const buyerAllocations = allocations.filter(a => !selectedBuyerId || a.buyerId === selectedBuyerId);

  const stats = React.useMemo(() => {
    const total = buyerAllocations.reduce((sum, a) => sum + (a.actualQty || a.allocatedQty || 0), 0);
    const confirmed = buyerAllocations.filter(a => a.status === 'Confirmed').reduce((sum, a) => sum + (a.actualQty || 0), 0);
    return { total, confirmed };
  }, [buyerAllocations]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Portal Buyer', 'Buyer Portal')} 
        subtitle={t('Pantau alokasi stok dan pesanan Anda', 'Monitor your stock allocations and orders')}
        action={
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm shadow-sm"
            value={selectedBuyerId}
            onChange={e => setSelectedBuyerId(e.target.value)}
          >
            <option value="">-- {t('Semua Buyer', 'All Buyers')} --</option>
            {buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-l-4 border-ocean-800">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-ocean-800" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TOTAL ALOKASI', 'TOTAL ALLOCATION')}</span>
          </div>
          <h3 className="text-2xl font-black text-ocean-800">{stats.total.toLocaleString()} kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PROVISIONAL (RECEIVING)', 'PROVISIONAL')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {buyerAllocations.filter(a => a.status === 'Provisional').length} Items
          </h3>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TERKONFIRMASI (READY)', 'CONFIRMED')}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.confirmed.toLocaleString()} kg</h3>
        </Card>
      </div>

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{t('DAFTAR STOK TERALOKASI', 'ALLOCATED STOCK LIST')}</h3>
          <Button variant="secondary"><Filter size={18} /> {t('Filter', 'Filter')}</Button>
        </div>

        <Table 
          data={buyerAllocations}
          columns={[
            { 
              header: t('PRODUK', 'PRODUCT'), 
              accessor: (a: any) => {
                const item = items.find(i => i.id === a.itemId);
                return (
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">{t(item?.nameId || '', item?.nameEn || '')}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item?.item_code} | {a.gradeId || 'STD'} | {a.sizeId || 'STD'}</span>
                  </div>
                );
              }
            },
            { 
              header: t('KUANTITAS', 'QUANTITY'), 
              accessor: (a: any) => (
                <div className="text-right">
                  <div className="font-black text-ocean-800">{(a.actualQty || a.allocatedQty || 0).toLocaleString()} kg</div>
                  {a.shortfall > 0 && <div className="text-[10px] text-red-500 font-bold">Shortfall: -{a.shortfall} kg</div>}
                </div>
              ), 
              className: 'text-right' 
            },
            { 
              header: t('STATUS', 'STATUS'), 
              accessor: (a: any) => (
                <Badge variant={a.status === 'Confirmed' ? 'posted' : 'pending'}>
                  {a.status}
                </Badge>
              ), 
              className: 'text-center' 
            },
            { 
              header: '', 
              accessor: (a: any) => (
                <div className="text-right">
                  {a.status === 'Confirmed' && (
                    <Button variant="secondary" className="py-1 px-3 text-xs">
                      <ShoppingBag size={14} /> {t('Tarik Stok', 'Pull Stock')}
                    </Button>
                  )}
                </div>
              ),
              className: 'text-right'
            }
          ]}
        />
      </Card>
    </div>
  );
};
