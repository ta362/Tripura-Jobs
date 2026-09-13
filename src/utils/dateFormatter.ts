/**
 * Utility to format various date string formats into standard Indian/UK format:
 * Day-Month-Year (e.g., DD-MM-YYYY or DD MMM YYYY).
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  // Clean potential whitespace or surrounding text
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Case 1: Already in DD-MM-YYYY or DD/MM/YYYY format
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: Standard ISO style date (YYYY-MM-DD)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  // Case 3: Try generic Javascript Date parsing
  try {
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      const d = String(parsedDate.getDate()).padStart(2, '0');
      const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const y = parsedDate.getFullYear();
      return `${d}-${m}-${y}`;
    }
  } catch {
    // Fallback to raw string
  }

  return trimmed;
}

/**
 * Beautifully formats dates with short month names (e.g. 06 Dec 2026)
 */
export function formatReadableDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  try {
    let parsedDate: Date | null = null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      parsedDate = new Date(trimmed);
    }

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      const day = String(parsedDate.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parsedDate.getMonth()];
      const year = parsedDate.getFullYear();
      return `${day} ${month} ${year}`;
    }
  } catch {
    // Fallback
  }

  return formatDate(trimmed);
}
