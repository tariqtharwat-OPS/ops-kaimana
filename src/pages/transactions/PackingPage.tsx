import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  ArrowLeft,
  Package,
  Box
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_PACKING, MOCK_ITEMS, MOCK_GRADES } from '../../mockData';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const PackingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');

  if (view === 'form') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={t('Pengemasan Baru', 'New Packing')} 
          subtitle={t('Proses pengemasan produk setengah jadi menjadi produk jadi', 'Process semi-finished products into finished goods')}
          action={
            <>
              <Button variant="secondary" onClick={() => setView('list')}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              <Button variant="secondary">{t('Simpan Draft', 'Save Draft')}</Button>
              <Button>{t('Post Pengemasan', 'Post Packing')}</Button>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <Box className="text-ocean-800" size={20} />
                <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">{t('Komponen Pengemasan', 'Packing Components')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('BARANG SUMBER', 'SOURCE ITEM')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Semi').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('GRADE SUMBER', 'SOURCE GRADE')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                    <option value="">--</option>
                    {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KUANTITAS SUMBER (KG)', 'SOURCE QTY (KG)')}</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-black" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('BAHAN KEMASAN', 'PACKAGING MATERIAL')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                    <option value="">{t('-- Pilih Kemasan --', '-- Select Packaging --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Packaging').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <Package className="text-emerald-500" size={20} />
                <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">{t('Produk Jadi', 'Finished Product')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('BARANG HASIL', 'OUTPUT ITEM')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Finished').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('GRADE HASIL', 'OUTPUT GRADE')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                    <option value="">--</option>
                    {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-700">{t('KUANTITAS HASIL (KG)', 'OUTPUT QTY (KG)')}</label>
                  <input type="number" className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-emerald-900" placeholder="0.00" />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-10">
            <Card className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Status Stok', 'Stock Status')}</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">{t('Loin Tersedia', 'Loin Available')}</span>
                   <span className="text-sm font-black text-ocean-800">120.0 kg</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">{t('Vakum Tersedia', 'Vac Available')}</span>
                   <span className="text-sm font-black text-ocean-800">450 pcs</span>
                 </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Pengemasan', 'Packing')} 
        subtitle={t('Kelola riwayat pengemasan produk', 'Manage product packing history')}
        action={<Button onClick={() => setView('form')}><Plus size={20} /> {t('Pengemasan Baru', 'New Packing')}</Button>}
      />

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari transaksi...', 'Search transactions...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
          <Button variant="secondary"><Filter size={18} /> {t('Filter', 'Filter')}</Button>
        </div>

        <Table 
          data={MOCK_PACKING}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold text-slate-500' },
            { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
            { 
              header: t('SUMBER', 'SOURCE'), 
              accessor: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-black text-slate-700">{item.sourceQty} kg</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t(MOCK_ITEMS.find(i => i.id === item.sourceItemId)?.nameId || '', MOCK_ITEMS.find(i => i.id === item.sourceItemId)?.nameEn || '')}</span>
                </div>
              )
            },
            { 
              header: t('KEMASAN', 'PACKAGING'), 
              accessor: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-black text-slate-700">{item.packagingQty} pcs</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t(MOCK_ITEMS.find(i => i.id === item.packagingItemId)?.nameId || '', MOCK_ITEMS.find(i => i.id === item.packagingItemId)?.nameEn || '')}</span>
                </div>
              )
            },
            { header: t('HASIL', 'OUTPUT'), accessor: (item: any) => <span className="font-black text-emerald-600">{item.outputQty} kg</span>, className: 'text-right' },
            { header: t('STATUS', 'STATUS'), accessor: (item: any) => <Badge variant={item.status === 'Posted' ? 'posted' : 'draft'}>{item.status}</Badge>, className: 'text-center' },
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
