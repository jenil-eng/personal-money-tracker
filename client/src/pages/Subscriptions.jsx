import React, { useState, useEffect } from 'react';
import { 
  getSubscriptionsApi, 
  addSubscriptionApi, 
  updateSubscriptionApi, 
  deleteSubscriptionApi, 
  paySubscriptionApi,
  getSettingsApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryPill } from '../utils/categoryUtils';
import Modal from '../components/common/Modal';
import { 
  Repeat, 
  CalendarCheck, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Zap, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const { formatAmount } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bills',
    amount: '',
    billingCycle: 'monthly',
    dueDay: '1',
    paymentMethod: 'UPI',
    notes: ''
  });

  const fetchSubscriptions = async () => {
    try {
      const [subsRes, settingsRes] = await Promise.all([
        getSubscriptionsApi(),
        getSettingsApi()
      ]);
      setSubscriptions(subsRes.data || []);
      if (settingsRes.data) {
        setCategoriesList(settingsRes.data.categories || ['Bills', 'Entertainment', 'Personal', 'Other']);
        setPaymentMethodsList(settingsRes.data.paymentMethods || ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer']);
      }
    } catch (err) {
      toast.error('Failed to load recurring subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Compute Days Remaining until due date in current month
  const getDueInfo = (dueDay) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const todayDate = today.getDate();

    let targetDate = new Date(currentYear, currentMonth, dueDay);
    if (todayDate > dueDay) {
      // Due date already passed this month, target next month
      targetDate = new Date(currentYear, currentMonth + 1, dueDay);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      diffDays,
      dueDay,
      isToday: diffDays === 0 || todayDate === dueDay,
      isDueSoon: diffDays > 0 && diffDays <= 5
    };
  };

  // Total Monthly Commitment
  const totalMonthlyCommitment = subscriptions
    .filter(s => s.status !== 'paused')
    .reduce((sum, s) => {
      const amt = Number(s.amount) || 0;
      if (s.billingCycle === 'yearly') return sum + Math.round(amt / 12);
      if (s.billingCycle === 'weekly') return sum + (amt * 4);
      return sum + amt;
    }, 0);

  // Due soon count (due in next 7 days)
  const upcomingBillsCount = subscriptions.filter(s => {
    const info = getDueInfo(Number(s.dueDay) || 1);
    return info.isToday || info.diffDays <= 7;
  }).length;

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: categoriesList[0] || 'Bills',
      amount: '',
      billingCycle: 'monthly',
      dueDay: '5',
      paymentMethod: paymentMethodsList[0] || 'UPI',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (sub) => {
    setEditItem(sub);
    setFormData({
      name: sub.name,
      category: sub.category,
      amount: sub.amount,
      billingCycle: sub.billingCycle || 'monthly',
      dueDay: String(sub.dueDay || 1),
      paymentMethod: sub.paymentMethod || 'UPI',
      notes: sub.notes || ''
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error('Subscription name and amount are required.');
      return;
    }

    setSubmitting(true);
    try {
      await addSubscriptionApi(formData);
      toast.success(`Subscription "${formData.name}" added successfully!`);
      setShowAddModal(false);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error('Subscription name and amount are required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateSubscriptionApi(editItem.id, formData);
      toast.success(`Updated "${formData.name}".`);
      setEditItem(null);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await deleteSubscriptionApi(deleteItem.id);
      toast.success(`Deleted "${deleteItem.name}".`);
      setDeleteItem(null);
      fetchSubscriptions();
    } catch (err) {
      toast.error('Failed to delete subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handle1ClickPay = async (sub) => {
    setPayingId(sub.id);
    try {
      const res = await paySubscriptionApi(sub.id);
      toast.success(res.data?.message || `Logged ₹${sub.amount} expense for "${sub.name}"!`);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log bill payment.');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-900 rounded-2xl" />
          <div className="h-28 bg-slate-900 rounded-2xl" />
          <div className="h-28 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Repeat className="w-8 h-8 text-indigo-400" />
            <span>Recurring Subscriptions & Bills</span>
          </h1>
          <p className="text-sm text-slate-400">Track monthly commitments, due date reminders & 1-click bill payments</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Subscription</span>
        </button>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Commitments */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Commitment</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            {formatAmount(totalMonthlyCommitment)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Fixed monthly recurring cost</p>
        </div>

        {/* Upcoming Bills Due Soon */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bills Due Soon</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-3 tracking-tight">
            {upcomingBillsCount} Bills
          </p>
          <p className="text-xs text-slate-400 mt-1">Due within next 7 days</p>
        </div>

        {/* Active Subscriptions Count */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Commitments</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 tracking-tight">
            {subscriptions.length} Active
          </p>
          <p className="text-xs text-slate-400 mt-1">Tracked recurring services</p>
        </div>
      </div>

      {/* SUBSCRIPTIONS CARDS GRID */}
      {subscriptions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
          <Repeat className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-medium">No recurring subscriptions or fixed bills added yet.</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add First Subscription</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subscriptions.map((sub) => {
            const dueInfo = getDueInfo(Number(sub.dueDay) || 1);
            const isPaying = payingId === sub.id;

            return (
              <div 
                key={sub.id} 
                className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Card Top Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-lg leading-tight">{sub.name}</h3>
                      <div className="flex items-center space-x-2">
                        <CategoryPill category={sub.category} />
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 font-medium uppercase border border-slate-800">
                          {sub.billingCycle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-rose-400">
                        {formatAmount(sub.amount)}
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">per cycle</span>
                    </div>
                  </div>

                  {/* Due Date Indicator Badge */}
                  <div className="pt-2">
                    {dueInfo.isToday ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-300 text-xs font-bold animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Due Today! ({sub.dueDay}th of month)</span>
                      </div>
                    ) : dueInfo.isDueSoon ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due in {dueInfo.diffDays} days ({sub.dueDay}th)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-slate-400 text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Due on {sub.dueDay}th of month</span>
                      </div>
                    )}
                  </div>

                  {sub.lastPaidDate && (
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Last logged payment: {sub.lastPaidDate}</span>
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handle1ClickPay(sub)}
                    disabled={isPaying}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Log bill payment directly to expense history"
                  >
                    {isPaying ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Pay & Log</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      title="Edit Subscription"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(sub)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      title="Delete Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD SUBSCRIPTION MODAL */}
      {showAddModal && (
        <Modal title="Add New Recurring Subscription" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Subscription / Bill Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Netflix 4K, House Rent, Jio WiFi"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                >
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 649"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Due Day of Month (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              >
                {paymentMethodsList.map((pm, idx) => (
                  <option key={idx} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Account ID or split details"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                {submitting ? 'Adding...' : 'Save Subscription'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT SUBSCRIPTION MODAL */}
      {editItem && (
        <Modal title={`Edit "${editItem.name}"`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Subscription / Bill Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                >
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Due Day of Month (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              >
                {paymentMethodsList.map((pm, idx) => (
                  <option key={idx} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                {submitting ? 'Updating...' : 'Update Subscription'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <Modal title="Confirm Delete" onClose={() => setDeleteItem(null)}>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Are you sure you want to delete the subscription <strong className="text-white">"{deleteItem.name}"</strong>?
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
