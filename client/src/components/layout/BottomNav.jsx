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
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl p-5 space-y-4 shadow-2xl mb-16 glow-cyan"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Quick Cyber Action</span>
              <button 
                onClick={() => setShowAddMenu(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleSelectAdd('/transactions/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition space-y-2 glow-expense"
              >
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">+ Add Expense</span>
              </button>

              <button
                onClick={() => handleSelectAdd('/earnings/add')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition space-y-2 glow-income"
              >
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">+ Add Earning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060b18]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl pb-safe"
      >
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
              isActive ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
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
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
              isActive ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
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
          <div className={`p-3.5 rounded-full shadow-xl border-2 border-[#060b18] transition-all duration-300 ${
            showAddMenu 
              ? 'bg-rose-600 text-white rotate-45 scale-110 shadow-rose-600/50' 
              : 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-cyan-500/40 hover:scale-110 active:scale-95 glow-cyan'
          }`}>
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-cyan-300 font-extrabold mt-0.5">Add</span>
        </button>

        {/* Earnings */}
        <NavLink
          to="/earnings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
              isActive ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
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
            `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
              isActive ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
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

