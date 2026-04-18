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

interface ReceivingLine {
  id: string;
  itemId: string;
  gradeId: string | null;
  sizeId: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form' | 'view'>('list');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [lines, setLines] = useState<ReceivingLine[]>([
    { id: '1', itemId: '', gradeId: null, sizeId: null, quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }
  ]);

  // Real data from Firestore
  const { data: items } = useMasterData('items');
  const { data: grades } = useMasterData('grades');
  const { data: sizes } = useMasterData('sizes');
  const { data: suppliers } = useMasterData('suppliers');
  const { data: receivings } = useMasterData('receivings');

  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceType, setSourceType] = useState('Lokal');

  const handleSaveDraft = async () => {
    if (!supplierId) {
      alert(t('Harap pilih supplier!', 'Please select a supplier!'));
      return;
    }

    try {
      await transactionService.saveReceivingDraft(
        { supplierId, date, sourceType },
        lines
      );
      alert(t('Draft berhasil disimpan!', 'Draft saved successfully!'));
      setView('list');
      resetForm();
    } catch (err) {
      console.error('Save Draft error:', err);
      alert('Failed to save draft.');
    }
  };

  const handlePost = async () => {
    // Basic validation
    if (!supplierId || lines.some(l => !l.itemId || l.quantity <= 0 || !l.sizeId)) {
      alert(t('Harap lengkapi semua data dan jumlah!', 'Please complete all fields and quantities!'));
      return;
    }
    // Deep validation for smart configs
    for (const line of lines) {
      const item = items.find((i: any) => i.id === line.itemId);
      if (item) {
        if (item.hasGrade && !line.gradeId) {
          alert(`Item ${item.nameEn} requires a grade!`);
          return;
        }
      }
    }

    try {
      await transactionService.postReceiving(
        { supplierId, date, sourceType },
        lines
      );
      alert(t('Dokumen berhasil diposting!', 'Document posted successfully!'));
      setView('list');
      resetForm();
    } catch (err) {
      console.error('Post error:', err);
      alert('Failed to post document.');
    }
  };

  const resetForm = () => {
    setLines([{ id: '1', itemId: '', gradeId: null, sizeId: null, quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }]);
    setSupplierId('');
    setDate(new Date().toISOString().split('T')[0]);
    setSourceType('Lokal');
    setSelectedDoc(null);
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), itemId: '', gradeId: null, sizeId: null, quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof ReceivingLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        
        // Smart Item Behavior triggers on itemId change
        if (field === 'itemId') {
          const item = items.find((i: any) => i.id === value);
          if (item) {
            updated.gradeId = item.hasGrade ? '' : null; // Clear if hasGrade is false
            updated.sizeId = ''; // Clear size on item change
          }
        }
        
        updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
        return updated;
      }
      return line;
    }));
  };

  const handleViewDoc = (doc: any) => {
    setSelectedDoc(doc);
    setLines(doc.lines || []);
    setSupplierId(doc.supplierId);
    setDate(doc.date);
    setSourceType(doc.sourceType);
    setView('view');
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0);

  if (view === 'form' || view === 'view') {
    const isReadOnly = view === 'view' && selectedDoc?.status === 'Posted';
    
    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={view === 'form' ? t('Penerimaan Baru', 'New Receiving') : t('Detail Penerimaan', 'Receiving Detail')} 
          subtitle={selectedDoc?.id || t('Dokumen penerimaan multi-item dari supplier', 'Multi-item receiving document from supplier')}
          action={
            <>
              <Button variant="secondary" onClick={() => { setView('list'); resetForm(); }}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              {!isReadOnly && (
                <>
                  <Button variant="secondary" onClick={handleSaveDraft}>{t('Simpan Draft', 'Save Draft')}</Button>
                  <Button onClick={handlePost}>{t('Post Dokumen', 'Post Document')}</Button>
                </>
              )}
              {isReadOnly && (
                <Badge variant="posted" className="px-6 py-3 text-sm">{t('DOKUMEN TERPOSTING (TERKUNCI)', 'POSTED DOCUMENT (LOCKED)')}</Badge>
              )}
              <Link to={`/print/receiving/${selectedDoc?.id || 'new'}`} target="_blank">
                <Button variant="secondary" className="border-ocean-200 text-ocean-800"><Printer size={18} /> {t('Cetak', 'Print')}</Button>
              </Link>
            </>
          }
        />

        <Card className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUPPLIER', 'SUPPLIER')}</label>
              {!isReadOnly && (
                <Link to="/master" className="text-[10px] font-black text-ocean-800 hover:text-ocean-600 transition-colors flex items-center gap-1">
                  <Plus size={10} /> {t('Tambah Pemasok', 'Add Supplier')}
                </Link>
              )}
            </div>
            <select 
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold disabled:opacity-50"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">-- {t('Pilih Supplier', 'Select Supplier')} --</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUMBER BARANG', 'SOURCE TYPE')}</label>
            <select 
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold disabled:opacity-50"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
            >
              <option>Lokal</option>
              <option>Import</option>
            </select>
          </div>
        </Card>

        <Card noPadding className="overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 tracking-tight">{t('Item Penerimaan', 'Receiving Items')}</h3>
            {!isReadOnly && (
              <div className="flex gap-4">
                <Link to="/master" className="text-xs font-black text-ocean-800 hover:text-ocean-600 transition-colors flex items-center gap-1 bg-ocean-50 px-3 py-1.5 rounded-lg border border-ocean-100">
                  <Plus size={14} /> {t('Master Item', 'Master Item')}
                </Link>
                <Button variant="secondary" onClick={addLine}><PlusCircle size={16} /> {t('Tambah Baris', 'Add Line')}</Button>
              </div>
            )}
          </div>
          <Table 
            data={lines}
            columns={[
              { 
                header: t('IKAN / BARANG', 'FISH / ITEM'), 
                accessor: (line) => (
                  <select 
                    disabled={isReadOnly}
                    value={line.itemId}
                    onChange={(e) => updateLine(line.id, 'itemId', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 disabled:opacity-50"
                  >
                    <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                    {items.filter((i: any) => i.category === 'Raw' || i.category === 'Packaging').map((i: any) => (
                      <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>
                    ))}
                  </select>
                )
              },
              { 
                header: 'GRADE', 
                accessor: (line) => {
                  const item = items.find((i: any) => i.id === line.itemId);
                  if (item && !item.hasGrade) {
                    return <span className="text-xs text-slate-400 italic">N/A</span>;
                  }
                  const availableGrades = item ? grades.filter((g: any) => g.profileId === item.gradeProfileId && g.active_status !== false) : [];
                  return (
                    <select disabled={isReadOnly || !item} value={line.gradeId || ''} onChange={(e) => updateLine(line.id, 'gradeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm disabled:opacity-50">
                      <option value="">--</option>
                      {availableGrades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  );
                },
                className: 'w-24'
              },
              { 
                header: 'SIZE', 
                accessor: (line) => {
                  const item = items.find((i: any) => i.id === line.itemId);
                  const availableSizes = item ? sizes.filter((s: any) => s.profileId === item.sizeProfileId && s.active_status !== false) : [];
                  return (
                    <select disabled={isReadOnly || !item} value={line.sizeId || ''} onChange={(e) => updateLine(line.id, 'sizeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm disabled:opacity-50">
                      <option value="">--</option>
                      {availableSizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  );
                },
                className: 'w-24'
              },
              { 
                header: 'QTY', 
                accessor: (line) => (
                  <input type="number" disabled={isReadOnly} value={line.quantity || ''} onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900 disabled:opacity-50" placeholder="0" />
                ),
                className: 'w-24 text-right'
              },
              { 
                header: 'PRICE', 
                accessor: (line) => (
                  <input type="number" disabled={isReadOnly} value={line.unitPrice || ''} onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900 disabled:opacity-50" placeholder="0" />
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{t('TOTAL KESELURUHAN', 'GRAND TOTAL')}</span>
            <span className="text-2xl font-black">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Header 
        title={t('Penerimaan', 'Receiving')} 
        subtitle={t('Kelola dokumen masuk dari supplier', 'Manage incoming documents from suppliers')}
        action={<Button onClick={() => { setView('form'); resetForm(); }}><Plus size={20} /> {t('Penerimaan Baru', 'New Receiving')}</Button>}
      />

      <Card noPadding>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder={t('Cari dokumen...', 'Search documents...')} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all text-sm font-medium" />
          </div>
          <Button variant="secondary"><Filter size={18} /> {t('Filter', 'Filter')}</Button>
        </div>

        <Table 
          data={receivings}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold text-slate-500' },
            { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
            { 
              header: t('SUPPLIER', 'SUPPLIER'), 
              accessor: (doc: any) => suppliers.find((s: any) => s.id === doc.supplierId)?.name || doc.supplierId 
            },
            { 
              header: t('TOTAL', 'TOTAL'), 
              accessor: (doc: any) => {
                const total = (doc.lines || []).reduce((sum: number, l: any) => sum + (l.total || 0), 0);
                return <span className="font-black text-ocean-800">Rp {total.toLocaleString('id-ID')}</span>;
              }, 
              className: 'text-right' 
            },
            { header: t('STATUS', 'STATUS'), accessor: (doc: any) => <Badge variant={doc.status === 'Posted' ? 'posted' : 'draft'}>{doc.status}</Badge>, className: 'text-center' },
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
