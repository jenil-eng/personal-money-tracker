import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  PlusCircle, 
  History, 
  LayoutDashboard,
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Sidebar() {
  const { logout, user, privacyMode, togglePrivacyMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(location.pathname.startsWith('/transactions'));
  const [earningsOpen, setEarningsOpen] = useState(location.pathname.startsWith('/earnings'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

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
            <span className="text-[11px] text-indigo-400 font-medium">Private Student Finance</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Privacy mode toggle button on mobile */}
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
                <p className="text-xs text-indigo-400 font-medium">Private Student Finance</p>
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

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            {/* Transactions Section */}
            <div>
              <button
                onClick={() => setTransactionsOpen(!transactionsOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname.startsWith('/transactions')
                    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowDownCircle className="w-5 h-5 text-rose-500" />
                  <span>Transactions</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${transactionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {transactionsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-slate-800/80 space-y-1">
                  <NavLink
                    to="/transactions"
                    end
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </NavLink>
                  <NavLink
                    to="/transactions/add"
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Transaction</span>
                  </NavLink>
                  <NavLink
                    to="/transactions/history"
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Earnings Section */}
            <div>
              <button
                onClick={() => setEarningsOpen(!earningsOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname.startsWith('/earnings')
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                  <span>Earnings</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${earningsOpen ? 'rotate-180' : ''}`} />
              </button>

              {earningsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-slate-800/80 space-y-1">
                  <NavLink
                    to="/earnings"
                    end
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </NavLink>
                  <NavLink
                    to="/earnings/add"
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Earning</span>
                  </NavLink>
                  <NavLink
                    to="/earnings/history"
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
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
