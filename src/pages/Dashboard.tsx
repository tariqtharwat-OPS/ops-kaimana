import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, TrendingUp, Package, Clock,
  DollarSign, Truck, FileText, Activity
} from 'lucide-react';
import { Card, Header, Badge } from '../components/ui/DesignSystem';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { getItemLabel } from '../utils/itemMapping';

export const Dashboard = () => {
  const { t } = useLanguage();
  // removed unused currentUser

  const { data: stock } = useMasterData('stock');
  const { data: receivings } = useMasterData('receivings');
  const { data: sales } = useMasterData('sales');
  const { data: movements } = useMasterData('stock_movements');
  const { data: buyers } = useMasterData('buyers');
  const { data: items } = useMasterData('items');

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
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
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
                  </div>
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
    </div>
  );
};
