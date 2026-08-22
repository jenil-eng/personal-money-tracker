import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  ArrowDownCircle, 
  BarChart3, 
  Target, 
  Grid, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Sidebar() {
  const { logout, user, privacyMode, togglePrivacyMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/transactions/history', label: 'Transactions', icon: ArrowDownCircle },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/categories', label: 'Categories', icon: Grid },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl text-white shadow-md shadow-indigo-600/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-none">Money Tracker</h1>
            <span className="text-[11px] text-indigo-400 font-medium">Fintech Personal Finance</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Privacy mode toggle button */}
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-lg transition ${
              privacyMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
          >
            {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg tracking-tight">Money Tracker</h2>
                <p className="text-xs text-indigo-400 font-medium">Fintech Personal Finance</p>
              </div>
            </div>

            {/* Privacy toggle button on desktop */}
            <button
              onClick={togglePrivacyMode}
              className={`p-2 rounded-lg transition ${
                privacyMode 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={privacyMode ? 'Privacy Mode Active (Amounts Masked)' : 'Enable Privacy Mode'}
            >
              {privacyMode ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-4 border-b border-slate-800/60">
            <NavLink
              to="/transactions/add"
              onClick={closeMobile}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-240px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || 'Admin'}</p>
              <p className="text-[11px] text-indigo-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>Private Admin</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
