import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowDownCircle, 
  ArrowUpCircle,
  BarChart3, 
  Plus,
  X
} from 'lucide-react';

export default function BottomNav() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setShowAddMenu(false);
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <>
      {/* Quick Add Popover Modal / Overlay */}
      {showAddMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl mb-[calc(5.5rem+env(safe-area-inset-bottom,1rem))] max-w-md mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action</span>
              <button 
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleNavigate('/transactions/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition space-y-2 cursor-pointer"
              >
                <div className="p-3.5 rounded-full bg-rose-500/20 text-rose-400">
                  <ArrowDownCircle className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/earnings/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition space-y-2 cursor-pointer"
              >
                <div className="p-3.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <ArrowUpCircle className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Earning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Centered Floating Dock Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none flex justify-center px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <nav 
          aria-label="Mobile Navigation"
          className="pointer-events-auto w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-slate-800/90 rounded-full px-3 py-2 flex items-center justify-between shadow-2xl shadow-black/80 box-border select-none"
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => handleNavigate('/dashboard')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
              location.pathname === '/dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-medium mt-0.5">Home</span>
          </button>

          {/* 2. Expenses */}
          <button
            type="button"
            onClick={() => handleNavigate('/transactions/history')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
              location.pathname.startsWith('/transactions') ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-medium mt-0.5">Expenses</span>
          </button>

          {/* 3. Center "+ Add" Action Button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer focus:outline-none"
              aria-label="Add Action"
            >
              <div className={`p-3 rounded-full shadow-lg shadow-indigo-600/30 transition-all duration-200 ${
                showAddMenu 
                  ? 'bg-rose-600 text-white rotate-45 scale-105 shadow-rose-600/50' 
                  : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white'
              }`}>
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] text-indigo-300 font-bold mt-0.5 tracking-tight">Add</span>
            </button>
          </div>

          {/* 4. Earnings */}
          <button
            type="button"
            onClick={() => handleNavigate('/earnings')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
              location.pathname.startsWith('/earnings') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-medium mt-0.5">Earnings</span>
          </button>

          {/* 5. Analytics */}
          <button
            type="button"
            onClick={() => handleNavigate('/analytics')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
              location.pathname.startsWith('/analytics') ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-medium mt-0.5">Analytics</span>
          </button>
        </nav>
      </div>
    </>
  );
}
