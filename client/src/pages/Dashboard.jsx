import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactionsApi, getEarningsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  isThisMonth, 
  parseDDMMYYYY, 
  getCurrentMonthISO, 
  isDateInMonth, 
  isDateInRange,
  formatMonthLabel
} from '../utils/formatters';
import { CategoryPill, getCategoryMeta } from '../utils/categoryUtils';
import StatCard from '../components/common/StatCard';
import { 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  RefreshCw,
  X,
  Zap,
  Target,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { formatAmount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Budget Goal State (defaults to 15,000 INR monthly target)
  const [monthlyBudget] = useState(15000);

  // Date Filter State
  const [filterMode, setFilterMode] = useState('all'); 
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const navigate = useNavigate();

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [txRes, earnRes] = await Promise.all([
        getTransactionsApi(),
        getEarningsApi()
      ]);
      setTransactions(txRes.data || []);
      setEarnings(earnRes.data || []);
      if (showToast) toast.success('Dashboard refreshed successfully');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Unable to connect to backend service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterRecord = (item) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'current_month') return isThisMonth(item.date);
    if (filterMode === 'specific_month') return isDateInMonth(item.date, selectedMonth);
    if (filterMode === 'custom_range') return isDateInRange(item.date, dateFrom, dateTo);
    return true;
  };

  const filteredTransactions = transactions.filter(filterRecord);
  const filteredEarnings = earnings.filter(filterRecord);

  // Overall Lifetime Totals
  const lifetimeEarned = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const lifetimeSpent = transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const lifetimeBalance = lifetimeEarned - lifetimeSpent;

  // Period Totals
  const periodEarned = filteredEarnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const periodSpent = filteredTransactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const periodBalance = periodEarned - periodSpent;

  // Budget Progress Ratio
  const currentMonthSpent = transactions.filter(t => isThisMonth(t.date)).reduce((s, item) => s + (Number(item.amount) || 0), 0);
  const budgetRatio = Math.min(Math.round((currentMonthSpent / monthlyBudget) * 100), 100);

  // Category Breakdown with custom visual meta
  const categoryMap = {};
  filteredTransactions.forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });
  const categoryData = Object.keys(categoryMap).map(cat => {
    const meta = getCategoryMeta(cat);
    return {
      name: cat,
      value: categoryMap[cat],
      color: meta.color
    };
  });

  // Timeline (Daily/Weekly Trend)
  const timelineMap = {};
  filteredEarnings.forEach(e => {
    const d = e.date;
    if (!timelineMap[d]) timelineMap[d] = { date: d, timestamp: parseDDMMYYYY(d).getTime(), Earned: 0, Spent: 0 };
    timelineMap[d].Earned += Number(e.amount) || 0;
  });
  filteredTransactions.forEach(t => {
    const d = t.date;
    if (!timelineMap[d]) timelineMap[d] = { date: d, timestamp: parseDDMMYYYY(d).getTime(), Earned: 0, Spent: 0 };
    timelineMap[d].Spent += Number(t.amount) || 0;
  });
  const timelineData = Object.values(timelineMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-14);

  // Recent Activity
  const formattedTx = filteredTransactions.map(t => ({
    ...t,
    type: 'transaction',
    timestamp: parseDDMMYYYY(t.date).getTime()
  }));
  const formattedEarn = filteredEarnings.map(e => ({
    ...e,
    type: 'earning',
    timestamp: parseDDMMYYYY(e.date).getTime()
  }));

  const recentActivity = [...formattedTx, ...formattedEarn]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const getPeriodLabel = () => {
    if (filterMode === 'all') return 'Lifetime All Records';
    if (filterMode === 'current_month') return 'Current Month (' + formatMonthLabel(getCurrentMonthISO()) + ')';
    if (filterMode === 'specific_month') return 'Selected Month (' + formatMonthLabel(selectedMonth) + ')';
    if (filterMode === 'custom_range') {
      return `Custom Range (${dateFrom || 'Start'} to ${dateTo || 'End'})`;
    }
    return '';
  };

  const handleResetFilter = () => {
    setFilterMode('all');
    setSelectedMonth(getCurrentMonthISO());
    setDateFrom('');
    setDateTo('');
  };

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
      
      {/* 1. TOP HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Main Dashboard</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
              Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Personal Finances & Analytics Overview</p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 self-start sm:self-auto shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. COMBINED HIGH-SPEED TOP CONTROL CARD (QUICK ACTIONS + DATE SELECTOR) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* ROW A: QUICK ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-semibold">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Fast Quick Actions:</span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
            <Link
              to="/earnings/add"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Income</span>
            </Link>
            <Link
              to="/transactions/add"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-rose-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Expense</span>
            </Link>
          </div>
        </div>

        {/* ROW B: DATE / PERIOD SELECTOR PILLS */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs sm:text-sm">
              <CalendarIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>TIME PERIOD:</span>
              <span className="text-xs font-normal text-slate-400 border-l border-slate-700 pl-2 truncate max-w-[200px] sm:max-w-none">
                {getPeriodLabel()}
              </span>
            </div>

            {/* Horizontal Scrollable Pills for Mobile */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilterMode('current_month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'current_month'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Current Month
              </button>
              <button
                onClick={() => setFilterMode('specific_month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'specific_month'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Select Month
              </button>
              <button
                onClick={() => setFilterMode('custom_range')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'custom_range'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Custom Range
              </button>

              {filterMode !== 'all' && (
                <button
                  onClick={handleResetFilter}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Reset Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Conditional Month or Range Inputs */}
          {filterMode === 'specific_month' && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-3">
              <label className="text-xs text-slate-300 font-medium">Month & Year:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs text-indigo-300 font-semibold">
                {formatMonthLabel(selectedMonth)}
              </span>
            </div>
          )}

          {filterMode === 'custom_range' && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FINANCIAL METRIC STAT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {filterMode === 'all' ? 'Lifetime Financial Summary' : `Period Summary (${getPeriodLabel()})`}
          </h2>
          {filterMode !== 'all' && (
            <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              Active Filter
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title={filterMode === 'all' ? "Total Income" : "Period Income"}
            amount={formatAmount(periodEarned)}
            icon={ArrowUpCircle}
            type="earned"
            subtitle={`${filteredEarnings.length} earning entries`}
          />
          <StatCard
            title={filterMode === 'all' ? "Total Expenses" : "Period Expenses"}
            amount={formatAmount(periodSpent)}
            icon={ArrowDownCircle}
            type="spent"
            subtitle={`${filteredTransactions.length} expense entries`}
          />
          <StatCard
            title={filterMode === 'all' ? "Net Savings / Balance" : "Period Savings"}
            amount={formatAmount(periodBalance)}
            icon={Wallet}
            type="balance"
            subtitle="Net available capital"
          />
        </div>
      </div>

      {/* 4. BUDGET TARGET PROGRESS & LIFETIME REFERENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Budget Target Card */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Monthly Spending Limit</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                budgetRatio > 90 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : budgetRatio > 70 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {budgetRatio > 90 ? 'Near Limit' : budgetRatio > 70 ? 'Moderate' : 'Healthy'} ({budgetRatio}%)
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Current month spent <strong className="text-slate-200">{formatAmount(currentMonthSpent)}</strong> out of <strong className="text-slate-200">{formatAmount(monthlyBudget)}</strong> target.
            </p>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetRatio > 90 
                    ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                    : budgetRatio > 70 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                }`}
                style={{ width: `${budgetRatio}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Remaining Budget: <strong className="text-emerald-400">{formatAmount(Math.max(0, monthlyBudget - currentMonthSpent))}</strong></span>
            <span>Target: {formatAmount(monthlyBudget)} / mo</span>
          </div>
        </div>

        {/* Lifetime Reference Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Lifetime Capital</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Lifetime Income:</span>
              <strong className="text-emerald-400">{formatAmount(lifetimeEarned)}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Lifetime Expenses:</span>
              <strong className="text-rose-400">{formatAmount(lifetimeSpent)}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 font-semibold">Lifetime Balance:</span>
              <strong className="text-indigo-300 font-bold">{formatAmount(lifetimeBalance)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Spending Over Time */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Income vs Spending Trend</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">{getPeriodLabel()}</span>
          </div>
          {timelineData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No entries recorded for selected period.
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

        {/* Chart 2: Spending by Category */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-rose-400" />
              <span>Expense Categories</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">{getPeriodLabel()}</span>
          </div>
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No transactions recorded for selected period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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

      {/* 6. RECENT ACTIVITY FEED */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Recent Activity ({getPeriodLabel()})</h3>
          </div>
          <Link to="/transactions/history" className="text-xs text-indigo-400 hover:underline font-semibold">
            View All History →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No transactions or earnings found for the selected date period.
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
