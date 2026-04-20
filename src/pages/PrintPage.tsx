import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
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
  const { data: categories } = useMasterData('expense_categories', true);

  const { data: sourceData } = useMasterData(type || '', true);

  useEffect(() => {
    if (sourceData && id) {
      const found = sourceData.find((d: any) => d.id === id);
      setData(found);
    }
  }, [sourceData, id]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-ocean-600" /></div>;

  const docTitle = type === 'receivings' ? 'RECEIVING NOTE' : type === 'expenses' ? 'EXPENSE VOUCHER' : type === 'sales' ? 'SALES INVOICE' : type?.toUpperCase();
  const partyValue = type === 'receivings' 
    ? suppliers.find((s: any) => s.id === data.supplierId)?.name || 'General Supplier' 
    : type === 'sales'
    ? buyers.find((b: any) => b.id === data.buyerId)?.name || 'General Buyer'
    : type === 'expenses' && data.supplierId
    ? suppliers.find((s: any) => s.id === data.supplierId)?.name || data.reference || 'General Expense'
    : data.reference || 'N/A';

  const totalQty = data.totalQty || (data.lines || []).reduce((s: number, l: any) => s + (Number(l.quantity) || Number(l.qty) || 0), 0);
  const totalAmount = data.totalAmount || data.totalValue || (data.lines || []).reduce((s: number, l: any) => s + (type === 'receivings' || type === 'sales' ? (Number(l.quantity) * Number(l.pricePerKg)) : Number(l.amount)), 0);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white print:p-0">
      {/* Control Panel */}
      <div className="max-w-[210mm] mx-auto py-6 px-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
            <ChevronLeft size={20} /> Back
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-black transition-all">
            <Printer size={20} /> PRINT INVOICE
          </button>
        </div>
      </div>

      {/* Professional Invoice Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none print:w-full min-h-[297mm] p-[15mm] flex flex-col box-border border border-slate-200 print:border-none">
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .print-hidden { display: none !important; }
            tr { page-break-inside: avoid; }
            td, th { page-break-inside: avoid; }
          }
          .invoice-table th { border-bottom: 2px solid #000; border-top: 2px solid #000; }
          .invoice-table td { border-bottom: 1px solid #eee; }
        `}} />

        {/* 1. Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <img src="/images/logo.png" alt="Logo" className="h-20 w-auto" />
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">PT. KAIMANA PLANT</h1>
              <p className="text-xs font-bold text-slate-500 max-w-[250px]">
                Jl. Pelabuhan Baru No. 88, Kaimana<br/>
                Papua Barat, Indonesia 98654<br/>
                Telp: +62 957 1234 5678<br/>
                Email: operations@kaimana.com
              </p>
            </div>
          </div>
          <div className="text-right space-y-6">
            <h2 className="text-5xl font-black tracking-tighter text-slate-300 uppercase leading-none">{docTitle}</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold text-slate-400">DOCUMENT NO:</span> <span className="font-black text-slate-900">#{data.id?.substring(0, 8).toUpperCase()}</span></p>
              <p><span className="font-bold text-slate-400">DATE:</span> <span className="font-black text-slate-900">{new Date(data.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></p>
              <p><span className="font-bold text-slate-400">STATUS:</span> <span className={`font-black uppercase ${data.status === 'Posted' ? 'text-emerald-600' : 'text-amber-500'}`}>{data.status}</span></p>
            </div>
          </div>
        </div>

        {/* 2. Billing Section */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{type === 'sales' ? 'BILL TO' : 'FROM SUPPLIER'}</h3>
            <p className="text-xl font-black text-slate-900 mb-1">{partyValue}</p>
            <p className="text-xs font-bold text-slate-500 italic">Registered Business Partner</p>
            {data.vehicleNo && (
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VEHICLE NO</p>
                <p className="text-sm font-black text-slate-900 uppercase">{data.vehicleNo}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-end text-right pr-6 pb-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PAYMENT TERMS</p>
             <p className="text-sm font-black text-slate-900 uppercase">DUE ON RECEIPT</p>
          </div>
        </div>

        {/* 3. Table Section */}
        <div className="flex-grow">
          <table className="w-full invoice-table">
            <thead>
              <tr className="text-slate-900">
                <th className="py-4 px-2 text-left text-[11px] font-black uppercase tracking-widest">DESCRIPTION</th>
                <th className="py-4 px-2 text-center text-[11px] font-black uppercase tracking-widest w-32">GRADE</th>
                <th className="py-4 px-2 text-right text-[11px] font-black uppercase tracking-widest w-24">QTY (KG)</th>
                <th className="py-4 px-2 text-right text-[11px] font-black uppercase tracking-widest w-32">PRICE</th>
                <th className="py-4 px-2 text-right text-[11px] font-black uppercase tracking-widest w-40">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {(data.lines || []).map((line: any, i: number) => {
                const desc = type === 'receivings' || type === 'sales'
                  ? items.find(it => it.id === line.itemId)?.name || 'Unknown Item'
                  : categories.find(c => c.id === line.categoryId)?.name || line.description || 'General Expense';
                const price = type === 'receivings' || type === 'sales' ? line.pricePerKg : line.amount / (line.qty || 1);
                const lineTotal = type === 'receivings' || type === 'sales' ? (Number(line.quantity) * Number(line.pricePerKg)) : Number(line.amount);
                
                return (
                  <tr key={i}>
                    <td className="py-4 px-2">
                      <p className="font-black text-slate-900 text-sm uppercase">{desc}</p>
                      {type === 'expenses' && line.description && <p className="text-[10px] font-bold text-slate-400 mt-1">{line.description}</p>}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {line.gradeId && <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{grades.find(g => g.id === line.gradeId)?.name}</span>}
                        {line.sizeId && <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{sizes.find(s => s.id === line.sizeId)?.name}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right font-black text-slate-900 text-sm">
                      {(line.quantity || line.qty || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-slate-500 text-sm">
                      {price?.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-black text-slate-900 text-sm">
                      {lineTotal?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Footer Summary Section */}
        <div className="mt-12 grid grid-cols-12 gap-12">
          <div className="col-span-7 space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NOTES / REMARKS</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed border-l-4 border-slate-200 pl-4 py-2">
                {data.notes || 'No additional notes for this document.'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TERMS & CONDITIONS</p>
              <ul className="text-[9px] font-bold text-slate-400 space-y-1 list-disc pl-4">
                <li>Goods received are in accordance with the specified quality.</li>
                <li>This document is valid as a legal invoice for payment purposes.</li>
                <li>For any discrepancies, please contact us within 24 hours.</li>
              </ul>
            </div>
          </div>
          <div className="col-span-5">
            <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">SUBTOTAL AMOUNT</span>
                <span className="font-black text-slate-900">Rp {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">TOTAL VOLUME (KG)</span>
                <span className="font-black text-slate-900">{totalQty.toLocaleString()} KG</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">TAX / VAT (0%)</span>
                <span className="font-black text-slate-900">Rp 0</span>
              </div>
              <div className="pt-6 border-t-4 border-slate-900 flex justify-between items-center mt-4">
                <span className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">GRAND TOTAL</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">Rp {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Signatures */}
        <div className="mt-20 grid grid-cols-3 gap-8">
          <div className="text-center space-y-16">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AUTHORIZED BY</p>
            <div className="border-b-2 border-slate-900 mx-8"></div>
            <p className="text-[10px] font-black text-slate-900 uppercase">Director / Manager</p>
          </div>
          <div className="text-center space-y-16">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PREPARED BY</p>
            <div className="border-b-2 border-slate-900 mx-8"></div>
            <p className="text-[10px] font-black text-slate-900 uppercase">Operations Staff</p>
          </div>
          <div className="text-center space-y-16">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RECEIVED BY</p>
            <div className="border-b-2 border-slate-900 mx-8"></div>
            <p className="text-[10px] font-black text-slate-900 uppercase">Customer / Supplier</p>
          </div>
        </div>

        {/* 6. Legal Footer */}
        <div className="mt-16 text-center border-t border-slate-100 pt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">PT. KAIMANA PLANT • OPERATIONAL EXCELLENCE SYSTEM • 2026</p>
        </div>
      </div>
    </div>
  );
};
