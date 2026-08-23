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

export default function BottomNav({ badgeCount = 0, hasDotBadge = false }) {
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
          className="lg:hidden fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-slate-900/95 border border-white/15 rounded-3xl p-5 space-y-4 shadow-2xl mb-[calc(5.5rem+env(safe-area-inset-bottom,1rem))] max-w-md mx-auto w-full backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action</span>
              <button 
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white active:scale-95 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectAdd('/transactions/add')}
                className="flex flex-col items-center justify-center p-4 min-h-[64px] rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 active:bg-rose-500/30 transition space-y-2 cursor-pointer touch-manipulation"
              >
                <div className="p-3.5 rounded-full bg-rose-500/20 text-rose-400">
                  <ArrowDownCircle className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdd('/earnings/add')}
                className="flex flex-col items-center justify-center p-4 min-h-[64px] rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 active:bg-emerald-500/30 transition space-y-2 cursor-pointer touch-manipulation"
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

      {/* 1. Main Container: Native iOS Floating Glassmorphism Bar */}
      <nav 
        aria-label="Native iOS Glassmorphism Navigation"
        className="lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 rounded-full p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] box-border select-none pointer-events-auto"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* 1. Home Tab (100% Flex-1 Hitbox, Min-h 52px) */}
        <NavLink
          to="/dashboard"
          onClick={() => setShowAddMenu(false)}
          className={({ isActive }) =>
            `flex-1 h-full min-h-[52px] py-2 px-1 flex flex-col items-center justify-center rounded-full transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:bg-white/15 relative ${
              isActive 
                ? 'bg-white/10 border border-white/25 text-white font-bold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`
          }
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[11px] leading-none tracking-tight font-medium mt-1">Home</span>
        </NavLink>

        {/* 2. Expenses Tab (100% Flex-1 Hitbox, Min-h 52px) */}
        <NavLink
          to="/transactions/history"
          onClick={() => setShowAddMenu(false)}
          className={({ isActive }) =>
            `flex-1 h-full min-h-[52px] py-2 px-1 flex flex-col items-center justify-center rounded-full transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:bg-rose-500/25 relative ${
              isActive 
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`
          }
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="relative flex items-center justify-center">
            <ArrowDownCircle className="w-5 h-5 stroke-[2]" />
            {hasDotBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm animate-pulse" />
            )}
          </div>
          <span className="text-[11px] leading-none tracking-tight font-medium mt-1">Expenses</span>
        </NavLink>

        {/* 3. Center Elevated "+ Add" Floating Pill Button (100% Flex-1 Hitbox, Min-h 52px) */}
        <div className="flex-1 h-full flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex-1 h-full min-h-[52px] py-1 flex flex-col items-center justify-center rounded-full transition-all duration-150 cursor-pointer touch-manipulation active:scale-90 focus:outline-none"
            aria-label="Add Action"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`p-2.5 rounded-full shadow-lg shadow-indigo-600/40 border border-white/20 transition-all duration-200 ${
              showAddMenu 
                ? 'bg-rose-600 text-white rotate-45 scale-105 shadow-rose-600/50' 
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white'
            }`}>
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] text-indigo-300 font-bold leading-none tracking-tight mt-0.5">Add</span>
          </button>
        </div>

        {/* 4. Earnings Tab (100% Flex-1 Hitbox, Min-h 52px) */}
        <NavLink
          to="/earnings"
          onClick={() => setShowAddMenu(false)}
          className={({ isActive }) =>
            `flex-1 h-full min-h-[52px] py-2 px-1 flex flex-col items-center justify-center rounded-full transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:bg-emerald-500/25 relative ${
              isActive 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`
          }
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="relative flex items-center justify-center">
            <ArrowUpCircle className="w-5 h-5 stroke-[2]" />
            {badgeCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-400 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shadow-md border border-slate-950">
                {badgeCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none tracking-tight font-medium mt-1">Earnings</span>
        </NavLink>

        {/* 5. Analytics Tab (100% Flex-1 Hitbox, Min-h 52px) */}
        <NavLink
          to="/analytics"
          onClick={() => setShowAddMenu(false)}
          className={({ isActive }) =>
            `flex-1 h-full min-h-[52px] py-2 px-1 flex flex-col items-center justify-center rounded-full transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:bg-white/15 relative ${
              isActive 
                ? 'bg-white/10 border border-white/25 text-white font-bold shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`
          }
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <BarChart3 className="w-5 h-5 stroke-[2]" />
          <span className="text-[11px] leading-none tracking-tight font-medium mt-1">Analytics</span>
        </NavLink>
      </nav>
    </>
  );
}
