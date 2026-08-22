import React, { useState, useEffect } from 'react';
import { getTransactionsApi, getSettingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isThisMonth } from '../utils/formatters';
import { CategoryPill, HIERARCHICAL_CATEGORIES, getCategoryMeta } from '../utils/categoryUtils';
import Modal from '../components/common/Modal';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Edit2, 
  Plus, 
  Zap,
  PieChart as PieChartIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_BUDGETS = {
  'Food & Dining': 5000,
  Food: 5000,
  Transport: 3000,
  Travel: 3000,
  Shopping: 4000,
  'Bills & Utilities': 4000,
  Bills: 4000,
  Entertainment: 2500,
  'Personal & Health': 3000,
  Personal: 3000,
  Education: 3000,
  Other: 2000
};

export default function Budgets() {
  const { formatAmount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Budgets state (persisted in localStorage)
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const saved = localStorage.getItem('pmt_category_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  // Edit budget modal
  const [editingCategory, setEditingCategory] = useState(null); // { name, budget }
  const [newBudgetVal, setNewBudgetVal] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await getTransactionsApi();
        setTransactions(txRes.data || []);
      } catch (err) {
        toast.error('Unable to load transactions for budget tracking.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter current month transactions
  const currentMonthTransactions = transactions.filter(t => isThisMonth(t.date));

  // Compute category spending for current month
  const categorySpendingMap = {};
  currentMonthTransactions.forEach(t => {
    const cat = t.category || 'Other';
    categorySpendingMap[cat] = (categorySpendingMap[cat] || 0) + (Number(t.amount) || 0);
  });

  // Overall Monthly Total Spent vs Total Budget Target
  const totalMonthlySpent = Object.values(categorySpendingMap).reduce((a, b) => a + b, 0);
  const totalMonthlyBudget = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  const overallRatio = totalMonthlyBudget > 0 ? Math.min(Math.round((totalMonthlySpent / totalMonthlyBudget) * 100), 100) : 0;

  const handleSaveBudget = () => {
    if (!editingCategory) return;
    const val = Number(newBudgetVal);
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid budget amount.');
      return;
    }

    const updated = {
      ...categoryBudgets,
      [editingCategory.name]: val
    };

    setCategoryBudgets(updated);
    localStorage.setItem('pmt_category_budgets', JSON.stringify(updated));
    toast.success(`Budget for "${editingCategory.name}" updated to ${formatAmount(val)}.`);
    setEditingCategory(null);
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

  // Active category names from hierarchical categories
  const activeCategories = HIERARCHICAL_CATEGORIES.map(g => g.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Target className="w-8 h-8 text-indigo-400" />
          <span>Category Budgets & Limits</span>
        </h1>
        <p className="text-sm text-slate-400">Set spending targets per category and monitor monthly budget health</p>
      </div>

      {/* OVERALL BUDGET SUMMARY BANNER */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl border-l-4 border-l-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Overall Monthly Target Health</h2>
          </div>
          <p className="text-xs text-slate-400">
            Total spent <strong className="text-white">{formatAmount(totalMonthlySpent)}</strong> of <strong className="text-white">{formatAmount(totalMonthlyBudget)}</strong> total budget target.
          </p>

          <div className="w-full sm:w-80 h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 mt-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                overallRatio > 90 
                  ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                  : overallRatio > 70 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${overallRatio}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Status</span>
            <span className={`inline-block mt-1 text-xs font-extrabold px-3 py-1 rounded-full border ${
              overallRatio > 90 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : overallRatio > 70 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {overallRatio > 100 ? 'Over Budget' : overallRatio > 90 ? 'Near Limit' : overallRatio > 70 ? 'Moderate' : 'Under Budget'} ({overallRatio}%)
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-medium">Remaining</span>
            <span className="text-lg font-black text-emerald-400 block mt-0.5">
              {formatAmount(Math.max(0, totalMonthlyBudget - totalMonthlySpent))}
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORY BUDGETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeCategories.map(catName => {
          const spent = categorySpendingMap[catName] || 0;
          const targetBudget = categoryBudgets[catName] || DEFAULT_BUDGETS[catName] || 3000;
          const ratio = targetBudget > 0 ? Math.min(Math.round((spent / targetBudget) * 100), 100) : 0;
          const meta = getCategoryMeta(catName);

          return (
            <div key={catName} className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <CategoryPill category={catName} />
                  <button
                    onClick={() => { setEditingCategory({ name: catName, budget: targetBudget }); setNewBudgetVal(String(targetBudget)); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                    title="Edit Category Budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Spent:</span>
                    <span className="text-xl font-black text-white">{formatAmount(spent)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-500">
                    <span>Limit Target:</span>
                    <span className="font-semibold text-slate-300">{formatAmount(targetBudget)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 mt-3">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${ratio}%`, backgroundColor: meta.color }} 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {spent > targetBudget ? 'Over by ' : 'Remaining: '}
                  <strong className={spent > targetBudget ? 'text-rose-400' : 'text-emerald-400'}>
                    {formatAmount(Math.abs(targetBudget - spent))}
                  </strong>
                </span>

                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  spent > targetBudget 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : ratio > 80 
                    ? 'bg-amber-500/20 text-amber-300' 
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {spent > targetBudget ? 'Exceeded' : `${ratio}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT BUDGET MODAL */}
      {editingCategory && (
        <Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title={`Set Budget for "${editingCategory.name}"`}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Spending Target (₹)</label>
              <input
                type="number"
                value={newBudgetVal}
                onChange={(e) => setNewBudgetVal(e.target.value)}
                placeholder="Enter monthly target..."
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Save Target
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
