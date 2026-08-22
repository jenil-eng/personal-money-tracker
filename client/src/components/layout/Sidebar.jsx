import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  ArrowDownCircle, 
  ArrowUpCircle,
  BarChart3, 
  Grid, 
  Repeat,
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
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/transactions/history', label: 'Transactions', icon: ArrowDownCircle },
    { to: '/earnings', label: 'Earnings', icon: ArrowUpCircle },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/categories', label: 'Categories', icon: Grid },
    { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-cyan-500/25">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base leading-none tracking-tight">Money Tracker</h1>
            <span className="text-[11px] text-cyan-400 font-semibold tracking-wide">My Personal Expenses</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Privacy mode toggle button */}
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-xl transition ${
              privacyMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
          >
            {privacyMode ? <EyeOff className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#060b18]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-xl shadow-cyan-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-white text-lg tracking-tight">Money Tracker</h2>
                <p className="text-xs text-cyan-400 font-semibold tracking-wide">My Personal Expenses</p>
              </div>
            </div>

            {/* Privacy toggle button on desktop */}
            <button
              onClick={togglePrivacyMode}
              className={`p-2 rounded-xl transition ${
                privacyMode 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={privacyMode ? 'Privacy Mode Active (Amounts Masked)' : 'Enable Privacy Mode'}
            >
              {privacyMode ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-4 border-b border-slate-800/60 grid grid-cols-2 gap-2">
            <NavLink
              to="/transactions/add"
              onClick={closeMobile}
              className="inline-flex items-center justify-center space-x-1 px-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition active:scale-95 text-center truncate"
              title="Add Expense"
            >
              <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>+ Expense</span>
            </NavLink>
            <NavLink
              to="/earnings/add"
              onClick={closeMobile}
              className="inline-flex items-center justify-center space-x-1 px-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 text-center truncate"
              title="Add Earning"
            >
              <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>+ Earning</span>
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
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/10 text-cyan-300 border-l-4 border-l-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
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
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.email || 'Admin'}</p>
              <p className="text-[11px] text-cyan-400 flex items-center space-x-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
                <span>Private Admin</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
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
