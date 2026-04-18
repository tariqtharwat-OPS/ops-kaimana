import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users, 
  Database, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  Clock, 
  Briefcase,
  ChevronRight,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  RefreshCcw,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_ITEMS, MOCK_GRADES, MOCK_SIZES, MOCK_WORKERS } from '../mockData';

type ReportCategory = 'operational' | 'financial' | 'payroll';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [category, setCategory] = useState<ReportCategory>('operational');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = {
    operational: [
      { id: 'rcv', label: t('Laporan Pembelian / Penerimaan', 'Purchasing / Receiving Report'), icon: ArrowDownCircle },
      { id: 'proc', label: t('Laporan Pengolahan', 'Processing Report'), icon: RefreshCcwIcon },
      { id: 'stk', label: t('Laporan Stok', 'Stock Report'), icon: Database },
      { id: 'sls', label: t('Laporan Penjualan', 'Sales Report'), icon: TrendingUp },
      { id: 'exp', label: t('Laporan Biaya', 'Expense Report'), icon: DollarSign },
      { id: 'sup', label: t('Laporan Supplier', 'Supplier Report'), icon: Users },
      { id: 'buy', label: t('Laporan Buyer / Customer', 'Buyer / Customer Report'), icon: UserCheckIcon },
    ],
    financial: [
      { id: 'cin', label: t('Laporan Kas Masuk', 'Cash In Report'), icon: ArrowDownCircle },
      { id: 'cout', label: t('Laporan Kas Keluar', 'Cash Out Report'), icon: ArrowUpCircle },
      { id: 'svl', label: t('Laporan Nilai Penjualan', 'Sales Value Report'), icon: PieChart },
      { id: 'pvl', label: t('Laporan Nilai Pembelian', 'Purchase Value Report'), icon: BarChart3 },
      { id: 'prof', label: t('Ringkasan Profit (Profit Overview)', 'Profit Overview Report'), icon: TrendingUp },
      { id: 'dfs', label: t('Ringkasan Keuangan Harian', 'Daily Financial Summary'), icon: Clock },
    ],
    payroll: [
      { id: 'mon', label: t('Laporan Karyawan Bulanan', 'Monthly Workers Report'), icon: Briefcase },
      { id: 'day', label: t('Laporan Karyawan Harian', 'Daily Workers Report'), icon: Clock },
      { id: 'pys', label: t('Ringkasan Payroll', 'Payroll Summary Report'), icon: DollarSign },
      { id: 'wgp', label: t('Laporan Pembayaran Gaji', 'Wage Payment Report'), icon: UserCheckIcon },
    ]
  };

  if (selectedReport) {
    return <ReportDetail id={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Pusat Laporan', 'Reports Hub')}</h1>
          <p className="text-slate-500 font-medium">{t('Analisis operasional dan finansial plant dalam satu tempat', 'Plant operational and financial analysis in one place')}</p>
        </div>
        <div className="flex gap-2">
          <button className="premium-button-secondary"><Download size={18} /> Export Data</button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        {(['operational', 'financial', 'payroll'] as ReportCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              category === cat 
                ? 'bg-white text-blue-600 shadow-lg shadow-slate-200 border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t(cat.charAt(0).toUpperCase() + cat.slice(1), cat.charAt(0).toUpperCase() + cat.slice(1))}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports[category].map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className="premium-card p-6 flex items-start gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-slate-100 group-hover:border-blue-100">
              <report.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{report.label}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('Klik untuk melihat detail', 'Click to view detail')}</p>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

const ReportDetail: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
       <div className="flex items-center gap-4">
         <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
           <ArrowLeftIcon size={20} className="text-slate-600" />
         </button>
         <div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report Detail: {id.toUpperCase()}</h1>
           <p className="text-slate-500 font-medium">{t('Data real-time berdasarkan filter yang dipilih', 'Real-time data based on selected filters')}</p>
         </div>
       </div>

       {/* Filters */}
       <div className="premium-card p-6 flex flex-wrap items-end gap-4">
         <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Rentang Tanggal', 'Date Range')}</label>
           <div className="flex items-center gap-2">
             <input type="date" className="premium-input w-40" />
             <span className="text-slate-400">to</span>
             <input type="date" className="premium-input w-40" />
           </div>
         </div>
         <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kategori', 'Category')}</label>
           <select className="premium-input w-48">
             <option>All Categories</option>
           </select>
         </div>
         <button className="premium-button-primary px-4 py-2.5 h-[46px]"><Filter size={18} /> Apply</button>
         <button className="premium-button-secondary px-4 py-2.5 h-[46px] ml-auto"><Printer size={18} /> Print Report</button>
       </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="premium-card p-6 bg-blue-600 text-white border-none shadow-blue-200">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{t('Total Nilai', 'Total Value')}</p>
           <h3 className="text-2xl font-black">Rp 125.400.000</h3>
         </div>
         <div className="premium-card p-6">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('Total Volume', 'Total Volume')}</p>
           <h3 className="text-2xl font-black text-slate-900">4,500 kg</h3>
         </div>
         <div className="premium-card p-6">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('Rata-rata Harga', 'Avg Price')}</p>
           <h3 className="text-2xl font-black text-slate-900">Rp 27,866</h3>
         </div>
         <div className="premium-card p-6">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('Jumlah Transaksi', 'Transactions')}</p>
           <h3 className="text-2xl font-black text-slate-900">42</h3>
         </div>
       </div>

       {/* Table */}
       <div className="premium-card overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Value</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 tracking-tight">2026-04-{10+i}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">DOC-2604-00{i}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">Sample transaction data line {i}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">250 kg</td>
                  <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">Rp 7.500.000</td>
                  <td className="px-6 py-4 text-center">
                    <span className="status-badge status-posted">Posted</span>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

// Simple Icon Components to avoid import errors
const RefreshCcwIcon = (props: any) => <RefreshCcw {...props} />;
const UserCheckIcon = (props: any) => <UserCheck {...props} />;
const ArrowLeftIcon = (props: any) => <ChevronLeft {...props} />;
