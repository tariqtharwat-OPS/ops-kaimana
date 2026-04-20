import React, { useState } from 'react';
import { Plus, Trash2, Send, Save, Printer, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { masterDataService } from '../../services/masterDataService';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  
  
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: receivings } = useMasterData('receivings', true);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    vehicleNo: '',
    notes: '',
    lines: []
  });

  const addLine = () => {
    setFormData((p: any) => ({
      ...p,
      lines: [...p.lines, { itemId: '', gradeId: '', sizeId: '', quantity: 0, pricePerKg: 0 }]
    }));
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const lines = [...formData.lines];
    const line = { ...lines[idx], [field]: value };
    
    // Auto-fill price logic
    if (field === 'itemId' || field === 'gradeId' || field === 'sizeId') {
      const item = items.find(i => i.id === line.itemId);
      if (item && item.pricingMatrix) {
        const gradeKey = line.gradeId || 'standard';
        const sizeKey = line.sizeId;
        if (sizeKey && item.pricingMatrix[gradeKey]?.[sizeKey]) {
          line.pricePerKg = item.pricingMatrix[gradeKey][sizeKey];
        }
      }
    }
    
    lines[idx] = line;
    setFormData((p: any) => ({ ...p, lines }));
  };

  const removeLine = (idx: number) => {
    setFormData((p: any) => ({ ...p, lines: p.lines.filter((_: any, i: number) => i !== idx) }));
  };

  const calculateTotalQty = () => {
    return formData.lines.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 0), 0);
  };

  const calculateTotalAmount = () => {
    return formData.lines.reduce((sum: number, l: any) => sum + ((Number(l.quantity) || 0) * (Number(l.pricePerKg) || 0)), 0);
  };

  const handleSave = async (isPost: boolean, isPrint: boolean = false) => {
    try {
      if (!formData.supplierId || formData.lines.length === 0) {
        alert("Supplier and lines required");
        return;
      }
      
      const hasMissingPrice = formData.lines.some((l: any) => !l.pricePerKg || l.pricePerKg <= 0);
      if (hasMissingPrice) {
        alert("Peringatan: Ada item dengan harga 0 atau kosong. Harap isi harga yang valid sebelum menyimpan.");
        return;
      }

      const docData = { 
        ...formData, 
        status: isPost ? 'Posted' : 'Draft',
        totalQty: calculateTotalQty(),
        totalAmount: calculateTotalAmount()
      };
      const id = await masterDataService.create('receivings', docData);
      if (isPost) {
        await transactionService.postReceiving(id, docData);
      }

      if (isPrint) {
        window.open(`/print/receivings/${id}`, '_blank');
      }

      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], supplierId: '', vehicleNo: '', notes: '', lines: [] });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getFilteredGrades = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.hasGrade || !item.gradeProfileId) return [];
    return grades.filter(g => g.profileId === item.gradeProfileId && g.active_status !== false);
  };

  const getFilteredSizes = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.sizeProfileId) return [];
    return sizes.filter(s => s.profileId === item.sizeProfileId && s.active_status !== false);
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Penerimaan Baru', 'New Receiving')} 
          subtitle={t('Catat pembelian bahan baku dari supplier', 'Record raw material purchase from supplier')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUPPLIER', 'SUPPLIER')}</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.supplierId} onChange={e => setFormData((p: any) => ({ ...p, supplierId: e.target.value }))}>
                      <option value="">-- {t('Pilih Supplier', 'Select Supplier')} --</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <div className="space-y-3">
                  {formData.lines.map((line: any, idx: number) => {
                    const filteredGrades = getFilteredGrades(line.itemId);
                    const filteredSizes = getFilteredSizes(line.itemId);
                    const item = items.find(i => i.id === line.itemId);
                    
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="col-span-3 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">{t('ITEM', 'ITEM')}</label>
                          <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                            value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                            <option value="">--</option>
                            {items.map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">GRADE</label>
                          <div className="flex gap-1">
                            <select disabled={!item?.hasGrade}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold disabled:opacity-30"
                              value={line.gradeId} onChange={e => updateLine(idx, 'gradeId', e.target.value)}>
                              <option value="">G</option>
                              {filteredGrades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold"
                              value={line.sizeId} onChange={e => updateLine(idx, 'sizeId', e.target.value)}>
                              <option value="">S</option>
                              {filteredSizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">QTY (KG)</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                            value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">PRICE/KG</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                            value={line.pricePerKg} onChange={e => updateLine(idx, 'pricePerKg', Number(e.target.value))} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                          <div className="w-full bg-slate-100/50 border border-transparent rounded-lg p-2 text-sm font-black text-right text-ocean-700">
                            Rp {((line.quantity || 0) * (line.pricePerKg || 0)).toLocaleString()}
                          </div>
                        </div>
                        <div className="col-span-1 pb-0.5 text-right">
                          <button className="p-2 text-red-300 hover:text-red-500 transition-colors" onClick={() => removeLine(idx)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </Card>
          </div>

          <div className="space-y-4">
             <Card className="bg-ocean-800 text-white border-none shadow-2xl">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">{t('RINGKASAN PENERIMAAN', 'RECEIVING SUMMARY')}</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <span className="text-[10px] font-black uppercase opacity-60">{t('TOTAL KUANTITAS', 'TOTAL QUANTITY')}</span>
                   <span className="text-xl font-black">{calculateTotalQty().toLocaleString()} kg</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                   <span className="text-[10px] font-black uppercase opacity-60">{t('TOTAL NILAI', 'TOTAL AMOUNT')}</span>
                   <span className="text-2xl font-black text-emerald-400">Rp {calculateTotalAmount().toLocaleString()}</span>
                 </div>
               </div>
             </Card>

             <Button className="w-full py-4 shadow-ocean-800/20" onClick={() => handleSave(true)}><Send size={18} /> {t('POST PENERIMAAN', 'POST RECEIVING')}</Button>
             <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN', 'SAVE')}</Button>
                <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false, true)}><Printer size={18} /> {t('CETAK', 'PRINT')}</Button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Log Penerimaan', 'Receiving Logs')} 
        subtitle={t('Daftar seluruh masuknya bahan baku', 'List of all incoming raw materials')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Penerimaan Baru', 'New Receiving')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          compact
          data={receivings}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('SUPPLIER', 'SUPPLIER'), accessor: (r: any) => suppliers.find(s => s.id === r.supplierId)?.name || 'Unknown' },
            { header: t('TOTAL QTY', 'TOTAL QTY'), accessor: (r: any) => `${(r.totalQty || r.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0))?.toLocaleString()} kg`, className: 'text-right' },
            { header: t('TOTAL NILAI', 'TOTAL VALUE'), accessor: (r: any) => `Rp ${(r.totalAmount || r.lines?.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0))?.toLocaleString()}`, className: 'text-right font-bold text-ocean-700' },
            { header: 'STATUS', accessor: (r: any) => <Badge variant={r.status === 'Posted' ? 'posted' : 'draft'}>{r.status}</Badge> },
            { header: '', accessor: (r: any) => (
              <div className="flex gap-2 justify-end">
                <Link to={`/print/receivings/${r.id}`}>
                  <Button variant="secondary" size="sm"><Printer size={16} /></Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => console.log(r)}><ChevronRight size={16} /></Button>
              </div>
            ), className: 'text-right' }
          ]}
        />
      </Card>
    </div>
  );
};

