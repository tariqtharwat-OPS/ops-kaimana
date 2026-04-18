import React, { useState } from 'react';
import { 
  Plus, 
  PlusCircle, 
  Trash2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../../mockData';
import { Button, Card, Header } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

interface OutputLine {
  id: string;
  itemId: string;
  gradeId: string;
  sizeId: string;
  quantity: number;
}

export const ProcessingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [inputItem, setInputItem] = useState('');
  const [inputQty, setInputQty] = useState(0);
  const [outputs, setOutputs] = useState<OutputLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0 }
  ]);

  const addOutput = () => {
    setOutputs([...outputs, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0 }]);
  };

  const removeOutput = (id: string) => {
    if (outputs.length > 1) setOutputs(outputs.filter(o => o.id !== id));
  };

  const updateOutput = (id: string, field: keyof OutputLine, value: any) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const totalOutput = outputs.reduce((sum, o) => sum + o.quantity, 0);
  const yieldPercent = inputQty > 0 ? (totalOutput / inputQty) * 100 : 0;

  if (view === 'form') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={t('Pengolahan Baru', 'New Processing')} 
          subtitle={t('Catat transformasi bahan baku menjadi produk jadi', 'Record raw material transformation into finished goods')}
          action={
            <>
              <Button variant="secondary" onClick={() => setView('list')}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              <Button variant="secondary">{t('Simpan Draft', 'Save Draft')}</Button>
              <Button>{t('Post Pengolahan', 'Post Processing')}</Button>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <Layers className="text-ocean-800" size={20} />
                <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">{t('Input Bahan Baku', 'Raw Material Input')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ITEM INPUT', 'INPUT ITEM')}</label>
                  <select 
                    value={inputItem}
                    onChange={(e) => setInputItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  >
                    <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KUANTITAS INPUT (KG)', 'INPUT QTY (KG)')}</label>
                  <input 
                    type="number" 
                    value={inputQty || ''}
                    onChange={(e) => setInputQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-black text-ocean-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <ArrowRight className="text-emerald-500" size={20} />
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">{t('Output Hasil', 'Output Results')}</h3>
                </div>
                <Button variant="secondary" onClick={addOutput} className="py-2 px-4"><PlusCircle size={16} /> {t('Tambah Baris', 'Add Line')}</Button>
              </div>
              
              <Table 
                data={outputs}
                columns={[
                  { 
                    header: t('ITEM HASIL', 'OUTPUT ITEM'), 
                    accessor: (o) => (
                      <select value={o.itemId} onChange={(e) => updateOutput(o.id, 'itemId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold">
                        <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                        {MOCK_ITEMS.filter(i => i.category !== 'Raw').map(i => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                      </select>
                    )
                  },
                  { 
                    header: 'GRADE', 
                    accessor: (o) => (
                      <select value={o.gradeId} onChange={(e) => updateOutput(o.id, 'gradeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm">
                        <option value="">--</option>
                        {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    ),
                    className: 'w-32'
                  },
                  { 
                    header: 'SIZE', 
                    accessor: (o) => (
                      <select value={o.sizeId} onChange={(e) => updateOutput(o.id, 'sizeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm">
                        <option value="">--</option>
                        {MOCK_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    ),
                    className: 'w-32'
                  },
                  { 
                    header: 'QTY (KG)', 
                    accessor: (o) => (
                      <input type="number" value={o.quantity || ''} onChange={(e) => updateOutput(o.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-emerald-600" placeholder="0.00" />
                    ),
                    className: 'w-32 text-right'
                  },
                  {
                    header: '',
                    accessor: (o) => <button onClick={() => removeOutput(o.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>,
                    className: 'w-12 text-center'
                  }
                ]}
              />
            </div>
          </Card>

          <div className="space-y-10">
            <Card className="bg-ocean-800 text-white border-none shadow-xl shadow-ocean-800/10">
               <div className="flex items-center gap-3 mb-6 opacity-60">
                 <Activity size={18} />
                 <h3 className="text-[10px] font-black uppercase tracking-widest">{t('Ringkasan Rendemen', 'Yield Summary')}</h3>
               </div>
               <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{t('Total Output', 'Total Output')}</p>
                   <p className="text-3xl font-black">{totalOutput.toFixed(2)} kg</p>
                 </div>
                 <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{t('Presentase Yield', 'Yield Percentage')}</p>
                   <p className="text-5xl font-black text-emerald-400">{yieldPercent.toFixed(1)}%</p>
                 </div>
                 <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-bold opacity-60 uppercase mb-2">{t('Waste / Loss', 'Waste / Loss')}</p>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div className="bg-red-400 h-full transition-all" style={{ width: `${Math.min(100, 100 - yieldPercent)}%` }}></div>
                   </div>
                   <p className="text-sm font-bold mt-2 text-red-300">{(inputQty - totalOutput).toFixed(2)} kg Lost</p>
                 </div>
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
        title={t('Pengolahan', 'Processing')} 
        subtitle={t('Pantau efisiensi transformasi produksi', 'Monitor production transformation efficiency')}
        action={<Button onClick={() => setView('form')}><Plus size={20} /> {t('Catat Pengolahan', 'Record Processing')}</Button>}
      />
      <Card noPadding className="flex items-center justify-center p-20 border-dashed border-2">
         <div className="text-center">
            <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center text-ocean-800 mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('Riwayat Pengolahan', 'Processing History')}</h3>
            <p className="text-slate-300 text-xs mt-1 font-bold">No records found yet.</p>
         </div>
      </Card>
    </div>
  );
};
