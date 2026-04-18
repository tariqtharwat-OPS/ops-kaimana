import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
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
                <Route path="/master" element={<MasterDataPage />} />
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
