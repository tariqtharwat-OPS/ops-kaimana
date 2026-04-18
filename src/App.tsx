import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { ReceivingPage } from './pages/transactions/ReceivingPage';
import { ProcessingPage } from './pages/transactions/ProcessingPage';
import { PackingPage } from './pages/transactions/PackingPage';
import { ExpensesPage } from './pages/transactions/ExpensesPage';
import { StockPage } from './pages/Stock';
import { BuyerView } from './pages/BuyerView';
import { ReportsPage } from './pages/ReportsPage';
import { PrintPage } from './pages/PrintPage';

// Placeholder Dashboard
const Dashboard = () => (
  <div className="space-y-8 animate-in fade-in duration-700">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">April 2026</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="premium-card p-8 bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Total Inventory</p>
        <h3 className="text-4xl font-black tracking-tighter">12,540 kg</h3>
      </div>
      <div className="premium-card p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Today's Receiving</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">450 kg</h3>
      </div>
      <div className="premium-card p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Pending Drafts</p>
        <h3 className="text-4xl font-black text-orange-500 tracking-tighter">3</h3>
      </div>
      <div className="premium-card p-8 bg-[#0f172a] text-white border-none shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Operational Cost</p>
        <h3 className="text-3xl font-black text-blue-400 tracking-tighter">Rp 4.5M</h3>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="premium-card p-8 h-80 flex items-center justify-center border-dashed border-2">
        <span className="text-slate-300 font-bold uppercase tracking-widest">Production Chart Placeholder</span>
      </div>
      <div className="premium-card p-8 h-80 flex items-center justify-center border-dashed border-2">
        <span className="text-slate-300 font-bold uppercase tracking-widest">Financial Flow Placeholder</span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Print route without AppShell wrapper */}
          <Route path="/print/:type/:id" element={<PrintPage />} />
          
          {/* Standard routes with AppShell */}
          <Route path="/*" element={
            <AppShell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/receiving" element={<ReceivingPage />} />
                <Route path="/processing" element={<ProcessingPage />} />
                <Route path="/packing" element={<PackingPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/buyer" element={<BuyerView />} />
                <Route path="/master" element={<div className="p-8 font-black text-slate-300">MASTER DATA UI</div>} />
                <Route path="/settings" element={<div className="p-8 font-black text-slate-300">SETTINGS UI</div>} />
              </Routes>
            </AppShell>
          } />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
