import React, { useState } from 'react';
import { Plus, Trash2, Send, Save, Printer, DollarSign, X, RotateCcw, History, Edit2, Users, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { getItemLabel } from '../../utils/itemMapping';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const canModify = currentUser?.role === 'Admin' || currentUser?.role === 'Operator';

  const { data: items, loading: itemsLoading } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: suppliers, loading: suppliersLoading } = useMasterData('suppliers', true);
  const { data: receivings } = useMasterData('receivings', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: allocations } = useMasterData('buyerAllocations', true);

  const [isCreating, setIsCreating] = useState(false);
  // editingDoc: when set, the form is in edit mode for an existing Draft
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    vehicleNo: '',
    notes: '',
    lines: []
  });

  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, receivingId: string, balanceDue: number}>({isOpen: false, receivingId: '', balanceDue: 0});
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [historyModal, setHistoryModal] = useState<{isOpen: boolean, receiving: any}>({isOpen: false, receiving: null});
  const [voidModal, setVoidModal] = useState<{isOpen: boolean, doc: any}>({isOpen: false, doc: null});
  const [voidReason, setVoidReason] = useState<string>('');

  // P1-F2: Open an existing Draft for editing
  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setFormData({
      date: doc.date || new Date().toISOString().split('T')[0],
      supplierId: doc.supplierId || '',
      vehicleNo: doc.vehicleNo || '',
      notes: doc.notes || '',
      lines: (doc.lines || []).map((l: any) => ({ ...l }))
    });
    setIsCreating(true);
  };

  // P1-F4: Compute allocation summary per receiving doc
  const getAllocationSummary = (receivingId: string, totalQty: number) => {
    const docAllocs = allocations.filter((a: any) => a.receivingId === receivingId && a.buyerId);
    const assignedQty = docAllocs.reduce((sum: number, a: any) => sum + (a.allocatedQty || 0), 0);
    return { assignedQty, totalQty: totalQty || 0 };
  };

  const addLine = () => {
    setFormData((p: any) => ({
      ...p,
      lines: [...p.lines, { id: Date.now(), itemId: '', gradeId: '', sizeId: '', quantity: 0, pricePerKg: 0, buyerAllocations: [] }]
    }));
  };

  // Add a blank buyer allocation row to a specific line
  const addBuyerAllocation = (lineIdx: number) => {
    setFormData((p: any) => {
      const lines = [...p.lines];
      lines[lineIdx] = { ...lines[lineIdx], buyerAllocations: [...(lines[lineIdx].buyerAllocations || []), { buyerId: '', qty: 0 }] };
      return { ...p, lines };
    });
  };

  // Update a buyer allocation row
  const updateBuyerAllocation = (lineIdx: number, allocIdx: number, field: string, value: any) => {
    setFormData((p: any) => {
      const lines = [...p.lines];
      const allocs = [...(lines[lineIdx].buyerAllocations || [])];
      allocs[allocIdx] = { ...allocs[allocIdx], [field]: value };
      lines[lineIdx] = { ...lines[lineIdx], buyerAllocations: allocs };
      return { ...p, lines };
    });
  };

  // Remove a buyer allocation row
  const removeBuyerAllocation = (lineIdx: number, allocIdx: number) => {
    setFormData((p: any) => {
      const lines = [...p.lines];
      const allocs = (lines[lineIdx].buyerAllocations || []).filter((_: any, i: number) => i !== allocIdx);
      lines[lineIdx] = { ...lines[lineIdx], buyerAllocations: allocs };
      return { ...p, lines };
    });
  };

  const updateLine = (idx: number, field: string, value: any) => {
    setFormData((p: any) => {
      const newLines = p.lines.map((l: any, i: number) => 
        i === idx ? { ...l, [field]: value } : l
      );
      
      const newLine = { ...newLines[idx] };
      
      // Auto-fill price only when item/grade/size changes AND price is currently 0 or empty
      if (field === 'itemId' || field === 'gradeId' || field === 'sizeId') {
        const item = items.find((i: any) => i.id === (field === 'itemId' ? value : newLine.itemId));
        if (item && item.pricingMatrix) {
          const gradeKey = field === 'gradeId' ? value : (newLine.gradeId || 'standard');
          const sizeKey = field === 'sizeId' ? value : newLine.sizeId;
          
          const matrixPrice = item.pricingMatrix[gradeKey]?.[sizeKey || 'standard'];
          if (matrixPrice && (!newLine.pricePerKg || newLine.pricePerKg === 0)) {
            newLine.pricePerKg = matrixPrice;
            newLines[idx] = newLine;
          }
        }
      }
      
      return { ...p, lines: newLines };
    });
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
      const snapshot = JSON.parse(JSON.stringify(formData));
      
      if (!snapshot.supplierId) {
        alert(t("Supplier is required", "Supplier harus dipilih"));
        return;
      }
      if (snapshot.lines.length === 0) {
        alert(t("At least one item is required", "Minimal satu item harus diisi"));
        return;
      }

      const finalLines = snapshot.lines.map((l: any) => ({
        itemId: l.itemId || '',
        gradeId: l.gradeId || '',
        sizeId: l.sizeId || '',
        quantity: Number(l.quantity) || 0,
        pricePerKg: Number(l.pricePerKg) || 0,
        // P2: carry buyerAllocations (filter out blank entries)
        buyerAllocations: (l.buyerAllocations || []).filter((a: any) => a.buyerId && Number(a.qty) > 0).map((a: any) => ({ buyerId: a.buyerId, qty: Number(a.qty) }))
      })).filter((l: any) => l.itemId !== '' && l.quantity > 0);

      // Validate over-assignment for all lines
      for (let i = 0; i < finalLines.length; i++) {
        const l = finalLines[i];
        const assignedSum = (l.buyerAllocations || []).reduce((sum: number, a: any) => sum + (Number(a.qty) || 0), 0);
        if (assignedSum > l.quantity) {
          alert(t(`Line ${i+1}: Buyer allocation (${assignedSum} kg) exceeds line quantity (${l.quantity} kg). Please fix before saving.`,
                   `Baris ${i+1}: Total alokasi buyer (${assignedSum} kg) melebihi jumlah item (${l.quantity} kg).`));
          return;
        }
      }

      const hasMissingPrice = finalLines.some((l: any) => l.pricePerKg <= 0);
      if (hasMissingPrice) {
        if (!window.confirm(t("Some items have 0 price. Continue?", "Ada item dengan harga 0. Lanjutkan?"))) return;
      }

      const totalQty = finalLines.reduce((sum: number, l: any) => sum + l.quantity, 0);
      const totalAmount = finalLines.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0);

      const docData = { 
        date: snapshot.date,
        supplierId: snapshot.supplierId,
        vehicleNo: snapshot.vehicleNo || '',
        notes: snapshot.notes || '',
        lines: finalLines,
        status: 'Draft',
        totalQty,
        totalAmount,
        paymentStatus: 'Draft',
        amountPaid: 0,
        balanceDue: totalAmount,
        paymentHistory: [],
        updatedAt: new Date().toISOString(),
        postedBy: currentUser?.fullName || 'Admin',
        userEmail: currentUser?.email || ''
      };
      
      let id: string;

      // P1-F2: If editing an existing Draft, update instead of create
      if (editingDoc) {
        id = editingDoc.id;
        await transactionService.updateDocument('receivings', id, docData);
        if (isPost) {
          await transactionService.postReceiving(id, { ...docData, status: 'Draft' });
          alert(t("Document Posted Successfully", "Dokumen Berhasil di-Post"));
        } else {
          alert(t("Draft Updated Successfully", "Draft Berhasil Diperbarui"));
        }
      } else {
        id = await transactionService.createDocument('receivings', docData, 'R');
        if (isPost) {
          await transactionService.postReceiving(id, docData);
          alert(t("Document Posted Successfully", "Dokumen Berhasil di-Post"));
        } else {
          alert(t("Draft Saved Successfully", "Draft Berhasil Disimpan"));
        }
      }

      if (isPrint) window.open(`/print/receivings/${id}`, '_blank');

      setEditingDoc(null);
      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], supplierId: '', vehicleNo: '', notes: '', lines: [] });
    } catch (e: any) {
      console.error("CRITICAL ERROR in handleSave:", e);
      alert(t('Gagal menyimpan: ', 'Failed to save: ') + e.message);
    }
  };

  const handlePayment = async () => {
    try {
      if (paymentAmount <= 0 || paymentAmount > paymentModal.balanceDue) {
        alert("Nominal pembayaran tidak valid");
        return;
      }
      await transactionService.recordPayment(paymentModal.receivingId, 'receivings', paymentAmount);
      
      // P5: Audit Log for payment
      await transactionService.writeAuditLog(paymentModal.receivingId, 'receivings', 'PAYMENT', currentUser?.id || 'System', currentUser?.email || '', `Paid Rp ${paymentAmount.toLocaleString()}`);

      setPaymentModal({isOpen: false, receivingId: '', balanceDue: 0});
      setPaymentAmount(0);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleVoidClick = (doc: any) => {
    setVoidModal({isOpen: true, doc});
    setVoidReason('');
  };

  const confirmVoid = async () => {
    if (!voidReason) {
      alert(t("Alasan wajib diisi.", "Reason is required."));
      return;
    }
    
    try {
      await transactionService.voidDocument('receivings', voidModal.doc.id, currentUser?.id || 'System', currentUser?.email || '', voidReason);
      alert(t("Dokumen berhasil di-VOID", "Document VOIDED successfully"));
      setVoidModal({isOpen: false, doc: null});
      setVoidReason('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReverse = async (paymentId: string) => {
    if (!window.confirm(t('Apakah Anda yakin ingin me-reverse pembayaran ini?', 'Are you sure you want to reverse this payment?'))) return;
    try {
      await transactionService.reversePayment(historyModal.receiving.id, 'receivings', paymentId);
      setHistoryModal({isOpen: false, receiving: null}); // Close after reversal to refresh
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

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingDoc(null);
    setFormData({ date: new Date().toISOString().split('T')[0], supplierId: '', vehicleNo: '', notes: '', lines: [] });
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={editingDoc ? t('Edit Draft Penerimaan', 'Edit Draft Receiving') : t('Penerimaan Baru', 'New Receiving')}
          subtitle={editingDoc ? `✏️ Editing Draft: #${editingDoc.id}` : t('Catat pembelian bahan baku dari supplier', 'Record raw material purchase from supplier')}
          action={<Button variant="secondary" onClick={handleCancelForm}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ID DOKUMEN', 'DOCUMENT ID')}</label>
                    <div className="w-full bg-slate-100/50 border border-slate-100 rounded-xl p-3 font-bold text-slate-500 h-[46px] flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {editingDoc ? `#${editingDoc.id.toUpperCase()}` : t('AUTO-GENERATED', 'AUTO-GENERATED')}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUPPLIER', 'SUPPLIER')}</label>
                    <select 
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold ${suppliersLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={suppliersLoading}
                      value={formData.supplierId} 
                      onChange={e => setFormData((p: any) => ({ ...p, supplierId: e.target.value }))}
                    >
                      <option value="">-- {t('Pilih Supplier', 'Select Supplier')} --</option>
                      {suppliersLoading ? (
                        <option disabled>Loading Suppliers...</option>
                      ) : (
                        suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)
                      )}
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
                    const item = items.find((i: any) => i.id === line.itemId);
                    const lineQty = Number(line.quantity) || 0;
                    const assignedSum = (line.buyerAllocations || []).reduce((s: number, a: any) => s + (Number(a.qty) || 0), 0);
                    const unassigned = lineQty - assignedSum;
                    const isOverAssigned = assignedSum > lineQty;
                    
                    return (
                      <div key={line.id || idx} className="rounded-2xl border border-slate-200 overflow-hidden">
                        {/* Line Header Row */}
                        <div className="grid grid-cols-[2fr_2fr_1.5fr_2fr_2fr_auto] gap-3 items-end bg-slate-50 p-3 overflow-x-auto no-scrollbar min-w-[600px]">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">{t('ITEM', 'ITEM')}</label>
                            <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                              value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                              <option value="">--</option>
                              {itemsLoading ? <option disabled>Loading...</option> : items.map((it: any) => (
                                <option key={it.id} value={it.id}>{getItemLabel(it)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">GRADE / SIZE</label>
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
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">QTY</label>
                            <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                              onWheel={e => e.currentTarget.blur()}
                              value={line.quantity || ''}
                              onChange={e => updateLine(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">PRICE/KG</label>
                            <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                              onWheel={e => e.currentTarget.blur()}
                              value={line.pricePerKg || ''}
                              onChange={e => updateLine(idx, 'pricePerKg', e.target.value === '' ? 0 : Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                            <div className="w-full bg-slate-100/50 rounded-lg p-2 text-sm font-black text-right text-ocean-700">
                              Rp {((line.quantity || 0) * (line.pricePerKg || 0)).toLocaleString()}
                            </div>
                          </div>
                          <div className="pb-0.5 flex items-center h-[38px]">
                            <button className="p-2 text-red-300 hover:text-red-500 transition-colors" onClick={() => removeLine(idx)}><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {/* P2: Buyer Allocation Sub-section */}
                        <div className="bg-white border-t border-slate-100 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users size={12} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ALOKASI BUYER', 'BUYER ALLOCATION')}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isOverAssigned ? 'bg-red-100 text-red-700' :
                                unassigned === 0 && lineQty > 0 ? 'bg-emerald-100 text-emerald-700' :
                                unassigned > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {isOverAssigned
                                  ? `⚠ Over-assigned by ${(assignedSum - lineQty).toLocaleString()} kg`
                                  : lineQty > 0
                                  ? `${unassigned.toLocaleString()} kg ${t('belum dialokasi', 'unassigned')}`
                                  : t('Set qty first', 'Isi QTY dulu')}
                              </span>
                            </div>
                            <button
                              onClick={() => addBuyerAllocation(idx)}
                              className="text-[10px] font-black text-ocean-600 hover:text-ocean-800 flex items-center gap-1 transition-colors"
                            >
                              <Plus size={10} /> {t('Tambah Buyer', 'Add Buyer')}
                            </button>
                          </div>
                          {(line.buyerAllocations || []).length === 0 && (
                            <p className="text-[10px] text-slate-300 font-bold italic">{t('Tidak ada alokasi — seluruh qty masuk pool tidak teralokasi.', 'No allocations — all qty goes to unassigned pool.')}</p>
                          )}
                          {(line.buyerAllocations || []).map((alloc: any, aIdx: number) => (
                            <div key={aIdx} className="flex items-center gap-2 mt-1.5">
                              <select
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                                value={alloc.buyerId}
                                onChange={e => updateBuyerAllocation(idx, aIdx, 'buyerId', e.target.value)}
                              >
                                <option value="">-- {t('Pilih Buyer', 'Select Buyer')} --</option>
                                {buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                              <input
                                type="number"
                                className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-black text-right"
                                onWheel={e => e.currentTarget.blur()}
                                placeholder="kg"
                                value={alloc.qty || ''}
                                onChange={e => updateBuyerAllocation(idx, aIdx, 'qty', e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                              <span className="text-[10px] text-slate-400 font-bold">kg</span>
                              <button
                                onClick={() => removeBuyerAllocation(idx, aIdx)}
                                className="p-1 text-red-300 hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
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

             {canModify && <Button className="w-full py-4 shadow-ocean-800/20" onClick={() => handleSave(true)}><Send size={18} /> {t('POST PENERIMAAN', 'POST RECEIVING')}</Button>}
             <div className="grid grid-cols-2 gap-4">
                {canModify && <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN', 'SAVE')}</Button>}
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
            { 
              header: 'ID', 
              accessor: (r: any) => (
                <span 
                  className="font-bold text-[10px] text-slate-400 cursor-help border-b border-dotted border-slate-300" 
                  title={r.id}
                >
                  #{r.id}
                </span>
              ),
              className: 'whitespace-nowrap min-w-[120px]'
            },
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('SUPPLIER', 'SUPPLIER'), accessor: (r: any) => suppliers.find(s => s.id === r.supplierId)?.name || 'Unknown' },
            { header: t('TOTAL QTY', 'TOTAL QTY'), accessor: (r: any) => `${(r.totalQty || r.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0))?.toLocaleString()} kg`, className: 'text-right' },
            { header: t('TOTAL NILAI', 'TOTAL VALUE'), accessor: (r: any) => `Rp ${(r.totalAmount || r.lines?.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0))?.toLocaleString()}`, className: 'text-right font-bold text-ocean-700' },
            {
              header: t('ALOKASI', 'ALLOCATION'),
              accessor: (r: any) => {
                if (r.status !== 'Posted') return <span className="text-slate-300 text-xs font-bold">—</span>;
                const { assignedQty, totalQty } = getAllocationSummary(r.id, r.totalQty || 0);
                const isFullyAssigned = assignedQty >= totalQty && totalQty > 0;
                const hasAny = assignedQty > 0;
                return (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                    isFullyAssigned ? 'bg-emerald-50 text-emerald-700' :
                    hasAny ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Users size={10} />
                    {assignedQty.toLocaleString()}/{totalQty.toLocaleString()} kg
                  </span>
                );
              }
            },
            { header: 'STATUS', accessor: (r: any) => (
              <div className="flex gap-2">
                <Badge variant={r.status === 'Posted' ? 'posted' : r.status === 'Void' ? 'pending' : 'draft'}>{r.status}</Badge>
                {r.status === 'Posted' && (
                  <Badge variant={r.paymentStatus === 'Paid' ? 'posted' : r.paymentStatus === 'Partial' ? 'draft' : 'pending'}>
                    {r.paymentStatus || 'Unpaid'}
                  </Badge>
                )}
              </div>
            ) },
            { header: '', accessor: (r: any) => (
              <div className="flex gap-2 justify-end">
                {r.status === 'Draft' && canModify && (
                  <>
                    <Button variant="secondary" size="sm" className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200" onClick={() => handleEdit(r)}>
                      <Edit2 size={14} /> {t('EDIT', 'EDIT')}
                    </Button>
                    <Button variant="primary" size="sm" className="bg-ocean-600 hover:bg-ocean-700 shadow-sm" onClick={() => {
                      handleEdit(r);
                    }}>
                      <Send size={14} /> POST
                    </Button>
                  </>
                )}
                {r.status === 'Posted' && (
                  <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-slate-200" onClick={() => setHistoryModal({isOpen: true, receiving: r})} title="Payment History">
                    <History size={14} />
                  </Button>
                )}
                {r.status === 'Posted' && (!r.paymentStatus || r.paymentStatus !== 'Paid') && (
                  <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 shadow-sm border-none" onClick={() => {
                    const bal = r.balanceDue !== undefined ? r.balanceDue : r.totalAmount;
                    setPaymentModal({isOpen: true, receivingId: r.id, balanceDue: bal});
                    setPaymentAmount(bal);
                  }}>
                    <DollarSign size={14} className="text-white" /> {t('BAYAR', 'PAY')}
                  </Button>
                )}
                {r.status === 'Posted' && currentUser?.role === 'Admin' && !r.processedAt && (
                   <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleVoidClick(r)} title="Void Document">
                      <Ban size={14} />
                   </Button>
                )}
                <Link to={`/print/receivings/${r.id}`}>
                  <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-slate-200"><Printer size={14} /></Button>
                </Link>
              </div>
            ), className: 'text-right min-w-[300px]' }
          ]}
        />
      </Card>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('Bayar Tagihan', 'Pay Invoice')}</h3>
                <p className="text-sm font-bold text-slate-500">Invoice: #{paymentModal.receivingId.substring(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setPaymentModal({isOpen: false, receivingId: '', balanceDue: 0})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-red-50 text-red-900 rounded-2xl flex justify-between items-center border border-red-100">
                <span className="text-xs font-black uppercase tracking-widest">{t('Sisa Tagihan', 'Balance Due')}</span>
                <span className="text-lg font-black">Rp {paymentModal.balanceDue.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NOMINAL PEMBAYARAN', 'PAYMENT AMOUNT')}</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-2xl font-black text-red-600 focus:ring-4 ring-red-500/20 outline-none transition-all"
                  onWheel={e => e.currentTarget.blur()}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  autoFocus
                />
              </div>

              <Button 
                className="w-full py-4 text-sm bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                onClick={handlePayment}
              >
                {t('KONFIRMASI PEMBAYARAN', 'CONFIRM PAYMENT')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.isOpen && historyModal.receiving && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('Riwayat Pembayaran', 'Payment History')}</h3>
                <p className="text-sm font-bold text-slate-500">Invoice: #{historyModal.receiving.id.substring(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setHistoryModal({isOpen: false, receiving: null})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(!historyModal.receiving?.paymentHistory || historyModal.receiving.paymentHistory.length === 0) ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold">{t('Belum ada riwayat pembayaran.', 'No payment history yet.')}</p>
                </div>
              ) : (
                [...historyModal.receiving.paymentHistory].reverse().map((p: any, idx: number) => (
                  <div key={p.id || idx} className={`p-4 rounded-2xl border flex items-center justify-between ${p.reversed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-red-50/50 border-red-100'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-400">{p.date || '--'}</span>
                        {p.reversed && <Badge variant="draft">Reversed</Badge>}
                      </div>
                      <p className={`font-black text-lg ${p.reversed ? 'text-slate-500 line-through' : 'text-red-700'}`}>Rp {(p.amount || 0).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Ref: {p.id}</p>
                    </div>
                    {!p.reversed && (
                      <button onClick={() => handleReverse(p.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Reverse Entry">
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidModal.isOpen && voidModal.doc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 border-2 border-rose-500">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                  <Ban size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-600">{t('Void Dokumen', 'Void Document')}</h3>
                  <p className="text-sm font-bold text-slate-500">#{voidModal.doc.id.substring(0,8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setVoidModal({isOpen: false, doc: null})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-sm font-bold text-rose-900 mb-2">
                  {t('Tindakan ini akan membatalkan dokumen secara permanen dan mengembalikan stok yang terkait. Transaksi finansial yang terkait dengan dokumen ini (termasuk riwayat pembayaran) mungkin perlu disesuaikan secara manual.', 'This action will permanently void the document and reverse associated stock. Associated financial transactions (including payment history) may need manual adjustment.')}
                </p>
                <p className="text-xs font-black text-rose-700 uppercase tracking-widest">{t('PERINGATAN: TINDAKAN INI TIDAK DAPAT DIBATALKAN!', 'WARNING: THIS ACTION CANNOT BE UNDONE!')}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ALASAN VOID', 'REASON FOR VOIDING')}</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 transition-all h-24"
                  placeholder={t('Wajib diisi...', 'Required...')}
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                />
              </div>

              <Button 
                className="w-full py-4 text-sm bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 border-none" 
                onClick={confirmVoid}
                disabled={!voidReason}
              >
                {t('KONFIRMASI VOID DOKUMEN', 'CONFIRM VOID DOCUMENT')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

