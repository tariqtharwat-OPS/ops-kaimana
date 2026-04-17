import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  ChevronRight, 
  Filter, 
  MoreVertical, 
  Save, 
  Send,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_RECEIVING, MOCK_SUPPLIERS, MOCK_ITEMS } from '../../mockData';

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="space-y-6 animate-in fade-in duration-500">
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
              <p className="text-slate-500 text-sm">{t('Input data penerimaan barang dari supplier', 'Input receiving data from supplier')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Save size={18} />
              {t('Simpan Draft', 'Save Draft')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">
              <Send size={18} />
              {t('Post ke Stok', 'Post to Stock')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">{t('Informasi Utama', 'Primary Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {t('Tanggal', 'Date')}
                  </label>
                  <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    {t('Supplier', 'Supplier')}
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    <option value="">{t('-- Pilih Supplier --', '-- Select Supplier --')}</option>
                    {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Package size={14} className="text-slate-400" />
                    {t('Barang', 'Item')}
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    <option value="">{t('-- Pilih Barang --', '-- Select Item --')}</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash size={14} className="text-slate-400" />
                    {t('Kuantitas (kg)', 'Quantity (kg)')}
                  </label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-400" />
                    {t('Harga Satuan', 'Unit Price')}
                  </label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Rp 0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('Total Harga', 'Total Price')}
                  </label>
                  <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-bold">
                    Rp 0
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText size={14} className="text-slate-400" />
                {t('Catatan', 'Notes')}
              </label>
              <textarea rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={t('Tambahkan catatan...', 'Add notes...')}></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-semibold text-slate-800 mb-4">{t('Status Transaksi', 'Transaction Status')}</h3>
               <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm font-medium mb-4">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                 {t('Draf Baru', 'New Draft')}
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                 {t('Transaksi belum masuk ke stok. Anda dapat menyimpan sebagai draf dan melanjutkannya nanti.', 'Transaction has not entered stock yet. You can save as draft and continue later.')}
               </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-xl text-white">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{t('Ringkasan', 'Summary')}</h3>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">{t('Subtotal', 'Subtotal')}</span>
                   <span className="font-medium">Rp 0</span>
                 </div>
                 <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                   <span className="text-slate-400">{t('Total', 'Total')}</span>
                   <span className="text-xl font-bold text-blue-400">Rp 0</span>
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
          <h1 className="text-2xl font-bold text-slate-900">{t('Penerimaan', 'Receiving')}</h1>
          <p className="text-slate-500 text-sm">{t('Kelola transaksi barang masuk dari supplier', 'Manage incoming goods from suppliers')}</p>
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
                <th className="px-6 py-4">{t('No. Transaksi', 'Transaction No.')}</th>
                <th className="px-6 py-4">{t('Supplier', 'Supplier')}</th>
                <th className="px-6 py-4">{t('Barang', 'Item')}</th>
                <th className="px-6 py-4 text-right">{t('Kuantitas', 'Quantity')}</th>
                <th className="px-6 py-4 text-right">{t('Total', 'Total')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_RECEIVING.map((item) => {
                const supplier = MOCK_SUPPLIERS.find(s => s.id === item.supplierId);
                const rawItem = MOCK_ITEMS.find(i => i.id === item.itemId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.id}</td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-semibold text-slate-800">{supplier?.name}</div>
                       <div className="text-xs text-slate-400">{supplier?.address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t(rawItem?.nameId || '', rawItem?.nameEn || '')}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono font-semibold text-slate-700">{item.quantity} kg</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">Rp {item.totalPrice.toLocaleString('id-ID')}</td>
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
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
           <div>{t('Menampilkan 2 dari 2 transaksi', 'Showing 2 of 2 transactions')}</div>
           <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">Prev</button>
             <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};
