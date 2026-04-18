import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_RECEIVING, MOCK_EXPENSES, MOCK_SUPPLIERS, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../mockData';

export const PrintPage: React.FC = () => {
  const { type, id } = useParams();
  
  if (type === 'receiving') {
    const doc = MOCK_RECEIVING.find(r => r.id === id);
    if (!doc) return <div>Document not found</div>;
    const supplier = MOCK_SUPPLIERS.find(s => s.id === doc.supplierId);

    return (
      <div className="A4-page bg-white p-10 text-slate-900 font-serif shadow-none">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">GOODS RECEIPT</h1>
            <p className="text-slate-500 font-sans font-bold">PT. OPS KAIMANA - PLANT OPERATIONS</p>
          </div>
          <div className="text-right font-sans">
            <div className="text-xs font-bold text-slate-400 uppercase">Document No.</div>
            <div className="text-xl font-black">{doc.id}</div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-2">Date</div>
            <div className="text-sm font-bold">{doc.date}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 my-10 font-sans">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100">Received From:</div>
            <div className="text-lg font-black">{supplier?.name}</div>
            <div className="text-sm text-slate-600">{supplier?.address}</div>
            <div className="text-sm text-slate-600">{supplier?.phone}</div>
          </div>
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100">Delivery Details:</div>
            <div className="text-sm font-bold">Source: <span className="font-black text-slate-900">{doc.sourceType}</span></div>
            <div className="text-sm font-bold mt-1">Status: <span className="text-emerald-600">{doc.status}</span></div>
          </div>
        </div>

        <table className="w-full border-collapse my-10 font-sans">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-center">Grade</th>
              <th className="p-3 text-center">Size</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doc.lines.map((line, idx) => {
              const item = MOCK_ITEMS.find(i => i.id === line.itemId);
              const grade = MOCK_GRADES.find(g => g.id === line.gradeId);
              const size = MOCK_SIZES.find(s => s.id === line.sizeId);
              return (
                <tr key={idx} className="text-sm">
                  <td className="p-3 font-black">{item?.nameEn}</td>
                  <td className="p-3 text-center">{grade?.name}</td>
                  <td className="p-3 text-center">{size?.name}</td>
                  <td className="p-3 text-right font-bold">{line.quantity} {line.unit}</td>
                  <td className="p-3 text-right">Rp {line.unitPrice.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right font-black">Rp {line.total.toLocaleString('id-ID')}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900">
              <td colSpan={5} className="p-4 text-right font-black uppercase tracking-widest text-xs">Grand Total</td>
              <td className="p-4 text-right text-xl font-black">Rp {doc.grandTotal.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-20 grid grid-cols-3 gap-8 text-center font-sans">
          <div className="space-y-12">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier Signature</div>
            <div className="border-b border-slate-900 mx-4"></div>
            <div className="text-xs font-bold text-slate-900">{supplier?.name}</div>
          </div>
          <div className="space-y-12">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Received By</div>
            <div className="border-b border-slate-900 mx-4"></div>
            <div className="text-xs font-bold text-slate-900">{doc.createdBy}</div>
          </div>
          <div className="space-y-12">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized By</div>
            <div className="border-b border-slate-900 mx-4"></div>
            <div className="text-xs font-bold text-slate-900">Plant Manager</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'expense') {
    const doc = MOCK_EXPENSES.find(r => r.id === id);
    if (!doc) return <div>Document not found</div>;

    return (
      <div className="A4-page bg-white p-10 text-slate-900 font-serif">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">PAYMENT VOUCHER</h1>
            <p className="text-slate-500 font-sans font-bold">PT. OPS KAIMANA - CASH OPERATIONS</p>
          </div>
          <div className="text-right font-sans">
            <div className="text-xs font-bold text-slate-400 uppercase">Voucher No.</div>
            <div className="text-xl font-black">{doc.id}</div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-2">Date</div>
            <div className="text-sm font-bold">{doc.date}</div>
          </div>
        </div>

        <div className="my-10 font-sans">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100">Expense Category:</div>
          <div className="text-lg font-black text-blue-600">{doc.category}</div>
          {doc.notes && <div className="mt-4 p-4 bg-slate-50 border-l-4 border-slate-200 italic text-sm">"{doc.notes}"</div>}
        </div>

        <table className="w-full border-collapse my-10 font-sans">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right w-32">Qty</th>
              <th className="p-3 text-right w-40">Price</th>
              <th className="p-3 text-right w-48">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doc.lines.map((line, idx) => (
              <tr key={idx} className="text-sm">
                <td className="p-3 font-bold">{line.description}</td>
                <td className="p-3 text-right">{line.qty}</td>
                <td className="p-3 text-right">Rp {line.price.toLocaleString('id-ID')}</td>
                <td className="p-3 text-right font-black">Rp {line.total.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900">
              <td colSpan={3} className="p-4 text-right font-black uppercase tracking-widest text-xs">Total Amount Paid</td>
              <td className="p-4 text-right text-xl font-black">Rp {doc.grandTotal.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-20 grid grid-cols-2 gap-12 text-center font-sans">
          <div className="space-y-12">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid By</div>
            <div className="border-b border-slate-900 mx-10"></div>
            <div className="text-xs font-bold text-slate-900">Cashier / Finance</div>
          </div>
          <div className="space-y-12">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Signature</div>
            <div className="border-b border-slate-900 mx-10"></div>
            <div className="text-xs font-bold text-slate-900">____________________</div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Unknown document type</div>;
};
