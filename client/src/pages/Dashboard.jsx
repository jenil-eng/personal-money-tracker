import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactionsApi, getEarningsApi } from '../services/api';
import { 
  formatINR, 
  isThisMonth, 
  parseDDMMYYYY, 
  getCurrentMonthISO, 
  isDateInMonth, 
  isDateInRange,
  formatMonthLabel
} from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import { 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Clock,
  RefreshCw,
  X,
  Zap
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
  Legend 
} from 'recharts';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      if (showToast) toast.success('Dashboard refreshed');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Unable to connect to backend/Google Sheets.');
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

  // Category Breakdown
  const categoryMap = {};
  filteredTransactions.forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });
  const categoryData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat]
  }));

  // Timeline
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
    .slice(-12);

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
          <div className="h-32 bg-slate-900 rounded-2xl" />
          <div className="h-32 bg-slate-900 rounded-2xl" />
          <div className="h-32 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      
      {/* 1. TOP HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Main Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400">Personal Student Finances — Live Google Sheets Summary</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* 2. COMBINED HIGH-SPEED TOP CONTROL CARD (QUICK ACTIONS + DATE SELECTOR) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* ROW A: QUICK ACTION BUTTONS (SWAPPED FOR RIGHT-THUMB ERGONOMICS: EARNING ON LEFT, TRANSACTION ON RIGHT) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-semibold">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Fast Action Buttons:</span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
            <Link
              to="/earnings/add"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Earning</span>
            </Link>
            <Link
              to="/transactions/add"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-rose-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </Link>
          </div>
        </div>

        {/* ROW B: DATE / PERIOD SELECTOR PILLS */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs sm:text-sm">
              <CalendarIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>SELECT DATE / PERIOD:</span>
              <span className="text-xs font-normal text-slate-400 border-l border-slate-700 pl-2 truncate max-w-[200px] sm:max-w-none">
                {getPeriodLabel()}
              </span>
            </div>

            {/* Horizontal Scrollable Pills for Mobile Phones */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilterMode('current_month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'current_month'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Current Month
              </button>
              <button
                onClick={() => setFilterMode('specific_month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'specific_month'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Select Month
              </button>
              <button
                onClick={() => setFilterMode('custom_range')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterMode === 'custom_range'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
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

      {/* 3. DYNAMIC PERIOD FINANCIAL SUMMARY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {filterMode === 'all' ? 'Overall Lifetime Summary' : `Financial Summary (${getPeriodLabel()})`}
          </h2>
          {filterMode !== 'all' && (
            <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              Filtered View
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title={filterMode === 'all' ? "Total Earned" : "Period Earned"}
            amount={formatINR(periodEarned)}
            icon={ArrowUpCircle}
            type="earned"
            subtitle={`${filteredEarnings.length} earnings entries in period`}
          />
          <StatCard
            title={filterMode === 'all' ? "Total Spent" : "Period Spent"}
            amount={formatINR(periodSpent)}
            icon={ArrowDownCircle}
            type="spent"
            subtitle={`${filteredTransactions.length} transaction entries in period`}
          />
          <StatCard
            title={filterMode === 'all' ? "Balance" : "Period Balance"}
            amount={formatINR(periodBalance)}
            icon={Wallet}
            type="balance"
            subtitle="Earned - Spent in period"
          />
        </div>
      </div>

      {/* LIFETIME REFERENCE BANNER */}
      {filterMode !== 'all' && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">Lifetime Totals Reference:</span>
            <div className="flex items-center space-x-4 text-slate-300">
              <span>Earned: <strong className="text-emerald-400">{formatINR(lifetimeEarned)}</strong></span>
              <span>Spent: <strong className="text-rose-400">{formatINR(lifetimeSpent)}</strong></span>
              <span>Balance: <strong className="text-indigo-300">{formatINR(lifetimeBalance)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Earnings vs Spending Over Time */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Earnings vs Spending Over Time</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">{getPeriodLabel()}</span>
          </div>
          {timelineData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No financial entries recorded for selected period.
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
                    formatter={(val) => [formatINR(val)]}
                  />
                  <Area type="monotone" dataKey="Earned" stroke="#10b981" fillOpacity={1} fill="url(#colorEarned)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Spent" stroke="#f43f5e" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Spending by Category */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-rose-400" />
              <span>Spending by Category</span>
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
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    formatter={(val) => [formatINR(val)]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 5. RECENT ACTIVITY FEED */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Recent Activity ({getPeriodLabel()})</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{recentActivity.length} entries</span>
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
                <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition">
                  <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isExpense ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{item.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                          {isExpense ? item.category : item.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-bold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isExpense ? `- ${formatINR(item.amount)}` : `+ ${formatINR(item.amount)}`}
                    </p>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      {isExpense ? 'Expense' : 'Earning'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. MOBILE STICKY FLOATING QUICK ACTION DOCK AT BOTTOM (SWAPPED FOR RIGHT-THUMB ERGONOMICS) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center gap-2">
        <Link
          to="/earnings/add"
          className="flex-1 py-3 bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Earning</span>
        </Link>
        <Link
          to="/transactions/add"
          className="flex-1 py-3 bg-rose-600 active:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Transaction</span>
        </Link>
      </div>

    </div>
  );
}
