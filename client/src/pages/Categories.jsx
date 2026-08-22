import React, { useState, useEffect } from 'react';
import { getTransactionsApi } from '../services/api';
import { HIERARCHICAL_CATEGORIES, CategoryPill, SubcategoryPill } from '../utils/categoryUtils';
import { 
  Grid, 
  Tag, 
  Plus, 
  Check, 
  X, 
  Layers, 
  Sparkles, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Film, 
  User 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const [transactions, setTransactions] = useState([]);
  const [categoriesData, setCategoriesData] = useState(() => {
    const saved = localStorage.getItem('pmt_hierarchical_categories');
    return saved ? JSON.parse(saved) : HIERARCHICAL_CATEGORIES;
  });

  const [addingParent, setAddingParent] = useState(null); // Parent category name
  const [newSubcatValue, setNewSubcatValue] = useState('');

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await getTransactionsApi();
        setTransactions(res.data || []);
      } catch (err) {
        console.error('Failed to load transactions count:', err);
      }
    };
    fetchTx();
  }, []);

  // Compute transaction counts per parent category
  const parentCountMap = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    parentCountMap[cat] = (parentCountMap[cat] || 0) + 1;
  });

  const handleAddSubcategory = (parentName) => {
    const val = newSubcatValue.trim();
    if (!val) return;

    const updated = categoriesData.map(group => {
      if (group.parent === parentName) {
        if (group.subcategories.includes(val)) {
          toast.error('Subcategory already exists.');
          return group;
        }
        return {
          ...group,
          subcategories: [...group.subcategories, val]
        };
      }
      return group;
    });

    setCategoriesData(updated);
    localStorage.setItem('pmt_hierarchical_categories', JSON.stringify(updated));
    toast.success(`Subcategory "${val}" added to ${parentName}.`);
    setAddingParent(null);
    setNewSubcatValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Grid className="w-8 h-8 text-indigo-400" />
          <span>Category & Subcategory Catalog</span>
        </h1>
        <p className="text-sm text-slate-400">Hierarchical category architecture for automated transaction tagging</p>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesData.map((group, idx) => {
          const Icon = group.icon || Tag;
          const count = parentCountMap[group.parent] || 0;
          const isAdding = addingParent === group.parent;

          return (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800" style={{ color: group.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-base leading-tight">{group.parent}</h2>
                      <span className="text-[11px] text-slate-400">{group.subcategories.length} Subcategories</span>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                    {count} records
                  </span>
                </div>

                {/* Subcategory Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {group.subcategories.map((sub, sIdx) => (
                    <SubcategoryPill key={sIdx} subcategory={sub} />
                  ))}
                </div>
              </div>

              {/* Add Subcategory Controls */}
              <div className="pt-3 border-t border-slate-800">
                {isAdding ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newSubcatValue}
                      onChange={(e) => setNewSubcatValue(e.target.value)}
                      placeholder="New Subcategory..."
                      className="flex-1 bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddSubcategory(group.parent)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingParent(null); setNewSubcatValue(''); }}
                      className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingParent(group.parent); setNewSubcatValue(''); }}
                    className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-indigo-400 flex items-center justify-center space-x-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Subcategory</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
