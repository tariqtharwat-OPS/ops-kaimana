import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Package, Search, Filter, Database, UserCheck } from 'lucide-react';
import { MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../../mockData';

const MOCK_BUYER_STOCK = [
  { id: 'st2', itemId: 'i2', gradeId: 'g1', sizeId: 'sz3', qty: 300, unit: 'kg' },
];

export const BuyerView: React.FC = () => {
  const { t } = useLanguage();
  const buyerName = "Buyer John";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">{t(`Stok Alokasi: ${buyerName}`, `Assigned Stock: ${buyerName}`)}</h1>
          <p className="text-blue-100 font-medium">{t('Berikut adalah daftar stok yang tersedia untuk dipesan', 'List of available stock for your orders')}</p>
        </div>
        <Database className="absolute -right-4 -bottom-4 text-blue-500 w-48 h-48 opacity-20 rotate-12" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Package size={18} className="text-blue-500" />
             {t('Inventaris Anda', 'Your Inventory')}
           </h3>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input type="text" placeholder={t('Cari...', 'Search...')} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">{t('Barang', 'Item')}</th>
                <th className="px-6 py-4">{t('Grade', 'Grade')}</th>
                <th className="px-6 py-4">{t('Size', 'Size')}</th>
                <th className="px-6 py-4 text-right">{t('Kuantitas Tersedia', 'Available Qty')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_BUYER_STOCK.map((item) => {
                const product = MOCK_ITEMS.find(i => i.id === item.itemId);
                const grade = MOCK_GRADES.find(g => g.id === item.gradeId);
                const size = MOCK_SIZES.find(sz => sz.id === item.sizeId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{t(product?.nameId || '', product?.nameEn || '')}</td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{grade?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{size?.name}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="text-lg font-black text-blue-600">{item.qty.toLocaleString('id-ID')} {item.unit}</div>
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
