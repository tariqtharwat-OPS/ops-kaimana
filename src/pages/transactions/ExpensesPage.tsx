import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Send, Save, ChevronRight, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { masterDataService } from '../../services/masterDataService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const ExpensesPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: categories } = useMasterData('expense_categories', true);
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: expenses } = useMasterData('expenses', true);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    supplierId: '',
    notes: '',
    transactionType: 'Money Out',
    lines: []
  });

  const addLine = () => {
    setFormData((p: any) => ({
      ...p,
      lines: [...p.lines, { categoryId: '', description: '', qty: 0, amount: 0 }]
    }));
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const lines = [...formData.lines];
    lines[idx] = { ...lines[idx], [field]: value };
    setFormData((p: any) => ({ ...p, lines }));
  };

  const removeLine = (idx: number) => {
    setFormData((p: any) => ({ ...p, lines: p.lines.filter((_: any, i: number) => i !== idx) }));
  };

  const calculateTotalQty = () => {
    return formData.lines.reduce((s: number, l: any) => s + (Number(l.qty) || 0), 0);
  };

  const calculateTotalAmount = () => {
    return formData.lines.reduce((s: number, l: any) => s + ((Number(l.qty) || 0) * (Number(l.amount) || 0)), 0);
  };

  const handleSave = async (isPost: boolean, isPrint: boolean = false) => {
    try {
      if (formData.lines.length === 0) {
        alert("Lines required");
        return;
      }
      const docData = { 
        ...formData, 
        status: isPost ? 'Posted' : 'Draft', 
        totalAmount: calculateTotalAmount(),
        totalQty: calculateTotalQty() 
      };
      const id = await masterDataService.create('expenses', docData);

      if (isPrint) {
        window.open(`/print/expenses/${id}`, '_blank');
      }

      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], reference: '', supplierId: '', notes: '', lines: [] });
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Jurnal Baru', 'New Journal Entry')} 
          subtitle={t('Catat arus kas masuk atau keluar', 'Record cash inflow or outflow')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        {/* Transaction Type Toggle */}
        <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit">
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${formData.transactionType === 'Money Out' ? 'bg-white text-red-600 shadow' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setFormData((p: any) => ({ ...p, transactionType: 'Money Out' }))}
          >
            {t('Uang Keluar', 'Money Out')}
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${formData.transactionType === 'Money In' ? 'bg-white text-emerald-600 shadow' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setFormData((p: any) => ({ ...p, transactionType: 'Money In' }))}
          >
            {t('Uang Masuk', 'Money In')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.date} onChange={e => setFormData((p: any) => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NO REFERENSI', 'REF NO')}</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.reference} onChange={e => setFormData((p: any) => ({ ...p, reference: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PEMASOK (OPSIONAL)', 'SUPPLIER (OPTIONAL)')}</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.supplierId} onChange={e => setFormData((p: any) => ({ ...p, supplierId: e.target.value }))}>
                      <option value="">--</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
             </Card>

             <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('DETAIL BIAYA', 'EXPENSE DETAILS')}</h3>
                  <Button variant="secondary" onClick={addLine}><Plus size={16} /> {t('Tambah Item', 'Add Item')}</Button>
                </div>
                <div className="space-y-3">
                  {formData.lines.map((line: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('KATEGORI', 'CATEGORY')}</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                          value={line.categoryId} onChange={e => updateLine(idx, 'categoryId', e.target.value)}>
                          <option value="">--</option>
                          <optgroup label="System">
                            <option value="sales_receipt">Sales Receipt</option>
                            <option value="supplier_payment">Supplier Payment</option>
                            <option value="adjustment">Adjustment</option>
                          </optgroup>
                          <optgroup label="Operational Expenses">
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </optgroup>
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('DESKRIPSI', 'DESC')}</label>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                          value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('QTY', 'QTY')}</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                          value={line.qty} onChange={e => updateLine(idx, 'qty', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('HARGA SATUAN', 'PRICE')}</label>
                        <input type="number" className={`w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right ${formData.transactionType === 'Money In' ? 'text-emerald-700' : 'text-red-700'}`}
                          value={line.amount} onChange={e => updateLine(idx, 'amount', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                        <div className={`w-full bg-slate-100/50 border border-transparent rounded-lg p-2 text-sm font-black text-right ${formData.transactionType === 'Money In' ? 'text-emerald-700' : 'text-red-700'}`}>
                          Rp {((line.qty || 0) * (line.amount || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-1 pb-0.5 text-right">
                        <button className="p-2 text-red-300 hover:text-red-500 transition-colors" onClick={() => removeLine(idx)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
             </Card>
          </div>

          <div className="space-y-8">
              <Card className={`${formData.transactionType === 'Money In' ? 'bg-emerald-800 shadow-emerald-800/20' : 'bg-red-800 shadow-red-800/20'} text-white border-none shadow-2xl`}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">{t('RINGKASAN TRANSAKSI', 'TRANSACTION SUMMARY')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black uppercase opacity-60">{t('TOTAL KUANTITAS', 'TOTAL QUANTITY')}</span>
                    <span className="text-xl font-black">{calculateTotalQty().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black uppercase opacity-60">{t('TOTAL NILAI', 'TOTAL AMOUNT')}</span>
                    <span className="text-2xl font-black text-white">Rp {calculateTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Button className={`w-full py-4 ${formData.transactionType === 'Money In' ? 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-800/20' : 'bg-red-800 hover:bg-red-900 shadow-red-800/20'}`} onClick={() => handleSave(true)}>
                  <Send size={18} /> {formData.transactionType === 'Money In' ? t('POST PENERIMAAN KAS', 'POST MONEY IN') : t('POST BIAYA', 'POST MONEY OUT')}
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN', 'SAVE')}</Button>
                  <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false, true)}><Printer size={18} /> {t('CETAK', 'PRINT')}</Button>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Jurnal Keuangan', 'Money Journal')} 
        subtitle={t('Daftar seluruh arus kas', 'List of all cash flows')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Entri Baru', 'New Entry')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          compact
          data={expenses}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('KATEGORI', 'CATEGORY'), accessor: (e: any) => {
              if (e.category) {
                return e.category.replace('_', ' ').toUpperCase();
              }
              const catIds = (e.lines || []).map((l: any) => l.categoryId);
              const names = catIds.map((id: string) => {
                if (['sales_receipt', 'supplier_payment', 'adjustment'].includes(id)) {
                  return id.replace('_', ' ').toUpperCase();
                }
                const customCat = categories.find((c: any) => c.id === id);
                return customCat ? customCat.name : id;
              });
              return names.join(', ') || '--';
            }},
            { header: t('TIPE', 'TYPE'), accessor: (e: any) => {
              const type = e.transactionType || 'Money Out';
              return <span className={`font-bold text-[10px] uppercase tracking-wider ${type === 'Money In' ? 'text-emerald-600' : 'text-red-600'}`}>{type}</span>;
            }},
            { header: t('TOTAL NILAI', 'TOTAL VALUE'), accessor: (e: any) => {
              const isOut = !e.transactionType || e.transactionType === 'Money Out';
              return <span className={`font-bold ${isOut ? 'text-red-600' : 'text-emerald-600'}`}>Rp {e.totalAmount?.toLocaleString()}</span>;
            }, className: 'text-right' },
            { header: 'STATUS', accessor: (e: any) => <Badge variant={e.status === 'Posted' ? 'posted' : 'draft'}>{e.status}</Badge> },
            { header: '', accessor: (e: any) => (
              <div className="flex justify-end gap-2">
                <Link to={`/print/expenses/${e.id}`}>
                  <Button variant="secondary" size="sm"><Printer size={16} /></Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => console.log(e)}><ChevronRight size={16} /></Button>
              </div>
            )}
          ]}
        />
      </Card>
    </div>
  );
};

