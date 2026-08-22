import React, { useState, useEffect } from 'react';
import { getSettingsApi, updateSettingsApi, getTransactionsApi, getEarningsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryPill, SourcePill } from '../utils/categoryUtils';
import Modal from '../components/common/Modal';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Tag, 
  Sparkles, 
  CreditCard,
  Eye,
  EyeOff,
  Shield,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { privacyMode, togglePrivacyMode } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Existing records for deletion usage check
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Adding state
  const [addingType, setAddingType] = useState(null); // 'categories' | 'sources' | 'paymentMethods'
  const [newItemValue, setNewItemValue] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null); // { type, index, oldValue, newValue }

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // { type, index, value, isUsed, count }

  const fetchData = async () => {
    try {
      const [settingsRes, txRes, earnRes] = await Promise.all([
        getSettingsApi(),
        getTransactionsApi(),
        getEarningsApi()
      ]);

      if (settingsRes.data) {
        setCategories(settingsRes.data.categories || []);
        setSources(settingsRes.data.sources || []);
        setPaymentMethods(settingsRes.data.paymentMethods || []);
      }
      setTransactions(txRes.data || []);
      setEarnings(earnRes.data || []);
    } catch (err) {
      toast.error('Failed to load settings from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveListsToBackend = async (newCategories, newSources, newPaymentMethods) => {
    setSaving(true);
    try {
      await updateSettingsApi({
        categories: newCategories,
        sources: newSources,
        paymentMethods: newPaymentMethods
      });
      setCategories(newCategories);
      setSources(newSources);
      setPaymentMethods(newPaymentMethods);
      toast.success('Settings updated in Google Sheets.');
    } catch (err) {
      toast.error('Failed to update Google Sheets LISTS.');
    } finally {
      setSaving(false);
    }
  };

  // Add Item Handler
  const handleAddItem = async (type) => {
    const val = newItemValue.trim();
    if (!val) return;

    let updatedCat = [...categories];
    let updatedSrc = [...sources];
    let updatedPm = [...paymentMethods];

    if (type === 'categories') {
      if (updatedCat.includes(val)) {
        toast.error('Category already exists.');
        return;
      }
      updatedCat.push(val);
    } else if (type === 'sources') {
      if (updatedSrc.includes(val)) {
        toast.error('Earning source already exists.');
        return;
      }
      updatedSrc.push(val);
    } else if (type === 'paymentMethods') {
      if (updatedPm.includes(val)) {
        toast.error('Payment method already exists.');
        return;
      }
      updatedPm.push(val);
    }

    setAddingType(null);
    setNewItemValue('');
    await saveListsToBackend(updatedCat, updatedSrc, updatedPm);
  };

  // Edit Item Handler
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const { type, index, newValue } = editingItem;
    const val = newValue.trim();
    if (!val) return;

    let updatedCat = [...categories];
    let updatedSrc = [...sources];
    let updatedPm = [...paymentMethods];

    if (type === 'categories') {
      updatedCat[index] = val;
    } else if (type === 'sources') {
      updatedSrc[index] = val;
    } else if (type === 'paymentMethods') {
      updatedPm[index] = val;
    }

    setEditingItem(null);
    await saveListsToBackend(updatedCat, updatedSrc, updatedPm);
  };

  // Delete Click Check
  const initiateDelete = (type, index, value) => {
    let count = 0;
    if (type === 'categories') {
      count = transactions.filter(t => t.category === value).length;
    } else if (type === 'sources') {
      count = earnings.filter(e => e.source === value).length;
    } else if (type === 'paymentMethods') {
      count = transactions.filter(t => t.paymentMethod === value).length;
    }

    setDeleteModal({
      type,
      index,
      value,
      isUsed: count > 0,
      count
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    if (deleteModal.isUsed) {
      toast.error(`Cannot delete "${deleteModal.value}" because it is currently used by existing records.`);
      setDeleteModal(null);
      return;
    }

    const { type, index } = deleteModal;
    let updatedCat = [...categories];
    let updatedSrc = [...sources];
    let updatedPm = [...paymentMethods];

    if (type === 'categories') updatedCat.splice(index, 1);
    else if (type === 'sources') updatedSrc.splice(index, 1);
    else if (type === 'paymentMethods') updatedPm.splice(index, 1);

    setDeleteModal(null);
    await saveListsToBackend(updatedCat, updatedSrc, updatedPm);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-indigo-400" />
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-sm text-slate-400">Manage categories, payment options, and privacy controls</p>
      </div>

      {/* PRIVACY & DISPLAY CARD */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Privacy & Security Options</h2>
            <p className="text-xs text-slate-400">Control sensitive financial data visibility in public places</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${privacyMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
              {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Privacy Mode (Mask Amounts)</p>
              <p className="text-xs text-slate-400">Mask all monetary values with `₹••••` when enabled</p>
            </div>
          </div>

          <button
            onClick={togglePrivacyMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              privacyMode 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {privacyMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* CATEGORY & SOURCE MANAGEMENT GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SECTION 1: TRANSACTION CATEGORIES */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Categories</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{categories.length}</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {categories.map((cat, idx) => {
                const isEditing = editingItem?.type === 'categories' && editingItem?.index === idx;

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 w-full">
                        <input
                          type="text"
                          value={editingItem.newValue}
                          onChange={(e) => setEditingItem({ ...editingItem, newValue: e.target.value })}
                          className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <CategoryPill category={cat} />
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingItem({ type: 'categories', index: idx, oldValue: cat, newValue: cat })}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => initiateDelete('categories', idx, cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="pt-3 border-t border-slate-800">
            {addingType === 'categories' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="New Category..."
                  className="flex-1 bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleAddItem('categories')}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingType(null); setNewItemValue(''); }}
                  className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingType('categories'); setNewItemValue(''); }}
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-rose-400 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Category</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: EARNING SOURCES */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Earning Sources</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{sources.length}</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sources.map((src, idx) => {
                const isEditing = editingItem?.type === 'sources' && editingItem?.index === idx;

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 w-full">
                        <input
                          type="text"
                          value={editingItem.newValue}
                          onChange={(e) => setEditingItem({ ...editingItem, newValue: e.target.value })}
                          className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <SourcePill source={src} />
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingItem({ type: 'sources', index: idx, oldValue: src, newValue: src })}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => initiateDelete('sources', idx, src)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Source Form */}
          <div className="pt-3 border-t border-slate-800">
            {addingType === 'sources' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="New Source..."
                  className="flex-1 bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleAddItem('sources')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingType(null); setNewItemValue(''); }}
                  className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingType('sources'); setNewItemValue(''); }}
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Source</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: PAYMENT METHODS */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Payment Methods</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{paymentMethods.length}</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {paymentMethods.map((pm, idx) => {
                const isEditing = editingItem?.type === 'paymentMethods' && editingItem?.index === idx;

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 w-full">
                        <input
                          type="text"
                          value={editingItem.newValue}
                          onChange={(e) => setEditingItem({ ...editingItem, newValue: e.target.value })}
                          className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-200">{pm}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingItem({ type: 'paymentMethods', index: idx, oldValue: pm, newValue: pm })}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => initiateDelete('paymentMethods', idx, pm)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Payment Method Form */}
          <div className="pt-3 border-t border-slate-800">
            {addingType === 'paymentMethods' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="New Payment Method..."
                  className="flex-1 bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleAddItem('paymentMethods')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingType(null); setNewItemValue(''); }}
                  className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingType('paymentMethods'); setNewItemValue(''); }}
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-indigo-400 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Payment Method</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* DELETE CONFIRMATION & PROTECTION MODAL */}
      {deleteModal && (
        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title={`Delete "${deleteModal.value}"`}>
          <div className="space-y-4">
            {deleteModal.isUsed ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-amber-400 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Option Currently in Use!</p>
                    <p className="mt-1 text-slate-300">
                      <strong>"{deleteModal.value}"</strong> is currently used by <strong>{deleteModal.count}</strong> existing record(s). You can rename it instead of deleting it to preserve historical records.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Got It (Cancel)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Are you sure you want to delete <strong>"{deleteModal.value}"</strong>?
                </p>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={saving}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-rose-600/30"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}
