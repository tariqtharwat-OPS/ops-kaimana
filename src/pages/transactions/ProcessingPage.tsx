import React, { useState } from 'react';
import { 
  Plus, 
  PlusCircle, 
  Trash2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Activity,
  FileText,
  ChevronRight,
  Search
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';
import { transactionService } from '../../services/transactionService';

interface OutputLine {
  id: string;
  itemId: string;
  gradeId: string;
  sizeId: string;
  quantity: number;
}

export const ProcessingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form' | 'view'>('list');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Form State
  const [inputItem, setInputItem] = useState('');
  const [inputGrade, setInputGrade] = useState('');
  const [inputSize, setInputSize] = useState('');
  const [inputQty, setInputQty] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [outputs, setOutputs] = useState<OutputLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0 }
  ]);

  // Real data from Firestore
  const { data: stock } = useMasterData('stock');
  const { data: items } = useMasterData('items');
  const { data: grades } = useMasterData('grades');
  const { data: sizes } = useMasterData('sizes');
  const { data: processingHistory } = useMasterData('processing');

  const handlePostProcessing = async () => {
    if (!inputItem || !inputGrade || !inputSize || inputQty <= 0) {
      alert(t('Harap lengkapi input bahan baku!', 'Please complete raw material input!'));
      return;
    }

    try {
      await transactionService.postProcessing(
        { itemId: inputItem, gradeId: inputGrade, sizeId: inputSize, quantity: inputQty, date },
        outputs
      );
      alert(t('Pengolahan berhasil diposting!', 'Processing posted successfully!'));
      setView('list');
      resetForm();
    } catch (err: any) {
      console.error('Processing error:', err);
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setInputItem('');
    setInputGrade('');
    setInputSize('');
    setInputQty(0);
    setOutputs([{ id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0 }]);
    setSelectedDoc(null);
  };

  const addOutput = () => {
    setOutputs([...outputs, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0 }]);
  };

  const removeOutput = (id: string) => {
    if (outputs.length > 1) setOutputs(outputs.filter(o => o.id !== id));
  };

  const updateOutput = (id: string, field: keyof OutputLine, value: any) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleViewDoc = (doc: any) => {
    setSelectedDoc(doc);
    setInputItem(doc.itemId);
    setInputGrade(doc.gradeId);
    setInputSize(doc.sizeId);
    setInputQty(doc.quantity);
    setDate(doc.date);
    setOutputs(doc.outputs || []);
    setView('view');
  };

  const totalOutput = outputs.reduce((sum, o) => sum + o.quantity, 0);
  const yieldPercent = inputQty > 0 ? (totalOutput / inputQty) * 100 : 0;

  if (view === 'form' || view === 'view') {
    const isReadOnly = view === 'view' && selectedDoc?.status === 'Posted';

    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={view === 'form' ? t('Pengolahan Baru', 'New Processing') : t('Detail Pengolahan', 'Processing Detail')} 
          subtitle={selectedDoc?.id || t('Catat transformasi bahan baku menjadi produk jadi', 'Record raw material transformation into finished goods')}
          action={
            <>
              <Button variant="secondary" onClick={() => { setView('list'); resetForm(); }}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              {!isReadOnly && (
                <>
                  <Button variant="secondary">{t('Simpan Draft', 'Save Draft')}</Button>
                  <Button onClick={handlePostProcessing}>{t('Post Pengolahan', 'Post Processing')}</Button>
                </>
              )}
              {isReadOnly && (
                <Badge variant="posted" className="px-6 py-3 text-sm">{t('TERPOSTING', 'POSTED')}</Badge>
              )}
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('STOK TERSEDIA', 'AVAILABLE STOCK')}</label>
                  <select 
                    disabled={isReadOnly}
                    value={`${inputItem}_${inputGrade}_${inputSize}`}
                    onChange={(e) => {
                      const [i, g, s] = e.target.value.split('_');
                      setInputItem(i);
                      setInputGrade(g);
                      setInputSize(s);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold disabled:opacity-50"
                  >
                    <option value="">-- {t('Pilih Stok', 'Select Stock')} --</option>
                    {stock.filter((s: any) => s.quantity > 0).map((s: any) => {
                      const item = items.find((i: any) => i.id === s.item_id);
                      const grade = grades.find((g: any) => g.id === s.grade_id);
                      const size = sizes.find((sz: any) => sz.id === s.size_id);
                      return (
                        <option key={s.id} value={`${s.item_id}_${s.grade_id}_${s.size_id}`}>
                          {t(item?.nameId, item?.nameEn)} - {grade?.name} - {size?.name} ({s.quantity} kg)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KUANTITAS INPUT (KG)', 'INPUT QTY (KG)')}</label>
                  <input 
                    type="number" 
                    disabled={isReadOnly}
                    value={inputQty || ''}
                    onChange={(e) => setInputQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-black text-ocean-800 disabled:opacity-50"
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
                {!isReadOnly && <Button variant="secondary" onClick={addOutput} className="py-2 px-4"><PlusCircle size={16} /> {t('Tambah Baris', 'Add Line')}</Button>}
              </div>
              
              <Table 
                data={outputs}
                columns={[
                  { 
                    header: t('ITEM HASIL', 'OUTPUT ITEM'), 
                    accessor: (o) => (
                      <select disabled={isReadOnly} value={o.itemId} onChange={(e) => updateOutput(o.id, 'itemId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold disabled:opacity-50">
                        <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                        {items.filter((i: any) => i.category !== 'Raw').map((i: any) => <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>)}
                      </select>
                    )
                  },
                  { 
                    header: 'GRADE', 
                    accessor: (o) => (
                      <select disabled={isReadOnly} value={o.gradeId} onChange={(e) => updateOutput(o.id, 'gradeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm disabled:opacity-50">
                        <option value="">--</option>
                        {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    ),
                    className: 'w-32'
                  },
                  { 
                    header: 'SIZE', 
                    accessor: (o) => (
                      <select disabled={isReadOnly} value={o.sizeId} onChange={(e) => updateOutput(o.id, 'sizeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm disabled:opacity-50">
                        <option value="">--</option>
                        {sizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    ),
                    className: 'w-32'
                  },
                  { 
                    header: 'QTY (KG)', 
                    accessor: (o) => (
                      <input type="number" disabled={isReadOnly} value={o.quantity || ''} onChange={(e) => updateOutput(o.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-emerald-600 disabled:opacity-50" placeholder="0.00" />
                    ),
                    className: 'w-32 text-right'
                  },
                  {
                    header: '',
                    accessor: (o) => !isReadOnly && <button onClick={() => removeOutput(o.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>,
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
      
      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari pengolahan...', 'Search processing...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
        </div>

        <Table 
          data={processingHistory}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold text-slate-500' },
            { 
              header: t('INPUT', 'INPUT'), 
              accessor: (doc: any) => {
                const item = items.find((i: any) => i.id === doc.itemId);
                return `${t(item?.nameId, item?.nameEn)} (${doc.quantity} kg)`;
              } 
            },
            { 
              header: t('YIELD', 'YIELD'), 
              accessor: (doc: any) => {
                const totalOut = (doc.outputs || []).reduce((s: number, o: any) => s + (o.quantity || 0), 0);
                const yp = (totalOut / doc.quantity) * 100;
                return <span className="font-black text-emerald-600">{yp.toFixed(1)}%</span>;
              }
            },
            { header: t('STATUS', 'STATUS'), accessor: (doc: any) => <Badge variant="posted">{doc.status}</Badge> },
            { 
              header: '', 
              accessor: (doc: any) => (
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleViewDoc(doc)} className="p-2 text-slate-300 hover:text-ocean-800 transition-all">
                    <FileText size={18} />
                  </button>
                  <ChevronRight size={18} className="text-slate-200 cursor-pointer" onClick={() => handleViewDoc(doc)} />
                </div>
              ),
              className: 'text-right'
            }
          ]}
        />
      </Card>
    </div>
  );
};
