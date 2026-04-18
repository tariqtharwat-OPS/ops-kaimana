import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { ReceivingPage } from './pages/transactions/ReceivingPage';
import { ProcessingPage } from './pages/transactions/ProcessingPage';
import { PackingPage } from './pages/transactions/PackingPage';
import { ExpensesPage } from './pages/transactions/ExpensesPage';
import { StockPage } from './pages/Stock';
import { MasterDataPage } from './pages/MasterData';
import { BuyerView } from './pages/BuyerView';
import { ReportsPage } from './pages/ReportsPage';
import { PrintPage } from './pages/PrintPage';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';

import { SalesPage } from './pages/transactions/SalesPage';

function App() {
  return (
    <AuthProvider>
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
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/stock" element={<StockPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/buyer" element={<BuyerView />} />
                  <Route path="/master" element={<MasterDataPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<div className="p-8 font-black text-slate-300">SETTINGS UI</div>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
