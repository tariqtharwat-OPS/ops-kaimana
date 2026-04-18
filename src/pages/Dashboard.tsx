import { Card, Header } from '../components/ui/DesignSystem';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Header 
        title={t('Ringkasan Operasional', 'Operational Overview')} 
        subtitle={t('Status real-time plant Kaimana', 'Real-time status of Kaimana plant')} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-l-4 border-ocean-800">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('TOTAL STOK', 'TOTAL STOCK')}</p>
          <h3 className="text-3xl font-black text-ocean-800 tracking-tighter">12,540 kg</h3>
        </Card>
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('PENERIMAAN HARI INI', 'TODAY\'S RECEIVING')}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">450 kg</h3>
        </Card>
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('DRAFT PENDING', 'DRAFT PENDING')}</p>
          <h3 className="text-3xl font-black text-amber-500 tracking-tighter">3</h3>
        </Card>
        <Card className="bg-ocean-800 text-white border-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{t('BIAYA OPERASIONAL', 'OPERATIONAL COST')}</p>
          <h3 className="text-3xl font-black tracking-tighter">Rp 4.5M</h3>
        </Card>
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
