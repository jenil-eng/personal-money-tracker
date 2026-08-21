import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionsApi, updateTransactionApi, getSettingsApi } from '../../services/api';
import { ddmmYYYYtoISO, isoToDDMMYYYY, formatINR } from '../../utils/formatters';
import { ArrowLeft, Save, Calendar, Tag, CreditCard, AlignLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dateIso, setDateIso] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txRes, settingsRes] = await Promise.all([
          getTransactionsApi(),
          getSettingsApi()
        ]);

        if (settingsRes.data) {
          setCategoriesList(settingsRes.data.categories || []);
          setPaymentMethodsList(settingsRes.data.paymentMethods || []);
        }

        const list = txRes.data || [];
        const targetId = parseInt(id, 10);
        const item = list.find(t => t.id === targetId || t.rowNumber === targetId);

        if (!item) {
          toast.error('Transaction record not found.');
          navigate('/transactions/history');
          return;
        }

        setDateIso(ddmmYYYYtoISO(item.date));
        setDescription(item.description || '');
        setCategory(item.category || '');
        setAmount(item.amount || '');
        setPaymentMethod(item.paymentMethod || '');
        setNotes(item.notes || '');
      } catch (err) {
        toast.error('Failed to load transaction details.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

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

    setSaving(true);
    try {
      await updateTransactionApi(id, {
        date: formattedDate,
        description: description.trim(),
        category,
        amount: numAmount,
        paymentMethod,
        notes: notes.trim()
      });

      toast.success('Transaction updated successfully.');
      navigate('/transactions/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading transaction details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Edit Transaction</h1>
          <p className="text-xs sm:text-sm text-slate-400">Update exact Google Sheets row #{id}</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FIELD 1: DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>1. Date (DD-MM-YYYY)</span>
            </label>
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              required
              className="w-full max-w-full box-border bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
            />
          </div>

          {/* FIELD 2: DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <AlignLeft className="w-4 h-4 text-indigo-400" />
              <span>2. Description *</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
            />
          </div>

          {/* FIELD 3: CATEGORY */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>3. Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* FIELD 4: AMOUNT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-indigo-400" />
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
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none transition"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="mt-1 text-xs text-indigo-300 font-medium">
                Formatted: {formatINR(amount)}
              </p>
            )}
          </div>

          {/* FIELD 5: PAYMENT METHOD */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>5. Payment Method</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
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
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <span>Updating Google Sheets...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Transaction</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
