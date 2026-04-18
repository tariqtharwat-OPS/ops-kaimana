import React, { useState } from 'react';
import { Plus, Trash2, Send, Save, Search, ChevronRight, Calculator } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { masterDataService } from '../../services/masterDataService';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const ProcessingPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: logs } = useMasterData('processing', true);
  const { data: stock } = useMasterData('stock', true);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    inputs: [],
    outputs: []
  });

  const getStockQty = (itemId: string, gradeId: string, sizeId: string) => {
    const key = `${itemId}_${gradeId || 'no'}_${sizeId || 'no'}`;
    const entry = stock.find((s: any) => s.id === key);
    return entry ? entry.quantity : 0;
  };

  const addLine = (type: 'inputs' | 'outputs') => {
    setFormData((p: any) => ({
      ...p,
      [type]: [...p[type], { itemId: '', gradeId: '', sizeId: '', quantity: 0 }]
    }));
  };

  const updateLine = (type: 'inputs' | 'outputs', index: number, field: string, value: any) => {
    const lines = [...formData[type]];
    lines[index] = { ...lines[index], [field]: value };
    setFormData((p: any) => ({ ...p, [type]: lines }));
  };

  const removeLine = (type: 'inputs' | 'outputs', index: number) => {
    const lines = formData[type].filter((_: any, i: number) => i !== index);
    setFormData((p: any) => ({ ...p, [type]: lines }));
  };

  const calculateYield = () => {
    const totalIn = formData.inputs.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
    const totalOut = formData.outputs.reduce((s: number, o: any) => s + (Number(o.quantity) || 0), 0);
    if (totalIn === 0) return 0;
    return (totalOut / totalIn) * 100;
  };

  const handleSave = async (isPost: boolean) => {
    try {
      if (formData.inputs.length === 0 || formData.outputs.length === 0) {
        alert("Input and Output lines required");
        return;
      }
      const docData = { ...formData, status: isPost ? 'Posted' : 'Draft', yield: calculateYield() };
      const id = await masterDataService.create('processing', docData);
      if (isPost) {
        await transactionService.postProcessing(id, docData);
      }
      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], notes: '', inputs: [], outputs: [] });
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Pengolahan Baru', 'New Processing')} 
          subtitle={t('Transformasi bahan baku menjadi produk jadi', 'Transform raw materials into finished products')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* INPUTS */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('BAHAN BAKU (INPUT)', 'RAW MATERIALS (INPUT)')}</h3>
                <Button variant="secondary" onClick={() => addLine('inputs')}><Plus size={16} /> {t('Tambah Item', 'Add Item')}</Button>
              </div>
              <div className="space-y-4">
                {formData.inputs.map((line: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl">
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400">{t('ITEM', 'ITEM')}</label>
                      <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                        value={line.itemId} onChange={e => updateLine('inputs', idx, 'itemId', e.target.value)}>
                        <option value="">--</option>
                        {items.map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400">GRADE/SIZE</label>
                      <div className="flex gap-2">
                        <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.gradeId} onChange={e => updateLine('inputs', idx, 'gradeId', e.target.value)}>
                          <option value="">--</option>
                          {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.sizeId} onChange={e => updateLine('inputs', idx, 'sizeId', e.target.value)}>
                          <option value="">--</option>
                          {sizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400">QTY (STOCK: {getStockQty(line.itemId, line.gradeId, line.sizeId)})</label>
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                        value={line.quantity} onChange={e => updateLine('inputs', idx, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="col-span-2 pb-1">
                      <Button variant="secondary" className="w-full text-red-500 hover:bg-red-50" onClick={() => removeLine('inputs', idx)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* OUTPUTS */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('HASIL PRODUKSI (OUTPUT)', 'PRODUCTION OUTPUT')}</h3>
                <Button variant="secondary" onClick={() => addLine('outputs')}><Plus size={16} /> {t('Tambah Item', 'Add Item')}</Button>
              </div>
              <div className="space-y-4">
                {formData.outputs.map((line: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[10px] font-black text-emerald-600">{t('ITEM JADI', 'FINISHED ITEM')}</label>
                      <select className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 text-sm font-bold"
                        value={line.itemId} onChange={e => updateLine('outputs', idx, 'itemId', e.target.value)}>
                        <option value="">--</option>
                        {items.map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-emerald-600">GRADE/SIZE</label>
                      <div className="flex gap-2">
                        <select className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.gradeId} onChange={e => updateLine('outputs', idx, 'gradeId', e.target.value)}>
                          <option value="">--</option>
                          {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <select className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 text-sm font-bold"
                          value={line.sizeId} onChange={e => updateLine('outputs', idx, 'sizeId', e.target.value)}>
                          <option value="">--</option>
                          {sizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-emerald-600">QTY (KG)</label>
                      <input type="number" className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 text-sm font-bold"
                        value={line.quantity} onChange={e => updateLine('outputs', idx, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="col-span-2 pb-1">
                      <Button variant="secondary" className="w-full text-red-500 hover:bg-red-50" onClick={() => removeLine('outputs', idx)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-ocean-800 text-white border-none shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6">{t('RINGKASAN RENDEMEN', 'YIELD SUMMARY')}</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium opacity-80">{t('Total Input', 'Total Input')}</span>
                  <span className="text-xl font-black">{formData.inputs.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0)} kg</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium opacity-80">{t('Total Output', 'Total Output')}</span>
                  <span className="text-xl font-black">{formData.outputs.reduce((s: number, o: any) => s + (Number(o.quantity) || 0), 0)} kg</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calculator size={16} className="opacity-60" />
                    <span className="text-sm font-black uppercase tracking-wider">{t('RENDEMEN', 'YIELD')}</span>
                  </div>
                  <span className="text-4xl font-black text-emerald-400">{calculateYield().toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold" 
                    value={formData.date} onChange={e => setFormData((p: any) => ({ ...p, date: e.target.value }))} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('CATATAN', 'NOTES')}</label>
                  <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold h-32" 
                    value={formData.notes} onChange={e => setFormData((p: any) => ({ ...p, notes: e.target.value }))} />
               </div>
               <div className="pt-4 space-y-3">
                  <Button className="w-full py-4" onClick={() => handleSave(true)}><Send size={18} /> {t('POST KE STOK', 'POST TO STOCK')}</Button>
                  <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN DRAFT', 'SAVE DRAFT')}</Button>
               </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Log Pengolahan', 'Processing Logs')} 
        subtitle={t('Daftar transformasi bahan baku', 'List of raw material transformations')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Produksi Baru', 'New Production')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          data={logs}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('INPUT', 'INPUT'), accessor: (l: any) => (
              <span className="font-bold">{l.inputs?.reduce((s: number, i: any) => s + i.quantity, 0)} kg</span>
            )},
            { header: t('OUTPUT', 'OUTPUT'), accessor: (l: any) => (
              <span className="font-bold text-emerald-600">{l.outputs?.reduce((s: number, o: any) => s + o.quantity, 0)} kg</span>
            )},
            { header: t('RENDEMEN', 'YIELD'), accessor: (l: any) => (
              <Badge variant="posted">{l.yield?.toFixed(2)}%</Badge>
            )},
            { header: 'STATUS', accessor: (l: any) => <Badge variant={l.status === 'Posted' ? 'posted' : 'draft'}>{l.status}</Badge> },
            { header: '', accessor: (l: any) => (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => console.log(l)}><ChevronRight size={16} /></Button>
              </div>
            )}
          ]}
        />
      </Card>
    </div>
  );
};
