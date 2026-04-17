import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { ReceivingPage } from './pages/transactions/ReceivingPage';

// Placeholder Pages
const Dashboard = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200"><h1 className="text-2xl font-bold mb-4">Dashboard</h1><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="p-6 bg-blue-50 border border-blue-100 rounded-lg"><p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Total Stok</p><h3 className="text-3xl font-bold text-blue-900">12,540 kg</h3></div><div className="p-6 bg-emerald-50 border border-emerald-100 rounded-lg"><p className="text-sm text-emerald-600 font-medium uppercase tracking-wider mb-1">Penerimaan Hari Ini</p><h3 className="text-3xl font-bold text-emerald-900">450 kg</h3></div><div className="p-6 bg-orange-50 border border-orange-100 rounded-lg"><p className="text-sm text-orange-600 font-medium uppercase tracking-wider mb-1">Draft Pending</p><h3 className="text-3xl font-bold text-orange-900">3</h3></div><div className="p-6 bg-purple-50 border border-purple-100 rounded-lg"><p className="text-sm text-purple-600 font-medium uppercase tracking-wider mb-1">Pengeluaran</p><h3 className="text-3xl font-bold text-purple-900">Rp 4.5M</h3></div></div></div>;
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <p className="mt-4 text-slate-500 italic">Screen blueprint for {title} is being implemented...</p>
    <div className="mt-8 border-2 border-dashed border-slate-100 rounded-lg h-64 flex items-center justify-center text-slate-300 font-medium">
      Module Preview Area
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/receiving" element={<ReceivingPage />} />
            <Route path="/processing" element={<PlaceholderPage title="Processing / Pengolahan" />} />
            <Route path="/packing" element={<PlaceholderPage title="Packing / Pengemasan" />} />
            <Route path="/sales" element={<PlaceholderPage title="Sales / Penjualan" />} />
            <Route path="/dispatch" element={<PlaceholderPage title="Dispatch / Pengiriman" />} />
            <Route path="/expenses" element={<PlaceholderPage title="Expenses / Biaya" />} />
            <Route path="/stock" element={<PlaceholderPage title="Stock / Stok" />} />
            <Route path="/master" element={<PlaceholderPage title="Master Data" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports / Laporan" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings / Pengaturan" />} />
            <Route path="/login" element={<div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">Login UI</div></div>} />
          </Routes>
        </AppShell>
      </Router>
    </LanguageProvider>
  );
}

export default App;
