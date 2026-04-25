import { Card, Header } from '../components/ui/DesignSystem';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Link } from 'react-router-dom';
import { AlertCircle, TrendingUp, Package, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { t } = useLanguage();

  const { data: stock } = useMasterData('stock');
  const { data: receivings } = useMasterData('receivings');

  const totalStock = stock.reduce((sum: any, s: any) => sum + (s.physicalQty || s.quantity || 0), 0);
  const lowStockCount = stock.filter((s: any) => ((s.physicalQty || 0) - (s.reservedQty || 0)) < 50 && (s.physicalQty || 0) > 0).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReceiving = receivings
    .filter((r: any) => r.date === todayStr)
    .reduce((sum, r) => {
      const lineTotal = (r.lines || []).reduce((s: number, l: any) => s + (l.quantity || 0), 0);
      return sum + lineTotal;
    }, 0);

  const pendingDrafts = receivings.filter((r: any) => r.status === 'Draft').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Header 
        title={t('Ringkasan Operasional', 'Operational Overview')} 
        subtitle={t('Status real-time plant Kaimana', 'Real-time status of Kaimana plant')} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-l-4 border-ocean-800">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-ocean-600" size={14} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('TOTAL STOK', 'TOTAL STOCK')}</p>
          </div>
          <h3 className="text-3xl font-black text-ocean-800 tracking-tighter">{totalStock.toLocaleString()} kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-emerald-500" size={14} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('PENERIMAAN HARI INI', "TODAY'S RECEIVING")}</p>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{todayReceiving.toLocaleString()} kg</h3>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-amber-400" size={14} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('DRAFT PENDING', 'DRAFT PENDING')}</p>
          </div>
          <h3 className="text-3xl font-black text-amber-500 tracking-tighter">{pendingDrafts}</h3>
        </Card>
        <Link to="/stock">
          <Card className={`border-2 transition-colors cursor-pointer hover:border-amber-400 ${
            lowStockCount > 0 ? 'border-amber-300 bg-amber-50/50' : 'border-transparent bg-slate-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={lowStockCount > 0 ? 'text-amber-500' : 'text-slate-300'} size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('STOK RENDAH', 'LOW STOCK')}</p>
            </div>
            <h3 className={`text-3xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {lowStockCount} {t('Item', 'Items')}
            </h3>
            {lowStockCount > 0 && (
              <p className="text-[10px] font-bold text-amber-500 mt-1">{t('Klik untuk lihat →', 'Click to view →')}</p>
            )}
          </Card>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        <Card className="h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Tren Produksi', 'Production Trend')}</h4>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
            <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Chart Visualization</span>
          </div>
        </Card>
        <Card className="h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Arus Kas', 'Cash Flow')}</h4>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
            <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Financial Flow</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
