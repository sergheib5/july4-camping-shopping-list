import { describe, it, expect } from 'vitest';
import { STORES } from './constants';
import { getStoreBrandFallbackVariant, getStoreFaviconDomain } from './storeBrandIcon';

describe('storeBrandIcon', () => {
  it('returns favicon domains for known chains', () => {
    expect(getStoreFaviconDomain('Fresh Farms')).toBe('freshfarms.com');
    expect(getStoreFaviconDomain('Costco')).toBe('costco.com');
    expect(getStoreFaviconDomain('Aldi')).toBe('aldi.us');
    expect(getStoreFaviconDomain("Binny's")).toBe('binnys.com');
  });

  it('resolves favicon for legacy singular label via normalizeRetailStore', () => {
    expect(getStoreFaviconDomain('Fresh Farm')).toBe('freshfarms.com');
  });

  it('maps favicon domains by normalized STORES labels (not legacy alias keys)', () => {
    for (const store of STORES) {
      if (store === 'Other') {
        expect(getStoreFaviconDomain(store)).toBeNull();
        continue;
      }
      expect(getStoreFaviconDomain(store)).toBeTruthy();
    }
  });

  it('returns null for Other and unknown stores', () => {
    expect(getStoreFaviconDomain('Other')).toBeNull();
    expect(getStoreFaviconDomain('')).toBeNull();
  });

  it('maps legacy / unknown stores to generic fallback variant', () => {
    expect(getStoreBrandFallbackVariant('Fresh Farms')).toBe('farm');
    expect(getStoreBrandFallbackVariant('Fresh Farm')).toBe('farm');
    expect(getStoreBrandFallbackVariant('Other')).toBe('generic');
    expect(getStoreBrandFallbackVariant('Costco')).toBe('generic');
    expect(getStoreBrandFallbackVariant(null)).toBe('generic');
  });
});
