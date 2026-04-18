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
import { useAuth } from '../../context/AuthContext';
import { masterDataService } from '../../services/masterDataService';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, users, loginAs, logout } = useAuth();

  const handleSeed = async () => {
    try {
      const usersToSeed = [
        { fullName: 'Admin Test', position: 'System Admin', email: 'admin@test.com', role: 'Admin', languagePreference: 'id', isActive: true, active_status: true },
        { fullName: 'Operator Test', position: 'Receiving Operator', email: 'operator@test.com', role: 'Operator', languagePreference: 'id', isActive: true, active_status: true },
        { fullName: 'Buyer Test', position: 'External Buyer', email: 'buyer@test.com', role: 'Buyer', languagePreference: 'id', isActive: true, active_status: true }
      ];
      for (const u of usersToSeed) {
        await masterDataService.create('users', u);
      }
      alert('Seeded test users!');
    } catch(e) {
      console.error(e);
      alert('Error seeding users');
    }
  };

  // If no user is logged in, show mock login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-md text-center">
          <img src="/images/logo.png" alt="Logo" className="h-16 mx-auto mb-8" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Simulasi Login (Day-Zero)</h2>
          <p className="text-sm text-slate-500 mb-8">Pilih pengguna untuk masuk ke sistem.</p>
          
          <div className="space-y-3">
            {users.length === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 italic">Belum ada pengguna.</p>
                <button onClick={handleSeed} className="w-full py-3 bg-ocean-800 text-white rounded-xl font-bold hover:bg-ocean-700 transition-colors">Seed Test Users</button>
              </div>
            )}
            {users.map(u => (
              <button 
                key={u.id}
                onClick={() => loginAs(u.id)}
                disabled={u.isActive === false || u.active_status === false}
                className="w-full p-4 border border-slate-100 rounded-xl hover:border-ocean-800 hover:bg-ocean-50 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="text-left">
                  <p className="font-bold text-slate-900 group-hover:text-ocean-800">{u.fullName}</p>
                  <p className="text-xs text-slate-500">{u.position}</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded text-slate-600 group-hover:bg-ocean-100 group-hover:text-ocean-800">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RBAC Navigation Logic
  const allNav = [
    { icon: LayoutDashboard, label: t('Dashboard', 'Dashboard'), path: '/', roles: ['Admin', 'Operator'] },
    { icon: ArrowDownCircle, label: t('Penerimaan', 'Receiving'), path: '/receiving', roles: ['Admin', 'Operator'] },
    { icon: RefreshCcw, label: t('Pengolahan', 'Processing'), path: '/processing', roles: ['Admin', 'Operator'] },
    { icon: Package, label: t('Packing', 'Packing'), path: '/packing', roles: ['Admin', 'Operator'] },
    { icon: Database, label: t('Stok', 'Stock'), path: '/stock', roles: ['Admin', 'Operator'] },
    { icon: CreditCard, label: t('Biaya', 'Expenses'), path: '/expenses', roles: ['Admin', 'Operator'] },
    { icon: BarChart, label: t('Laporan', 'Reports'), path: '/reports', roles: ['Admin', 'Operator'] },
    { icon: UserCheck, label: t('Buyer View', 'Buyer View'), path: '/buyer', roles: ['Admin', 'Buyer'] },
  ];

  const adminNav = [
    { icon: Users, label: t('Master Data', 'Master Data'), path: '/master', roles: ['Admin'] },
    { icon: UserIcon, label: t('Pengguna', 'Users'), path: '/users', roles: ['Admin'] },
    { icon: Settings, label: t('Pengaturan', 'Settings'), path: '/settings', roles: ['Admin'] },
  ];

  const navigation = allNav.filter(nav => nav.roles.includes(currentUser.role));
  const filteredAdminNav = adminNav.filter(nav => nav.roles.includes(currentUser.role));

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
          
          {filteredAdminNav.length > 0 && (
            <>
              <div className="pt-6 pb-2 px-4">
                {!collapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Administrasi', 'Administration')}</span>}
              </div>

              {filteredAdminNav.map((item) => {
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
            </>
          )}
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
               <span className="text-xl font-black text-slate-900 tracking-tight">{currentUser.fullName}</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => {
                  setLanguage('id');
                  // Ideally we update user preference in db too, but this is sufficient for UI
                }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'id' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
              >ID</button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}
              >EN</button>
            </div>
            
            <div className="flex items-center gap-4 group cursor-pointer pl-8 border-l border-slate-100" onClick={logout}>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-ocean-800 transition-colors">{currentUser.position}</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-tight">{currentUser.role}</p>
              </div>
              <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-ocean-800 group-hover:border-ocean-100 group-hover:bg-ocean-50 transition-all">
                <UserIcon size={20} />
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Logout">
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
