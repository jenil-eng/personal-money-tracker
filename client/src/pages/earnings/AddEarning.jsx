import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEarningApi, getSettingsApi } from '../../services/api';
import { getTodayISO, isoToDDMMYYYY, formatINR } from '../../utils/formatters';
import { ArrowLeft, Save, Calendar, Sparkles, AlignLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddEarning() {
  const navigate = useNavigate();

  // Fields in EXACT required order
  const [dateIso, setDateIso] = useState(getTodayISO());
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Sources dropdown list
  const [sourcesList, setSourcesList] = useState([
    'Pocket Money', 'Gift', 'Freelancing', 'Business', 'Navratri', 'Scholarship', 'Refund', 'Other'
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsApi();
        if (res.data?.sources?.length > 0) {
          setSourcesList(res.data.sources);
          setSource(res.data.sources[0]);
        }
      } catch (err) {
        console.error('Failed to load settings sources:', err);
      }
    };
    fetchSettings();
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
      await addEarningApi({
        date: formattedDate,
        description: description.trim(),
        source: source || sourcesList[0],
        amount: numAmount,
        notes: notes.trim()
      });

      toast.success('Earning added successfully.');

      // Reset form
      setDescription('');
      setAmount('');
      setNotes('');

      navigate('/earnings/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save earning. Please try again.');
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Add Earning</h1>
          <p className="text-xs sm:text-sm text-slate-400">Record money received (Pocket money, freelancing, gifts, etc.)</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FIELD 1: DATE */}
          <div className="w-full max-w-full overflow-hidden">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1. Date (DD-MM-YYYY)</span>
            </label>
            <div className="w-full max-w-full overflow-hidden rounded-xl">
              <input
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                required
                className="w-full max-w-full box-border bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Display format: <span className="text-slate-300 font-mono">{isoToDDMMYYYY(dateIso)}</span>
            </p>
          </div>

          {/* FIELD 2: DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <AlignLeft className="w-4 h-4 text-emerald-500" />
              <span>2. Description *</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Pocket money from parents, Freelance website project"
              required
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* FIELD 3: SOURCE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>3. Source</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            >
              {sourcesList.map((src, idx) => (
                <option key={idx} value={src}>{src}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">Dynamically loaded from Google Sheets LISTS</p>
          </div>

          {/* FIELD 4: AMOUNT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
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
                placeholder="5000"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="mt-1 text-xs text-emerald-400 font-medium">
                Formatted: {formatINR(amount)}
              </p>
            )}
          </div>

          {/* FIELD 5: NOTES */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              5. Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, client info, gift event..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving to Google Sheets...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Earning</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
