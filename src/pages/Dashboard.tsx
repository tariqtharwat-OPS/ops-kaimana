import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, TrendingUp, Package, Clock,
  DollarSign, Truck, FileText, Activity, Bot, ShieldCheck, Users, X, SearchCheck
} from 'lucide-react';
import { Card, Header, Badge } from '../components/ui/DesignSystem';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../hooks/useMasterData';
import { getItemLabel } from '../utils/itemMapping';

export const Dashboard = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [selectedMovement, setSelectedMovement] = useState<any | null>(null);

  const { data: stock } = useMasterData('stock', true);
  const { data: receivings } = useMasterData('receivings', true);
  const { data: sales } = useMasterData('sales', true);
  const { data: movements } = useMasterData('stock_movements', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: items } = useMasterData('items', true);
  const { data: users } = useMasterData('users', true);
  const { data: expenseCategories } = useMasterData('expense_categories', true);
  const { data: allocations } = useMasterData('buyerAllocations', true);

  const todayStr = new Date().toISOString().split('T')[0];

  // ── KPI derivations ──────────────────────────────────────────────────────
  const totalPhysical = useMemo(() =>
    stock.reduce((sum: number, s: any) => sum + (s.physicalQty || s.quantity || 0), 0),
  [stock]);

  const lowStockCount = useMemo(() =>
    stock.filter((s: any) => ((s.physicalQty || 0) - (s.reservedQty || 0)) < 50 && (s.physicalQty || 0) > 0).length,
  [stock]);

  const todayReceiving = useMemo(() =>
    receivings
      .filter((r: any) => r.date === todayStr && r.status === 'Posted')
      .reduce((sum: number, r: any) => sum + (r.totalQty || 0), 0),
  [receivings, todayStr]);

  const pendingDrafts = useMemo(() =>
    receivings.filter((r: any) => r.status === 'Draft').length,
  [receivings]);

  const openInvoices = useMemo(() =>
    sales.filter((s: any) => s.status === 'Posted' && s.paymentStatus !== 'Paid'),
  [sales]);

  const totalUnpaidBuyers = useMemo(() =>
    openInvoices.reduce((sum: number, s: any) => sum + (s.balanceDue !== undefined ? s.balanceDue : (s.totalAmount || 0)), 0),
  [openInvoices]);

  const pendingDispatches = useMemo(() =>
    sales.filter((s: any) => s.status === 'Posted' && s.dispatchStatus !== 'Dispatched').length,
  [sales]);

  const notRecorded = t('Belum tercatat', 'Not recorded yet');

  const movementDetailRows = (movement: any) => {
    const item = items.find((entry: any) => entry.id === movement.itemId);
    const source = movement.source || movement.sourceModule || movement.module || notRecorded;
    const createdAt = movement.timestamp?.toDate ? movement.timestamp.toDate() : new Date(movement.timestamp || movement.created_at || Date.now());
    return [
      ['Movement type', movement.type || notRecorded],
      ['Product', getItemLabel(item)],
      ['Quantity', `${movement.quantity || 0} ${item?.unit || movement.unit || 'kg'}`],
      ['Source module', source],
      ['Source document', movement.docId || movement.sourceId || movement.reference || notRecorded],
      ['Date/time', Number.isNaN(createdAt.getTime()) ? notRecorded : createdAt.toLocaleString('id-ID')],
      ['Created by', movement.createdBy || movement.userName || notRecorded],
      ['Status', movement.status || notRecorded],
      ['Notes', movement.notes || notRecorded],
    ];
  };

  // ── Recent activity: last 8 movements ────────────────────────────────────
  const recentActivity = useMemo(() =>
    [...movements]
      .sort((a: any, b: any) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || a.created_at || 0).getTime();
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || b.created_at || 0).getTime();
        return tB - tA;
      })
      .slice(0, 8),
  [movements]);

  const hasArabicText = (value: any) => /[\u0600-\u06FF]/.test(JSON.stringify(value || ''));

  const dataQuality = useMemo(() => {
    const supplierMissingContact = suppliers.filter((s: any) => !(s.phone || s.whatsapp)).length;
    const buyerMissingContact = buyers.filter((b: any) => !(b.phone || b.whatsapp || b.pic)).length;
    const buyerMissingLinkedUser = buyers.filter((b: any) => !users.some((u: any) => u.linkedBuyerId === b.id || b.linkedUserId === u.id)).length;
    const productMissingCore = items.filter((item: any) => !(item.scientificName && (item.defaultGrade || item.gradeProfileId) && (item.sizeRange || item.sizeProfileId))).length;
    const languageIssues = [...expenseCategories, ...items, ...suppliers, ...buyers].filter(hasArabicText).length;
    const provisionalAllocations = allocations.filter((allocation: any) => allocation.status === 'Provisional').length;
    return { supplierMissingContact, buyerMissingContact, buyerMissingLinkedUser, productMissingCore, languageIssues, movementCount: recentActivity.length, provisionalAllocations };
  }, [allocations, buyers, expenseCategories, items, recentActivity.length, suppliers, users]);

  // ── KPI Card helper ───────────────────────────────────────────────────────
  const KpiCard = ({ icon, label, value, sub, color, to }: { icon: React.ReactNode, label: string, value: React.ReactNode, sub?: string, color?: string, to?: string }) => {
    const inner = (
      <Card className={`h-full transition-all hover:shadow-md ${to ? 'cursor-pointer' : ''} ${color || ''}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-400">{icon}</span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {sub && <p className="text-[10px] font-bold mt-1.5 text-slate-400">{sub}</p>}
      </Card>
    );
    return to ? <Link to={to} className="block h-full">{inner}</Link> : inner;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <Header
        title={t('Ringkasan Operasional', 'Operational Overview')}
        subtitle={t('Status real-time plant Kaimana', 'Real-time Kaimana plant status')}
      />

      <Card className="border-ocean-100 bg-gradient-to-br from-ocean-50 to-white p-5 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="posted" className="border-ocean-100 bg-ocean-50 text-ocean-700">
                Investor Demo
              </Badge>
              <Badge variant="draft">{currentUser?.role || 'Role'} view</Badge>
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              {t('Demo mini plant siap diuji', 'Mini plant demo ready to test')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              {t(
                'Gunakan data demo dengan hati-hati. Coba alur sesuai role, buka Shark Lite untuk ringkasan operasi, dan jangan hapus data atau mengganti password akun testing.',
                'Use the demo data carefully. Try the flow for each role, open Shark Lite for operational summaries, and do not delete data or change testing account passwords.'
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
              <Users size={18} className="mt-0.5 shrink-0 text-ocean-700" />
              <p className="text-xs font-bold leading-5 text-slate-600">
                <span className="text-slate-900">Admin</span>: dashboard, master data, reports, audit. <span className="text-slate-900">Operator</span>: receiving, processing, stock. <span className="text-slate-900">Buyer</span>: buyer portal only.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
              <Bot size={18} className="mt-0.5 shrink-0 text-ocean-700" />
              <p className="text-xs font-bold leading-5 text-slate-600">
                Shark Lite is demo intelligence: read-only, role-aware, rule-based, no Gemini, no backend actions.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-3 shadow-sm sm:col-span-2 lg:col-span-1">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-xs font-bold leading-5 text-slate-600">
                Safe testing: no password changes, no bulk deletes, no production reset. Use QA/demo records when trying forms.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KpiCard
          icon={<Package size={16} />}
          label={t('STOK FISIK', 'PHYSICAL STOCK')}
          value={<><span className="text-ocean-800">{totalPhysical.toLocaleString()}</span><span className="text-sm font-bold text-slate-400 ml-1">kg</span></>}
          to="/stock"
        />
        <KpiCard
          icon={<TrendingUp size={16} />}
          label={t('PENERIMAAN HARI INI', "TODAY'S RECEIVING")}
          value={<><span>{todayReceiving.toLocaleString()}</span><span className="text-sm font-bold text-slate-400 ml-1">kg</span></>}
          sub={pendingDrafts > 0 ? `${pendingDrafts} draft pending` : undefined}
          to="/receiving"
        />
        <KpiCard
          icon={<DollarSign size={16} />}
          label={t('PIUTANG TERBUKA', 'UNPAID RECEIVABLES')}
          value={<span className={totalUnpaidBuyers > 0 ? 'text-emerald-600' : 'text-slate-400'}>{totalUnpaidBuyers > 0 ? `Rp ${totalUnpaidBuyers.toLocaleString()}` : '—'}</span>}
          sub={openInvoices.length > 0 ? `${openInvoices.length} ${t('invoice terbuka', 'open invoices')}` : undefined}
          to="/sales"
        />
        <Link to="/stock" className="block">
          <Card className={`h-full transition-all hover:shadow-md cursor-pointer border-2 ${lowStockCount > 0 ? 'border-amber-300 bg-amber-50/60' : 'border-transparent'}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className={lowStockCount > 0 ? 'text-amber-500' : 'text-slate-300'} />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{t('STOK RENDAH', 'LOW STOCK')}</p>
            </div>
            <div className={`text-2xl font-black tracking-tight ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {lowStockCount} {t('Item', 'Items')}
            </div>
            {lowStockCount > 0 && <p className="text-[10px] font-bold mt-1.5 text-amber-500">{t('Tersedia &lt; 50 kg', 'Available < 50 kg')} →</p>}
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          icon={<Truck size={16} />}
          label={t('PENDING DISPATCH', 'PENDING DISPATCH')}
          value={<span className={pendingDispatches > 0 ? 'text-orange-600' : 'text-slate-400'}>{pendingDispatches}</span>}
          sub={pendingDispatches > 0 ? t('Invoice Posted belum dikirim', 'Posted invoices awaiting dispatch') : undefined}
          to="/sales"
        />
        <KpiCard
          icon={<Clock size={16} />}
          label={t('DRAFT PENERIMAAN', 'RECEIVING DRAFTS')}
          value={<span className={pendingDrafts > 0 ? 'text-amber-500' : 'text-slate-400'}>{pendingDrafts}</span>}
          sub={pendingDrafts > 0 ? t('Belum di-POST', 'Not yet posted') : undefined}
          to="/receiving"
        />
        <KpiCard
          icon={<FileText size={16} />}
          label={t('TOTAL INVOICE SALES', 'TOTAL SALES DOCS')}
          value={sales.length}
          sub={`${sales.filter((s: any) => s.status === 'Posted').length} ${t('Posted', 'Posted')}`}
          to="/sales"
        />
      </div>

      <Card className="border-[#0F3A5F]/10 bg-white p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#071827] text-cyan-300">
              <SearchCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Management Watch</h3>
              <p className="text-xs font-bold text-slate-400">Data Quality / Demo Readiness</p>
            </div>
          </div>
          <Badge variant={dataQuality.languageIssues > 0 ? 'pending' : 'posted'}>
            {dataQuality.languageIssues > 0 ? 'Review' : 'Clean'}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Supplier contact missing', dataQuality.supplierMissingContact],
            ['Buyer contact/link issues', dataQuality.buyerMissingContact + dataQuality.buyerMissingLinkedUser],
            ['Product seafood fields missing', dataQuality.productMissingCore],
            ['Recent movements', dataQuality.movementCount],
            ['Language hygiene warnings', dataQuality.languageIssues],
            ['Provisional allocations', dataQuality.provisionalAllocations],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-slate-400" size={18} />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Aktivitas Terbaru', 'Recent Stock Activity')}</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-slate-300 font-bold text-xs text-center py-6">{t('Tidak ada aktivitas', 'No recent activity')}</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((m: any, i: number) => {
                const ts = m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || m.created_at || 0);
                const it = items.find((x: any) => x.id === m.itemId);
                return (
                  <button key={i} type="button" onClick={() => setSelectedMovement(m)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left transition-all hover:border-cyan-200 hover:bg-cyan-50/40">
                    <Badge variant={m.type === 'IN' ? 'posted' : 'pending'}>{m.type}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{getItemLabel(it)}</p>
                      <p className="text-[10px] font-bold text-slate-400">{m.source || 'System'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-black ${m.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {m.type === 'IN' ? '+' : '-'}{m.quantity} kg
                      </p>
                      <p className="text-[10px] text-slate-300 font-bold">{ts.toLocaleDateString('id-ID')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="text-slate-400" size={18} />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Piutang per Buyer', 'Receivables by Buyer')}</h3>
          </div>
          {openInvoices.length === 0 ? (
            <p className="text-slate-300 font-bold text-xs text-center py-6">{t('Semua invoice telah dibayar', 'All invoices paid')}</p>
          ) : (
            <div className="space-y-3">
              {openInvoices.slice(0, 8).map((s: any, i: number) => {
                const buyer = buyers.find((b: any) => b.id === s.buyerId);
                const due = s.balanceDue !== undefined ? s.balanceDue : (s.totalAmount || 0);
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div>
                      <p className="text-xs font-black text-slate-900">{buyer?.name || 'Unknown'}</p>
                      <p className="text-[10px] font-bold text-slate-400">{s.date} · #{s.id?.substring(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-700">Rp {due.toLocaleString()}</p>
                      <Badge variant={s.paymentStatus === 'Partial' ? 'draft' : 'pending'} >{s.paymentStatus || 'Unpaid'}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
      {selectedMovement && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#071827] px-6 py-5 text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">IN/OUT Traceability</p>
                <h3 className="text-lg font-black">Stock Movement Detail</h3>
              </div>
              <button type="button" onClick={() => setSelectedMovement(null)} className="rounded-2xl bg-white/10 p-2 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[70dvh] overflow-y-auto p-6">
              <div className="grid gap-3">
                {movementDetailRows(selectedMovement).map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-1 break-words text-sm font-black text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              {(selectedMovement.docId || selectedMovement.sourceId) && (
                <Link to={String(selectedMovement.source || '').toLowerCase().includes('receiving') ? '/receiving' : String(selectedMovement.source || '').toLowerCase().includes('sale') ? '/sales' : '/stock'} className="mt-5 block rounded-2xl bg-ocean-700 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white">
                  Open source module
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
