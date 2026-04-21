import React, { useState } from 'react';
import { Plus, Trash2, Save, ChevronRight, Printer, Send, DollarSign, X, RotateCcw, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { masterDataService } from '../../services/masterDataService';
import { transactionService } from '../../services/transactionService';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

export const SalesPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: items, loading: itemsLoading } = useMasterData('items', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);
  const { data: buyers, loading: buyersLoading } = useMasterData('buyers', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: stock } = useMasterData('stock', true);
  const { data: allocations } = useMasterData('buyerAllocations');

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

  const getStockQty = (itemId: string, gradeId: string, sizeId: string) => {
    const key = `${itemId}_${gradeId || 'no'}_${sizeId || 'no'}`;
    const entry = stock.find((s: any) => s.id === key);
    return entry ? (entry.quantity || 0) : 0;
  };

  const getAvailableQty = (itemId: string, gradeId: string, sizeId: string) => {
    const total = getStockQty(itemId, gradeId, sizeId);
    const reserved = allocations
      .filter((a: any) => 
        a.itemId === itemId && 
        a.gradeId === gradeId && 
        a.sizeId === sizeId && 
        a.status === 'Provisional' &&
        a.buyerId != null
      )
      .reduce((sum: number, a: any) => sum + (a.allocatedQty || 0), 0);
    return total - reserved;
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
        alert("Buyer and lines required");
        return;
      }

      const hasMissingPrice = formData.lines.some((l: any) => !l.pricePerKg || l.pricePerKg <= 0);
      if (hasMissingPrice) {
        alert("Peringatan: Ada item dengan harga 0 atau kosong. Harap isi harga yang valid sebelum menyimpan.");
        return;
      }

      // Check stock availability if posting
      if (isPost) {
        for (const line of formData.lines) {
          const avail = getAvailableQty(line.itemId, line.gradeId, line.sizeId);
          if (line.quantity > avail) {
            alert(`Stok tidak mencukupi. Tersedia: ${avail} kg`);
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
        paymentHistory: []
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

  const handlePayment = async () => {
    try {
      if (paymentAmount <= 0 || paymentAmount > paymentModal.balanceDue) {
        alert("Nominal pembayaran tidak valid");
        return;
      }
      await transactionService.recordPayment(paymentModal.saleId, 'sales', paymentAmount);
      setPaymentModal({isOpen: false, saleId: '', balanceDue: 0});
      setPaymentAmount(0);
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
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">{t('ITEM', 'ITEM')}</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold"
                          value={line.itemId} onChange={e => updateLine(idx, 'itemId', e.target.value)}>
                          <option value="">--</option>
                          {itemsLoading ? (
                            <option disabled>Loading...</option>
                          ) : (
                            items.filter(it => it.active_status !== false).map((it: any) => {
                              const label = it.nameId || it.nameEn || it.item_code || it.id;
                              return <option key={it.id} value={it.id}>{label}</option>;
                            })
                          )}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1">
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
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">QTY (AVAIL: {getAvailableQty(line.itemId, line.gradeId, line.sizeId)})</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right"
                          value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase text-right block">PRICE/KG</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-right text-emerald-700"
                          value={line.pricePerKg} onChange={e => updateLine(idx, 'pricePerKg', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase text-right block">TOTAL</label>
                        <div className="w-full bg-slate-100/50 border border-transparent rounded-lg p-2 text-sm font-black text-right text-emerald-700">
                          Rp {((line.quantity || 0) * (line.pricePerKg || 0)).toLocaleString()}
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
                <Button className="w-full py-4 shadow-emerald-800/20" onClick={() => handleSave(true)}><Send size={18} /> {t('POST PENJUALAN', 'POST SALES')}</Button>
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
        title={t('Daftar Penjualan', 'Sales / Dispatch List')} 
        subtitle={t('Kelola pengiriman barang ke pembeli', 'Manage item dispatch to buyers')}
        action={<Button onClick={() => setIsCreating(true)}><Plus size={20} /> {t('Penjualan Baru', 'New Sales')}</Button>}
      />
      
      <Card noPadding>
        <Table 
          compact
          data={sales}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold' },
            { header: t('PEMBELI', 'BUYER'), accessor: (s: any) => buyers.find(b => b.id === s.buyerId)?.name || 'Unknown' },
            { header: t('TOTAL QTY', 'TOTAL QTY'), accessor: (s: any) => `${(s.totalQty || s.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0))?.toLocaleString()} kg`, className: 'text-right' },
            { header: t('TOTAL NILAI', 'TOTAL VALUE'), accessor: (s: any) => `Rp ${(s.totalAmount || s.lines?.reduce((sum: number, l: any) => sum + (l.quantity * l.pricePerKg), 0))?.toLocaleString()}`, className: 'text-right font-bold text-emerald-700' },
            { header: 'STATUS', accessor: (s: any) => (
              <div className="flex gap-2">
                <Badge variant={s.status === 'Posted' ? 'posted' : 'draft'}>{s.status}</Badge>
                {s.status === 'Posted' && (
                  <Badge variant={s.paymentStatus === 'Paid' ? 'posted' : s.paymentStatus === 'Partial' ? 'draft' : 'pending'}>
                    {s.paymentStatus || 'Unpaid'}
                  </Badge>
                )}
              </div>
            ) },
            { header: '', accessor: (s: any) => (
              <div className="flex justify-end gap-2">
                {s.status === 'Posted' && (
                  <Button variant="ghost" size="sm" onClick={() => setHistoryModal({isOpen: true, sale: s})} title="Payment History">
                    <History size={16} />
                  </Button>
                )}
                {s.status === 'Posted' && (!s.paymentStatus || s.paymentStatus !== 'Paid') && (
                  <Button variant="secondary" size="sm" onClick={() => {
                    const bal = s.balanceDue !== undefined ? s.balanceDue : s.totalAmount;
                    setPaymentModal({isOpen: true, saleId: s.id, balanceDue: bal});
                    setPaymentAmount(bal);
                  }}>
                    <DollarSign size={16} className="text-emerald-600" />
                  </Button>
                )}
                <Link to={`/print/sales/${s.id}`}>
                  <Button variant="secondary" size="sm"><Printer size={16} /></Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => console.log(s)}><ChevronRight size={16} /></Button>
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
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
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
              {(!historyModal.sale.paymentHistory || historyModal.sale.paymentHistory.length === 0) ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold">{t('Belum ada riwayat pembayaran.', 'No payment history yet.')}</p>
                </div>
              ) : (
                historyModal.sale.paymentHistory.map((p: any) => (
                  <div key={p.id} className={`p-4 rounded-2xl border flex items-center justify-between ${p.reversed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-400">{p.date}</span>
                        {p.reversed && <Badge variant="draft">Reversed</Badge>}
                      </div>
                      <p className={`font-black text-lg ${p.reversed ? 'text-slate-500 line-through' : 'text-emerald-700'}`}>Rp {p.amount.toLocaleString()}</p>
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
