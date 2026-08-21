/**
 * Indian Rupee (₹) and DD-MM-YYYY Date formatting helpers
 */

// Format numbers in Indian Rupee format (en-IN)
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// Format date string or object to DD-MM-YYYY
export function formatDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}-${m}-${y}`;
  }

  // Handle Google Sheets / Excel Serial Date Numbers (e.g. 46255 -> 21-08-2026)
  if (!isNaN(str) && Number(str) > 30000 && Number(str) < 60000) {
    const d = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return str;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (year > 2099 || year < 1900) return str;

  return `${day}-${month}-${year}`;
}

// Convert YYYY-MM-DD (from input[type=date]) to DD-MM-YYYY
export function isoToDDMMYYYY(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  if (y && m && d) {
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return isoStr;
}

// Convert DD-MM-YYYY to YYYY-MM-DD (for input[type=date])
export function ddmmYYYYtoISO(ddmmyyyy) {
  if (!ddmmyyyy) return '';
  const str = String(ddmmyyyy).trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return str;
}

// Get today's date in YYYY-MM-DD for date input default
export function getTodayISO() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// Get current month in YYYY-MM for month picker default
export function getCurrentMonthISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
}

// Parse DD-MM-YYYY string to Date object
export function parseDDMMYYYY(ddmmyyyy) {
  if (!ddmmyyyy) return new Date(0);
  const str = String(ddmmyyyy).trim();

  // If serial date number
  if (!isNaN(str) && Number(str) > 30000 && Number(str) < 60000) {
    return new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
  }

  const parts = str.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (year > 1900 && year < 2100) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date(str);
}

// Check if a DD-MM-YYYY date falls in current month and year
export function isThisMonth(ddmmyyyy) {
  const d = parseDDMMYYYY(ddmmyyyy);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// Check if a DD-MM-YYYY date falls in specific YYYY-MM month
export function isDateInMonth(ddmmyyyy, yyyyMm) {
  if (!ddmmyyyy || !yyyyMm) return true;
  const d = parseDDMMYYYY(ddmmyyyy);
  const [targetYear, targetMonth] = yyyyMm.split('-').map(Number);
  return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
}

// Check if a DD-MM-YYYY date falls within Date From (YYYY-MM-DD) and Date To (YYYY-MM-DD)
export function isDateInRange(ddmmyyyy, dateFromIso, dateToIso) {
  if (!ddmmyyyy) return true;
  const t = parseDDMMYYYY(ddmmyyyy).getTime();

  if (dateFromIso) {
    const from = new Date(dateFromIso).getTime();
    if (t < from) return false;
  }

  if (dateToIso) {
    const to = new Date(dateToIso);
    to.setHours(23, 59, 59, 999);
    if (t > to.getTime()) return false;
  }

  return true;
}

// Format YYYY-MM to human label like "August 2026"
export function formatMonthLabel(yyyyMm) {
  if (!yyyyMm) return '';
  const [year, month] = yyyyMm.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
