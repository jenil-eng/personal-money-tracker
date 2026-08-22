import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactionsApi, getEarningsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  parseDDMMYYYY, 
  getCurrentMonthISO, 
  formatMonthLabel,
  ddmmYYYYtoISO
} from '../utils/formatters';
import { CategoryPill, getCategoryMeta } from '../utils/categoryUtils';
import { 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { formatAmount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [txRes, earnRes] = await Promise.all([
        getTransactionsApi(),
        getEarningsApi()
      ]);
      setTransactions(txRes.data || []);
      setEarnings(earnRes.data || []);
      if (showToast) toast.success('Dashboard refreshed');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Unable to connect to backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Overall Totals
  const totalIncome = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalSavings = totalIncome - totalExpenses;

  // Current Month vs Previous Month Comparisons
  const now = new Date();
  const currentMonthISO = getCurrentMonthISO();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthISO = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions
    .filter(t => {
      const iso = ddmmYYYYtoISO(t.date);
      return iso.startsWith(currentMonthISO);
    })
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const prevMonthExpenses = transactions
    .filter(t => {
      const iso = ddmmYYYYtoISO(t.date);
      return iso.startsWith(prevMonthISO);
    })
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Month-over-Month % Change
  let momPercentChange = 0;
  if (prevMonthExpenses > 0) {
    momPercentChange = Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100);
  }

  // Top Spending Categories
  const categoryMap = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });
  const topCategories = Object.keys(categoryMap)
    .map(cat => ({ name: cat, amount: categoryMap[cat], meta: getCategoryMeta(cat) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // Timeline (Monthly Trend visualization)
  const timelineMap = {};
  earnings.forEach(e => {
    const d = e.date;
    if (!timelineMap[d]) timelineMap[d] = { date: d, timestamp: parseDDMMYYYY(d).getTime(), Earned: 0, Spent: 0 };
    timelineMap[d].Earned += Number(e.amount) || 0;
  });
  transactions.forEach(t => {
    const d = t.date;
    if (!timelineMap[d]) timelineMap[d] = { date: d, timestamp: parseDDMMYYYY(d).getTime(), Earned: 0, Spent: 0 };
    timelineMap[d].Spent += Number(t.amount) || 0;
  });
  const timelineData = Object.values(timelineMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-14);

  // Recent Activity Feed
  const formattedTx = transactions.map(t => ({ ...t, type: 'transaction', timestamp: parseDDMMYYYY(t.date).getTime() }));
  const formattedEarn = earnings.map(e => ({ ...e, type: 'earning', timestamp: parseDDMMYYYY(e.date).getTime() }));
  const recentActivity = [...formattedTx, ...formattedEarn]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-slate-900/80 rounded-2xl" />
          <div className="h-36 bg-slate-900/80 rounded-2xl" />
          <div className="h-36 bg-slate-900/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Financial Dashboard</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
              Live Overview
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Overview & Financial Health Analytics</p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/transactions/add"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add</span>
          </Link>
        </div>
      </div>

      {/* 2. FINTECH 3-METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Balance</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            {formatAmount(totalSavings)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Available capital balance</p>
        </div>

        {/* Total Income */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 tracking-tight">
            {formatAmount(totalIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{earnings.length} total income records</p>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-3 tracking-tight">
            {formatAmount(totalExpenses)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{transactions.length} total expense records</p>
        </div>
      </div>

      {/* 3. CURRENT MONTH VS PREVIOUS MONTH COMPARISON CARD */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Monthly Spending Comparison</span>
          <span className="text-[11px] font-semibold text-slate-400">{formatMonthLabel(currentMonthISO)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <span className="text-xs text-slate-400">Current Month Spending:</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{formatAmount(currentMonthExpenses)}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400">Previous Month ({formatMonthLabel(prevMonthISO)}):</span>
            <p className="text-xl font-semibold text-slate-300 mt-0.5">{formatAmount(prevMonthExpenses)}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Month-over-Month Change:</span>
            <span className={`inline-flex items-center space-x-1 font-extrabold text-xs px-2.5 py-1 rounded-md ${
              momPercentChange <= 0 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {momPercentChange <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              <span>{momPercentChange > 0 ? `+${momPercentChange}%` : `${momPercentChange}%`}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. CHARTS & TOP SPENDING CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Spending Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Cash Flow & Spending Trend</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Recent Timeline</span>
          </div>

          {timelineData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No financial entries recorded.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    formatter={(val) => [formatAmount(val)]}
                  />
                  <Area type="monotone" dataKey="Earned" stroke="#10b981" fillOpacity={1} fill="url(#colorEarned)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Spent" stroke="#f43f5e" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Spending Categories List */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5 text-rose-400" />
                <span>Top Categories</span>
              </h3>
              <Link to="/analytics" className="text-xs text-indigo-400 hover:underline font-semibold">Analytics →</Link>
            </div>

            {topCategories.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No expense records found.</div>
            ) : (
              <div className="space-y-3">
                {topCategories.map((cat, idx) => {
                  const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <CategoryPill category={cat.name} />
                        <span className="font-bold text-rose-400">{formatAmount(cat.amount)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.meta.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT TRANSACTIONS FEED */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Recent Activity Feed</h3>
          </div>
          <Link to="/transactions/history" className="text-xs text-indigo-400 hover:underline font-semibold">
            View All History →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentActivity.map((item, idx) => {
              const isExpense = item.type === 'transaction';
              return (
                <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2.5 rounded-xl transition">
                  <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isExpense ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isExpense ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{item.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <span>{item.date}</span>
                        <span>•</span>
                        {isExpense ? (
                          <CategoryPill category={item.category} />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                            {item.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-bold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isExpense ? `- ${formatAmount(item.amount)}` : `+ ${formatAmount(item.amount)}`}
                    </p>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      {isExpense ? 'Expense' : 'Income'}
                    </span>
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
