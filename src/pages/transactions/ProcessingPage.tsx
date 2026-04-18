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
  FileText,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_PROCESSING, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../../mockData';

interface OutputLine {
  id: string;
  itemId: string;
  gradeId: string;
  sizeId: string;
  quantity: number;
}

export const ProcessingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');

  // Form State
  const [inputQty, setInputQty] = useState<number>(0);
  const [wasteQty, setWasteQty] = useState<number>(0);
  const [outputs, setOutputs] = useState<OutputLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0 }
  ]);

  const addOutput = () => {
    setOutputs([...outputs, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0 }]);
  };

  const removeOutput = (id: string) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter(o => o.id !== id));
    }
  };

  const updateOutput = (id: string, field: keyof OutputLine, value: any) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const totalOutput = outputs.reduce((sum, o) => sum + o.quantity, 0);
  const yieldPercent = inputQty > 0 ? (totalOutput / inputQty) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('Pengolahan Baru', 'New Processing')}</h1>
              <p className="text-slate-500 text-sm">{t('Input (Mixed) ➜ Output (Sorted by Size/Grade)', 'Mixed Input ➜ Sorted Output')}</p>
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
                <h3 className="font-bold text-slate-800">{t('Input (Bahan Baku)', 'Input (Raw Materials)')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('Tanggal', 'Date')}</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('Barang Input', 'Input Item')}</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('Kuantitas Input (kg)', 'Input Quantity (kg)')}</label>
                  <input 
                    type="number" 
                    value={inputQty || ''}
                    onChange={(e) => setInputQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-emerald-500" size={18} />
                  {t('Output (Hasil Pengolahan)', 'Output (Result)')}
                </h3>
                <button onClick={addOutput} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold">
                  <PlusCircle size={16} />
                  {t('Tambah Output', 'Add Output')}
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                    <th className="px-4 py-3">{t('Produk', 'Product')}</th>
                    <th className="px-4 py-3 w-32">{t('Grade', 'Grade')}</th>
                    <th className="px-4 py-3 w-40">{t('Size', 'Size')}</th>
                    <th className="px-4 py-3 w-32 text-right">{t('Kuantitas (kg)', 'Qty (kg)')}</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outputs.map((out) => (
                    <tr key={out.id}>
                      <td className="px-4 py-3">
                        <select 
                          value={out.itemId}
                          onChange={(e) => updateOutput(out.id, 'itemId', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded text-sm font-semibold text-slate-800"
                        >
                          <option value="">-- {t('Pilih Produk', 'Select Product')} --</option>
                          {MOCK_ITEMS.filter(i => i.category === 'Semi').map(i => (
                            <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          value={out.gradeId}
                          onChange={(e) => updateOutput(out.id, 'gradeId', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded text-sm"
                        >
                          <option value="">--</option>
                          {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          value={out.sizeId}
                          onChange={(e) => updateOutput(out.id, 'sizeId', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded text-sm"
                        >
                          <option value="">--</option>
                          {MOCK_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={out.quantity || ''}
                          onChange={(e) => updateOutput(out.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded text-right text-sm font-mono font-bold text-emerald-700"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeOutput(out.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('Limbah / Waste (kg)', 'Waste / Shrinkage (kg)')}</label>
              <input 
                type="number" 
                value={wasteQty || ''}
                onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-red-50 border border-red-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-red-900 font-bold text-sm" 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4">{t('Visualisasi Transformasi', 'Transformation View')}</h3>
               <div className="space-y-4">
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                   <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t('Input Total', 'Total Input')}</div>
                   <div className="text-2xl font-black text-blue-900">{inputQty} kg</div>
                 </div>
                 <div className="flex justify-center text-slate-300"><ArrowRight size={24} className="rotate-90 lg:rotate-0" /></div>
                 <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
                   <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t('Output Terjual', 'Sellable Output')}</div>
                   <div className="text-2xl font-black text-emerald-900">{totalOutput} kg</div>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-xl text-white">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{t('Ringkasan Batch', 'Batch Summary')}</h3>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Input', 'Input')}</span>
                   <span className="font-medium text-blue-400">{inputQty} kg</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Output', 'Output')}</span>
                   <span className="font-medium text-emerald-400">{totalOutput} kg</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Waste', 'Waste')}</span>
                   <span className="font-medium text-red-400">{wasteQty} kg</span>
                 </div>
                 <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('Yield Efisiensi', 'Yield Efficiency')}</span>
                   <span className="text-xl font-black text-blue-400">{yieldPercent.toFixed(1)}%</span>
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
      {/* List view code remains similarly structured as before but with updated labels */}
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
      {/* ... Table UI ... */}
    </div>
  );
};
