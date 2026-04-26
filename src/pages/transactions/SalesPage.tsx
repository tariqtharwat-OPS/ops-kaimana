import React, { useState } from 'react';
import { Plus, Trash2, Save, Printer, Send, DollarSign, X, RotateCcw, History, Truck, AlertTriangle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { getItemLabel } from '../../utils/itemMapping';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';

export const SalesPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const canModify = currentUser?.role === 'Admin' || currentUser?.role === 'Operator';

  const { data: items, loading: itemsLoading } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: buyers, loading: buyersLoading } = useMasterData('buyers', true);
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

  const getFilteredGrades = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.gradeProfileId) return [];
    return grades.filter(g => g.profileId === item.gradeProfileId && g.active_status !== false);
  };

  const getFilteredSizes = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.sizeProfileId) return [];
    return sizes.filter(s => s.profileId === item.sizeProfileId && s.active_status !== false);
  };

  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, saleId: string, balanceDue: number}>({isOpen: false, saleId: '', balanceDue: 0});
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [historyModal, setHistoryModal] = useState<{isOpen: boolean, sale: any}>({isOpen: false, sale: null});
  const [dispatchModal, setDispatchModal] = useState<{isOpen: boolean, sale: any | null}>({isOpen: false, sale: null});
  const [voidModal, setVoidModal] = useState<{isOpen: boolean, doc: any}>({isOpen: false, doc: null});
  const [voidReason, setVoidReason] = useState<string>('');

  const getStockKey = (itemId: string, gradeId: string, sizeId: string) => {
    return `${itemId}_${gradeId || 'no'}_${sizeId || 'no'}`;
  };

  const getStockQty = (itemId: string, gradeId: string, sizeId: string) => {
    const key = getStockKey(itemId, gradeId, sizeId);
    const entry = stock.find((s: any) => s.id === key);
    return entry ? (entry.physicalQty || 0) : 0;
  };

  const getReservedQty = (itemId: string, gradeId: string, sizeId: string) => {
    const key = getStockKey(itemId, gradeId, sizeId);
    const entry = stock.find((s: any) => s.id === key);
    return entry ? (entry.reservedQty || 0) : 0;
  };

  const getAvailableQty = (itemId: string, gradeId: string, sizeId: string) => {
    const total = getStockQty(itemId, gradeId, sizeId);
    const reserved = getReservedQty(itemId, gradeId, sizeId);
    return Math.max(0, total - reserved);
  };

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

  const calculateTotal = () => {
    return formData.lines.reduce((s: number, l: any) => s + (Number(l.quantity) || 0) * (Number(l.pricePerKg) || 0), 0);
  };

  const calculateTotalQty = () => {
    return formData.lines.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 0), 0);
  };

  const handleSave = async (isPost: boolean, isPrint: boolean = false) => {
    try {
      if (!formData.buyerId || formData.lines.length === 0) {
        alert(t('Pembeli dan detail barang wajib diisi', 'Buyer and lines required'));
        return;
      }

      const hasMissingPrice = formData.lines.some((l: any) => !l.pricePerKg || l.pricePerKg <= 0);
      if (hasMissingPrice) {
        alert(t("Harga tidak boleh kosong atau 0", "Price cannot be empty or 0"));
        return;
      }

      // Check availability for manual sales
      if (isPost) {
        for (const line of formData.lines) {
          const avail = getAvailableQty(line.itemId, line.gradeId, line.sizeId);
          // If this is a manual sale (no allocationId), we MUST check availability
          if (!line.allocationId && line.quantity > avail) {
            alert(`${t('Stok tidak mencukupi untuk', 'Insufficient stock for')} ${getItemLabel(items.find(i => i.id === line.itemId))}. ${t('Tersedia', 'Available')}: ${avail} kg`);
            return;
          }
        }
      }

      const totalAmount = calculateTotal();
      const docData = { 
        ...formData, 
        status: 'Draft',
        totalAmount,
        totalQty: calculateTotalQty(),
        paymentStatus: 'Unpaid',
        amountPaid: 0,
        balanceDue: totalAmount,
        paymentHistory: [],
        postedBy: currentUser?.fullName || 'Admin',
        userEmail: currentUser?.email || ''
      };
      const id = await transactionService.createDocument('sales', docData, 'S');
      if (isPost) {
        await transactionService.postSales(id, docData);
      }

      if (isPrint) {
        window.open(`/print/sales/${id}`, '_blank');
      }

      setIsCreating(false);
      setFormData({ date: new Date().toISOString().split('T')[0], buyerId: '', vehicleNo: '', notes: '', lines: [] });
    } catch (e: any) {
      console.error("Sales Save/Post error:", e);
      alert(t('Gagal menyimpan: ', 'Failed to save: ') + e.message);
    }
  };

  const handleQuickPost = async (sale: any) => {
    try {
      if (!sale.buyerId || !sale.lines || sale.lines.length === 0) {
        throw new Error(t("Data invoice tidak lengkap (Buyer/Lines missing)", "Invoice data incomplete (Buyer/Lines missing)"));
      }
      await transactionService.postSales(sale.id, { ...sale, postedBy: currentUser?.fullName || 'Admin', userEmail: currentUser?.email || '' });
      alert(t("Invoice berhasil di-POST!", "Invoice posted successfully!"));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDispatch = async (saleId: string) => {
    try {
      await transactionService.postDispatch(saleId);
      alert(t('Barang berhasil dikirim!', 'Items dispatched successfully!'));
      setDispatchModal({isOpen: false, sale: null});
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePayment = async () => {
    try {
      if (paymentAmount <= 0 || paymentAmount > paymentModal.balanceDue) {
        alert("Nominal pembayaran tidak valid");
        return;
      }
      await transactionService.recordPayment(paymentModal.saleId, 'sales', paymentAmount);
      
      // P5: Audit Log for payment
      await transactionService.writeAuditLog(paymentModal.saleId, 'sales', 'PAYMENT', currentUser?.id || 'System', currentUser?.email || '', `Paid Rp ${paymentAmount.toLocaleString()}`);

      setPaymentModal({isOpen: false, saleId: '', balanceDue: 0});
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
      await transactionService.voidDocument('sales', voidModal.doc.id, currentUser?.id || 'System', currentUser?.email || '', voidReason);
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
      await transactionService.reversePayment(historyModal.sale.id, 'sales', paymentId);
      setHistoryModal({isOpen: false, sale: null}); // Close after reversal to refresh
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-8 pb-20">
        <Header 
          title={t('Penjualan / Invoice Baru', 'New Sales / Invoice')} 
          subtitle={t('Buat invoice penjualan. Stok akan dikurangi saat dispatch.', 'Create sales invoice. Stock will be deducted at dispatch.')}
          action={<Button variant="secondary" onClick={() => setIsCreating(false)}>{t('Batal', 'Cancel')}</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ID DOKUMEN', 'DOCUMENT ID')}</label>
                    <div className="w-full bg-slate-100/50 border border-slate-100 rounded-xl p-3 font-bold text-slate-500 h-[46px] flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {t('AUTO-GENERATED', 'AUTO-GENERATED')}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PEMBELI', 'BUYER')}</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold"
                      value={formData.buyerId} onChange={e => setFormData((p: any) => ({ ...p, buyerId: e.target.value }))}>
                      <option value="">-- {t('Pilih Pembeli', 'Select Buyer')} --</option>
                      {buyersLoading ? (
                        <option disabled>Loading...</option>
                      ) : (
                        buyers.filter(b => b.active_status !== false).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)
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
                  {formData.lines.map((line: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-[3fr_2fr_2fr_2fr_2fr_auto] gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100/50 min-w-[800px] overflow-x-auto no-scrollbar">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('ITEM', 'ITEM')}</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                          value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                          <option value="">--</option>
                          {itemsLoading ? (
                            <option disabled>Loading...</option>
                          ) : (
                            items.filter(it => it.active_status !== false).map((it: any) => (
                              <option key={it.id} value={it.id}>{getItemLabel(it)}</option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">GRADE / SIZE</label>
                        <div className="flex gap-1">
                          <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold"
                            value={line.gradeId} onChange={e => updateLine(idx, 'gradeId', e.target.value)}>
                            <option value="">G</option>
                            {getFilteredGrades(line.itemId).map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                          <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold"
                            value={line.sizeId} onChange={e => updateLine(idx, 'sizeId', e.target.value)}>
                            <option value="">S</option>
                            {getFilteredSizes(line.itemId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">
                          QTY <span className="text-emerald-600">(AVAIL: {getAvailableQty(line.itemId, line.gradeId, line.sizeId)})</span>
                        </label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                          onWheel={e => e.currentTarget.blur()}
                          value={line.quantity || ''} 
                          onChange={e => updateLine(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase text-right block">PRICE/KG</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right text-emerald-700"
                          onWheel={e => e.currentTarget.blur()}
                          value={line.pricePerKg || ''} 
                          onChange={e => updateLine(idx, 'pricePerKg', e.target.value === '' ? 0 : Number(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                        <div className="w-full bg-slate-100/50 border border-transparent rounded-lg p-2 text-sm font-black text-right text-emerald-700">
                          Rp {((line.quantity || 0) * (line.pricePerKg || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div className="pb-0.5 text-right flex items-center h-[38px]">
                        <button className="p-2 text-red-300 hover:text-red-500 transition-colors" onClick={() => removeLine(idx)}><Trash2 size={16} /></button>
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
                   <span className="text-xl font-black">{calculateTotalQty().toLocaleString()} kg</span>
                 </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <span className="text-sm font-black uppercase tracking-wider">{t('TOTAL NILAI', 'TOTAL VALUE')}</span>
                   <span className="text-3xl font-black text-emerald-400">Rp {calculateTotal().toLocaleString()}</span>
                 </div>
               </div>
             </Card>

                <div className="space-y-4">
                  {canModify && <Button className="w-full py-4 shadow-emerald-800/20" onClick={() => handleSave(true)}><Send size={18} /> {t('POST INVOICE', 'POST INVOICE')}</Button>}
                  <p className="text-[10px] text-center font-bold text-emerald-200 opacity-60 px-4 italic">
                    *{t('Posting invoice hanya mengunci stok (Reserved). Stok fisik berkurang saat DISPATCH.', 'Posting invoice only reserves stock. Physical deduction occurs at DISPATCH.')}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {canModify && <Button variant="secondary" className="w-full py-4" onClick={() => handleSave(false)}><Save size={18} /> {t('SIMPAN DRAFT', 'SAVE DRAFT')}</Button>}
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
        title={t('Daftar Penjualan & Pengiriman', 'Sales & Dispatch List')} 
        subtitle={t('Kelola invoice dan pengiriman barang ke pembeli', 'Manage invoices and item dispatch to buyers')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Invoice Baru', 'New Invoice')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          compact
          data={sales}
          columns={[
            { 
              header: 'ID', 
              accessor: (s: any) => (
                <span 
                  className="font-bold text-[10px] text-slate-400 cursor-help border-b border-dotted border-slate-300" 
                  title={s.id}
                >
                  #{s.id}
                </span>
              ),
              className: 'whitespace-nowrap min-w-[120px]'
            },
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('PEMBELI', 'BUYER'), accessor: (s: any) => buyers.find(b => b.id === s.buyerId)?.name || 'Unknown' },
            { header: t('QTY', 'QTY'), accessor: (s: any) => `${(s.totalQty || 0).toLocaleString()} kg`, className: 'text-right' },
            { header: t('NILAI', 'VALUE'), accessor: (s: any) => `Rp ${(s.totalAmount || 0).toLocaleString()}`, className: 'text-right font-bold text-emerald-700' },
            { header: 'INVOICE', accessor: (s: any) => (
              <div className="flex gap-2">
                <Badge variant={s.status === 'Posted' ? 'posted' : s.status === 'Void' ? 'pending' : 'draft'}>{s.status}</Badge>
                {s.status === 'Posted' && (
                  <Badge variant={s.paymentStatus === 'Paid' ? 'posted' : s.paymentStatus === 'Partial' ? 'draft' : 'pending'}>
                    {s.paymentStatus || 'Unpaid'}
                  </Badge>
                )}
              </div>
            ) },
            { header: 'DISPATCH', accessor: (s: any) => (
              <Badge variant={s.dispatchStatus === 'Dispatched' ? 'posted' : 'pending'}>
                {s.dispatchStatus || 'Pending'}
              </Badge>
            ) },
            { header: '', accessor: (s: any) => (
              <div className="flex gap-2 justify-end">
                {s.status === 'Draft' && canModify && (
                  <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm" onClick={() => handleQuickPost(s)}>
                    <Send size={14} /> POST
                  </Button>
                )}
                {s.status === 'Posted' && s.dispatchStatus !== 'Dispatched' && canModify && (
                  <Button variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700 shadow-sm border-none" onClick={() => setDispatchModal({isOpen: true, sale: s})}>
                    <Truck size={14} /> {t('KIRIM', 'DISPATCH')}
                  </Button>
                )}
                {s.status === 'Posted' && (
                  <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-slate-200" onClick={() => setHistoryModal({isOpen: true, sale: s})} title="Payment History">
                    <History size={14} />
                  </Button>
                )}
                {s.status === 'Posted' && (!s.paymentStatus || s.paymentStatus !== 'Paid') && (
                  <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm border-none" onClick={() => {
                    const bal = s.balanceDue !== undefined ? s.balanceDue : (s.totalAmount || 0);
                    setPaymentModal({isOpen: true, saleId: s.id, balanceDue: bal});
                    setPaymentAmount(bal);
                  }}>
                    <DollarSign size={14} className="text-white" /> {t('BAYAR', 'PAY')}
                  </Button>
                )}
                {s.status === 'Posted' && s.dispatchStatus !== 'Dispatched' && currentUser?.role === 'Admin' && (
                   <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleVoidClick(s)} title="Void Document">
                      <Ban size={14} />
                   </Button>
                )}
                <Link to={`/print/sales/${s.id}`}>
                  <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-slate-200"><Printer size={14} /></Button>
                </Link>
              </div>
            ), className: 'text-right min-w-[280px]' }
          ]}
        />
      </Card>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('Terima Pembayaran', 'Receive Payment')}</h3>
                <p className="text-sm font-bold text-slate-500">Invoice: #{paymentModal.saleId.substring(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setPaymentModal({isOpen: false, saleId: '', balanceDue: 0})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl flex justify-between items-center border border-emerald-100">
                <span className="text-xs font-black uppercase tracking-widest">{t('Sisa Tagihan', 'Balance Due')}</span>
                <span className="text-lg font-black">Rp {paymentModal.balanceDue.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NOMINAL PEMBAYARAN', 'PAYMENT AMOUNT')}</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-2xl font-black text-emerald-600 focus:ring-4 ring-emerald-500/20 outline-none transition-all"
                  onWheel={e => e.currentTarget.blur()}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  autoFocus
                />
              </div>

              <Button 
                className="w-full py-4 text-sm bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" 
                onClick={handlePayment}
              >
                {t('KONFIRMASI PEMBAYARAN', 'CONFIRM PAYMENT')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModal.isOpen && dispatchModal.sale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('Konfirmasi Pengiriman', 'Confirm Dispatch')}</h3>
                <p className="text-sm font-bold text-slate-500">Invoice: #{dispatchModal.sale.id.substring(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setDispatchModal({isOpen: false, sale: null})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-orange-50 text-orange-900 rounded-2xl border border-orange-100">
                <p className="text-xs font-black uppercase tracking-widest mb-1">{t('PEMBELI', 'BUYER')}</p>
                <p className="text-lg font-black">{buyers.find(b => b.id === dispatchModal.sale.buyerId)?.name || 'Unknown'}</p>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('RINGKASAN BARANG', 'ITEM SUMMARY')}</p>
                {dispatchModal.sale.lines?.map((line: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 truncate mr-2">
                      {getItemLabel(items.find(i => i.id === line.itemId))} ({grades.find(g => g.id === line.gradeId)?.name || '-'}, {sizes.find(s => s.id === line.sizeId)?.name || '-'})
                    </span>
                    <span className="text-xs font-black text-slate-900 shrink-0">{line.quantity} kg</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                 <span className="text-sm font-medium opacity-80">{t('Total Qty', 'Total Qty')}</span>
                 <span className="text-xl font-black text-orange-600">{dispatchModal.sale.totalQty?.toLocaleString()} kg</span>
               </div>

              <div className="pt-2">
                <p className="text-[10px] text-center font-bold text-orange-600 mb-4 bg-orange-50 p-2 rounded-lg border border-orange-100 flex items-center justify-center">
                  <AlertTriangle className="inline-block w-4 h-4 mr-2" />
                  {t('Tindakan ini akan memotong stok fisik secara permanen.', 'This action will permanently deduct physical stock.')}
                </p>
                <Button 
                  className="w-full py-4 text-sm bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 border-none" 
                  onClick={() => handleDispatch(dispatchModal.sale.id)}
                >
                  <Truck size={18} className="mr-2" />
                  {t('KONFIRMASI PENGIRIMAN', 'CONFIRM DISPATCH')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.isOpen && historyModal.sale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('Riwayat Pembayaran', 'Payment History')}</h3>
                <p className="text-sm font-bold text-slate-500">Invoice: #{historyModal.sale.id.substring(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setHistoryModal({isOpen: false, sale: null})} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(!historyModal.sale?.paymentHistory || historyModal.sale.paymentHistory.length === 0) ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold">{t('Belum ada riwayat pembayaran.', 'No payment history yet.')}</p>
                </div>
              ) : (
                historyModal.sale.paymentHistory.map((p: any) => (
                  <div key={p.id} className={`p-4 rounded-2xl border flex items-center justify-between ${p.reversed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-400">{p.date || '--'}</span>
                        {p.reversed && <Badge variant="draft">Reversed</Badge>}
                      </div>
                      <p className={`font-black text-lg ${p.reversed ? 'text-slate-500 line-through' : 'text-emerald-700'}`}>Rp {(p.amount || 0).toLocaleString()}</p>
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
