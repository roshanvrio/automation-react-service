/**
 * Format a number into a compact human-readable string.
 *
 * 123       → "123"
 * 1200      → "1.2K"
 * 15000     → "15K"
 * 1500000   → "1.5M"
 * 1200000000→ "1.2B"
 */
export default function formatCompact(n) {
  if (n == null || isNaN(n)) return '0';
  const num = Number(n);
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}
