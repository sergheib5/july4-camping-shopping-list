import { normalizeRetailStore } from './constants';

/**
 * Domains for DuckDuckGo favicon CDN (`https://icons.duckduckgo.com/ip3/{domain}.ico`).
 * Only chains with recognizable public sites — no API key required.
 */
const FAVICON_DOMAIN_BY_STORE = {
  'Fresh Farms': 'freshfarms.com', // https://www.freshfarms.com/
  Aldi: 'aldi.us',
  Costco: 'costco.com',
  "Binny's": 'binnys.com',
};

export const STORE_FAVICON_BASE = 'https://icons.duckduckgo.com/ip3';

/** @returns {string | null} */
export function getStoreFaviconDomain(store) {
  const key = normalizeRetailStore(store);
  return FAVICON_DOMAIN_BY_STORE[key] ?? null;
}

/** `'farm'` for Fresh Farms; `'generic'` for everything else without / failed favicon. */
export function getStoreBrandFallbackVariant(store) {
  const key = normalizeRetailStore(store);
  if (key === 'Fresh Farms') return 'farm';
  return 'generic';
}
