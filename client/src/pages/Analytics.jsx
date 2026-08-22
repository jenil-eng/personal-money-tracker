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
  CreditCard
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

      {/* 2. DAILY EXPENSE TIMELINE (Replaced Artificial Scale Monthly Trend) */}
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
