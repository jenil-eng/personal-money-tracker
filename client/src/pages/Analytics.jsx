import React, { useState, useEffect } from 'react';
import { getTransactionsApi, getEarningsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { parseDDMMYYYY, formatMonthLabel, ddmmYYYYtoISO } from '../utils/formatters';
import { CategoryPill, getCategoryMeta, getPaymentMeta } from '../utils/categoryUtils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Wallet, 
  Award, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { formatAmount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar View State
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, earnRes] = await Promise.all([
          getTransactionsApi(),
          getEarningsApi()
        ]);
        setTransactions(txRes.data || []);
        setEarnings(earnRes.data || []);
      } catch (err) {
        toast.error('Unable to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Total Calculations
  const totalIncome = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((totalSavings / totalIncome) * 100)) : 0;

  // Average & Largest Transaction
  const avgTransaction = transactions.length > 0 ? Math.round(totalExpenses / transactions.length) : 0;
  const largestTransaction = transactions.length > 0 
    ? [...transactions].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0]
    : null;

  // Daily Spending Average (over last 30 days)
  const dailySpendingAvg = Math.round(totalExpenses / 30);

  // Net Cash Flow Calculation
  const netCashFlow = totalIncome - totalExpenses;
  const isPositiveCashFlow = netCashFlow >= 0;

  // Calendar Math & Data Mapping
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const calendarMonthLabel = `${monthNames[month]} ${year}`;

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
    setSelectedDayDate(null);
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
    setSelectedDayDate(null);
  };

  const handleToday = () => {
    setCalendarDate(new Date());
    setSelectedDayDate(null);
  };

  const dailyMap = {};
  transactions.forEach(t => {
    const dStr = t.date;
    if (!dailyMap[dStr]) dailyMap[dStr] = { expenses: 0, income: 0, items: [] };
    dailyMap[dStr].expenses += Number(t.amount) || 0;
    dailyMap[dStr].items.push({ ...t, recordType: 'expense' });
  });

  earnings.forEach(e => {
    const dStr = e.date;
    if (!dailyMap[dStr]) dailyMap[dStr] = { expenses: 0, income: 0, items: [] };
    dailyMap[dStr].income += Number(e.amount) || 0;
    dailyMap[dStr].items.push({ ...e, recordType: 'income', category: e.source });
  });

  // Current Selected Month Cashflow Stats
  const selectedMonthStr = `${String(month + 1).padStart(2, '0')}-${year}`;
  const currentMonthTxns = transactions.filter(t => t.date && t.date.slice(3) === selectedMonthStr);
  const currentMonthEarn = earnings.filter(e => e.date && e.date.slice(3) === selectedMonthStr);
  const monthTotalSpent = currentMonthTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const monthTotalEarned = currentMonthEarn.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthNetFlow = monthTotalEarned - monthTotalSpent;

  // Daily Expense Timeline (Day-by-day trend & peak spikes)
  const dailyTimelineMap = {};
  transactions.forEach(t => {
    const dIso = ddmmYYYYtoISO(t.date); // '2026-08-22'
    if (!dailyTimelineMap[dIso]) {
      dailyTimelineMap[dIso] = { dateIso: dIso, dateLabel: t.date.slice(0, 5), Spent: 0, count: 0 };
    }
    dailyTimelineMap[dIso].Spent += Number(t.amount) || 0;
    dailyTimelineMap[dIso].count += 1;
  });

  const dailyTimelineData = Object.values(dailyTimelineMap)
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  // Category Breakdown Data
  const categoryMap = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });
  const categoryData = Object.keys(categoryMap).map(cat => {
    const meta = getCategoryMeta(cat);
    return { name: cat, value: categoryMap[cat], color: meta.color };
  });

  const top5Categories = [...categoryData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Monthly Spending Trend
  const monthlyTrendMap = {};
  transactions.forEach(t => {
    const monthKey = ddmmYYYYtoISO(t.date).slice(0, 7); // '2026-08'
    if (!monthlyTrendMap[monthKey]) monthlyTrendMap[monthKey] = { monthKey, label: formatMonthLabel(monthKey), Spent: 0, Earned: 0 };
    monthlyTrendMap[monthKey].Spent += Number(t.amount) || 0;
  });

  earnings.forEach(e => {
    const monthKey = ddmmYYYYtoISO(e.date).slice(0, 7);
    if (!monthlyTrendMap[monthKey]) monthlyTrendMap[monthKey] = { monthKey, label: formatMonthLabel(monthKey), Spent: 0, Earned: 0 };
    monthlyTrendMap[monthKey].Earned += Number(e.amount) || 0;
  });

  const monthlyTrendData = Object.values(monthlyTrendMap)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Payment Method Breakdown
  const paymentMap = {};
  transactions.forEach(t => {
    const pm = t.paymentMethod || 'Cash';
    paymentMap[pm] = (paymentMap[pm] || 0) + (Number(t.amount) || 0);
  });
  const paymentData = Object.keys(paymentMap).map((pm, idx) => {
    const colors = ['#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#10b981', '#64748b'];
    return { name: pm, value: paymentMap[pm], color: colors[idx % colors.length] };
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-slate-900/80 rounded-2xl" />
          <div className="h-32 bg-slate-900/80 rounded-2xl" />
          <div className="h-32 bg-slate-900/80 rounded-2xl" />
          <div className="h-32 bg-slate-900/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          <span>Analytics & Financial Trends</span>
        </h1>
        <p className="text-sm text-slate-400">Deep insights into spending behavior, category breakdown & cash flow</p>
      </div>

      {/* 1. KEY ANALYTICS STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Transaction */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Transaction</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            {formatAmount(avgTransaction)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Per transaction average</p>
        </div>

        {/* Daily Spending Average */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Spending Avg</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-400 mt-3 tracking-tight">
            {formatAmount(dailySpendingAvg)}
          </p>
          <p className="text-xs text-slate-400 mt-1">30-day average daily expense</p>
        </div>

        {/* Largest Single Expense */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Largest Expense</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-3 tracking-tight">
            {largestTransaction ? formatAmount(largestTransaction.amount) : '₹0'}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {largestTransaction ? largestTransaction.description : 'No record'}
          </p>
        </div>

        {/* Net Cash Flow (Replaced Overall Savings Rate) */}
        <div className={`glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 ${isPositiveCashFlow ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Cash Flow</span>
            <div className={`p-2.5 rounded-xl border ${isPositiveCashFlow ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black mt-3 tracking-tight ${isPositiveCashFlow ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositiveCashFlow ? `+ ${formatAmount(netCashFlow)}` : `- ${formatAmount(Math.abs(netCashFlow))}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isPositiveCashFlow ? 'Surplus (Income > Expenses)' : 'Deficit (Expenses > Income)'}
          </p>
        </div>
      </div>

      {/* 2. INTERACTIVE FINANCIAL CALENDAR CASHFLOW VIEW */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 border border-slate-800/80 relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Calendar Header with Title, Month Summary Badges & Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>{calendarMonthLabel}</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Daily net cashflow breakdown & activity heatmap</p>
            </div>
          </div>

          {/* Monthly Executive Summary Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span>Earned: {formatAmount(monthTotalEarned)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]" />
              <span>Spent: {formatAmount(monthTotalSpent)}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm border ${
              monthNetFlow >= 0 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <span>Net: {monthNetFlow >= 0 ? `+${formatAmount(monthNetFlow)}` : `-${formatAmount(Math.abs(monthNetFlow))}`}</span>
            </div>

            {/* Month Navigation Controls */}
            <div className="flex items-center space-x-1.5 ml-auto lg:ml-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="py-2 bg-slate-950/80 rounded-xl border border-slate-800/60 shadow-inner">{d}</div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Previous Month Padding Days */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => {
            const prevDateNum = totalDaysInPrevMonth - firstDayIndex + idx + 1;
            return (
              <div key={`prev-${idx}`} className="min-h-[68px] sm:min-h-[88px] p-2 rounded-2xl bg-slate-950/20 border border-slate-900/60 opacity-20 select-none">
                <span className="text-xs text-slate-600 font-bold">{prevDateNum}</span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedDayStr = `${String(dayNum).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
            const dayData = dailyMap[formattedDayStr];
            
            const hasIncome = dayData && dayData.income > 0;
            const hasExpense = dayData && dayData.expenses > 0;
            const netAmount = dayData ? (dayData.income - dayData.expenses) : 0;
            const isSelected = selectedDayDate === formattedDayStr;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDayDate(isSelected ? null : formattedDayStr)}
                className={`min-h-[68px] sm:min-h-[88px] p-2 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer relative group hover:scale-[1.03] ${
                  isSelected 
                    ? 'bg-gradient-to-br from-indigo-950/90 via-slate-950 to-indigo-900/50 border-indigo-500 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500' 
                    : dayData 
                      ? 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80 shadow-md' 
                      : 'bg-slate-950/40 border-slate-900/80 hover:bg-slate-950/80'
                }`}
              >
                {/* Top Row: Date Number & Glowing Dots */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-black tracking-tight ${isSelected ? 'text-indigo-400' : 'text-slate-100'}`}>
                    {dayNum}
                  </span>

                  {/* Status Indicator Dots with Glow */}
                  <div className="flex items-center space-x-1">
                    {hasIncome && (
                      <span 
                        className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" 
                        title={`Income: +${formatAmount(dayData.income)}`} 
                      />
                    )}
                    {hasExpense && (
                      <span 
                        className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]" 
                        title={`Spent: -${formatAmount(dayData.expenses)}`} 
                      />
                    )}
                  </div>
                </div>

                {/* Bottom Row: Daily Amount Pill Badge */}
                {dayData && (dayData.income > 0 || dayData.expenses > 0) && (
                  <div className="mt-1 text-right">
                    <span className={`text-[10px] sm:text-xs font-black tracking-tight inline-block px-1.5 py-0.5 rounded-lg border shadow-sm ${
                      netAmount < 0 
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
                        : netAmount > 0 
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {netAmount < 0 
                        ? `-₹${Math.abs(netAmount)}` 
                        : netAmount > 0 
                          ? `+₹${netAmount}` 
                          : '₹0'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Transaction Details Inspector Drawer */}
        {selectedDayDate && (
          <div className="mt-5 p-5 rounded-2xl bg-slate-950/95 border border-indigo-500/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Activity Inspector for {selectedDayDate}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {dailyMap[selectedDayDate]?.items.length || 0} Records
                </span>
              </div>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {!dailyMap[selectedDayDate] || dailyMap[selectedDayDate].items.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No transactions logged on {selectedDayDate}.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {dailyMap[selectedDayDate].items.map((item, idx) => {
                  const isExp = item.recordType === 'expense';
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl bg-slate-900/90 border flex items-center justify-between text-xs shadow-md ${
                        isExp ? 'border-rose-500/20 border-l-4 border-l-rose-500' : 'border-emerald-500/20 border-l-4 border-l-emerald-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${isExp ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {isExp ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{item.description}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 font-medium">{item.paymentMethod || 'UPI'}</span>
                            {item.notes && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-slate-500 italic truncate max-w-[150px]">{item.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className={`font-black text-base tracking-tight ${isExp ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExp ? `- ${formatAmount(item.amount)}` : `+ ${formatAmount(item.amount)}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. DAILY EXPENSE TIMELINE */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Daily Expense Timeline & Peak Spikes</span>
            </h2>
            <p className="text-xs text-slate-400">Day-by-day spending pattern and expense velocity over time</p>
          </div>
        </div>

        {dailyTimelineData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No daily transaction data recorded yet.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dailyTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="dateLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  formatter={(val, name, item) => [formatAmount(val), `Spent (${item.payload.count} txns)`]}
                />
                <Area type="monotone" dataKey="Spent" stroke="#6366f1" fillOpacity={1} fill="url(#dailyTimelineGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. INCOME VS EXPENSES COMPARATIVE BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Monthly Income vs Expenses</span>
            </h3>
          </div>

          {monthlyTrendData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No records.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    formatter={(val) => [formatAmount(val)]}
                  />
                  <Bar dataKey="Earned" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. PAYMENT METHOD BREAKDOWN PIE CHART */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span>Payment Method Share</span>
            </h3>
          </div>

          {paymentData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No records.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    formatter={(val) => [formatAmount(val)]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 5. TOP 5 SPENDING CATEGORIES PROGRESS */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-amber-400" />
            <span>Top 5 Spending Categories</span>
          </h3>
        </div>

        {top5Categories.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">No transaction categories recorded.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {top5Categories.map((cat, idx) => {
              const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <CategoryPill category={cat.name} />
                    <p className="text-lg font-black text-white mt-2">{formatAmount(cat.value)}</p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Share:</span>
                      <strong className="text-white">{pct}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
