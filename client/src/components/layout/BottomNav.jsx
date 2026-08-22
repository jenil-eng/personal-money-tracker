import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Settings, 
  Plus
} from 'lucide-react';

export default function BottomNav() {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl"
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
        to="/transactions"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
            isActive ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <ArrowDownCircle className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Expenses</span>
      </NavLink>

      {/* Floating Quick Add */}
      <NavLink
        to="/transactions/add"
        className="flex flex-col items-center justify-center -mt-6"
      >
        <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-3 rounded-full shadow-lg shadow-indigo-600/40 border-2 border-slate-900 hover:scale-105 active:scale-95 transition">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] text-indigo-300 font-medium mt-0.5">Add</span>
      </NavLink>

      {/* Earnings */}
      <NavLink
        to="/earnings"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
            isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <ArrowUpCircle className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Income</span>
      </NavLink>

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
            isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Settings className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Settings</span>
      </NavLink>
    </nav>
  );
}
