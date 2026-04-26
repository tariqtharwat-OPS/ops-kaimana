import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ArrowDownCircle, CreditCard, RefreshCcw,
  Database, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  User as UserIcon, BarChart, Loader2, Sparkles, Globe, Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, isAuthLoading, login, logout } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && currentUser && location.pathname === '/') {
      navigate(currentUser.role === 'Buyer' ? '/buyer' : '/dashboard', { replace: true });
    }
  }, [isAuthLoading, currentUser, location.pathname, navigate]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null); 
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    if (!currentUser && !isAuthLoading && needsSetup === null) {
      const check = async () => {
        try {
          const q = query(collection(db, 'users'), limit(1));
          const snap = await getDocs(q);
          setNeedsSetup(snap.empty);
        } catch (err) {
          setNeedsSetup(false);
        }
      };
      check();
    }
  }, [currentUser, isAuthLoading, needsSetup]);

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
      setLoginError(err.message || 'Login failed');
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

  if (isAuthLoading || (!currentUser && needsSetup === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 bg-ocean-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] selection:bg-ocean-500 selection:text-white relative">
        {/* Top-aligned Language Selection (Responsive fix) */}
        <div className="absolute top-8 left-0 right-0 z-[100] flex justify-center md:justify-start md:px-24">
           <div className="flex bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-2xl">
             <button onClick={() => setLanguage('id')} className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${language === 'id' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' : 'text-slate-400 hover:text-white'}`}>INDONESIA</button>
             <button onClick={() => setLanguage('en')} className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${language === 'en' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' : 'text-slate-400 hover:text-white'}`}>ENGLISH</button>
           </div>
        </div>

        {/* Left Side: Dynamic Branding */}
        <div className="md:w-3/5 relative overflow-hidden flex flex-col items-center justify-center p-8 pt-24 md:p-12 lg:p-24 min-h-[50vh] md:min-h-screen">
          {/* Abstract backgrounds */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
             <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-ocean-600/20 blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[100px]"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-2xl text-center space-y-8 md:space-y-12">
            <div className="group relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-ocean-500 to-accent-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-48 h-48 md:w-80 md:h-80 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center p-8 md:p-12 transition-transform duration-700 hover:scale-[1.02]">
                <img src="/images/logo.png" alt="Logo" className="w-full h-auto object-contain" />
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto">
                <Sparkles size={14} className="text-ocean-400" />
                <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">Operational Excellence</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter italic uppercase leading-none">
                OPS <span className="text-transparent bg-clip-text bg-gradient-to-br from-ocean-400 to-accent-400">Kaimana</span>
              </h1>
              <p className="text-slate-400 font-medium text-base md:text-xl max-w-lg mx-auto leading-relaxed">
                {t('Sistem Operasional Pemrosesan Ikan Terintegrasi', 'Future-ready Integrated Fish Processing Operational System')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Form */}
        <div className="md:w-2/5 flex items-center justify-center p-8 bg-[#0f172a] relative border-l border-white/5 min-h-[50vh] md:min-h-screen">
          <div className="w-full max-w-md space-y-12 relative z-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">{needsSetup ? t('Konfigurasi Awal', 'Initial Setup') : t('Selamat Datang', 'Welcome Back')}</h2>
              <p className="text-slate-500 font-medium">{needsSetup ? t('Siapkan sistem Anda dalam hitungan detik', 'Ready your system in seconds') : t('Silakan masuk ke akun Anda', 'Please sign in to your account')}</p>
            </div>

            <div className="space-y-6">
              {needsSetup ? (
                <div className="space-y-6 animate-slide-up">
                   <div className="space-y-2">
                      <label className="text-white/40">Full Name</label>
                      <input type="text" value={setupName} onChange={e => setSetupName(e.target.value)} className="w-full bg-white/5 border-white/10 text-white focus:bg-white/10" placeholder="Tariq Tharwat" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-white/40">Email Address</label>
                      <input type="email" value={setupEmail} onChange={e => setSetupEmail(e.target.value)} className="w-full bg-white/5 border-white/10 text-white focus:bg-white/10" placeholder="admin@kaimana.com" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-white/40">Security Key</label>
                      <input type="password" value={setupPassword} onChange={e => setSetupPassword(e.target.value)} className="w-full bg-white/5 border-white/10 text-white focus:bg-white/10" placeholder="••••••••" />
                   </div>
                   {setupError && <p className="text-xs text-rose-400 font-bold">{setupError}</p>}
                   <button onClick={handleSetup} disabled={setupLoading} className="btn-primary w-full">
                      {setupLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'INITIALIZE SYSTEM'}
                   </button>
                </div>
              ) : (
                <div className="space-y-8 animate-slide-up">
                  <div className="space-y-6">
                    <div className="space-y-2 group">
                      <label className="text-white/40 group-focus-within:text-ocean-400 transition-colors tracking-widest uppercase">User Identifier</label>
                      <input type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                        onKeyDown={e => e.key === 'Enter' && document.getElementById('pw')?.focus()} placeholder="Email address" autoFocus
                        className="w-full bg-white/5 border-white/10 text-white focus:bg-white/10 py-4" />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-white/40 group-focus-within:text-ocean-400 transition-colors tracking-widest uppercase">Access Password</label>
                      <input id="pw" type="password" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
                        className="w-full bg-white/5 border-white/10 text-white focus:bg-white/10 py-4" />
                    </div>
                  </div>
                  {loginError && <p className="text-xs text-rose-400 font-bold bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{loginError}</p>}
                  <button onClick={handleLogin} disabled={loginLoading}
                    className="btn-primary w-full text-base tracking-widest">
                    {loginLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'AUTHENTICATE'}
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-600 font-black tracking-widest text-center uppercase">© 2026 Kaimana Operational Systems</p>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { icon: LayoutDashboard, label: t('Dashboard', 'Dashboard'), path: '/dashboard', roles: ['Admin', 'Operator'] },
    { icon: ArrowDownCircle, label: t('Penerimaan', 'Receiving'), path: '/receiving', roles: ['Admin', 'Operator'] },
    { icon: RefreshCcw, label: t('Pengolahan', 'Processing'), path: '/processing', roles: ['Admin', 'Operator'] },
    // { icon: Package, label: t('Packing', 'Packing'), path: '/packing', roles: ['Admin', 'Operator'] },
    { icon: Database, label: t('Stok', 'Stock'), path: '/stock', roles: ['Admin', 'Operator'] },
    { icon: BarChart, label: t('Sales / Dispatch', 'Sales / Dispatch'), path: '/sales', roles: ['Admin', 'Operator'] },
    { icon: CreditCard, label: t('Biaya', 'Expenses'), path: '/expenses', roles: ['Admin', 'Operator'] },
    { icon: BarChart, label: t('Laporan', 'Reports'), path: '/reports', roles: ['Admin', 'Operator'] },
    // { icon: UserCheck, label: t('Buyers / Partners', 'Buyers / Partners'), path: '/buyer', roles: ['Admin', 'Buyer'] },
  ].filter(n => n.roles.includes(currentUser.role));

  const adminNav = [
    { icon: Users, label: t('Master Data', 'Master Data'), path: '/master', roles: ['Admin'] },
    { icon: UserIcon, label: t('Pengguna', 'Users'), path: '/users', roles: ['Admin'] },
    { icon: Shield, label: t('Log Audit', 'Audit Log'), path: '/audit-log', roles: ['Admin'] },
    { icon: Settings, label: t('Pengaturan', 'Settings'), path: '/settings', roles: ['Admin'] },
  ].filter(n => n.roles.includes(currentUser.role));

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar Refinement */}
      <aside className={`print:hidden ${collapsed ? 'w-24' : 'w-80'} bg-white border-r border-slate-100 transition-all duration-500 ease-in-out flex flex-col fixed inset-y-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="p-10 flex items-center justify-center">
          <div className="relative group w-full">
            <div className="absolute -inset-2 bg-gradient-to-br from-ocean-500/10 to-accent-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-white relative flex justify-center items-center">
              <img src="/images/logo.png" alt="Logo" className={`${collapsed ? 'h-10' : 'h-28'} transition-all duration-500 object-contain hover:scale-105 mix-blend-multiply`} />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-ocean-600 text-white shadow-xl shadow-ocean-600/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-ocean-600'}`}>
                <item.icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
          {adminNav.length > 0 && (
            <div className="pt-8">
              {!collapsed && <p className="px-5 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Administrasi', 'Administration')}</p>}
              {adminNav.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-ocean-600 text-white shadow-xl shadow-ocean-600/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-ocean-600'}`}>
                    <item.icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-6">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all duration-300 text-slate-400 hover:text-ocean-600">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      <main className={`flex-1 print:ml-0 ${collapsed ? 'ml-24' : 'ml-80'} transition-all duration-500 relative min-h-screen`}>
        {/* Subtle Background Glow Effects for Inner Pages */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-ocean-400/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-accent-400/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Glass Header */}
        <header className="print:hidden h-24 sticky top-0 z-40 px-6 md:px-12 flex items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-white shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="animate-slide-up">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('Sistem Operasional', 'Operational System')}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">{currentUser.fullName}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden sm:flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
              <button onClick={() => setLanguage('id')}
                className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 ${language === 'id' ? 'bg-white text-ocean-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>ID</button>
              <button onClick={() => setLanguage('en')}
                className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 ${language === 'en' ? 'bg-white text-ocean-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
            </div>

            {/* Mobile Language Icon */}
            <div className="sm:hidden p-3 bg-slate-100/50 rounded-xl">
               <Globe size={18} className="text-slate-500" />
            </div>
            
            <div className="flex items-center gap-3 md:gap-5 pl-4 md:pl-10 border-l border-slate-200/50">
              <div className="text-right hidden xs:block">
                <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest">{currentUser.position}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-ocean-500 uppercase tracking-tighter">{currentUser.role}</p>
              </div>
              <button onClick={logout} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all duration-300 group" title="Logout">
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 print:p-0 max-w-[1600px] mx-auto animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
};
