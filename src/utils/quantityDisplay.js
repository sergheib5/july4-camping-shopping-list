/**
 * Split free-text quantity into a leading number and trailing unit for compact display.
 * @param {string | null | undefined} quantity
 * @returns {{ empty: true } | { amount: string, unit: string } | { text: string }}
 */
export function parseQuantityForDisplay(quantity) {
  const raw = String(quantity ?? '').trim();
  if (!raw) return { empty: true };

  const numberWithUnit = raw.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z][\w\s.-]*)$/);
  if (numberWithUnit) {
    return { amount: numberWithUnit[1], unit: numberWithUnit[2].trim() };
  }

  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    return { amount: raw, unit: '' };
  }

  return { text: raw };
}
