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
import { MOCK_RECEIVING, MOCK_SUPPLIERS, MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES } from '../../mockData';
import { Button, Card, Header, Badge } from '../../components/ui/DesignSystem';
import { Table } from '../../components/ui/Table';

interface ReceivingLine {
  id: string;
  itemId: string;
  gradeId: string;
  sizeId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const ReceivingPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [lines, setLines] = useState<ReceivingLine[]>([
    { id: '1', itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), itemId: '', gradeId: '', sizeId: '', quantity: 0, unit: 'KG', unitPrice: 0, total: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof ReceivingLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return line;
    }));
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0);

  if (view === 'form') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        <Header 
          title={t('Penerimaan Baru', 'New Receiving')} 
          subtitle={t('Dokumen penerimaan multi-item dari supplier', 'Multi-item receiving document from supplier')}
          action={
            <>
              <Button variant="secondary" onClick={() => setView('list')}><ArrowLeft size={18} /> {t('Kembali', 'Back')}</Button>
              <Button variant="secondary">{t('Simpan Draft', 'Save Draft')}</Button>
              <Button>{t('Post Dokumen', 'Post Document')}</Button>
              <Link to="/print/receiving/RCV-2604-001" target="_blank">
                <Button variant="secondary" className="border-ocean-200 text-ocean-800"><Printer size={18} /> {t('Cetak', 'Print')}</Button>
              </Link>
            </>
          }
        />

        <Card className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TANGGAL', 'DATE')}</label>
            <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUPPLIER', 'SUPPLIER')}</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
              <option value="">-- {t('Pilih Supplier', 'Select Supplier')} --</option>
              {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SUMBER BARANG', 'SOURCE TYPE')}</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
              <option>Lokal</option>
              <option>Import</option>
            </select>
          </div>
        </Card>

        <Card noPadding className="overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 tracking-tight">{t('Item Penerimaan', 'Receiving Items')}</h3>
            <Button variant="secondary" onClick={addLine}><PlusCircle size={16} /> {t('Tambah Baris', 'Add Line')}</Button>
          </div>
          <Table 
            data={lines}
            columns={[
              { 
                header: t('IKAN / BARANG', 'FISH / ITEM'), 
                accessor: (line) => (
                  <select 
                    value={line.itemId}
                    onChange={(e) => updateLine(line.id, 'itemId', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900"
                  >
                    <option value="">-- {t('Pilih Item', 'Select Item')} --</option>
                    {MOCK_ITEMS.filter(i => i.category === 'Raw').map(i => (
                      <option key={i.id} value={i.id}>{t(i.nameId, i.nameEn)}</option>
                    ))}
                  </select>
                )
              },
              { 
                header: 'GRADE', 
                accessor: (line) => (
                  <select value={line.gradeId} onChange={(e) => updateLine(line.id, 'gradeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm">
                    <option value="">--</option>
                    {MOCK_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                ),
                className: 'w-24'
              },
              { 
                header: 'SIZE', 
                accessor: (line) => (
                  <select value={line.sizeId} onChange={(e) => updateLine(line.id, 'sizeId', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm">
                    <option value="">--</option>
                    {MOCK_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ),
                className: 'w-24'
              },
              { 
                header: 'QTY', 
                accessor: (line) => (
                  <input type="number" value={line.quantity || ''} onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900" placeholder="0" />
                ),
                className: 'w-24 text-right'
              },
              { 
                header: 'PRICE', 
                accessor: (line) => (
                  <input type="number" value={line.unitPrice || ''} onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none focus:ring-0 text-right font-black text-slate-900" placeholder="0" />
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
                accessor: (line) => <button onClick={() => removeLine(line.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>,
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
        action={<Button onClick={() => setView('form')}><Plus size={20} /> {t('Penerimaan Baru', 'New Receiving')}</Button>}
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
          data={MOCK_RECEIVING}
          columns={[
            { header: t('TANGGAL', 'DATE'), accessor: 'date', className: 'font-bold text-slate-500' },
            { header: t('NO. DOKUMEN', 'DOC NO.'), accessor: 'id', className: 'font-black text-slate-900' },
            { header: t('SUPPLIER', 'SUPPLIER'), accessor: (doc) => MOCK_SUPPLIERS.find(s => s.id === doc.supplierId)?.name },
            { header: t('TOTAL', 'TOTAL'), accessor: (doc) => <span className="font-black text-ocean-800">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>, className: 'text-right' },
            { header: t('STATUS', 'STATUS'), accessor: (doc) => <Badge variant={doc.status === 'Posted' ? 'posted' : 'draft'}>{doc.status}</Badge>, className: 'text-center' },
            { 
              header: '', 
              accessor: (doc) => (
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/print/receiving/${doc.id}`} target="_blank" className="p-2 text-slate-300 hover:text-ocean-800 transition-all">
                    <FileText size={18} />
                  </Link>
                  <ChevronRight size={18} className="text-slate-200" />
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
