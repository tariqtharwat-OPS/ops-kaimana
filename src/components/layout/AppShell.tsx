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
  UserCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const navigation = [
    { icon: LayoutDashboard, label: t('Dashboard', 'Dashboard'), path: '/' },
    { icon: ArrowDownCircle, label: t('Penerimaan', 'Receiving'), path: '/receiving' },
    { icon: RefreshCcw, label: t('Pengolahan', 'Processing'), path: '/processing' },
    { icon: Package, label: t('Packing', 'Packing'), path: '/packing' },
    { icon: Database, label: t('Stok', 'Stock'), path: '/stock' },
    { icon: CreditCard, label: t('Biaya', 'Expenses'), path: '/expenses' },
    { icon: BarChart, label: t('Laporan', 'Reports'), path: '/reports' },
    { icon: UserCheck, label: t('Buyer View', 'Buyer View'), path: '/buyer' },
  ];

  const adminNav = [
    { icon: Users, label: t('Master Data', 'Master Data'), path: '/master' },
    { icon: Settings, label: t('Pengaturan', 'Settings'), path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside 
        className={`${collapsed ? 'w-20' : 'w-72'} bg-[#f8fafc] border-r border-slate-100 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}
      >
        <div className="p-8 flex items-center justify-center">
          <img 
            src="/images/logo.png" 
            alt="OPS Kaimana" 
            className={`${collapsed ? 'h-8' : 'h-16'} transition-all object-contain`}
          />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-ocean-800 text-white shadow-md shadow-ocean-800/10' 
                    : 'text-slate-500 hover:bg-ocean-50 hover:text-ocean-800'
                }`}
              >
                <item.icon size={20} />
                {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
          
          <div className="pt-6 pb-2 px-4">
            {!collapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Administrasi', 'Administration')}</span>}
          </div>

          {adminNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-ocean-800 text-white shadow-md shadow-ocean-800/10' 
                    : 'text-slate-500 hover:bg-ocean-50 hover:text-ocean-800'
                }`}
              >
                <item.icon size={20} />
                {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 hover:bg-ocean-50 rounded-xl transition-colors text-slate-400 hover:text-ocean-800"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="h-24 bg-white sticky top-0 z-40 px-12 flex items-center justify-between border-b border-slate-50">
          <div>
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('Selamat Datang', 'Welcome')},</h2>
             <div className="flex items-center gap-2 mt-0.5">
               <span className="text-xl font-black text-slate-900 tracking-tight">Tariq Tharwat</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('id')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'id' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
              >ID</button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
              >EN</button>
            </div>
            
            <div className="flex items-center gap-4 group cursor-pointer pl-8 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-ocean-800 transition-colors">Plant Manager</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-tight">Administrator</p>
              </div>
              <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-ocean-800 group-hover:border-ocean-100 group-hover:bg-ocean-50 transition-all">
                <UserIcon size={20} />
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
