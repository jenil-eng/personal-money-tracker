/**
 * Date and currency helper utilities for backend logic.
 */

// Format date as DD-MM-YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  // If already DD-MM-YYYY, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  
  // If YYYY-MM-DD format (standard HTML date input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-');
    return `${day}-${month}-${year}`;
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

  // Guard against invalid/corrupted year like 46255
  if (year > 2099 || year < 1900) return str;

  return `${day}-${month}-${year}`;
}

// Standardize DD-MM-YYYY to YYYY-MM-DD for sorting/comparison
function parseDDMMYYYY(ddmmyyyy) {
  if (!ddmmyyyy) return new Date(0);
  const str = String(ddmmyyyy).trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (year > 1900 && year < 2100) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date(str);
}

// Parse numeric amount safely from numbers or formatted currency strings (e.g. "₹300", "₹5,624" -> 300, 5624)
function parseAmount(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

module.exports = {
  formatDate,
  parseDDMMYYYY,
  parseAmount
};

