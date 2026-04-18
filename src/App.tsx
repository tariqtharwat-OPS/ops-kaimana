import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { ReceivingPage } from './pages/transactions/ReceivingPage';
import { ProcessingPage } from './pages/transactions/ProcessingPage';
import { PackingPage } from './pages/transactions/PackingPage';
import { ExpensesPage } from './pages/transactions/ExpensesPage';
import { StockPage } from './pages/Stock';
import { BuyerView } from './pages/BuyerView';

// Placeholder Dashboard
const Dashboard = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200"><h1 className="text-2xl font-bold mb-4">Dashboard</h1><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="p-6 bg-blue-50 border border-blue-100 rounded-lg"><p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Total Stok</p><h3 className="text-3xl font-bold text-blue-900">2,100 kg</h3></div><div className="p-6 bg-emerald-50 border border-emerald-100 rounded-lg"><p className="text-sm text-emerald-600 font-medium uppercase tracking-wider mb-1">Penerimaan Hari Ini</p><h3 className="text-3xl font-bold text-emerald-900">450 kg</h3></div><div className="p-6 bg-orange-50 border border-orange-100 rounded-lg"><p className="text-sm text-orange-600 font-medium uppercase tracking-wider mb-1">Draft Pending</p><h3 className="text-3xl font-bold text-orange-900">3</h3></div><div className="p-6 bg-purple-50 border border-purple-100 rounded-lg"><p className="text-sm text-purple-600 font-medium uppercase tracking-wider mb-1">Pengeluaran</p><h3 className="text-3xl font-bold text-purple-900">Rp 4.5M</h3></div></div></div>;

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/receiving" element={<ReceivingPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/packing" element={<PackingPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/buyer" element={<BuyerView />} />
            <Route path="/master" element={<div className="p-8">Master Data Management UI</div>} />
            <Route path="/settings" element={<div className="p-8">Settings UI</div>} />
          </Routes>
        </AppShell>
      </Router>
    </LanguageProvider>
  );
}

export default App;
