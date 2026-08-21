import React from 'react';

export default function StatCard({ title, amount, subtitle, icon: Icon, type = 'neutral' }) {
  const themes = {
    earned: {
      bg: 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500/10 via-transparent to-transparent'
    },
    spent: {
      bg: 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400',
      text: 'text-rose-400',
      gradient: 'from-rose-500/10 via-transparent to-transparent'
    },
    balance: {
      bg: 'bg-slate-900/90 border-indigo-500/30 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      text: 'text-indigo-300',
      gradient: 'from-indigo-500/10 via-transparent to-transparent'
    },
    neutral: {
      bg: 'bg-slate-900/90 border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300',
      text: 'text-slate-100',
      gradient: 'from-slate-800/20 via-transparent to-transparent'
    }
  };

  const theme = themes[type] || themes.neutral;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200 shadow-lg ${theme.bg}`}>
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full blur-2xl pointer-events-none`} />
      
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.text}`}>
          {amount}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
