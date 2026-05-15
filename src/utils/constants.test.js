import { describe, it, expect } from 'vitest';
import {
  STORES,
  getStoreColor,
  getStoreGradient,
  DEFAULT_STORE,
  normalizeRetailStore,
  coerceStoreFromItem,
  AUTO_SAVE_DEBOUNCE_MS,
  CLICK_OUTSIDE_DELAY_MS,
} from './constants';

describe('constants', () => {
  it('should export debounce timings', () => {
    expect(AUTO_SAVE_DEBOUNCE_MS).toBe(500);
    expect(CLICK_OUTSIDE_DELAY_MS).toBe(100);
  });

  it('should define retail store chips', () => {
    expect(STORES).toEqual(['Fresh Farms', 'Aldi', 'Costco', "Binny's", 'Other']);
    expect(DEFAULT_STORE).toBe('Fresh Farms');
  });

  it('normalizeRetailStore should map legacy lanes and labels', () => {
    expect(normalizeRetailStore('Cooler & drinks')).toBe('Other');
    expect(normalizeRetailStore('Fresh Farms')).toBe('Fresh Farms');
    expect(normalizeRetailStore('Fresh Farm')).toBe('Fresh Farms');
    expect(normalizeRetailStore('')).toBe('Other');
  });

  it('coerceStoreFromItem maps legacy singular name for forms', () => {
    expect(coerceStoreFromItem('Fresh Farm')).toBe('Fresh Farms');
    expect(coerceStoreFromItem('')).toBe('Fresh Farms');
    expect(coerceStoreFromItem('Costco')).toBe('Costco');
  });

  it('getStoreColor should return brand colors', () => {
    expect(getStoreColor('Fresh Farms')).toBe('#2e7d32');
    expect(getStoreColor('Fresh Farm')).toBe('#2e7d32');
    expect(getStoreColor('Aldi')).toBe('#1565c0');
    expect(getStoreColor('Costco')).toBe('#c62828');
    expect(getStoreColor("Binny's")).toBe('#212121');
    expect(getStoreColor('Other')).toBe('#9e9e9e');
  });

  it('getStoreGradient should be a soft linear gradient using the store base color', () => {
    const g = getStoreGradient('Costco');
    expect(g.startsWith('linear-gradient(')).toBe(true);
    expect(g).toContain('#c62828');
    expect(getStoreGradient('Fresh Farm')).toContain('#2e7d32');
  });
});
