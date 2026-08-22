import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowDownCircle, 
  ArrowUpCircle,
  BarChart3, 
  Plus,
  PlusCircle,
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
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl mb-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action</span>
              <button 
                onClick={() => setShowAddMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl pb-safe"
      >
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* Expenses */}
        <NavLink
          to="/transactions/history"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              isActive ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowDownCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Expenses</span>
        </NavLink>

        {/* Floating Quick Add Trigger */}
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex flex-col items-center justify-center -mt-6 focus:outline-none"
        >
          <div className={`p-3 rounded-full shadow-lg border-2 border-slate-900 transition ${
            showAddMenu 
              ? 'bg-rose-600 text-white rotate-45 scale-105' 
              : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-600/40 hover:scale-105 active:scale-95'
          }`}>
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-indigo-300 font-semibold mt-0.5">Add</span>
        </button>

        {/* Earnings */}
        <NavLink
          to="/earnings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowUpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Earnings</span>
        </NavLink>

        {/* Analytics */}
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
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

