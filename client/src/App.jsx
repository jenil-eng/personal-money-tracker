import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionDashboard from './pages/transactions/TransactionDashboard';
import AddTransaction from './pages/transactions/AddTransaction';
import EditTransaction from './pages/transactions/EditTransaction';
import TransactionHistory from './pages/transactions/TransactionHistory';
import EarningsDashboard from './pages/earnings/EarningsDashboard';
import AddEarning from './pages/earnings/AddEarning';
import EditEarning from './pages/earnings/EditEarning';
import EarningsHistory from './pages/earnings/EarningsHistory';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }
          }} 
        />
        
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Transactions Routes */}
            <Route path="/transactions" element={<TransactionDashboard />} />
            <Route path="/transactions/add" element={<AddTransaction />} />
            <Route path="/transactions/:id/edit" element={<EditTransaction />} />
            <Route path="/transactions/history" element={<TransactionHistory />} />

            {/* Earnings Routes */}
            <Route path="/earnings" element={<EarningsDashboard />} />
            <Route path="/earnings/add" element={<AddEarning />} />
            <Route path="/earnings/:id/edit" element={<EditEarning />} />
            <Route path="/earnings/history" element={<EarningsHistory />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Budgets */}
            <Route path="/budgets" element={<Budgets />} />

            {/* Categories */}
            <Route path="/categories" element={<Categories />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Index redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
