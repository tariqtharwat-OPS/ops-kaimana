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
import { AuditLogPage } from './pages/AuditLogPage';

import { SalesPage } from './pages/transactions/SalesPage';

import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* 1. Public / Login Route (Root) */}
            <Route path="/" element={<AppShell children={null} />} />

            {/* 2. Print route (Outside Shell) */}
            <Route path="/print/:type/:id" element={<PrintPage />} />
            
            {/* 3. Protected Dashboard (Home) */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><Dashboard /></AppShell>
              </ProtectedRoute>
            } />

            {/* 4. Operator/Admin Restricted Routes */}
            <Route path="/receiving" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><ReceivingPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/processing" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><ProcessingPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/packing" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><PackingPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><SalesPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/stock" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><StockPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><ExpensesPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                <AppShell><ReportsPage /></AppShell>
              </ProtectedRoute>
            } />

            {/* 5. Buyer Restricted Routes */}
            <Route path="/buyer" element={
              <ProtectedRoute allowedRoles={['Admin', 'Buyer']}>
                <AppShell><BuyerView /></AppShell>
              </ProtectedRoute>
            } />

            {/* 6. Admin ONLY Routes */}
            <Route path="/master" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AppShell><MasterDataPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AppShell><UsersPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AppShell><div className="p-8 font-black text-slate-300">SETTINGS UI</div></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/audit-log" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AppShell><AuditLogPage /></AppShell>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
