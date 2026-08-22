import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  GraduationCap, 
  Receipt, 
  User, 
  Tag, 
  Wallet, 
  Gift, 
  Briefcase, 
  Sparkles, 
  Award, 
  RefreshCw,
  Landmark,
  CreditCard,
  Banknote,
  DollarSign
} from 'lucide-react';

export const CATEGORY_META = {
  Food: {
    icon: Utensils,
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    color: '#f59e0b'
  },
  Travel: {
    icon: Car,
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    color: '#0ea5e9'
  },
  Shopping: {
    icon: ShoppingBag,
    bg: 'bg-ecstasy-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    color: '#a855f7'
  },
  Entertainment: {
    icon: Film,
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    color: '#f43f5e'
  },
  Education: {
    icon: GraduationCap,
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    color: '#6366f1'
  },
  Bills: {
    icon: Receipt,
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    color: '#f97316'
  },
  Personal: {
    icon: User,
    bg: 'bg-teal-500/15',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    color: '#14b8a6'
  },
  Other: {
    icon: Tag,
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    color: '#64748b'
  }
};

export const SOURCE_META = {
  'Pocket Money': { icon: Wallet, color: '#10b981', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Gift: { icon: Gift, color: '#ec4899', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  Freelancing: { icon: Briefcase, color: '#8b5cf6', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  Business: { icon: Landmark, color: '#3b82f6', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Navratri: { icon: Sparkles, color: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  Scholarship: { icon: Award, color: '#06b6d4', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  Refund: { icon: RefreshCw, color: '#14b8a6', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  'IPO Allocation': { icon: Landmark, color: '#10b981', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Other: { icon: Tag, color: '#64748b', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

export const PAYMENT_META = {
  Cash: { icon: Banknote, badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  UPI: { icon: DollarSign, badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'Debit Card': { icon: CreditCard, badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'Credit Card': { icon: CreditCard, badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'Bank Transfer': { icon: Landmark, badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Other: { icon: Tag, badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

export function getCategoryMeta(categoryName) {
  return CATEGORY_META[categoryName] || CATEGORY_META.Other;
}

export function getSourceMeta(sourceName) {
  return SOURCE_META[sourceName] || SOURCE_META.Other;
}

export function getPaymentMeta(paymentName) {
  return PAYMENT_META[paymentName] || PAYMENT_META.Other;
}

export function CategoryPill({ category }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
}

export function SourcePill({ source }) {
  const meta = getSourceMeta(source);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{source}</span>
    </span>
  );
}
