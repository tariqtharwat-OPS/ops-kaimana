import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Save, 
  Send, 
  ArrowLeft, 
  CreditCard, 
  PlusCircle, 
  Trash2, 
  ChevronRight, 
  Filter,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_EXPENSES } from '../../mockData';

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
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Biaya Baru', 'New Expense')}</h1>
              <p className="text-slate-500 font-medium">{t('Input pengeluaran operasional multi-item', 'Input multi-item operational expenses')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="premium-button-secondary"><Save size={18} /> {t('Simpan Draft', 'Save Draft')}</button>
             <button className="premium-button-primary"><Send size={18} /> {t('Post Biaya', 'Post Expense')}</button>
          </div>
        </div>

        <div className="premium-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
              <input type="date" className="premium-input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NO. REFERENSI', 'REF NO.')}</label>
              <input type="text" className="premium-input font-black" placeholder="e.g. INV/2024/001" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('METODE PEMBAYARAN', 'PAYMENT METHOD')}</label>
              <select className="premium-input font-bold">
                <option>Cash</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" />
              {t('Rincian Biaya', 'Expense Details')}
            </h3>
            <button onClick={addLine} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-xs font-black uppercase tracking-widest">
              <PlusCircle size={16} />
              {t('Tambah Baris', 'Add Line')}
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">{t('KATEGORI', 'CATEGORY')}</th>
                <th className="px-6 py-4">{t('DESKRIPSI', 'DESCRIPTION')}</th>
                <th className="px-6 py-4 w-24 text-right">{t('QTY', 'QTY')}</th>
                <th className="px-6 py-4 w-32 text-right">{t('HARGA', 'PRICE')}</th>
                <th className="px-6 py-4 w-40 text-right">{t('TOTAL', 'TOTAL')}</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-6 py-3">
                    <select 
                      value={line.category}
                      onChange={(e) => updateLine(line.id, 'category', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900"
                    >
                      <option value="">-- {t('Pilih Kategori', 'Category')} --</option>
                      <option>Ice / Es</option>
                      <option>Electricity / Listrik</option>
                      <option>Fuel / BBM</option>
                      <option>Salaries / Gaji</option>
                      <option>Repair / Perbaikan</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="text" 
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600"
                      placeholder={t('Keterangan...', 'Description...')}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number" 
                      value={line.qty || ''}
                      onChange={(e) => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-sm font-black text-slate-900"
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input 
                      type="number" 
                      value={line.price || ''}
                      onChange={(e) => updateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-sm font-black text-slate-900"
                    />
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-black text-blue-600">
                    Rp {line.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => removeLine(line.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0f172a] text-white">
                <td colSpan={4} className="px-8 py-5 text-sm font-black text-right uppercase tracking-[0.2em]">{t('TOTAL PENGELUARAN', 'GRAND TOTAL')}</td>
                <td className="px-6 py-5 text-right text-xl font-black text-blue-400">
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Biaya Operasional', 'Expenses')}</h1>
          <p className="text-slate-500 font-medium">{t('Kelola pengeluaran harian plant', 'Manage daily plant expenses')}</p>
        </div>
        <button onClick={() => setView('form')} className="premium-button-primary">
          <Plus size={20} />
          {t('Input Biaya', 'Input Expense')}
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={t('Cari pengeluaran...', 'Search expenses...')} className="premium-input pl-12" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="premium-button-secondary flex-1 md:flex-none"><Filter size={18} /> {t('Filter', 'Filter')}</button>
            <button className="premium-button-secondary flex-1 md:flex-none"><Printer size={18} /> {t('Cetak', 'Print')}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-8 py-5">{t('TANGGAL', 'DATE')}</th>
                <th className="px-8 py-5">{t('NO. REFERENSI', 'REF NO.')}</th>
                <th className="px-8 py-5 text-right">{t('TOTAL', 'TOTAL')}</th>
                <th className="px-8 py-5 text-center">{t('STATUS', 'STATUS')}</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_EXPENSES.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{exp.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{exp.id}</td>
                  <td className="px-8 py-5 text-sm font-black text-blue-600 text-right">Rp {exp.grandTotal.toLocaleString('id-ID')}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`status-badge ${exp.status === 'Posted' ? 'status-posted' : 'status-draft'}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <Link to={`/print/expense/${exp.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 inline-block">
                      <FileText size={18} />
                    </Link>
                    <button className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
