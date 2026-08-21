import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTransactionsApi, deleteTransactionApi, getSettingsApi } from '../../services/api';
import { formatINR, parseDDMMYYYY, ddmmYYYYtoISO } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  ArrowUpDown, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionHistory() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dropdown lists for filter options
  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const [txRes, settingsRes] = await Promise.all([
        getTransactionsApi(),
        getSettingsApi()
      ]);
      setTransactions(txRes.data || []);
      if (settingsRes.data) {
        setCategoriesList(settingsRes.data.categories || []);
        setPaymentMethodsList(settingsRes.data.paymentMethods || []);
      }
    } catch (err) {
      toast.error('Unable to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter & Search Logic
  const filteredTransactions = transactions.filter(item => {
    // Search
    const matchSearch = 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    // Category Filter
    if (filterCategory && item.category !== filterCategory) return false;

    // Payment Method Filter
    if (filterPaymentMethod && item.paymentMethod !== filterPaymentMethod) return false;

    // Date Range Filter
    const itemDate = parseDDMMYYYY(item.date).getTime();
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      if (itemDate < fromTime) return false;
    }
    if (dateTo) {
      const toTime = new Date(dateTo).getTime();
      if (itemDate > toTime) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      const timeA = parseDDMMYYYY(a.date).getTime();
      const timeB = parseDDMMYYYY(b.date).getTime();
      comparison = timeA - timeB;
    } else if (sortField === 'amount') {
      comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination Logic
  const totalRecords = sortedTransactions.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterPaymentMethod('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteTransactionApi(deleteItem.id || deleteItem.rowNumber);
      toast.success('Transaction deleted successfully.');
      setDeleteItem(null);
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Transaction History</h1>
          <p className="text-sm text-slate-400">All recorded expenses from Google Sheets</p>
        </div>

        <Link
          to="/transactions/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-rose-600/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Transaction</span>
        </Link>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description or category..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* CATEGORY FILTER */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* PAYMENT METHOD FILTER */}
          <div>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            >
              <option value="">All Payment Methods</option>
              {paymentMethodsList.map((pm, idx) => (
                <option key={idx} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* SORTING TOGGLE */}
          <div className="flex items-center space-x-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="flex-1 bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none transition"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition"
              title={`Toggle Order (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DATE RANGE & CLEAR BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Date Range:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading transactions from Google Sheets...</div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-slate-400 font-medium">No transactions yet.</p>
            <Link
              to="/transactions/add"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </Link>
          </div>
        ) : (
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
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id || tx.rowNumber} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-400 whitespace-nowrap">
                      {formatINR(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate hidden md:table-cell">
                      {tx.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setViewItem(tx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/transactions/${tx.id || tx.rowNumber}/edit`)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
                        title="Edit Transaction"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(tx)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
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
      </div>

      {/* VIEW MODAL */}
      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Transaction Details">
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
                <p className="text-sm font-semibold text-rose-400">{viewItem.category}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount</span>
                <p className="text-base font-bold text-rose-400">{formatINR(viewItem.amount)}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Method</span>
              <p className="text-sm font-medium text-slate-300">{viewItem.paymentMethod}</p>
            </div>
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
        <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Transaction">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-medium">Are you sure you want to delete this transaction?</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm space-y-1 text-slate-300">
              <p><span className="text-slate-500">Description:</span> <strong className="text-white">{deleteItem.description}</strong></p>
              <p><span className="text-slate-500">Amount:</span> <strong className="text-rose-400">{formatINR(deleteItem.amount)}</strong></p>
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
