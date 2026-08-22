import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEarningsApi, deleteEarningApi, getSettingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { parseDDMMYYYY } from '../../utils/formatters';
import { SourcePill } from '../../utils/categoryUtils';
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
  Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EarningsHistory() {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();

  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sourcesList, setSourcesList] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEarnings = async () => {
    try {
      const [earnRes, settingsRes] = await Promise.all([
        getEarningsApi(),
        getSettingsApi()
      ]);
      setEarnings(earnRes.data || []);
      if (settingsRes.data?.sources) {
        setSourcesList(settingsRes.data.sources);
      }
    } catch (err) {
      toast.error('Unable to load earnings history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // Filter & Search
  const filteredEarnings = earnings.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      (item.description || '').toLowerCase().includes(q) ||
      (item.source || '').toLowerCase().includes(q) ||
      (item.notes || '').toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (filterSource && item.source !== filterSource) return false;

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

  // Sorting
  const sortedEarnings = [...filteredEarnings].sort((a, b) => {
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

  // Pagination
  const totalRecords = sortedEarnings.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedEarnings = sortedEarnings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSource('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteEarningApi(deleteItem.id || deleteItem.rowNumber);
      toast.success('Earning deleted successfully.');
      setDeleteItem(null);
      fetchEarnings();
    } catch (err) {
      toast.error('Failed to delete earning. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Earnings History</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {filteredEarnings.length} Incomes
            </span>
          </h1>
          <p className="text-sm text-slate-400">All recorded income/earnings entries</p>
        </div>

        <Link
          to="/earnings/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/25 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Income</span>
        </Link>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, notes or source..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
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

          {/* SOURCE FILTER */}
          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            >
              <option value="">All Sources</option>
              {sourcesList.map((src, idx) => (
                <option key={idx} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {/* SORTING TOGGLE */}
          <div className="flex items-center space-x-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="flex-1 bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none transition"
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

        {/* DATE RANGE & CLEAR */}
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

      {/* TABLE */}
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading earnings from Google Sheets...</div>
        ) : paginatedEarnings.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Landmark className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">No earnings recorded yet.</p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedEarnings.map((earn) => (
                  <tr key={earn.id || earn.rowNumber} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">{earn.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">{earn.description}</td>
                    <td className="py-3.5 px-4">
                      <SourcePill source={earn.source} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      {formatAmount(earn.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate hidden md:table-cell">
                      {earn.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setViewItem(earn)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/earnings/${earn.id || earn.rowNumber}/edit`)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
                        title="Edit Earning"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(earn)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete Earning"
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

        {/* PAGINATION */}
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
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Earning Details">
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
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Source</span>
                <div className="mt-1"><SourcePill source={viewItem.source} /></div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount</span>
                <p className="text-base font-bold text-emerald-400">{formatAmount(viewItem.amount)}</p>
              </div>
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
        <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Earning">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-medium">Are you sure you want to delete this earning?</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm space-y-1 text-slate-300">
              <p><span className="text-slate-500">Description:</span> <strong className="text-white">{deleteItem.description}</strong></p>
              <p><span className="text-slate-500">Amount:</span> <strong className="text-emerald-400">{formatAmount(deleteItem.amount)}</strong></p>
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
