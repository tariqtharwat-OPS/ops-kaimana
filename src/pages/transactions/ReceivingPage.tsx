import React, { useState } from 'react';
import { Plus, Trash2, Send, Save, Printer, ChevronRight, DollarSign, X, RotateCcw, History } from 'lucide-react';
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
  const { data: buyers, loading: buyersLoading } = useMasterData('buyers', true);

  const [isCreating, setIsCreating] = useState(false);
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

  const addLine = () => {
    setFormData((p: any) => ({
      ...p,
      lines: [...p.lines, { itemId: '', gradeId: '', sizeId: '', quantity: 0, pricePerKg: 0, buyerId: '' }]
    }));
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
      // Use functional update trick to get the absolute latest state if needed, 
      // but in a click handler, formData from closure is usually sufficient.
      // To be 100% sure against stale closures, we'll build from a snapshot.
      const snapshot = JSON.parse(JSON.stringify(formData));
      
      // STRICT VALIDATION
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
        buyerId: l.buyerId || null
      })).filter((l: any) => l.itemId !== '' && l.quantity > 0);

      if (finalLines.length === 0) {
        alert(t("Valid items with quantity > 0 are required", "Item valid dengan jumlah > 0 diperlukan"));
        return;
      }

      const hasMissingPrice = finalLines.some((l: any) => l.pricePerKg <= 0);
      if (hasMissingPrice) {
        if (!window.confirm(t("Some items have 0 price. Continue?", "Ada item dengan harga 0. Lanjutkan?"))) {
          return;
        }
      }

      const totalQty = finalLines.reduce((sum: number, l: any) => sum + l.quantity, 0);
      const totalAmount = finalLines.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0);

      // Build payload EXPLICITLY to avoid carrying over unwanted state
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
        updatedAt: new Date().toISOString()
      };
      
      const id = await transactionService.createDocument('receivings', docData, 'R');
      
      if (isPost) {
        await transactionService.postReceiving(id, docData);
        alert(t("Document Posted Successfully", "Dokumen Berhasil di-Post"));
      } else {
        alert(t("Draft Saved Successfully", "Draft Berhasil Disimpan"));
      }

      if (isPrint) {
        window.open(`/print/receivings/${id}`, '_blank');
      }

      // RESET AND CLOSE
      setIsCreating(false);
      setFormData({ 
        date: new Date().toISOString().split('T')[0], 
        supplierId: '', 
        vehicleNo: '', 
        notes: '', 
        lines: [] 
      });
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
      setPaymentModal({isOpen: false, receivingId: '', balanceDue: 0});
      setPaymentAmount(0);
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
                    const item = items.find(i => i.id === line.itemId);
                    
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">{t('ITEM', 'ITEM')}</label>
                          <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                            value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                            <option value="">--</option>
                            {itemsLoading ? (
                              <option disabled>Loading...</option>
                            ) : (
                              items.map((it: any) => (
                                <option key={it.id} value={it.id}>{getItemLabel(it)}</option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
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
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">{t('BUYER', 'BUYER')}</label>
                          <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold"
                            value={line.buyerId || ''} onChange={e => updateLine(idx, 'buyerId', e.target.value)}>
                            <option value="">-- {t('Opsional', 'Optional')} --</option>
                            {buyersLoading ? (
                              <option disabled>Loading...</option>
                            ) : (
                              buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)
                            )}
                          </select>
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">QTY</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-right"
                            value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">PRICE/KG</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-right"
                            value={line.pricePerKg} onChange={e => updateLine(idx, 'pricePerKg', Number(e.target.value))} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                          <div className="w-full bg-slate-100/50 border border-transparent rounded-lg p-2 text-[10px] font-black text-right text-ocean-700">
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
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('SUPPLIER', 'SUPPLIER'), accessor: (r: any) => suppliers.find(s => s.id === r.supplierId)?.name || 'Unknown' },
            { header: t('TOTAL QTY', 'TOTAL QTY'), accessor: (r: any) => `${(r.totalQty || r.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0))?.toLocaleString()} kg`, className: 'text-right' },
            { header: t('TOTAL NILAI', 'TOTAL VALUE'), accessor: (r: any) => `Rp ${(r.totalAmount || r.lines?.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0))?.toLocaleString()}`, className: 'text-right font-bold text-ocean-700' },
            { header: 'STATUS', accessor: (r: any) => (
              <div className="flex gap-2">
                <Badge variant={r.status === 'Posted' ? 'posted' : 'draft'}>{r.status}</Badge>
                {r.status === 'Posted' && (
                  <Badge variant={r.paymentStatus === 'Paid' ? 'posted' : r.paymentStatus === 'Partial' ? 'draft' : 'pending'}>
                    {r.paymentStatus || 'Unpaid'}
                  </Badge>
                )}
              </div>
            ) },
            { header: '', accessor: (r: any) => (
              <div className="flex gap-2 justify-end">
                {r.status === 'Posted' && (
                  <Button variant="ghost" size="sm" onClick={() => setHistoryModal({isOpen: true, receiving: r})} title="Payment History">
                    <History size={16} />
                  </Button>
                )}
                {r.status === 'Posted' && (!r.paymentStatus || r.paymentStatus !== 'Paid') && (
                  <Button variant="secondary" size="sm" onClick={() => {
                    const bal = r.balanceDue !== undefined ? r.balanceDue : r.totalAmount;
                    setPaymentModal({isOpen: true, receivingId: r.id, balanceDue: bal});
                    setPaymentAmount(bal);
                  }}>
                    <DollarSign size={16} className="text-ocean-600" />
                  </Button>
                )}
                <Link to={`/print/receivings/${r.id}`}>
                  <Button variant="secondary" size="sm"><Printer size={16} /></Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => console.log(r)}><ChevronRight size={16} /></Button>
              </div>
            ), className: 'text-right' }
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
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
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
    </div>
  );
};

