import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Save, 
  Send,
  ArrowLeft,
  Calendar,
  CreditCard,
  PlusCircle,
  Trash2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ExpenseLine {
  id: string;
  category: string;
  description: string;
  qty: number;
  price: number;
  total: number;
}

export const ExpensesPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  
  const [lines, setLines] = useState<ExpenseLine[]>([
    { id: '1', category: '', description: '', qty: 1, price: 0, total: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), category: '', description: '', qty: 1, price: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof ExpenseLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        updated.total = updated.qty * updated.price;
        return updated;
      }
      return line;
    }));
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0);

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('Biaya Baru', 'New Expense')}</h1>
              <p className="text-slate-500 text-sm">{t('Input pengeluaran operasional multi-item', 'Input multi-item operational expenses')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
               <Save size={18} />
               {t('Simpan Draft', 'Save Draft')}
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">
               <Send size={18} />
               {t('Post Biaya', 'Post Expense')}
             </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Tanggal', 'Date')}</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('No. Referensi', 'Ref No.')}</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. INV/2024/001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Metode Pembayaran', 'Payment Method')}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option>Cash</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-500" />
              {t('Rincian Biaya', 'Expense Details')}
            </h3>
            <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold">
              <PlusCircle size={16} />
              {t('Tambah Baris', 'Add Line')}
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="px-4 py-3">{t('Kategori', 'Category')}</th>
                <th className="px-4 py-3">{t('Deskripsi', 'Description')}</th>
                <th className="px-4 py-3 w-24 text-right">{t('Qty', 'Qty')}</th>
                <th className="px-4 py-3 w-32 text-right">{t('Harga', 'Price')}</th>
                <th className="px-4 py-3 w-32 text-right">{t('Total', 'Total')}</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">
                    <select 
                      value={line.category}
                      onChange={(e) => updateLine(line.id, 'category', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-sm font-semibold"
                    >
                      <option value="">-- {t('Pilih Kategori', 'Category')} --</option>
                      <option>Ice / Es</option>
                      <option>Electricity / Listrik</option>
                      <option>Fuel / BBM</option>
                      <option>Salaries / Gaji</option>
                      <option>Repair / Perbaikan</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-sm"
                      placeholder={t('Keterangan...', 'Description...')}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={line.qty || ''}
                      onChange={(e) => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-right text-sm font-mono font-bold"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input 
                      type="number" 
                      value={line.price || ''}
                      onChange={(e) => updateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-right text-sm font-mono"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    Rp {line.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => removeLine(line.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td colSpan={4} className="px-6 py-4 text-sm font-bold text-right uppercase tracking-wider">{t('Total Pengeluaran', 'Grand Total')}</td>
                <td className="px-4 py-4 text-right text-lg font-black text-amber-400">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('Biaya Operasional', 'Expenses')}</h1>
          <p className="text-slate-500 text-sm">{t('Kelola pengeluaran harian plant', 'Manage daily plant expenses')}</p>
        </div>
        <button onClick={() => setView('form')} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-semibold">
          <Plus size={20} />
          {t('Input Biaya', 'Input Expense')}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={t('Cari pengeluaran...', 'Search expenses...')} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white text-sm font-medium"><Filter size={16} />{t('Filter', 'Filter')}</button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white text-sm font-medium"><Printer size={16} />{t('Cetak', 'Print')}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">{t('Tanggal', 'Date')}</th>
                <th className="px-6 py-4">{t('No. Referensi', 'Ref No.')}</th>
                <th className="px-6 py-4">{t('Total', 'Total')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              <tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 text-slate-600">2026-04-18</td>
                <td className="px-6 py-4 text-slate-900 font-bold">EXP-2604-001</td>
                <td className="px-6 py-4 text-slate-900 font-bold">Rp 500.000</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-100 text-emerald-700 border-emerald-200">
                    Posted
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><ChevronRight size={18} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
