import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  RefreshCcw, 
  Package, 
  CreditCard, 
  Database, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  BarChart,
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  category: 'core' | 'trans' | 'data';
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const navigation: SidebarItem[] = [
    { icon: LayoutDashboard, label: t('Dashboard', 'Dashboard'), path: '/', category: 'core' },
    { icon: ArrowDownCircle, label: t('Penerimaan', 'Receiving'), path: '/receiving', category: 'trans' },
    { icon: RefreshCcw, label: t('Pengolahan', 'Processing'), path: '/processing', category: 'trans' },
    { icon: Package, label: t('Packing', 'Packing'), path: '/packing', category: 'trans' },
    { icon: Database, label: t('Stok', 'Stock'), path: '/stock', category: 'trans' },
    { icon: CreditCard, label: t('Biaya', 'Expenses'), path: '/expenses', category: 'trans' },
    { icon: BarChart, label: t('Laporan', 'Reports'), path: '/reports', category: 'core' },
    { icon: UserCheck, label: t('Buyer View', 'Buyer View'), path: '/buyer', category: 'core' },
    { icon: Users, label: t('Master Data', 'Master Data'), path: '/master', category: 'data' },
    { icon: Settings, label: t('Pengaturan', 'Settings'), path: '/settings', category: 'data' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside 
        className={`${collapsed ? 'w-20' : 'w-64'} bg-[#0f172a] text-slate-300 transition-all duration-300 flex flex-col fixed inset-y-0 z-50 border-r border-slate-800 shadow-2xl`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">K</div>
          {!collapsed && <span className="font-black text-white tracking-tight text-lg">OPS <span className="text-blue-500">Kaimana</span></span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
                {!collapsed && <span className="text-sm font-bold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div>
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('Selamat Datang', 'Welcome')},</h2>
             <div className="flex items-center gap-2">
               <span className="text-lg font-black text-slate-900">Tariq Tharwat</span>
               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-tight border border-blue-100">Plant Manager</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setLanguage('id')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${language === 'id' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >ID</button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >EN</button>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">Administrator</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                <UserIcon size={20} />
              </div>
              <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-(--breakpoint-2xl) mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
