import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ArrowDownCircle, RefreshCcw, Package, CreditCard, 
  Database, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  User as UserIcon, BarChart, UserCheck, Loader2, Globe
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, isAuthLoading, login, logout } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Setup state (first admin creation)
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Check if system needs initial setup
  useEffect(() => {
    if (!currentUser && !isAuthLoading) {
      const check = async () => {
        try {
          const q = query(collection(db, 'users'), limit(1));
          const snap = await getDocs(q);
          setNeedsSetup(snap.empty);
        } catch {
          setNeedsSetup(false);
        }
      };
      check();
    }
  }, [currentUser, isAuthLoading]);

  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError(t('Masukkan email dan password', 'Enter email and password'));
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setLoginError(t('Email atau password salah', 'Invalid email or password'));
      } else if (code === 'auth/too-many-requests') {
        setLoginError(t('Terlalu banyak percobaan. Coba lagi nanti.', 'Too many attempts. Try again later.'));
      } else {
        setLoginError(err.message || 'Login failed');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSetup = async () => {
    setSetupError('');
    if (!setupName || !setupEmail || !setupPassword) {
      setSetupError(t('Lengkapi semua field', 'Fill all fields'));
      return;
    }
    if (setupPassword.length < 6) {
      setSetupError(t('Password minimal 6 karakter', 'Password must be at least 6 characters'));
      return;
    }
    setSetupLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, setupEmail, setupPassword);
      await setDoc(doc(db, 'users', cred.user.uid), {
        fullName: setupName,
        position: 'System Admin',
        email: setupEmail,
        role: 'Admin',
        languagePreference: 'id',
        isActive: true,
        active_status: true,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setSetupError(err.message || 'Setup failed');
      setSetupLoading(false);
    }
  };

  // Loading screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-800" />
      </div>
    );
  }

  // Real Production Login screen (Split)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden border-r border-slate-50">
          <div className="relative z-10 text-center animate-in fade-in zoom-in duration-1000">
            <div className="w-48 h-48 bg-white shadow-2xl rounded-3xl flex items-center justify-center mx-auto mb-10 p-6 border border-slate-50">
              <img src="/images/logo.png" alt="OPS Kaimana" className="w-full h-auto object-contain" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">OPS Kaimana</h1>
            <p className="text-slate-400 font-bold text-lg max-w-md mx-auto leading-relaxed">
              {t('Sistem Operasional Pemrosesan Ikan Terintegrasi', 'Integrated Fish Processing Operational System')}
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
             <button onClick={() => setLanguage('id')} className={`text-[10px] font-black tracking-widest uppercase ${language === 'id' ? 'text-ocean-800' : 'text-slate-300'}`}>INDONESIA</button>
             <div className="w-1 h-1 rounded-full bg-slate-200"></div>
             <button onClick={() => setLanguage('en')} className={`text-[10px] font-black tracking-widest uppercase ${language === 'en' ? 'text-ocean-800' : 'text-slate-300'}`}>ENGLISH</button>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 flex items-center justify-center p-8 bg-slate-50/30">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-right duration-700 delay-150">
            {needsSetup ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('Inisialisasi Sistem', 'System Initialization')}</h2>
                  <p className="text-sm text-slate-500 font-medium">{t('Buat akun Administrator pertama Anda', 'Create your first Administrator account')}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('NAMA LENGKAP', 'FULL NAME')}</label>
                    <input type="text" value={setupName} onChange={e => setSetupName(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" placeholder="Tariq Tharwat" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL</label>
                    <input type="email" value={setupEmail} onChange={e => setSetupEmail(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" placeholder="admin@ops.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PASSWORD</label>
                    <input type="password" value={setupPassword} onChange={e => setSetupPassword(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" placeholder="••••••••" />
                  </div>
                  {setupError && <p className="text-xs text-red-500 font-bold">{setupError}</p>}
                  <button onClick={handleSetup} disabled={setupLoading} className="w-full py-4 bg-ocean-800 text-white rounded-2xl font-black text-sm hover:bg-ocean-900 transition-all active:scale-[0.98] shadow-lg shadow-ocean-800/20">
                    {setupLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('KONFIGURASI & MASUK', 'CONFIGURE & LOGIN')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('Selamat Datang Kembali', 'Welcome Back')}</h2>
                  <p className="text-sm text-slate-500 font-medium">{t('Masuk untuk mengakses dashboard operasional', 'Sign in to access operational dashboard')}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL</label>
                    <input type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('pw')?.focus()} placeholder="user@ops.com" autoFocus
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PASSWORD</label>
                    <input id="pw" type="password" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-ocean-800/5 focus:border-ocean-800 font-bold text-slate-900 transition-all shadow-sm" />
                  </div>
                  {loginError && <p className="text-xs text-red-500 font-bold">{loginError}</p>}
                  <button onClick={handleLogin} disabled={loginLoading}
                    className="w-full py-4 bg-ocean-800 text-white rounded-2xl font-black text-sm hover:bg-ocean-900 transition-all active:scale-[0.98] shadow-lg shadow-ocean-800/20">
                    {loginLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('MASUK KE SISTEM', 'LOGIN TO SYSTEM')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RBAC Navigation
  const navigation = [
    { icon: LayoutDashboard, label: t('Dashboard', 'Dashboard'), path: '/', roles: ['Admin', 'Operator'] },
    { icon: ArrowDownCircle, label: t('Penerimaan', 'Receiving'), path: '/receiving', roles: ['Admin', 'Operator'] },
    { icon: RefreshCcw, label: t('Pengolahan', 'Processing'), path: '/processing', roles: ['Admin', 'Operator'] },
    { icon: Package, label: t('Packing', 'Packing'), path: '/packing', roles: ['Admin', 'Operator'] },
    { icon: Database, label: t('Stok', 'Stock'), path: '/stock', roles: ['Admin', 'Operator'] },
    { icon: BarChart, label: t('Sales / Dispatch', 'Sales / Dispatch'), path: '/sales', roles: ['Admin', 'Operator'] },
    { icon: CreditCard, label: t('Biaya', 'Expenses'), path: '/expenses', roles: ['Admin', 'Operator'] },
    { icon: BarChart, label: t('Laporan', 'Reports'), path: '/reports', roles: ['Admin', 'Operator'] },
    { icon: UserCheck, label: t('Buyer View', 'Buyer View'), path: '/buyer', roles: ['Admin', 'Buyer'] },
  ].filter(n => n.roles.includes(currentUser.role));

  const adminNav = [
    { icon: Users, label: t('Master Data', 'Master Data'), path: '/master', roles: ['Admin'] },
    { icon: UserIcon, label: t('Pengguna', 'Users'), path: '/users', roles: ['Admin'] },
    { icon: Settings, label: t('Pengaturan', 'Settings'), path: '/settings', roles: ['Admin'] },
  ].filter(n => n.roles.includes(currentUser.role));

  return (
    <div className="flex min-h-screen bg-white">
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-[#f8fafc] border-r border-slate-100 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}>
        <div className="p-8 flex items-center justify-center">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-50">
            <img src="/images/logo.png" alt="OPS Kaimana" className={`${collapsed ? 'h-6' : 'h-12'} transition-all object-contain`} />
          </div>
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
          {adminNav.length > 0 && (
            <>
              <div className="pt-6 pb-2 px-4">
                {!collapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Administrasi', 'Administration')}</span>}
              </div>
              {adminNav.map(item => {
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
