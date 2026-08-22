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
  DollarSign,
  Coffee,
  Zap,
  Smartphone,
  Home,
  Tv,
  Gamepad2,
  Ticket,
  HeartPulse,
  BookOpen,
  Scissors
} from 'lucide-react';

export const HIERARCHICAL_CATEGORIES = [
  {
    parent: 'Food & Dining',
    icon: Utensils,
    color: '#f59e0b',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    subcategories: ['Restaurants', 'Fast Food', 'Groceries', 'Coffee']
  },
  {
    parent: 'Transport',
    icon: Car,
    color: '#0ea5e9',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    subcategories: ['Fuel', 'Public Transport', 'Taxi', 'Maintenance']
  },
  {
    parent: 'Shopping',
    icon: ShoppingBag,
    color: '#a855f7',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    subcategories: ['Clothing', 'Electronics', 'Personal Care', 'Accessories']
  },
  {
    parent: 'Bills & Utilities',
    icon: Receipt,
    color: '#f97316',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    subcategories: ['Electricity', 'Internet', 'Mobile', 'Rent', 'Water']
  },
  {
    parent: 'Entertainment',
    icon: Film,
    color: '#f43f5e',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    subcategories: ['Movies', 'Games', 'Events', 'Subscriptions']
  },
  {
    parent: 'Personal & Health',
    icon: User,
    color: '#14b8a6',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    subcategories: ['Education', 'Books', 'Fitness', 'Medical', 'Personal']
  },
  {
    parent: 'Other',
    icon: Tag,
    color: '#64748b',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    subcategories: ['General', 'Miscellaneous']
  }
];

export const CATEGORY_META = {
  'Food & Dining': { icon: Utensils, badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', color: '#f59e0b' },
  Food: { icon: Utensils, badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', color: '#f59e0b' },
  Transport: { icon: Car, badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', color: '#0ea5e9' },
  Travel: { icon: Car, badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', color: '#0ea5e9' },
  Shopping: { icon: ShoppingBag, badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', color: '#a855f7' },
  'Bills & Utilities': { icon: Receipt, badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', color: '#f97316' },
  Bills: { icon: Receipt, badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', color: '#f97316' },
  Entertainment: { icon: Film, badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', color: '#f43f5e' },
  Education: { icon: GraduationCap, badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', color: '#6366f1' },
  'Personal & Health': { icon: User, badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', color: '#14b8a6' },
  Personal: { icon: User, badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', color: '#14b8a6' },
  Other: { icon: Tag, badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', color: '#64748b' }
};

export const SUBCATEGORY_META = {
  Restaurants: Utensils,
  'Fast Food': Utensils,
  Groceries: ShoppingBag,
  Coffee: Coffee,
  Fuel: Car,
  'Public Transport': Car,
  Taxi: Car,
  Maintenance: Car,
  Clothing: ShoppingBag,
  Electronics: Tv,
  'Personal Care': Scissors,
  Electricity: Zap,
  Internet: Zap,
  Mobile: Smartphone,
  Rent: Home,
  Movies: Film,
  Games: Gamepad2,
  Events: Ticket,
  Education: GraduationCap,
  Books: BookOpen,
  Fitness: HeartPulse,
  Medical: HeartPulse
};

export const SOURCE_META = {
  'Pocket Money': { icon: Wallet, color: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Gift: { icon: Gift, color: '#ec4899', badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  Freelancing: { icon: Briefcase, color: '#8b5cf6', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  Business: { icon: Landmark, color: '#3b82f6', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  Navratri: { icon: Sparkles, color: '#f59e0b', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  Scholarship: { icon: Award, color: '#06b6d4', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  Refund: { icon: RefreshCw, color: '#14b8a6', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  'IPO Allocation': { icon: Landmark, color: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Other: { icon: Tag, color: '#64748b', badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30' }
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

export function getParentCategory(categoryOrSubcategory) {
  for (const group of HIERARCHICAL_CATEGORIES) {
    if (group.parent === categoryOrSubcategory || group.subcategories.includes(categoryOrSubcategory)) {
      return group.parent;
    }
  }
  return 'Other';
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

export function getSubcategoriesForCategory(categoryName) {
  if (!categoryName) return ['General', 'Miscellaneous'];
  const cat = String(categoryName).trim().toLowerCase();

  // Direct alias matching
  if (cat.includes('food') || cat.includes('din')) {
    return ['Restaurants', 'Fast Food', 'Groceries', 'Coffee'];
  }
  if (cat.includes('travel') || cat.includes('transport') || cat.includes('vehic') || cat.includes('car') || cat.includes('bike')) {
    return ['Fuel', 'Public Transport', 'Taxi', 'Maintenance'];
  }
  if (cat.includes('shop') || cat.includes('cloth') || cat.includes('store')) {
    return ['Clothing', 'Electronics', 'Personal Care', 'Accessories'];
  }
  if (cat.includes('bill') || cat.includes('util') || cat.includes('recharg')) {
    return ['Electricity', 'Internet', 'Mobile', 'Rent', 'Water'];
  }
  if (cat.includes('entertain') || cat.includes('movi') || cat.includes('game') || cat.includes('fun')) {
    return ['Movies', 'Games', 'Events', 'Subscriptions'];
  }
  if (cat.includes('educat') || cat.includes('study') || cat.includes('school') || cat.includes('colleg')) {
    return ['Courses', 'Tuition', 'Stationery', 'Books', 'Fees'];
  }
  if (cat.includes('person') || cat.includes('health') || cat.includes('med') || cat.includes('fit')) {
    return ['Education', 'Books', 'Fitness', 'Medical', 'Personal Care'];
  }

  // Fallback to HIERARCHICAL_CATEGORIES matcher
  for (const group of HIERARCHICAL_CATEGORIES) {
    const parentLower = group.parent.toLowerCase();
    if (parentLower.includes(cat) || cat.includes(parentLower)) {
      return group.subcategories;
    }
  }

  // Default fallback for any other custom category
  return ['General', 'Miscellaneous', 'Other'];
}

export function isCategoryMatch(itemCategory, filterCategory) {
  if (!filterCategory) return true;
  if (!itemCategory) return false;

  const itemCat = String(itemCategory).trim().toLowerCase();
  const filterCat = String(filterCategory).trim().toLowerCase();

  if (itemCat === filterCat) return true;

  // Food / Food & Dining
  if ((itemCat.includes('food') || itemCat.includes('din')) && (filterCat.includes('food') || filterCat.includes('din'))) {
    return true;
  }

  // Travel / Transport
  if ((itemCat.includes('travel') || itemCat.includes('transport') || itemCat.includes('vehic')) && 
      (filterCat.includes('travel') || filterCat.includes('transport') || filterCat.includes('vehic'))) {
    return true;
  }

  // Bills / Bills & Utilities
  if ((itemCat.includes('bill') || itemCat.includes('util')) && (filterCat.includes('bill') || filterCat.includes('util'))) {
    return true;
  }

  // Personal / Health / Education
  if ((itemCat.includes('person') || itemCat.includes('health') || itemCat.includes('educat')) &&
      (filterCat.includes('person') || filterCat.includes('health') || filterCat.includes('educat'))) {
    return true;
  }

  return itemCat.includes(filterCat) || filterCat.includes(itemCat);
}

export function SubcategoryPill({ subcategory }) {
  const Icon = SUBCATEGORY_META[subcategory] || Tag;
  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
      <Icon className="w-3 h-3 text-indigo-400" />
      <span>{subcategory}</span>
    </span>
  );
}
