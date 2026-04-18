import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ArrowDownCircle, RefreshCcw, Package, CreditCard,
  Database, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  User as UserIcon, BarChart, UserCheck, Loader2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { masterDataService } from '../../services/masterDataService';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, users, login, logout, isLoading } = useAuth();

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-seed if no users
  const [seeding, setSeeding] = useState(false);
  useEffect(() => {
    if (!isLoading && users.length === 0 && !seeding) {
      setSeeding(true);
      const seed = async () => {
        try {
          // Predefined test users
          await masterDataService.create('users', { fullName: 'Admin', position: 'System Admin', email: 'admin@ops.com', role: 'Admin', languagePreference: 'id', isActive: true, active_status: true });
          await masterDataService.create('users', { fullName: 'Operator', position: 'Receiving Operator', email: 'operator@ops.com', role: 'Operator', languagePreference: 'id', isActive: true, active_status: true });
          await masterDataService.create('users', { fullName: 'Buyer', position: 'External Buyer', email: 'buyer@ops.com', role: 'Buyer', languagePreference: 'id', isActive: true, active_status: true });
        } catch (e) { console.error(e); }
      };
      seed();
    }
  }, [isLoading, users.length]);

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError('Masukkan email dan password');
      return;
    }
    // Fast login: match email, password is 'kaimana2024' for all for now
    if (password !== 'kaimana2024') {
      setError('Password salah');
      return;
    }
    const err = login(email.trim());
    if (err) setError(err);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-800" />
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-ocean-800 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 text-center animate-in fade-in slide-in-from-left duration-700">
            <img src="/images/logo.png" alt="OPS Kaimana" className="h-24 w-auto mx-auto mb-8 drop-shadow-2xl" />
            <h1 className="text-4xl font-black tracking-tighter mb-4">OPS Kaimana</h1>
            <p className="text-ocean-100 font-medium text-lg max-w-md mx-auto leading-relaxed">
              {t('Sistem Operasional Pemrosesan Ikan Terintegrasi', 'Integrated Fish Processing Operational System')}
            </p>
          </div>
          <div className="absolute bottom-8 text-ocean-300 text-[10px] font-black tracking-widest uppercase opacity-50">
            © 2024 Kaimana Plant Operations
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 flex items-center justify-center p-8 bg-slate-50/30">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-right duration-700 delay-150">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('Selamat Datang Kembali', 'Welcome Back')}</h2>
              <p className="text-sm text-slate-500 font-medium">{t('Masuk untuk mengakses dashboard operasional', 'Sign in to access operational dashboard')}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('ALAMAT EMAIL', 'EMAIL ADDRESS')}</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()} 
                    placeholder="user@ops.com" 
                    autoFocus
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PASSWORD</label>
                <input 
                  id="pw-input" 
                  type="password" 
                  value={password} 
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} 
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" 
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in shake duration-300">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-ocean-800 text-white rounded-2xl font-black text-sm hover:bg-ocean-900 transition-all active:scale-[0.98] shadow-lg shadow-ocean-800/20 flex items-center justify-center gap-2 group"
              >
                {t('MASUK KE SISTEM', 'LOGIN TO SYSTEM')}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {users.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 text-center">{t('AKSES PENGEMBANGAN', 'DEVELOPMENT ACCESS')}</p>
                <div className="grid grid-cols-1 gap-2">
                  {users.filter(u => u.isActive !== false && u.active_status !== false).slice(0, 3).map(u => (
                    <button 
                      key={u.id} 
                      onClick={() => { setEmail(u.email || ''); setPassword('kaimana2024'); }}
                      className="px-4 py-3 text-left text-[11px] text-slate-400 hover:bg-white hover:text-ocean-800 hover:border-ocean-100 border border-transparent rounded-xl transition-all flex justify-between items-center group font-bold"
                    >
                      <span>{u.email}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-slate-100 rounded text-slate-400 group-hover:bg-ocean-100 group-hover:text-ocean-800">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RBAC Navigation
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
  const navigation = allNav.filter(n => n.roles.includes(currentUser.role));
  const filteredAdminNav = adminNav.filter(n => n.roles.includes(currentUser.role));

  return (
    <div className="flex min-h-screen bg-white">
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-[#f8fafc] border-r border-slate-100 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}>
        <div className="p-8 flex items-center justify-center">
          <img src="/images/logo.png" alt="OPS Kaimana" className={`${collapsed ? 'h-8' : 'h-16'} transition-all object-contain`} />
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-ocean-800 text-white shadow-md shadow-ocean-800/10' : 'text-slate-500 hover:bg-ocean-50 hover:text-ocean-800'}`}>
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
              {filteredAdminNav.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-ocean-800 text-white shadow-md shadow-ocean-800/10' : 'text-slate-500 hover:bg-ocean-50 hover:text-ocean-800'}`}>
                    <item.icon size={20} />
                    {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 hover:bg-ocean-50 rounded-xl transition-colors text-slate-400 hover:text-ocean-800">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
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
              <button onClick={() => setLanguage('id')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'id' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}>ID</button>
              <button onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-ocean-800 shadow-sm' : 'text-slate-400'}`}>EN</button>
            </div>
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{currentUser.position}</p>
                <p className="text-[10px] font-bold text-slate-400">{currentUser.role}</p>
              </div>
              <button onClick={logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        <div className="p-12 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
