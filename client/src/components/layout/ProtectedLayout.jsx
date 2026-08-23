import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading personal money tracker...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-full h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 lg:pl-64 h-full w-full overflow-y-auto overflow-x-hidden pt-[calc(4.75rem+env(safe-area-inset-top,0px))] pb-[calc(9.5rem+env(safe-area-inset-bottom,1rem))] lg:pt-0 lg:pb-8 relative z-0">
        <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 w-full max-w-full">
          <Outlet />
          <div className="h-16 lg:hidden shrink-0 pointer-events-none" aria-hidden="true" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
