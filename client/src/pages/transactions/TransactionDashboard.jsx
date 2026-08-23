import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactionsApi } from '../../services/api';
import { 
  formatINR, 
  isThisMonth, 
  getCurrentMonthISO, 
  isDateInMonth, 
  isDateInRange, 
  formatMonthLabel 
} from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import { ArrowDownCircle, Calendar, Hash, PlusCircle, History, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const cached = localStorage.getItem('pmt_cached_transactions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('pmt_cached_transactions');
  });

  // Date Filter State
  const [filterMode, setFilterMode] = useState('all'); 
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await getTransactionsApi();
      const freshTx = res.data || [];
      setTransactions(freshTx);
      localStorage.setItem('pmt_cached_transactions', JSON.stringify(freshTx));
    } catch (err) {
      toast.error('Unable to fetch transactions from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filterRecord = (item) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'current_month') return isThisMonth(item.date);
    if (filterMode === 'specific_month') return isDateInMonth(item.date, selectedMonth);
    if (filterMode === 'custom_range') return isDateInRange(item.date, dateFrom, dateTo);
    return true;
  };

  const filteredTransactions = transactions.filter(filterRecord);

  // Stat Calculations
  const periodSpent = filteredTransactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const thisMonthSpent = transactions
    .filter(item => isThisMonth(item.date))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Spending by Category Breakdown for Period
  const categoryMap = {};
  filteredTransactions.forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });

  const categoryList = Object.entries(categoryMap)
    .map(([cat, amt]) => ({ category: cat, amount: amt }))
    .sort((a, b) => b.amount - a.amount);

  const recentTransactions = [...filteredTransactions].reverse().slice(0, 5);

  const getPeriodLabel = () => {
    if (filterMode === 'all') return 'Lifetime All Transactions';
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
      
      {/* Header & Quick Links */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ArrowDownCircle className="w-8 h-8 text-rose-500" />
            <span>Transaction Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Overview of money spent</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2.5 sm:space-y-0 sm:space-x-2.5 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <Link
              to="/transactions/add"
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition active:scale-95 text-center"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">+ Add Expense</span>
            </Link>
            <Link
              to="/earnings/add"
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95 text-center"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">+ Add Earning</span>
            </Link>
          </div>
          <Link
            to="/transactions/history"
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition w-full sm:w-auto"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* COMBINED TOP CONTROL CARD (FAST RESPONSE FOR PHONE) */}
      <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>SELECT DATE / PERIOD:</span>
            <span className="text-xs font-normal text-slate-400 border-l border-slate-700 pl-2">
              Showing {getPeriodLabel()}
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterMode === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterMode('current_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterMode === 'current_month'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Current Month
            </button>
            <button
              onClick={() => setFilterMode('specific_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterMode === 'specific_month'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Select Month
            </button>
            <button
              onClick={() => setFilterMode('custom_range')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterMode === 'custom_range'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
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

        {filterMode === 'specific_month' && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-3">
            <label className="text-xs text-slate-300 font-medium">Month & Year:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <span className="text-xs text-rose-300 font-semibold">
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
                className="bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-300">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title={filterMode === 'all' ? "Total Spent" : "Period Spent"}
          amount={formatINR(periodSpent)}
          icon={ArrowDownCircle}
          type="spent"
          subtitle={filterMode === 'all' ? "All time expenses" : `Spent in ${getPeriodLabel()}`}
        />
        <StatCard
          title="This Month Spent"
          amount={formatINR(thisMonthSpent)}
          icon={Calendar}
          type="spent"
          subtitle="Current calendar month"
        />
        <StatCard
          title="Transactions"
          amount={filteredTransactions.length}
          icon={Hash}
          type="neutral"
          subtitle={`Records in period (${transactions.length} total)`}
        />
      </div>

      {/* SPENDING BY CATEGORY & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100">Spending by Category</h2>
            <span className="text-xs text-slate-500 font-medium">{getPeriodLabel()}</span>
          </div>
          
          {categoryList.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No categories found for selected period.</p>
          ) : (
            <div className="space-y-3">
              {categoryList.map((item, idx) => {
                const percentage = periodSpent > 0 ? Math.round((item.amount / periodSpent) * 100) : 0;
                return (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-200">{item.category}</span>
                      <span className="font-bold text-rose-400">{formatINR(item.amount)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100">Recent Transactions</h2>
            <Link to="/transactions/history" className="text-xs text-rose-400 hover:underline font-semibold">
              View All
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No transactions found for selected period.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentTransactions.map((tx, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{tx.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="text-rose-400 font-medium">{tx.category}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-rose-400">
                    - {formatINR(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM DOCK */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-center">
        <Link
          to="/transactions/add"
          className="w-full py-3 bg-rose-600 active:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Transaction</span>
        </Link>
      </div>

    </div>
  );
}
