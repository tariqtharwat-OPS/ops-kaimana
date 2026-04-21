import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
import { Loader2, Printer, ChevronLeft } from 'lucide-react';
import { companyConfig } from '../config/company';
import { getItemLabel } from '../utils/itemMapping';

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

  // Removed auto print as requested

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
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none print:w-full min-h-[297mm] print:min-h-0 p-[10mm] flex flex-col box-border border border-slate-200 print:border-none print:p-0">
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4; margin: 8mm; }
            body, html { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; height: auto; }
            .print-hidden { display: none !important; }
            tr, td, th { page-break-inside: avoid; }
            thead { display: table-header-group; }
            .invoice-table { width: 100%; border-collapse: collapse; }
            .summary-section { page-break-inside: avoid; }
          }
          .invoice-table th { border-bottom: 2px solid #000; border-top: 2px solid #000; }
          .invoice-table td { border-bottom: 1px solid #eee; }
        `}} />

        {/* 1. Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <img src="/images/logo.png" alt="Logo" className="h-16 w-auto" />
            <div className="space-y-0.5">
              <h1 className="text-xl font-black tracking-tighter text-slate-900">OPS - Kaimana Plant</h1>
              <p className="text-[10px] font-bold text-slate-500 max-w-[250px]">
                Phone: +6282144434743<br/>
                Email: info@OceanPearlSeafood.com
              </p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-slate-300 uppercase leading-none">{docTitle}</h2>
            <div className="space-y-0.5 text-[11px]">
              <p><span className="font-bold text-slate-400">DOCUMENT NO:</span> <span className="font-black text-slate-900">#{data.id?.toUpperCase()}</span></p>
              <p><span className="font-bold text-slate-400">DATE:</span> <span className="font-black text-slate-900">{new Date(data.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></p>
              <p><span className="font-bold text-slate-400">STATUS:</span> <span className={`font-black uppercase ${data.status === 'Posted' ? 'text-emerald-600' : 'text-amber-500'}`}>{data.status}</span></p>
            </div>
          </div>
        </div>

        {/* 2. Billing Section */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{type === 'sales' ? 'BILL TO' : 'FROM SUPPLIER'}</h3>
            <p className="text-lg font-black text-slate-900 mb-0.5">{partyValue}</p>
            <p className="text-[10px] font-bold text-slate-500 italic">Registered Business Partner</p>
            {data.vehicleNo && (
              <div className="mt-3 pt-3 border-t border-slate-200/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VEHICLE NO</p>
                <p className="text-xs font-black text-slate-900 uppercase">{data.vehicleNo}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-end text-right pr-4 pb-4">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PAYMENT TERMS</p>
             <p className="text-xs font-black text-slate-900 uppercase">DUE ON RECEIPT</p>
          </div>
        </div>

        {/* 3. Table Section */}
        <div className="flex-grow">
          <table className="w-full invoice-table">
            <thead>
              <tr className="text-slate-900">
                <th className="py-2 px-2 text-left text-[10px] font-black uppercase tracking-widest">DESCRIPTION</th>
                <th className="py-2 px-2 text-center text-[10px] font-black uppercase tracking-widest w-24">GRADE</th>
                <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-widest w-20">QTY (KG)</th>
                <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-widest w-28">PRICE</th>
                <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-widest w-32">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {(data.lines || []).map((line: any, i: number) => {
                const it = items.find((i: any) => i.id === line.itemId);
                const desc = type === 'receivings' || type === 'sales'
                  ? getItemLabel(it)
                  : categories.find((c: any) => c.id === line.categoryId)?.name || line.description || 'General Expense';
                const price = type === 'receivings' || type === 'sales' ? line.pricePerKg : line.amount / (line.qty || 1);
                const lineTotal = type === 'receivings' || type === 'sales' ? (Number(line.quantity) * Number(line.pricePerKg)) : Number(line.amount);
                
                return (
                  <tr key={i}>
                    <td className="py-2 px-2">
                      <p className="font-black text-slate-900 text-[11px] uppercase">{desc}</p>
                      {type === 'expenses' && line.description && <p className="text-[9px] font-bold text-slate-400">{line.description}</p>}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {line.gradeId && <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 rounded uppercase">{grades.find((g: any) => g.id === line.gradeId)?.name}</span>}
                        {line.sizeId && <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 rounded uppercase">{sizes.find((s: any) => s.id === line.sizeId)?.name}</span>}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-black text-slate-900 text-[11px]">
                      {(line.quantity || line.qty || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-slate-500 text-[11px]">
                      {price?.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-slate-900 text-[11px]">
                      {lineTotal?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Footer Summary Section */}
        <div className="mt-6 grid grid-cols-12 gap-8 summary-section">
          <div className="col-span-7 space-y-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NOTES / REMARKS</p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3 py-1">
                {data.notes || 'No additional notes for this document.'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TERMS & CONDITIONS</p>
              <ul className="text-[8px] font-bold text-slate-400 space-y-0.5 list-disc pl-3">
                <li>Goods received are in accordance with the specified quality.</li>
                <li>This document is valid as a legal invoice for payment purposes.</li>
                <li>For any discrepancies, please contact us within 24 hours.</li>
              </ul>
            </div>
          </div>
          <div className="col-span-5">
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-widest">SUBTOTAL AMOUNT</span>
                <span className="font-black text-slate-900">Rp {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-widest">TOTAL VOLUME (KG)</span>
                <span className="font-black text-slate-900">{totalQty.toLocaleString()} KG</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-widest">TAX / VAT (0%)</span>
                <span className="font-black text-slate-900">Rp 0</span>
              </div>
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center mt-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">GRAND TOTAL</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">Rp {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Signatures */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="text-center space-y-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AUTHORIZED BY</p>
            <div className="border-b border-slate-900 mx-8"></div>
            <p className="text-[9px] font-black text-slate-900 uppercase">Director / Manager</p>
          </div>
          <div className="text-center space-y-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PREPARED BY</p>
            <div className="border-b border-slate-900 mx-8"></div>
            <p className="text-[9px] font-black text-slate-900 uppercase">Operations Staff</p>
          </div>
          <div className="text-center space-y-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RECEIVED BY</p>
            <div className="border-b border-slate-900 mx-8"></div>
            <p className="text-[9px] font-black text-slate-900 uppercase">Customer / Supplier</p>
          </div>
        </div>

        {/* 6. Legal Footer */}
        <div className="mt-8 text-center border-t border-slate-100 pt-4">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">{companyConfig.name.toUpperCase()} • OPERATIONAL EXCELLENCE SYSTEM • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};
