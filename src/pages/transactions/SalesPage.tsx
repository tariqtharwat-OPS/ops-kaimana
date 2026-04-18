import React, { useState } from 'react';
import { Plus, Trash2, Send, Save, Truck, Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { masterDataService } from '../../services/masterDataService';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const SalesPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: stock } = useMasterData('stock', true);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    buyerId: '',
    vehicleNo: '',
    notes: '',
    lines: []
  });

  const getStockQty = (itemId: string, gradeId: string, sizeId: string) => {
    const key = `${itemId}_${gradeId || 'no'}_${sizeId || 'no'}`;
    const entry = stock.find((s: any) => s.id === key);
    return entry ? entry.quantity : 0;
  };

  const addLine = () => {
    setFormData((p: any) => ({
      ...p,
      lines: [...p.lines, { itemId: '', gradeId: '', sizeId: '', quantity: 0, pricePerKg: 0 }]
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

  const calculateTotal = () => {
    return formData.lines.reduce((s: number, l: any) => s + (l.quantity * l.pricePerKg), 0);
  };

  const handleSave = async (isPost: boolean) => {
    try {
      if (!formData.buyerId || formData.lines.length === 0) {
        alert("Buyer and lines required");
        return;
      }
      const docData = { ...formData, status: isPost ? 'Posted' : 'Draft', totalValue: calculateTotal() };
      const id = await masterDataService.create('sales', docData);
      if (isPost) {
        await transactionService.postSales(id, docData);
      }
      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], buyerId: '', vehicleNo: '', notes: '', lines: [] });
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Penjualan / Dispatch Baru', 'New Sales / Dispatch')} 
          subtitle={t('Keluarkan stok untuk pengiriman ke buyer', 'Release stock for dispatch to buyer')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PEMBELI', 'BUYER')}</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.buyerId} onChange={e => setFormData((p: any) => ({ ...p, buyerId: e.target.value }))}>
                      <option value="">-- {t('Pilih Pembeli', 'Select Buyer')} --</option>
                      {buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.date} onChange={e => setFormData((p: any) => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NO KENDARAAN', 'VEHICLE NO')}</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.vehicleNo} onChange={e => setFormData((p: any) => ({ ...p, vehicleNo: e.target.value }))} />
                  </div>
                </div>
             </Card>

             <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('DETAIL BARANG', 'ITEM DETAILS')}</h3>
                  <Button variant="secondary" onClick={addLine}><Plus size={16} /> {t('Tambah Item', 'Add Item')}</Button>
                </div>
                <div className="space-y-4">
                  {formData.lines.map((line: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl">
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">{t('ITEM', 'ITEM')}</label>
                        <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                          <option value="">--</option>
                          {items.map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">GRADE/SIZE</label>
                        <div className="flex gap-2">
                          <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                            value={line.gradeId} onChange={e => updateLine(idx, 'gradeId', e.target.value)}>
                            <option value="">--</option>
                            {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                          <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                            value={line.sizeId} onChange={e => updateLine(idx, 'sizeId', e.target.value)}>
                            <option value="">--</option>
                            {sizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">QTY (STK: {getStockQty(line.itemId, line.gradeId, line.sizeId)})</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">PRICE / KG</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-emerald-700"
                          value={line.pricePerKg} onChange={e => updateLine(idx, 'pricePerKg', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 pb-1">
                        <Button variant="secondary" className="w-full text-red-500 hover:bg-red-50" onClick={() => removeLine(idx)}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
             </Card>
          </div>

          <div className="space-y-8">
             <Card className="bg-emerald-800 text-white border-none shadow-2xl">
               <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6">{t('RINGKASAN PENJUALAN', 'SALES SUMMARY')}</h3>
               <div className="space-y-6">
                 <div className="flex justify-between items-end">
                   <span className="text-sm font-medium opacity-80">{t('Total Qty', 'Total Qty')}</span>
                   <span className="text-xl font-black">{formData.lines.reduce((s: number, l: any) => s + (Number(l.quantity) || 0), 0)} kg</span>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <span className="text-sm font-black uppercase tracking-wider">{t('TOTAL NILAI', 'TOTAL VALUE')}</span>
                   <span className="text-3xl font-black text-emerald-400">Rp {calculateTotal().toLocaleString()}</span>
                 </div>
               </div>
             </Card>

             <Card className="space-y-4">
               <Button className="w-full py-4" onClick={() => handleSave(true)}><Truck size={18} /> {t('POST PENJUALAN', 'POST SALES')}</Button>
               <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN DRAFT', 'SAVE DRAFT')}</Button>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Daftar Penjualan', 'Sales / Dispatch List')} 
        subtitle={t('Kelola pengiriman barang ke pembeli', 'Manage item dispatch to buyers')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Penjualan Baru', 'New Sales')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          data={sales}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('PEMBELI', 'BUYER'), accessor: (s: any) => buyers.find(b => b.id === s.buyerId)?.name || 'Unknown' },
            { header: t('TOTAL QTY', 'TOTAL QTY'), accessor: (s: any) => `${s.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0)} kg` },
            { header: t('NILAI', 'VALUE'), accessor: (s: any) => `Rp ${s.totalValue?.toLocaleString()}`, className: 'font-bold text-emerald-600' },
            { header: 'STATUS', accessor: (s: any) => <Badge variant={s.status === 'Posted' ? 'posted' : 'draft'}>{s.status}</Badge> },
            { header: '', accessor: (s: any) => (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => console.log(s)}><ChevronRight size={16} /></Button>
              </div>
            )}
          ]}
        />
      </Card>
    </div>
  );
};
