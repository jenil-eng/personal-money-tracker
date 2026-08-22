import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTransactionsApi, getEarningsApi, deleteTransactionApi, deleteEarningApi, getSettingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { parseDDMMYYYY, formatMonthLabel, ddmmYYYYtoISO } from '../../utils/formatters';
import { CategoryPill, SubcategoryPill, SourcePill, HIERARCHICAL_CATEGORIES } from '../../utils/categoryUtils';
import Modal from '../../components/common/Modal';
import { 
  Search, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  ArrowUpDown, 
  AlertTriangle,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Type Filter: 'all' | 'expense' | 'income'
  const [typeFilter, setTypeFilter] = useState('all');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Amount Range Filter
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Dropdown lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);

  // Sorting: 'newest' | 'oldest' | 'highest' | 'lowest'
  const [sortOption, setSortOption] = useState('newest');

  // Group By Month View Toggle
  const [groupByMonth, setGroupByMonth] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async () => {
    try {
      const [txRes, earnRes, settingsRes] = await Promise.all([
        getTransactionsApi(),
        getEarningsApi(),
        getSettingsApi()
      ]);
      setTransactions(txRes.data || []);
      setEarnings(earnRes.data || []);
      if (settingsRes.data) {
        setCategoriesList(settingsRes.data.categories || []);
        setPaymentMethodsList(settingsRes.data.paymentMethods || []);
      }
    } catch (err) {
      toast.error('Unable to load history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Combined Records (Expenses + Earnings)
  const allRecords = [
    ...transactions.map(t => ({ ...t, recordType: 'expense', timestamp: parseDDMMYYYY(t.date).getTime() })),
    ...earnings.map(e => ({ ...e, recordType: 'income', category: e.source, timestamp: parseDDMMYYYY(e.date).getTime() }))
  ];

  // Filtering Logic
  const filteredRecords = allRecords.filter(item => {
    // Type Filter
    if (typeFilter === 'expense' && item.recordType !== 'expense') return false;
    if (typeFilter === 'income' && item.recordType !== 'income') return false;

    // Search Query
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      (item.description || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.notes || '').toLowerCase().includes(q);
    if (!matchSearch) return false;

    // Category Filter
    if (filterCategory && item.category !== filterCategory) return false;

    // Subcategory Filter
    if (filterSubcategory && item.subcategory !== filterSubcategory) return false;

    // Payment Method Filter
    if (filterPaymentMethod && item.paymentMethod !== filterPaymentMethod) return false;

    // Date Range Filter
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      if (item.timestamp < fromTime) return false;
    }
    if (dateTo) {
      const toTime = new Date(dateTo).getTime();
      if (item.timestamp > toTime) return false;
    }

    // Amount Range Filter
    const amt = Number(item.amount) || 0;
    if (minAmount && amt < Number(minAmount)) return false;
    if (maxAmount && amt > Number(maxAmount)) return false;

    return true;
  });

  // Sorting Logic
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortOption === 'newest') return b.timestamp - a.timestamp;
    if (sortOption === 'oldest') return a.timestamp - b.timestamp;
    if (sortOption === 'highest') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    if (sortOption === 'lowest') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
    return b.timestamp - a.timestamp;
  });

  // Monthly Grouping
  const monthlyGroups = {};
  if (groupByMonth) {
    sortedRecords.forEach(item => {
      const isoMonth = ddmmYYYYtoISO(item.date).slice(0, 7); // e.g. '2026-08'
      if (!monthlyGroups[isoMonth]) monthlyGroups[isoMonth] = [];
      monthlyGroups[isoMonth].push(item);
    });
  }

  // Pagination Logic
  const totalRecords = sortedRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
    setFilterCategory('');
    setFilterSubcategory('');
    setFilterPaymentMethod('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      if (deleteItem.recordType === 'expense') {
        await deleteTransactionApi(deleteItem.id || deleteItem.rowNumber);
      } else {
        await deleteEarningApi(deleteItem.id || deleteItem.rowNumber);
      }
      toast.success(`${deleteItem.recordType === 'expense' ? 'Transaction' : 'Income'} deleted successfully.`);
      setDeleteItem(null);
      fetchRecords();
    } catch (err) {
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get available subcategories based on selected parent category
  const selectedParentGroup = HIERARCHICAL_CATEGORIES.find(c => c.parent === filterCategory);
  const availableSubcategories = selectedParentGroup ? selectedParentGroup.subcategories : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Transaction History</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {filteredRecords.length} Records
            </span>
          </h1>
          <p className="text-sm text-slate-400">All recorded transactions and earnings with advanced filters</p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
          <button
            onClick={() => setGroupByMonth(!groupByMonth)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              groupByMonth 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {groupByMonth ? <Layers className="w-4 h-4" /> : <List className="w-4 h-4" />}
            <span>{groupByMonth ? 'Grouped View' : 'List View'}</span>
          </button>

          <Link
            to="/transactions/add"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Expense</span>
          </Link>

          <Link
            to="/earnings/add"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Earning</span>
          </Link>
        </div>
      </div>

      {/* SEARCH AND FILTERS PANEL */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* ROW 1: TYPE TOGGLE & SEARCH BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Income vs Expense Filter Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => { setTypeFilter('expense'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => { setTypeFilter('income'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search description, category or notes..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-8 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: CATEGORIES, SUBCATEGORIES, PAYMENT & SORT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CATEGORY FILTER */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setFilterSubcategory(''); setCurrentPage(1); }}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="">All Categories</option>
              {HIERARCHICAL_CATEGORIES.map((group, idx) => (
                <option key={idx} value={group.parent}>{group.parent}</option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY FILTER */}
          <div>
            <select
              value={filterSubcategory}
              onChange={(e) => { setFilterSubcategory(e.target.value); setCurrentPage(1); }}
              disabled={!filterCategory || availableSubcategories.length === 0}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-40"
            >
              <option value="">All Subcategories</option>
              {availableSubcategories.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* PAYMENT METHOD FILTER */}
          <div>
            <select
              value={filterPaymentMethod}
              onChange={(e) => { setFilterPaymentMethod(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="">All Payment Methods</option>
              {paymentMethodsList.map((pm, idx) => (
                <option key={idx} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* SORTING SELECTOR */}
          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="newest">Sort: Newest Date</option>
              <option value="oldest">Sort: Oldest Date</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* ROW 3: DATE RANGE & AMOUNT RANGE */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Dates:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value)} }
                className="bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Amount Range */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Amount:</span>
              <input
                type="number"
                placeholder="Min ₹"
                value={minAmount}
                onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                className="w-20 bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxAmount}
                onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                className="w-20 bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition self-end lg:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

      </div>

      {/* DATA VIEW (LIST OR GROUPED BY MONTH) */}
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading transactions from Google Sheets...</div>
        ) : sortedRecords.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">No records match your active filters.</p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : groupByMonth ? (
          /* GROUPED BY MONTH VIEW */
          <div className="p-4 space-y-6">
            {Object.keys(monthlyGroups).map(monthKey => {
              const items = monthlyGroups[monthKey];
              const monthSpent = items.filter(i => i.recordType === 'expense').reduce((s, i) => s + (Number(i.amount) || 0), 0);
              const monthEarned = items.filter(i => i.recordType === 'income').reduce((s, i) => s + (Number(i.amount) || 0), 0);

              return (
                <div key={monthKey} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                    <h3 className="font-bold text-white text-base flex items-center space-x-2">
                      <span>{formatMonthLabel(monthKey)}</span>
                      <span className="text-xs text-slate-500 font-medium">({items.length} records)</span>
                    </h3>
                    <div className="flex items-center space-x-4 text-xs">
                      <span>Earned: <strong className="text-emerald-400">{formatAmount(monthEarned)}</strong></span>
                      <span>Spent: <strong className="text-rose-400">{formatAmount(monthSpent)}</strong></span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {items.map(item => {
                      const isExpense = item.recordType === 'expense';
                      return (
                        <div key={item.id || item.rowNumber} className="py-2.5 flex items-center justify-between hover:bg-slate-900/50 px-2 rounded-lg transition">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`p-2 rounded-lg ${isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {isExpense ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">{item.description}</p>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                <span>{item.date}</span>
                                <span>•</span>
                                {isExpense ? <CategoryPill category={item.category} /> : <SourcePill source={item.category} />}
                                {item.subcategory && <SubcategoryPill subcategory={item.subcategory} />}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-bold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isExpense ? `- ${formatAmount(item.amount)}` : `+ ${formatAmount(item.amount)}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* STANDARD TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedRecords.map((item) => {
                  const isExpense = item.recordType === 'expense';
                  return (
                    <tr key={`${item.recordType}-${item.id || item.rowNumber}`} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">{item.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100">{item.description}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1">
                          {isExpense ? <CategoryPill category={item.category} /> : <SourcePill source={item.category} />}
                          {item.subcategory && <SubcategoryPill subcategory={item.subcategory} />}
                        </div>
                      </td>
                      <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExpense ? `- ${formatAmount(item.amount)}` : `+ ${formatAmount(item.amount)}`}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{item.paymentMethod || '-'}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate hidden md:table-cell">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(isExpense ? `/transactions/${item.id || item.rowNumber}/edit` : `/earnings/${item.id || item.rowNumber}/edit`)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!groupByMonth && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-white focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>records per page</span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span>
                Showing {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-md text-white transition"
                >
                  Prev
                </button>
                <span className="px-2 font-semibold text-slate-300">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-md text-white transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`${viewItem.recordType === 'expense' ? 'Transaction' : 'Income'} Details`}>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date</span>
              <p className="text-base font-bold text-slate-200">{viewItem.date}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</span>
              <p className="text-base font-bold text-slate-100">{viewItem.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Category</span>
                <div className="mt-1">
                  {viewItem.recordType === 'expense' ? <CategoryPill category={viewItem.category} /> : <SourcePill source={viewItem.category} />}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount</span>
                <p className={`text-base font-bold ${viewItem.recordType === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatAmount(viewItem.amount)}
                </p>
              </div>
            </div>
            {viewItem.paymentMethod && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Method</span>
                <p className="text-sm font-medium text-slate-300">{viewItem.paymentMethod}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Notes</span>
              <p className="text-sm text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1">
                {viewItem.notes || 'No notes provided.'}
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Confirmation">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-medium">Are you sure you want to delete this record?</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm space-y-1 text-slate-300">
              <p><span className="text-slate-500">Description:</span> <strong className="text-white">{deleteItem.description}</strong></p>
              <p><span className="text-slate-500">Amount:</span> <strong className={deleteItem.recordType === 'expense' ? 'text-rose-400' : 'text-emerald-400'}>{formatAmount(deleteItem.amount)}</strong></p>
              <p><span className="text-slate-500">Date:</span> {deleteItem.date}</p>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center space-x-2"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
