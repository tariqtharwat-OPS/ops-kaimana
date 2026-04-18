import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  ChevronRight, 
  Filter, 
  Save, 
  Send,
  Trash2,
  ArrowLeft,
  PlusCircle,
  Package,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_RECEIVING, MOCK_SUPPLIERS, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../../mockData';

interface ReceivingLine {
  id: string;
  itemId: string;
  gradeId: string;
  sizeId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [lines, setLines] = useState<ReceivingLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof ReceivingLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        updated.total = updated.quantity * updated.unitPrice;
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
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Penerimaan Baru', 'New Receiving')}</h1>
              <p className="text-slate-500 font-medium">{t('Dokumen penerimaan multi-item dari supplier', 'Multi-item receiving document from supplier')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="premium-button-secondary"><Save size={18} /> {t('Simpan Draft', 'Save Draft')}</button>
            <button className="premium-button-primary"><Send size={18} /> {t('Post Dokumen', 'Post Document')}</button>
          </div>
        </div>

        <div className="premium-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NOMOR DOKUMEN', 'DOCUMENT NO.')}</label>
              <input type="text" className="premium-input bg-slate-100 font-black" value="RCV-AUTO-GEN" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
              <input type="date" className="premium-input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUPPLIER', 'SUPPLIER')}</label>
              <select className="premium-input font-bold">
                <option value="">-- {t('Pilih Supplier', 'Select Supplier')} --</option>
                {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUMBER BARANG', 'SOURCE TYPE')}</label>
              <select className="premium-input">
                <option>Lokal</option>
                <option>Import</option>
              </select>
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('CATATAN', 'NOTES')}</label>
            <textarea className="premium-input min-h-[100px]" placeholder={t('Tambahkan catatan dokumen...', 'Add document notes...')}></textarea>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Package className="text-blue-500" size={20} />
              {t('Item Penerimaan', 'Receiving Items')}
            </h3>
            <button onClick={addLine} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-xs font-black uppercase tracking-widest">
              <PlusCircle size={16} />
              {t('Tambah Baris', 'Add Line')}
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">{t('NAMA IKAN / BARANG', 'FISH / ITEM NAME')}</th>
                <th className="px-6 py-4 w-32">{t('GRADE', 'GRADE')}</th>
                <th className="px-6 py-4 w-32">{t('SIZE', 'SIZE')}</th>
                <th className="px-6 py-4 w-24 text-right">{t('QTY', 'QTY')}</th>
                <th className="px-6 py-4 w-24">{t('UNIT', 'UNIT')}</th>
                <th className="px-6 py-4 w-40 text-right">{t('HARGA', 'PRICE')}</th>
                <th className="px-6 py-4 w-40 text-right">{t('TOTAL', 'TOTAL')}</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <select 
                      value={line.itemId}
                      onChange={(e) => updateLine(line.id, 'itemId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900"
                    >
                      <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                      {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => (
                        <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <select 
                      value={line.gradeId}
                      onChange={(e) => updateLine(line.id, 'gradeId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600"
                    >
                      <option value="">--</option>
                      {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <select 
                      value={line.sizeId}
                      onChange={(e) => updateLine(line.id, 'sizeId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600"
                    >
                      <option value="">--</option>
                      {MOCK_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number" 
                      value={line.quantity || ''}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-sm font-black text-slate-900"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-3 text-xs font-black text-slate-400">KG</td>
                  <td className="px-6 py-3">
                    <input 
                      type="number" 
                      value={line.unitPrice || ''}
                      onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-sm font-black text-slate-900"
                      placeholder="0"
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
                <td colSpan={6} className="px-8 py-5 text-sm font-black text-right uppercase tracking-[0.2em]">{t('TOTAL KESELURUHAN', 'GRAND TOTAL')}</td>
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Penerimaan', 'Receiving')}</h1>
          <p className="text-slate-500 font-medium">{t('Kelola dokumen masuk dari supplier', 'Manage incoming documents from suppliers')}</p>
        </div>
        <button onClick={() => setView('form')} className="premium-button-primary">
          <Plus size={20} />
          {t('Penerimaan Baru', 'New Receiving')}
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={t('Cari dokumen...', 'Search documents...')} className="premium-input pl-12" />
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
                <th className="px-8 py-5">{t('NO. DOKUMEN', 'DOC NO.')}</th>
                <th className="px-8 py-5">{t('SUPPLIER', 'SUPPLIER')}</th>
                <th className="px-8 py-5 text-right">{t('TOTAL', 'TOTAL')}</th>
                <th className="px-8 py-5 text-center">{t('STATUS', 'STATUS')}</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_RECEIVING.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{doc.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{doc.id}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{MOCK_SUPPLIERS.find(s => s.id === doc.supplierId)?.name}</td>
                  <td className="px-8 py-5 text-sm font-black text-blue-600 text-right">Rp {doc.grandTotal.toLocaleString('id-ID')}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`status-badge ${doc.status === 'Posted' ? 'status-posted' : 'status-draft'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <Link to={`/print/receiving/${doc.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 inline-block">
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
