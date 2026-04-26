import React, { useState, useMemo } from 'react';
import { Plus, Send, Save, ChevronRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';
import { getItemLabel } from '../../utils/itemMapping';
import { useAuth } from '../../context/AuthContext';

export const ProcessingPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const canModify = currentUser?.role === 'Admin' || currentUser?.role === 'Operator';

  const { data: items } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: logs } = useMasterData('processing', true);
  const { data: receivings, loading: receivingsLoading } = useMasterData('receivings', true);
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: allocations } = useMasterData('buyerAllocations', true);

  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<{
    date: string;
    notes: string;
    selectedReceivings: string[];
    lines: any[];
  }>({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    selectedReceivings: [],
    lines: []
  });

  const postedReceivings = useMemo(() => 
    receivings.filter((r: any) => r.status === 'Posted' && !r.processedAt), 
    [receivings]
  );

  const handleSelectReceiving = (id: string) => {
    if (formData.selectedReceivings.includes(id)) {
      setFormData(prev => ({
        ...prev,
        selectedReceivings: prev.selectedReceivings.filter(x => x !== id),
        lines: prev.lines.filter(l => l.receivingId !== id)
      }));
    } else {
      const rec = receivings.find((r: any) => r.id === id);
      if (rec && rec.lines) {
        const newLines = rec.lines.map((l: any, idx: number) => ({
          id: `${id}_${idx}`,
          receivingId: id,
          itemId: l.itemId,
          gradeId: l.gradeId,
          sizeId: l.sizeId,
          invoiceQty: Number(l.quantity) || 0,
          actualQty: Number(l.quantity) || 0,
          shortfallReason: ''
        }));
        setFormData(prev => ({
          ...prev,
          selectedReceivings: [...prev.selectedReceivings, id],
          lines: [...prev.lines, ...newLines]
        }));
      }
    }
  };

  const updateLine = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const summary = useMemo(() => {
    const sum: Record<string, any> = {};
    formData.lines.forEach(l => {
      const key = `${l.itemId}_${l.gradeId}_${l.sizeId}`;
      if (!sum[key]) {
        sum[key] = {
          itemId: l.itemId,
          gradeId: l.gradeId,
          sizeId: l.sizeId,
          totalInvoice: 0,
          totalActual: 0
        };
      }
      sum[key].totalInvoice += l.invoiceQty;
      sum[key].totalActual += l.actualQty;
    });
    return Object.values(sum);
  }, [formData.lines]);

  const isValid = () => {
    if (formData.selectedReceivings.length === 0) return false;
    for (const l of formData.lines) {
      if (l.actualQty < l.invoiceQty && !l.shortfallReason) return false;
      if (l.actualQty <= 0) return false;
    }
    return true;
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

  const handleSave = async (isPost: boolean) => {
    if (!isValid()) {
      alert("Pastikan semua qty valid dan alasan selisih diisi jika ada shortfall.");
      return;
    }
    try {
      const docData = { 
        ...formData, 
        summary,
        status: 'Draft',
        totalInput: formData.lines.reduce((acc, l) => acc + l.actualQty, 0),
        totalOutput: formData.lines.reduce((acc, l) => acc + l.actualQty, 0)
      };
      
      const id = await transactionService.createDocument('processing', docData, 'P');
      if (isPost) {
        const relevantAllocations = allocations.filter((a: any) => 
          formData.selectedReceivings.includes(a.receivingId) && a.status === 'Provisional'
        );

        const stockData = {
          ...docData,
          relevantAllocations,
          inputs: formData.lines.map(l => ({...l, quantity: l.actualQty})), 
          outputs: summary.map(s => ({...s, quantity: s.totalActual})) 
        };
        await transactionService.postProcessing(id, stockData);
      }
      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], notes: '', selectedReceivings: [], lines: [] });
    } catch (e: any) {
      console.error("Processing Save/Post error:", e);
      alert(t('Gagal menyimpan: ', 'Failed to save: ') + e.message);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Produksi Baru', 'New Production')} 
          subtitle={t('Konfirmasi hasil olah dari penerimaan. Surplus diperbolehkan.', 'Confirm processing output. Surplus is allowed.')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('1. PILIH INVOICE PENERIMAAN', '1. SELECT RECEIVING INVOICES')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-1">
                {receivingsLoading ? (
                  <p className="text-slate-400 italic font-bold">Loading invoices...</p>
                ) : (
                  <>
                    {postedReceivings.map((r: any) => {
                      const isSelected = formData.selectedReceivings.includes(r.id);
                      return (
                        <div 
                          key={r.id} 
                          onClick={() => handleSelectReceiving(r.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-ocean-500 bg-ocean-50/50' : 'border-slate-100 hover:border-ocean-200'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{r.date}</p>
                              <p className="font-bold text-slate-900">{suppliers.find((s: any) => s.id === r.supplierId)?.name || 'Unknown'}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="text-ocean-600" size={20} />}
                          </div>
                          <p className="text-sm font-black text-slate-600">Inv: #{r.id.substring(0,8).toUpperCase()}</p>
                          <p className="text-xs font-bold text-slate-500 mt-2">{r.totalQty} kg</p>
                        </div>
                      );
                    })}
                    {postedReceivings.length === 0 && (
                      <p className="text-slate-400 italic font-bold">No posted receiving invoices available.</p>
                    )}
                  </>
                )}
              </div>
            </Card>

            {formData.selectedReceivings.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('2. KONFIRMASI HASIL PRODUKSI AKTUAL', '2. CONFIRM ACTUAL PRODUCTION OUTPUT')}</h3>
                </div>
                <div className="space-y-4">
                  {formData.lines.map((line: any) => {
                    const item = items.find((i: any) => i.id === line.itemId);
                    const itemName = item?.nameEn || item?.nameId || item?.name || item?.item_code || 'Unknown Item';
                    const hasShortfall = line.actualQty < line.invoiceQty;
                    const hasSurplus = line.actualQty > line.invoiceQty;
                    return (
                      <div key={line.id} className={`p-4 rounded-2xl border transition-all ${hasShortfall ? 'border-amber-200 bg-amber-50/30' : hasSurplus ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 items-center overflow-x-auto no-scrollbar min-w-[500px]">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Inv: #{line.receivingId.substring(0,8).toUpperCase()}</p>
                            {/* P1-F5: Show resolved item name */}
                            <p className="font-black text-sm text-slate-900">{itemName}</p>
                            <div className="flex gap-1 mt-1">
                              <select 
                                className="text-[10px] bg-white px-1 py-0.5 rounded font-black text-slate-500 border border-slate-200 uppercase outline-none focus:ring-1 focus:ring-ocean-500/20"
                                value={line.gradeId || ''} 
                                onChange={e => updateLine(line.id, 'gradeId', e.target.value)}
                              >
                                <option value="">G--</option>
                                {getFilteredGrades(line.itemId).map((g: any) => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                              <select 
                                className="text-[10px] bg-white px-1 py-0.5 rounded font-black text-slate-500 border border-slate-200 uppercase outline-none focus:ring-1 focus:ring-ocean-500/20"
                                value={line.sizeId || ''} 
                                onChange={e => updateLine(line.id, 'sizeId', e.target.value)}
                              >
                                <option value="">S--</option>
                                {getFilteredSizes(line.itemId).map((s: any) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase">{t('ESTIMASI AWAL', 'RAW ESTIMATE')}</p>
                            <p className="font-black text-lg text-slate-700">{line.invoiceQty} kg</p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase">{t('QTY AKTUAL (PROSES)', 'ACTUAL QTY (PROCESSED)')}</p>
                               {hasSurplus && <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse"><TrendingUp size={10}/> SURPLUS</span>}
                            </div>
                            <input 
                              type="number" 
                              className={`w-full min-w-[100px] p-2.5 rounded-xl border text-sm font-black focus:ring-2 outline-none ${hasShortfall ? 'border-amber-300 focus:ring-amber-500/20' : hasSurplus ? 'border-emerald-300 focus:ring-emerald-500/20' : 'border-slate-200 focus:ring-ocean-500/20'}`}
                              onWheel={e => e.currentTarget.blur()}
                              value={line.actualQty || ''}
                              onChange={e => updateLine(line.id, 'actualQty', e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                            {hasShortfall && (
                              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                <select 
                                  className="w-full p-2 rounded-lg border border-amber-300 bg-white text-xs font-bold text-amber-900 outline-none"
                                  value={line.shortfallReason}
                                  onChange={e => updateLine(line.id, 'shortfallReason', e.target.value)}
                                >
                                  <option value="">-- Klasifikasi Selisih --</option>
                                  <option value="loss">Susut (Loss/Shrinkage)</option>
                                  <option value="reject">Reject / Rusak</option>
                                  <option value="waste">Waste</option>
                                  <option value="other">Lainnya</option>
                                </select>
                                {!line.shortfallReason && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> Wajib diisi jika kurang</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {summary.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest">{t('RINGKASAN HASIL PRODUKSI', 'PRODUCTION SUMMARY')}</h3>
                </div>
                <Table 
                  data={summary}
                  columns={[
                    { header: 'ITEM', accessor: (s: any) => getItemLabel(items.find((i: any) => i.id === s.itemId)), className: 'font-bold' },
                    { header: 'GRADE', accessor: (s: any) => grades.find((g: any) => g.id === s.gradeId)?.name || '--' },
                    { header: 'SIZE', accessor: (s: any) => sizes.find((sz: any) => sz.id === s.sizeId)?.name || '--' },
                    { header: 'TOTAL ACTUAL (KG)', accessor: (s: any) => <span className="font-black text-emerald-600">{s.totalActual} kg</span>, className: 'text-right' }
                  ]}
                />
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <Card className="space-y-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ID DOKUMEN', 'DOCUMENT ID')}</label>
                  <div className="w-full bg-slate-100/50 border border-slate-100 rounded-xl p-3 font-bold text-slate-500 h-[46px] flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    {t('AUTO-GENERATED', 'AUTO-GENERATED')}
                  </div>
               </div>
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
                  {canModify && (
                    <Button 
                      className={`w-full py-4 ${!isValid() ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      onClick={() => isValid() && handleSave(true)}
                    >
                      <Send size={18} /> {t('POST PRODUKSI', 'POST PRODUCTION')}
                    </Button>
                  )}
                  {canModify && <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN DRAFT', 'SAVE DRAFT')}</Button>}
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
        title={t('Produksi', 'Production')} 
        subtitle={t('Daftar riwayat produksi dari penerimaan', 'Production history from receivings')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Produksi Baru', 'New Production')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          data={logs}
          columns={[
            { 
              header: 'ID', 
              accessor: (l: any) => (
                <span 
                  className="font-bold text-[10px] text-slate-400 cursor-help border-b border-dotted border-slate-300" 
                  title={l.id}
                >
                  #{l.id}
                </span>
              ),
              className: 'whitespace-nowrap min-w-[120px]'
            },
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('SUMBER INVOICE', 'SOURCE INVOICES'), accessor: (l: any) => (
              <div className="flex flex-wrap gap-1">
                {(l.selectedReceivings || []).map((id: string) => (
                  <span key={id} className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">#{id.substring(0,8).toUpperCase()}</span>
                ))}
              </div>
            )},
            { header: t('TOTAL INPUT', 'TOTAL INPUT'), accessor: (l: any) => <span className="font-bold">{l.totalInput} kg</span> },
            { header: t('TOTAL ACTUAL', 'TOTAL ACTUAL'), accessor: (l: any) => <span className="font-black text-emerald-600">{l.totalOutput} kg</span> },
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
