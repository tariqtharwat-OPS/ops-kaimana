import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  Save, 
  Send,
  ArrowLeft,
  Calendar,
  Layers,
  Activity,
  Trash2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_PROCESSING, MOCK_ITEMS } from '../../mockData';

export const ProcessingPage: React.FC = () => {
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
              <h1 className="text-2xl font-bold text-slate-900">{t('Pengolahan Baru', 'New Processing')}</h1>
              <p className="text-slate-500 text-sm">{t('Konversi bahan mentah menjadi produk setengah jadi', 'Convert raw materials to semi-finished products')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Save size={18} />
              {t('Simpan Draft', 'Save Draft')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">
              <Send size={18} />
              {t('Post Pengolahan', 'Post Processing')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layers className="text-blue-500" size={18} />
                <h3 className="font-semibold text-slate-800">{t('Input (Bahan Baku)', 'Input (Raw Materials)')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Tanggal', 'Date')}</label>
                  <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Barang Input', 'Input Item')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Batch Sumber', 'Source Batch')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Batch --', '-- Select Batch --')}</option>
                    <option>BATCH-2604-001 (500 kg)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Kuantitas Input (kg)', 'Input Quantity (kg)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Activity className="text-emerald-500" size={18} />
                <h3 className="font-semibold text-slate-800">{t('Output (Hasil Pengolahan)', 'Output (Result)')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Barang Output', 'Output Item')}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Semi').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Kuantitas Output (kg)', 'Output Quantity (kg)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-700">{t('Limbah/Waste (kg)', 'Waste (kg)')}</label>
                  <input type="number" className="w-full px-3 py-2 bg-red-50 border border-red-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-red-900 font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('Yield (%)', 'Yield (%)')}</label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-bold">
                    0%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-semibold text-slate-800 mb-4">{t('Instruksi', 'Instructions')}</h3>
               <p className="text-xs text-slate-500 leading-relaxed mb-4">
                 {t('Pilih batch bahan baku yang akan diproses. Sistem akan secara otomatis mengurangi stok bahan baku dan menambah stok barang setengah jadi saat diposting.', 'Select the raw material batch to process. The system will automatically reduce raw material stock and increase semi-finished stock when posted.')}
               </p>
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                 <FileText size={16} className="text-blue-500" />
                 <span className="text-xs font-medium text-blue-700">{t('Metode: Rata-rata Tertimbang', 'Method: Weighted Average')}</span>
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-xl text-white">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{t('Ringkasan Batch', 'Batch Summary')}</h3>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Total Input', 'Total Input')}</span>
                   <span className="font-medium text-blue-400">0 kg</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Total Output', 'Total Output')}</span>
                   <span className="font-medium text-emerald-400">0 kg</span>
                 </div>
                 <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                   <span className="text-slate-400">{t('Susut / Loss', 'Shrinkage')}</span>
                   <span className="text-lg font-bold text-red-400">0 kg</span>
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
          <h1 className="text-2xl font-bold text-slate-900">{t('Pengolahan', 'Processing')}</h1>
          <p className="text-slate-500 text-sm">{t('Kelola riwayat konversi produk', 'Manage product conversion history')}</p>
        </div>
        <button onClick={() => setView('form')} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-semibold">
          <Plus size={20} />
          {t('Pengolahan Baru', 'New Processing')}
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
                <th className="px-6 py-4">{t('Input', 'Input')}</th>
                <th className="px-6 py-4">{t('Output', 'Output')}</th>
                <th className="px-6 py-4 text-right">{t('Waste', 'Waste')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_PROCESSING.map((item) => {
                const input = MOCK_ITEMS.find(i => i.id === item.inputItemId);
                const output = MOCK_ITEMS.find(i => i.id === item.outputItemId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{item.inputQty} kg</span>
                      <div className="text-xs text-slate-400">{t(input?.nameId || '', input?.nameEn || '')}</div>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">
                      {item.outputQty} kg
                      <div className="text-xs text-slate-400 font-normal">{t(output?.nameId || '', output?.nameEn || '')}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-red-500 font-medium">{item.wasteQty} kg</td>
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
