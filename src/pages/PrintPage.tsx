import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_RECEIVING, MOCK_SUPPLIERS, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../mockData';

export const PrintPage: React.FC = () => {
  const { type, id } = useParams<{ type: string, id: string }>();

  if (type === 'receiving') {
    const doc = MOCK_RECEIVING.find(r => r.id === id) || MOCK_RECEIVING[0];
    const supplier = MOCK_SUPPLIERS.find(s => s.id === doc.supplierId);

    return (
      <div className="bg-white min-h-screen py-20 px-4">
        <div className="A4-page mx-auto shadow-2xl border border-slate-100 animate-in fade-in duration-1000">
          {/* Header */}
          <div className="flex justify-between items-start mb-20">
            <div>
              <img src="/images/New-Logo.png" alt="Logo" className="h-20 object-contain mb-6" />
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{doc.sourceType === 'Lokal' ? 'Nota Penerimaan' : 'Goods Receipt'}</h1>
              <p className="text-slate-400 font-bold tracking-widest text-[10px] mt-2 uppercase">Official Production Document</p>
            </div>
            <div className="text-right">
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Document No.</p>
                <p className="text-xl font-black text-ocean-800">{doc.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="text-lg font-bold text-slate-900">{doc.date}</p>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-2 gap-20 mb-20 pb-10 border-b border-slate-50">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supplier Information</p>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{supplier?.name}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {supplier?.address || 'Kaimana, West Papua, Indonesia'}<br />
                {supplier?.phone || '+62 812-xxxx-xxxx'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ship To / Plant</p>
              <h3 className="text-lg font-black text-slate-900 mb-1">PT. OPS Kaimana</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Jl. Pelabuhan Kaimana<br />
                Kaimana, Papua Barat
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-20">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Description</th>
                <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest">Grade/Size</th>
                <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Qty</th>
                <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Unit Price</th>
                <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(doc as any).lines.map((item: any, idx: number) => {
                const fish = MOCK_ITEMS.find(i => i.id === item.itemId);
                return (
                  <tr key={idx}>
                    <td className="py-6">
                      <p className="font-black text-slate-900">{fish?.nameEn}</p>
                      <p className="text-xs text-slate-400 italic font-medium">{fish?.nameId}</p>
                    </td>
                    <td className="py-6 text-center text-sm font-bold text-slate-600">
                      {MOCK_GRADES.find(g => g.id === item.gradeId)?.name} / {MOCK_SIZES.find(s => s.id === item.sizeId)?.name}
                    </td>
                    <td className="py-6 text-right font-black text-slate-900">{item.quantity} {item.unit}</td>
                    <td className="py-6 text-right text-sm font-bold text-slate-600">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                    <td className="py-6 text-right font-black text-ocean-800">Rp {(item.quantity * item.unitPrice).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals & Signature */}
          <div className="flex justify-between items-end">
             <div className="grid grid-cols-2 gap-20">
                <div className="text-center border-t border-slate-200 pt-4 w-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">Supplier</p>
                  <p className="text-xs font-bold text-slate-300">( ............................ )</p>
                </div>
                <div className="text-center border-t border-slate-200 pt-4 w-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">Plant Manager</p>
                  <p className="text-xs font-bold text-slate-300">( ............................ )</p>
                </div>
             </div>
             <div className="w-80 bg-slate-50 p-8 rounded-2xl">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                 <span className="font-bold text-slate-600">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                 <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                 <span className="text-2xl font-black text-ocean-800">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>
               </div>
             </div>
          </div>
          
          <div className="mt-32 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Kaimana Ocean Excellence</p>
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
