import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  Save, 
  Send,
  ArrowLeft,
  Package,
  Box,
  Hash,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_PACKING, MOCK_ITEMS } from '../../mockData';

export const PackingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('Pengemasan Baru', 'New Packing')}</h1>
              <p className="text-slate-500 text-sm">{t('Proses pengemasan produk setengah jadi menjadi produk jadi', 'Process semi-finished products into finished goods')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Save size={18} />
              {t('Simpan Draft', 'Save Draft')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">
              <Send size={18} />
              {t('Post Pengemasan', 'Post Packing')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Box className="text-blue-500" size={18} />
                <h3 className="font-semibold text-slate-800">{t('Komponen Pengemasan', 'Packing Components')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Barang Sumber', 'Source Item')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Semi').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Kuantitas Sumber (kg)', 'Source Qty (kg)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Bahan Kemasan', 'Packaging Material')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Kemasan --', '-- Select Packaging --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Packaging').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Kuantitas Kemasan (pcs)', 'Packaging Qty (pcs)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Package className="text-emerald-500" size={18} />
                <h3 className="font-semibold text-slate-800">{t('Produk Jadi', 'Finished Product')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Barang Hasil', 'Output Item')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Finished').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-700">{t('Kuantitas Hasil (kg)', 'Output Qty (kg)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-bold" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-semibold text-slate-800 mb-4">{t('Status Stok', 'Stock Status')}</h3>
               <div className="space-y-2 text-xs">
                 <div className="flex justify-between">
                   <span className="text-slate-500">{t('Tersedia (Semi)', 'Available (Semi)')}</span>
                   <span className="font-bold text-slate-800">120.0 kg</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-500">{t('Tersedia (Kemasan)', 'Available (Pack)')}</span>
                   <span className="font-bold text-slate-800">450 pcs</span>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-xl text-white">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{t('Ringkasan Packing', 'Packing Summary')}</h3>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Target Hasil', 'Output Target')}</span>
                   <span className="font-medium text-emerald-400">0 kg</span>
                 </div>
                 <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                   <span className="text-slate-400">{t('Total Item', 'Total Items')}</span>
                   <span className="text-lg font-bold">1</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('Pengemasan', 'Packing')}</h1>
          <p className="text-slate-500 text-sm">{t('Kelola riwayat pengemasan produk', 'Manage product packing history')}</p>
        </div>
        <button onClick={() => setView('form')} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-semibold">
          <Plus size={20} />
          {t('Pengemasan Baru', 'New Packing')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={t('Cari transaksi...', 'Search transactions...')} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white text-sm font-medium"><Filter size={16} />{t('Filter', 'Filter')}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">{t('Tanggal', 'Date')}</th>
                <th className="px-6 py-4">{t('No. Transaksi', 'ID')}</th>
                <th className="px-6 py-4">{t('Sumber', 'Source')}</th>
                <th className="px-6 py-4">{t('Kemasan', 'Packaging')}</th>
                <th className="px-6 py-4 text-right">{t('Hasil', 'Output')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_PACKING.map((item) => {
                const source = MOCK_ITEMS.find(i => i.id === item.sourceItemId);
                const pack = MOCK_ITEMS.find(i => i.id === item.packagingItemId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{item.sourceQty} kg</span>
                      <div className="text-xs text-slate-400">{t(source?.nameId || '', source?.nameEn || '')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{item.packagingQty} pcs</span>
                      <div className="text-xs text-slate-400">{t(pack?.nameId || '', pack?.nameEn || '')}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">{item.outputQty} kg</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><ChevronRight size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
