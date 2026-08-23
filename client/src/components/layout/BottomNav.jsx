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

function NavTabItem({ to, label, icon: Icon, activeColorClass = "text-indigo-400" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  const handleTap = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (location.pathname !== to) {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      onTouchEnd={handleTap}
      className={`flex-1 h-full py-2 flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation transition-all active:scale-90 ${
        isActive ? `${activeColorClass} font-bold` : 'text-slate-400 hover:text-slate-200'
      }`}
      aria-label={label}
    >
      <div className="relative flex items-center justify-center">
        <Icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
        {isActive && (
          <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-current shadow-sm" />
        )}
      </div>
      <span className="text-[11px] leading-none tracking-tight font-medium mt-0.5">{label}</span>
    </button>
  );
}

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
          className="lg:hidden fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
          onTouchEnd={() => setShowAddMenu(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl mb-[calc(5.5rem+env(safe-area-inset-bottom,2rem))]"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action</span>
              <button 
                onClick={() => setShowAddMenu(false)}
                onTouchEnd={() => setShowAddMenu(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectAdd('/transactions/add');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSelectAdd('/transactions/add');
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition space-y-2 cursor-pointer touch-manipulation"
              >
                <div className="p-3.5 rounded-full bg-rose-500/20 text-rose-400">
                  <ArrowDownCircle className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white">+ Add Expense</span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectAdd('/earnings/add');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSelectAdd('/earnings/add');
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition space-y-2 cursor-pointer touch-manipulation"
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

      {/* Main Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] transform-gpu translate-z-0 bg-slate-950/98 backdrop-blur-2xl border-t border-slate-800/80 px-2 h-[56px] flex items-center justify-around shadow-2xl w-full max-w-full box-content pointer-events-auto select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* 1. Dashboard */}
        <NavTabItem to="/dashboard" label="Home" icon={Home} activeColorClass="text-indigo-400" />

        {/* 2. Expenses */}
        <NavTabItem to="/transactions/history" label="Expenses" icon={ArrowDownCircle} activeColorClass="text-rose-400" />

        {/* 3. Docked Floating Elevated Center "+ Add" Slot */}
        <div className="flex-1 h-full flex flex-col items-center justify-center relative select-none">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddMenu(!showAddMenu);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddMenu(!showAddMenu);
            }}
            className="flex flex-col items-center focus:outline-none group -mt-6 active:scale-90 transition-transform cursor-pointer touch-manipulation"
            aria-label="Add Action"
          >
            <div className={`p-3.5 rounded-full shadow-lg shadow-indigo-600/40 border-4 border-slate-950 transition-all duration-200 ${
              showAddMenu 
                ? 'bg-rose-600 text-white rotate-45 scale-105 shadow-rose-600/50' 
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white group-hover:scale-105'
            }`}>
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[11px] text-indigo-300 font-bold mt-0.5 tracking-tight">Add</span>
          </button>
        </div>

        {/* 4. Earnings */}
        <NavTabItem to="/earnings" label="Earnings" icon={ArrowUpCircle} activeColorClass="text-emerald-400" />

        {/* 5. Analytics */}
        <NavTabItem to="/analytics" label="Analytics" icon={BarChart3} activeColorClass="text-indigo-400" />
      </nav>
    </>
  );
}
