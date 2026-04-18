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
  Calendar,
  User,
  Hash,
  FileText,
  Package,
  PlusCircle,
  MoreVertical
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [lines, setLines] = useState<ReceivingLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'kg', unitPrice: 0, total: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'kg', unitPrice: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof ReceivingLine, value: any) => {
    const newLines = lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        // Auto-update unit if item changes
        if (field === 'itemId') {
          const item = MOCK_ITEMS.find(i => i.id === value);
          updatedLine.unit = item?.default_unit || 'kg';
        }
        // Auto-calculate total
        updatedLine.total = updatedLine.quantity * updatedLine.unitPrice;
        return updatedLine;
      }
      return line;
    });
    setLines(newLines);
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('Penerimaan Baru', 'New Receiving')}</h1>
              <p className="text-slate-500 text-sm">{t('Dokumen penerimaan multi-item dari supplier', 'Multi-item receiving document from supplier')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Save size={18} />
              {t('Simpan Draft', 'Save Draft')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">
              <Send size={18} />
              {t('Post Dokumen', 'Post Document')}
            </button>
          </div>
        </div>

        {/* Document Header Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('No. Dokumen', 'Document No.')}</label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 font-mono text-sm">
                RCV-AUTO-GEN
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Tanggal', 'Date')}</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Supplier', 'Supplier')}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                <option value="">{t('-- Pilih Supplier --', '-- Select Supplier --')}</option>
                {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Tipe Sumber', 'Source Type')}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                <option value="Local">Lokal</option>
                <option value="Import">Impor</option>
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Catatan', 'Notes')}</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder={t('Tambahkan catatan dokumen...', 'Add document notes...')}></textarea>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Package size={18} className="text-blue-500" />
              {t('Item Penerimaan', 'Receiving Items')}
            </h3>
            <button 
              onClick={addLine}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold"
            >
              <PlusCircle size={16} />
              {t('Tambah Baris', 'Add Line')}
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="px-4 py-3 w-1/4">{t('Nama Ikan / Item', 'Fish / Item Name')}</th>
                <th className="px-4 py-3 w-32">{t('Grade', 'Grade')}</th>
                <th className="px-4 py-3 w-40">{t('Size / Ukuran', 'Size')}</th>
                <th className="px-4 py-3 w-24 text-right">{t('Qty', 'Qty')}</th>
                <th className="px-4 py-3 w-20">{t('Unit', 'Unit')}</th>
                <th className="px-4 py-3 w-32 text-right">{t('Harga Satuan', 'Price')}</th>
                <th className="px-4 py-3 w-32 text-right">{t('Total', 'Total')}</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line, index) => (
                <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <select 
                      value={line.itemId}
                      onChange={(e) => updateLine(line.id, 'itemId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-sm font-semibold text-slate-800"
                    >
                      <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                      {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => (
                        <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={line.gradeId}
                      onChange={(e) => updateLine(line.id, 'gradeId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-sm text-slate-600"
                    >
                      <option value="">--</option>
                      {MOCK_GRADES.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={line.sizeId}
                      onChange={(e) => updateLine(line.id, 'sizeId', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-sm text-slate-600"
                    >
                      <option value="">--</option>
                      {MOCK_SIZES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={line.quantity || ''}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-right text-sm font-mono font-bold"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-bold uppercase">{line.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <input 
                      type="number" 
                      value={line.unitPrice || ''}
                      onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded text-right text-sm font-mono"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    Rp {line.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => removeLine(line.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td colSpan={6} className="px-6 py-4 text-sm font-bold text-right uppercase tracking-wider">{t('Total Keseluruhan', 'Grand Total')}</td>
                <td className="px-4 py-4 text-right text-lg font-black text-blue-400">
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
          <h1 className="text-2xl font-bold text-slate-900">{t('Penerimaan', 'Receiving')}</h1>
          <p className="text-slate-500 text-sm">{t('Kelola dokumen penerimaan barang masuk', 'Manage incoming goods receiving documents')}</p>
        </div>
        <button 
          onClick={() => setView('form')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-semibold"
        >
          <Plus size={20} />
          {t('Penerimaan Baru', 'New Receiving')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('Cari supplier atau ID...', 'Search supplier or ID...')}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-all text-sm font-medium">
              <Filter size={16} />
              {t('Filter', 'Filter')}
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-all text-sm font-medium">
              <Printer size={16} />
              {t('Cetak Daftar', 'Print List')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">{t('Tanggal', 'Date')}</th>
                <th className="px-6 py-4">{t('No. Dokumen', 'Doc No.')}</th>
                <th className="px-6 py-4">{t('Supplier', 'Supplier')}</th>
                <th className="px-6 py-4 text-right">{t('Grand Total', 'Grand Total')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_RECEIVING.map((item) => {
                const supplier = MOCK_SUPPLIERS.find(s => s.id === item.supplierId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.id}</td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-semibold text-slate-800">{supplier?.name}</div>
                       <div className="text-xs text-slate-400">{supplier?.address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">Rp {item.grandTotal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight size={18} />
                      </button>
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
