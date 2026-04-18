import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  RefreshCcw, 
  Package, 
  BarChart3, 
  Truck, 
  CreditCard, 
  Database, 
  Users, 
  Settings, 
  Printer,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const isPrintView = location.pathname.startsWith('/print');

  // Mock User Info
  const user = {
    name: 'Tariq Tharwat',
    position: 'Plant Manager',
    role: 'Admin'
  };

  if (isPrintView) return <div className="print-view bg-white min-h-screen">{children}</div>;

  const navItems = [
    { path: '/', icon: LayoutDashboard, labelId: 'Dashboard', labelEn: 'Dashboard' },
    { path: '/receiving', icon: ArrowDownCircle, labelId: 'Penerimaan', labelEn: 'Receiving' },
    { path: '/processing', icon: RefreshCcw, labelId: 'Pengolahan', labelEn: 'Processing' },
    { path: '/packing', icon: Package, labelId: 'Pengemasan', labelEn: 'Packing' },
    { path: '/stock', icon: Database, labelId: 'Stok', labelEn: 'Stock' },
    { path: '/expenses', icon: CreditCard, labelId: 'Biaya', labelEn: 'Expenses' },
    { path: '/master', icon: Users, labelId: 'Data Master', labelEn: 'Master Data' },
    { path: '/settings', icon: Settings, labelId: 'Pengaturan', labelEn: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col shadow-xl z-20`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-800 h-16 shrink-0 overflow-hidden">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded shrink-0 object-contain bg-white" />
          {sidebarOpen && <span className="font-bold text-lg tracking-tight truncate">OPS Kaimana</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{t(item.labelId, item.labelEn)}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors"
           >
             {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
             {sidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Collapse</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-slate-800 text-lg">
              {t(`Selamat Datang, ${user.name}`, `Welcome, ${user.name}`)}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
               <button 
                 onClick={() => setLanguage('id')}
                 className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'id' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
               >ID</button>
               <button 
                 onClick={() => setLanguage('en')}
                 className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
               >EN</button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 leading-none">{user.name}</div>
                <div className="text-[10px] font-medium text-slate-500 mt-1">{user.position}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <UserIcon size={16} />
              </div>
            </div>

            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
