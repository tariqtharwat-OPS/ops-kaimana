import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
import { Badge } from '../components/ui/DesignSystem';
import { Loader2, Printer, ChevronLeft } from 'lucide-react';

export const PrintPage: React.FC = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  
  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: buyers } = useMasterData('buyers', true);

  const { data: sourceData } = useMasterData(type || '', true);

  useEffect(() => {
    if (sourceData && id) {
      const found = sourceData.find((d: any) => d.id === id);
      setData(found);
    }
  }, [sourceData, id]);

  if (!data) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Actions - Hidden on Print */}
        <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-ocean-800 transition-colors">
             <ChevronLeft size={20} /> Back
           </button>
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-ocean-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-ocean-800/20 hover:bg-ocean-900 transition-all">
             <Printer size={20} /> Print to PDF
           </button>
        </div>

        {/* Document Content */}
        <div className="bg-white p-12 shadow-2xl rounded-[2rem] border border-slate-100 min-h-[11in] print:shadow-none print:border-none print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10 mb-10">
            <div className="space-y-4">
              <img src="/images/logo.png" alt="Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">PT. KAIMANA PLANT OPERATIONS</h1>
                <p className="text-xs font-bold text-slate-400">Jl. Pelabuhan Baru, Kaimana, Papua Barat</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">{type}</h2>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">DOCUMENT NO</p>
                <p className="text-lg font-black text-ocean-800">#{data.id?.substring(0, 8).toUpperCase()}</p>
                <p className="text-xs font-bold text-slate-600 uppercase mt-2">{new Date(data.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DARI / FROM</h3>
               <div className="font-black text-slate-900">
                  {type === 'receivings' ? suppliers.find(s => s.id === data.supplierId)?.name || 'General Supplier' : 'KAIMANA PLANT'}
               </div>
            </div>
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border-l-4 border-ocean-800">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UNTUK / TO</h3>
               <div className="font-black text-slate-900">
                  {type === 'sales' ? buyers.find(b => b.id === data.buyerId)?.name || 'General Buyer' : 'INTERNAL OPERATIONS'}
               </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item / Fish</th>
                <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Spec</th>
                <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">UOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(data.lines || data.inputs || data.outputs || []).map((line: any, i: number) => (
                <tr key={i}>
                  <td className="py-4">
                    <p className="font-black text-slate-900">{items.find(it => it.id === line.itemId)?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{items.find(it => it.id === line.itemId)?.englishName}</p>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                       {line.gradeId && <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{grades.find(g => g.id === line.gradeId)?.name}</span>}
                       {line.sizeId && <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{sizes.find(s => s.id === line.sizeId)?.name}</span>}
                    </div>
                  </td>
                  <td className="py-4 text-right font-black text-slate-900">{line.quantity?.toLocaleString()}</td>
                  <td className="py-4 text-right font-bold text-slate-400 uppercase">KG</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer / Signs */}
          <div className="grid grid-cols-3 gap-8 mt-auto pt-20">
            <div className="text-center space-y-16">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PREPARED BY</p>
               <div className="border-b border-slate-200 mx-8"></div>
               <p className="text-[10px] font-bold text-slate-300">Operations Officer</p>
            </div>
            <div className="text-center space-y-16">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VERIFIED BY</p>
               <div className="border-b border-slate-200 mx-8"></div>
               <p className="text-[10px] font-bold text-slate-300">Plant Manager</p>
            </div>
            <div className="text-center space-y-16">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RECEIVED BY</p>
               <div className="border-b border-slate-200 mx-8"></div>
               <p className="text-[10px] font-bold text-slate-300">Driver / Recipient</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
