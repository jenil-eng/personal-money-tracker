import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleSelectAdd = (path) => {
    setShowAddMenu(false);
    navigate(path);
  };

  return (
    <>
      {/* Quick Add Popover Modal / Overlay */}
      {showAddMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl mb-[calc(5rem+env(safe-area-inset-bottom,1rem))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action</span>
              <button 
                onClick={() => setShowAddMenu(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleSelectAdd('/transactions/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition space-y-2"
              >
                <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Expense</span>
              </button>

              <button
                onClick={() => handleSelectAdd('/earnings/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition space-y-2"
              >
                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Earning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-between shadow-2xl w-full max-w-full select-none"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex-1 py-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer touch-manipulation ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. Expenses */}
        <NavLink
          to="/transactions/history"
          className={({ isActive }) =>
            `flex-1 py-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer touch-manipulation ${
              isActive ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowDownCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Expenses</span>
        </NavLink>

        {/* 3. Docked Floating Elevated Center "+ Add" Slot */}
        <div className="flex-1 flex flex-col items-center justify-center relative cursor-pointer touch-manipulation">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            type="button"
            className="flex flex-col items-center focus:outline-none group -mt-5 active:scale-95 transition-transform"
            aria-label="Add Action"
          >
            <div className={`p-3.5 rounded-full shadow-xl border-4 border-slate-950 transition-all duration-200 ${
              showAddMenu 
                ? 'bg-rose-600 text-white rotate-45 scale-105 shadow-rose-600/40' 
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-indigo-600/50 group-hover:scale-105'
            }`}>
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] text-indigo-300 font-bold mt-0.5">Add</span>
          </button>
        </div>

        {/* 4. Earnings */}
        <NavLink
          to="/earnings"
          className={({ isActive }) =>
            `flex-1 py-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer touch-manipulation ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowUpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Earnings</span>
        </NavLink>

        {/* 5. Analytics */}
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex-1 py-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer touch-manipulation ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </NavLink>
      </nav>
    </>
  );
}
