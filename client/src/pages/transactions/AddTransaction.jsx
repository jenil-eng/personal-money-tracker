import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTransactionApi, getSettingsApi } from '../../services/api';
import { getTodayISO, isoToDDMMYYYY, formatINR } from '../../utils/formatters';
import { ArrowLeft, Save, Calendar, Tag, CreditCard, AlignLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTransaction() {
  const navigate = useNavigate();

  // Form State in EXACT required order
  const [dateIso, setDateIso] = useState(getTodayISO());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Lists state
  const [categoriesList, setCategoriesList] = useState([
    'Food', 'Travel', 'Shopping', 'Entertainment', 'Education', 'Bills', 'Personal', 'Other'
  ]);
  const [paymentMethodsList, setPaymentMethodsList] = useState([
    'Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await getSettingsApi();
        if (res.data) {
          if (res.data.categories?.length > 0) {
            setCategoriesList(res.data.categories);
            setCategory(res.data.categories[0]);
          }
          if (res.data.paymentMethods?.length > 0) {
            setPaymentMethodsList(res.data.paymentMethods);
            setPaymentMethod(res.data.paymentMethods[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching settings lists:', err);
      }
    };
    fetchLists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Description is required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Amount must be a number greater than 0.');
      return;
    }

    const formattedDate = isoToDDMMYYYY(dateIso);

    setLoading(true);
    try {
      await addTransactionApi({
        date: formattedDate,
        description: description.trim(),
        category: category || categoriesList[0],
        amount: numAmount,
        paymentMethod: paymentMethod || paymentMethodsList[0],
        notes: notes.trim()
      });

      toast.success('Transaction added successfully.');
      
      // Reset form
      setDescription('');
      setAmount('');
      setNotes('');

      // Navigate to History or Dashboard
      navigate('/transactions/history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to save transaction. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Add Transaction</h1>
          <p className="text-xs sm:text-sm text-slate-400">Record a new expense into Google Sheets</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FIELD 1: DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>1. Date (DD-MM-YYYY)</span>
            </label>
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              required
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            />
            <p className="mt-1 text-xs text-slate-500">
              Display format: <span className="text-slate-300 font-mono">{isoToDDMMYYYY(dateIso)}</span>
            </p>
          </div>

          {/* FIELD 2: DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <AlignLeft className="w-4 h-4 text-rose-500" />
              <span>2. Description *</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner with friends, Petrol for bike"
              required
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* FIELD 3: CATEGORY */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-rose-500" />
              <span>3. Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">Dynamically loaded from Google Sheets LISTS</p>
          </div>

          {/* FIELD 4: AMOUNT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-rose-500" />
              <span>4. Amount (₹) *</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="mt-1 text-xs text-emerald-400 font-medium">
                Formatted: {formatINR(amount)}
              </p>
            )}
          </div>

          {/* FIELD 5: PAYMENT METHOD */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>5. Payment Method</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
            >
              {paymentMethodsList.map((pm, idx) => (
                <option key={idx} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* FIELD 6: NOTES */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              6. Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, birthday event, receipt info..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-rose-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition resize-none"
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving to Google Sheets...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Transaction</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
