/**
 * AJOWANU Utility Formatters
 * Formats numbers, currencies (FCFA), and dates for French / West African context
 */

/**
 * Formats an amount into West African FCFA standard representation
 * Example: 5000 -> "5 000 FCFA"
 * Example: 125000 -> "125 000 FCFA"
 */
export function formatFCFA(amount: number | undefined | null, currency: string = 'FCFA'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `0 ${currency}`;
  }
  const rounded = Math.round(amount);
  // Use French locale spacing (with regular space instead of narrow non-breaking space for reliable rendering)
  const formattedNumber = rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
  return `${formattedNumber} ${currency}`;
}

/**
 * Formats a plain number with thousand spaces
 * Example: 12450 -> "12 450"
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return Math.round(value).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
}

/**
 * Formats date and time into French natural format
 * Example: "16/09/2026 14:30"
 */
export function formatDateTimeFR(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats date into French natural format
 * Example: "16/09/2026"
 */
export function formatDateFR(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
