import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEarningsApi, updateEarningApi, getSettingsApi } from '../../services/api';
import { ddmmYYYYtoISO, isoToDDMMYYYY, formatINR } from '../../utils/formatters';
import { ArrowLeft, Save, Calendar, Sparkles, AlignLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditEarning() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dateIso, setDateIso] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [sourcesList, setSourcesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [earnRes, settingsRes] = await Promise.all([
          getEarningsApi(),
          getSettingsApi()
        ]);

        if (settingsRes.data?.sources) {
          setSourcesList(settingsRes.data.sources);
        }

        const list = earnRes.data || [];
        const targetId = parseInt(id, 10);
        const item = list.find(e => e.id === targetId || e.rowNumber === targetId);

        if (!item) {
          toast.error('Earning record not found.');
          navigate('/earnings/history');
          return;
        }

        setDateIso(ddmmYYYYtoISO(item.date));
        setDescription(item.description || '');
        setSource(item.source || '');
        setAmount(item.amount || '');
        setNotes(item.notes || '');
      } catch (err) {
        toast.error('Failed to load earning details.');
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
      await updateEarningApi(id, {
        date: formattedDate,
        description: description.trim(),
        source,
        amount: numAmount,
        notes: notes.trim()
      });

      toast.success('Earning updated successfully.');
      navigate('/earnings/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update earning. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading earning details...
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Edit Earning</h1>
          <p className="text-xs sm:text-sm text-slate-400">Update exact Google Sheets row #{id}</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FIELD 1: DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>1. Date (DD-MM-YYYY)</span>
            </label>
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              required
              className="w-full max-w-full box-border bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
            />
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
              required
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
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
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition"
            >
              {sourcesList.map((src, idx) => (
                <option key={idx} value={src}>{src}</option>
              ))}
            </select>
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
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none transition"
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
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <span>Updating Google Sheets...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Earning</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
