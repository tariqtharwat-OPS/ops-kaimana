import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  Trash2,
  ArrowLeft,
  PlusCircle,
  FileText,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';
import { transactionService } from '../../services/transactionService';

interface ExpenseLine {
  id: string;
  categoryId: string;
  description: string;
  qty: number;
  price: number;
  total: number;
}

export const ExpensesPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form' | 'view'>('list');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  const [lines, setLines] = useState<ExpenseLine[]>([
    { id: '1', categoryId: '', description: '', qty: 1, price: 0, total: 0 }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Real data from Firestore
  const { data: expenseCategories } = useMasterData('expense_categories');
  const { data: expensesHistory } = useMasterData('expenses');

  const handlePostExpense = async () => {
    if (lines.some(l => !l.categoryId || l.total <= 0)) {
      alert(t('Harap lengkapi semua kategori dan jumlah!', 'Please complete all categories and amounts!'));
      return;
    }

    try {
      await transactionService.postExpense(
        { date, refNo, paymentMethod },
        lines
      );
      alert(t('Biaya berhasil diposting!', 'Expense posted successfully!'));
      setView('list');
      resetForm();
    } catch (err) {
      console.error('Expense error:', err);
      alert('Failed to post expense.');
    }
  };

  const resetForm = () => {
    setLines([{ id: '1', categoryId: '', description: '', qty: 1, price: 0, total: 0 }]);
    setRefNo('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setSelectedDoc(null);
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), categoryId: '', description: '', qty: 1, price: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof ExpenseLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        updated.total = updated.qty * updated.price;
        return updated;
      }
      return line;
    }));
  };

  const handleViewDoc = (doc: any) => {
    setSelectedDoc(doc);
    setLines(doc.lines || []);
    setDate(doc.date);
    setRefNo(doc.refNo);
    setPaymentMethod(doc.paymentMethod);
    setView('view');
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0);

  if (view === 'form' || view === 'view') {
    const isReadOnly = view === 'view' && selectedDoc?.status === 'Posted';

    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={view === 'form' ? t('Biaya Baru', 'New Expense') : t('Detail Biaya', 'Expense Detail')} 
          subtitle={selectedDoc?.id || t('Input pengeluaran operasional multi-item', 'Input multi-item operational expenses')}
          action={
            <>
              <Button variant="secondary" onClick={() => { setView('list'); resetForm(); }}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              {!isReadOnly && (
                <>
                  <Button variant="secondary">{t('Simpan Draft', 'Save Draft')}</Button>
                  <Button onClick={handlePostExpense}>{t('Post Biaya', 'Post Expense')}</Button>
                </>
              )}
              {isReadOnly && (
                <Badge variant="posted" className="px-6 py-3 text-sm">{t('TERPOSTING', 'POSTED')}</Badge>
              )}
              <Link to={`/print/expense/${selectedDoc?.id || 'new'}`} target="_blank">
                <Button variant="secondary" className="border-ocean-200 text-ocean-800"><Printer size={18} /> {t('Cetak', 'Print')}</Button>
              </Link>
            </>
          }
        />

        <Card className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
            <input 
              type="date" 
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold disabled:opacity-50" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NO. REFERENSI', 'REF NO.')}</label>
            <input 
              type="text" 
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-black disabled:opacity-50" 
              placeholder="e.g. INV/2024/001" 
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('METODE PEMBAYARAN', 'PAYMENT METHOD')}</label>
            <select 
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold disabled:opacity-50"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
            </select>
          </div>
        </Card>

        <Card noPadding className="overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 tracking-tight">{t('Rincian Biaya', 'Expense Details')}</h3>
            {!isReadOnly && <Button variant="secondary" onClick={addLine}><PlusCircle size={16} /> {t('Tambah Baris', 'Add Line')}</Button>}
          </div>
          <Table 
            data={lines}
            columns={[
              { 
                header: t('KATEGORI', 'CATEGORY'), 
                accessor: (line) => (
                  <select 
                    disabled={isReadOnly}
                    value={line.categoryId}
                    onChange={(e) => updateLine(line.id, 'categoryId', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 disabled:opacity-50"
                  >
                    <option value="">-- {t('Pilih Kategori', 'Category')} --</option>
                    {expenseCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )
              },
              { 
                header: t('DESKRIPSI', 'DESCRIPTION'), 
                accessor: (line) => (
                  <input type="text" disabled={isReadOnly} value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium disabled:opacity-50" placeholder={t('Keterangan...', 'Description...')} />
                )
              },
              { 
                header: 'QTY', 
                accessor: (line) => (
                  <input type="number" disabled={isReadOnly} value={line.qty || ''} onChange={(e) => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900 disabled:opacity-50" />
                ),
                className: 'w-24 text-right'
              },
              { 
                header: 'PRICE', 
                accessor: (line) => (
                  <input type="number" disabled={isReadOnly} value={line.price || ''} onChange={(e) => updateLine(line.id, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900 disabled:opacity-50" />
                ),
                className: 'w-40 text-right'
              },
              { 
                header: 'TOTAL', 
                accessor: (line) => <span className="font-black text-ocean-800">Rp {line.total.toLocaleString('id-ID')}</span>,
                className: 'w-40 text-right'
              },
              {
                header: '',
                accessor: (line) => !isReadOnly && <button onClick={() => removeLine(line.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>,
                className: 'w-12 text-center'
              }
            ]}
          />
          <div className="bg-ocean-800 px-8 py-6 flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{t('TOTAL PENGELUARAN', 'GRAND TOTAL')}</span>
            <span className="text-2xl font-black">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Biaya Operasional', 'Expenses')} 
        subtitle={t('Kelola pengeluaran harian plant', 'Manage daily plant expenses')}
        action={<Button onClick={() => { setView('form'); resetForm(); }}><Plus size={20} /> {t('Input Biaya', 'Input Expense')}</Button>}
      />

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari pengeluaran...', 'Search expenses...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
          <Button variant="secondary"><Filter size={18} /> {t('Filter', 'Filter')}</Button>
        </div>

        <Table 
          data={expensesHistory}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold text-slate-500' },
            { header: t('NO. REFERENSI', 'REF NO.'), accessor: 'refNo', className: 'font-black text-slate-900' },
            { 
              header: t('TOTAL', 'TOTAL'), 
              accessor: (exp: any) => {
                const total = (exp.lines || []).reduce((s: number, l: any) => s + (l.total || 0), 0);
                return <span className="font-black text-ocean-800">Rp {total.toLocaleString('id-ID')}</span>;
              }, 
              className: 'text-right' 
            },
            { header: t('STATUS', 'STATUS'), accessor: (exp: any) => <Badge variant={exp.status === 'Posted' ? 'posted' : 'draft'}>{exp.status}</Badge>, className: 'text-center' },
            { 
              header: '', 
              accessor: (exp: any) => (
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleViewDoc(exp)} className="p-2 text-slate-300 hover:text-ocean-800 transition-all">
                    <FileText size={18} />
                  </button>
                  <ChevronRight size={18} className="text-slate-200 cursor-pointer" onClick={() => handleViewDoc(exp)} />
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
