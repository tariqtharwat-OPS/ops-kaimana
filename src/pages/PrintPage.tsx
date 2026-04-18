import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_RECEIVING, MOCK_SUPPLIERS, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../mockData';

export const PrintPage: React.FC = () => {
  const { type, id } = useParams<{ type: string, id: string }>();

  if (type === 'receiving') {
    const doc = MOCK_RECEIVING.find(r => r.id === id) || MOCK_RECEIVING[0];
    const supplier = MOCK_SUPPLIERS.find(s => s.id === doc.supplierId);

    return (
      <div className="bg-white min-h-screen py-4 px-4">
        <div className="A4-page mx-auto shadow-none border-none animate-in fade-in duration-500">
          {/* Header - Compact */}
          <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
            <div className="flex gap-6 items-center">
              <img src="/images/logo.png" alt="Logo" className="h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{doc.sourceType === 'Lokal' ? 'Nota Penerimaan' : 'Goods Receipt'}</h1>
                <p className="text-slate-500 font-bold tracking-widest text-[8px] uppercase">PT. OPS Kaimana • Production Document</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document No.</p>
                <p className="text-lg font-black text-ocean-800 leading-tight">{doc.id}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                <p className="text-sm font-bold text-slate-900">{doc.date}</p>
              </div>
            </div>
          </div>

          {/* Supplier Info - Compact */}
          <div className="grid grid-cols-2 gap-10 mb-8 pb-6 border-b border-slate-100">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier</p>
              <h3 className="text-xl font-black text-slate-900 leading-tight">{supplier?.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                {supplier?.address || 'Kaimana, West Papua, Indonesia'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ship To</p>
              <h3 className="text-md font-black text-slate-900 leading-tight">Plant Kaimana</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                PT. OPS Kaimana • Jl. Pelabuhan Kaimana
              </p>
            </div>
          </div>

          {/* Table - Compact to fit 12 items */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 text-left text-[9px] font-black uppercase tracking-widest">Description</th>
                <th className="py-2 text-center text-[9px] font-black uppercase tracking-widest">Grade/Size</th>
                <th className="py-2 text-right text-[9px] font-black uppercase tracking-widest">Qty</th>
                <th className="py-2 text-right text-[9px] font-black uppercase tracking-widest">Price</th>
                <th className="py-2 text-right text-[9px] font-black uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(doc as any).lines.map((item: any, idx: number) => {
                const fish = MOCK_ITEMS.find(i => i.id === item.itemId);
                return (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <p className="font-bold text-slate-900 text-sm">{fish?.nameEn}</p>
                      <p className="text-[10px] text-slate-400 italic font-medium">{fish?.nameId}</p>
                    </td>
                    <td className="py-2.5 text-center text-xs font-bold text-slate-600">
                      {MOCK_GRADES.find(g => g.id === item.gradeId)?.name || '-'} / {MOCK_SIZES.find(s => s.id === item.sizeId)?.name || '-'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900 text-sm">{item.quantity} {item.unit}</td>
                    <td className="py-2.5 text-right text-xs font-bold text-slate-600">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 text-right font-black text-ocean-800 text-sm">Rp {(item.quantity * item.unitPrice).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals & Signature - Bottom of page */}
          <div className="flex justify-between items-start">
             <div className="flex gap-10 pt-4">
                <div className="text-center border-t border-slate-200 pt-2 w-36">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-10">Supplier Signature</p>
                  <p className="text-[9px] font-bold text-slate-300">( ............................ )</p>
                </div>
                <div className="text-center border-t border-slate-200 pt-2 w-36">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-10">Plant Manager</p>
                  <p className="text-[9px] font-bold text-slate-300">( Tariq Tharwat )</p>
                </div>
             </div>
             <div className="w-64 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                 <span className="font-bold text-slate-600 text-xs">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                 <span className="text-lg font-black text-ocean-800">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>
               </div>
             </div>
          </div>
          
          <div className="mt-12 text-center border-t border-slate-50 pt-4">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Kaimana Ocean Excellence • PT. OPS Kaimana</p>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center no-print">
          <button onClick={() => window.print()} className="bg-ocean-800 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-ocean-900 transition-all flex items-center gap-3">
            Print Document
          </button>
        </div>
      </div>
    );
  }

  // Similar logic for Expense...
  return <div>Expense Print View Placeholder (Following same style)</div>;
};
