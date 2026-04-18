import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  UserPlus, 
  History, 
  TrendingUp, 
  AlertCircle,
  Tag,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../mockData';

// Mock Stock Data expanded to include Grade, Size, and Buyer
const MOCK_STOCK_DETAILED = [
  { id: 'st1', itemId: 'i2', gradeId: 'g1', sizeId: 'sz2', qty: 450, unit: 'kg', buyerId: null },
  { id: 'st2', itemId: 'i2', gradeId: 'g1', sizeId: 'sz3', qty: 300, unit: 'kg', buyerId: 'b1' },
  { id: 'st3', itemId: 'i3', gradeId: 'g1', sizeId: 'sz2', qty: 150, unit: 'kg', buyerId: 'b2' },
  { id: 'st4', itemId: 'i1', gradeId: 'g2', sizeId: 'sz4', qty: 1200, unit: 'kg', buyerId: null },
];

const MOCK_BUYERS = [
  { id: 'b1', name: 'Buyer John' },
  { id: 'b2', name: 'Buyer Sarah' },
];

export const StockPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('Stok & Inventaris', 'Stock & Inventory')}</h1>
          <p className="text-slate-500 text-sm">{t('Pemantauan stok berdasarkan Item + Grade + Size', 'Stock monitoring by Item + Grade + Size')}</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white text-sm font-bold shadow-sm transition-all">
             <History size={18} />
             {t('Riwayat Pergerakan', 'Movement History')}
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-200 transition-all">
             <TrendingUp size={18} />
             {t('Prediksi Stok', 'Stock Prediction')}
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Total Stok', 'Total Stock')}</p>
            <h3 className="text-2xl font-black text-slate-900">2,100 kg</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Ter-Alokasi', 'Assigned')}</p>
            <h3 className="text-2xl font-black text-slate-900">450 kg</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Stok Bebas', 'Free Stock')}</p>
            <h3 className="text-2xl font-black text-slate-900">1,650 kg</h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button 
               onClick={() => setActiveTab('all')}
               className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {t('Semua Stok', 'All Stock')}
             </button>
             <button 
               onClick={() => setActiveTab('assigned')}
               className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'assigned' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {t('Alokasi Buyer', 'Buyer Allocation')}
             </button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder={t('Cari barang/grade/size...', 'Search item/grade/size...')} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">{t('Barang / Produk', 'Item / Product')}</th>
                <th className="px-6 py-4">{t('Grade', 'Grade')}</th>
                <th className="px-6 py-4">{t('Size', 'Size')}</th>
                <th className="px-6 py-4 text-right">{t('Kuantitas', 'Quantity')}</th>
                <th className="px-6 py-4">{t('Alokasi Buyer', 'Buyer Assignment')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_STOCK_DETAILED.filter(s => activeTab === 'all' || s.buyerId !== null).map((item) => {
                const product = MOCK_ITEMS.find(i => i.id === item.itemId);
                const grade = MOCK_GRADES.find(g => g.id === item.gradeId);
                const size = MOCK_SIZES.find(sz => sz.id === item.sizeId);
                const buyer = MOCK_BUYERS.find(b => b.id === item.buyerId);
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="text-sm font-bold text-slate-900">{t(product?.nameId || '', product?.nameEn || '')}</div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{product?.item_code}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{grade?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-600">{size?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="text-sm font-black text-slate-900">{item.qty.toLocaleString('id-ID')} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                       {buyer ? (
                         <div className="flex items-center gap-2 text-blue-600">
                           <UserCheck size={14} />
                           <span className="text-xs font-bold">{buyer.name}</span>
                         </div>
                       ) : (
                         <button className="flex items-center gap-1.5 px-3 py-1 border border-dashed border-slate-300 rounded text-[10px] font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                           <UserPlus size={12} />
                           {t('Tugaskan Buyer', 'Assign Buyer')}
                         </button>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={18} /></button>
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
