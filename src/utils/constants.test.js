import { describe, it, expect } from 'vitest';
import {
  STORES,
  getStoreColor,
  DEFAULT_STORE,
  normalizeRetailStore,
  AUTO_SAVE_DEBOUNCE_MS,
  CLICK_OUTSIDE_DELAY_MS,
} from './constants';

describe('constants', () => {
  it('should export debounce timings', () => {
    expect(AUTO_SAVE_DEBOUNCE_MS).toBe(500);
    expect(CLICK_OUTSIDE_DELAY_MS).toBe(100);
  });

  it('should define retail store chips', () => {
    expect(STORES).toEqual(['Fresh Farm', 'Aldi', 'Costco', "Binny's", 'Other']);
    expect(DEFAULT_STORE).toBe('Fresh Farm');
  });

  it('normalizeRetailStore should map legacy lanes to Other', () => {
    expect(normalizeRetailStore('Cooler & drinks')).toBe('Other');
    expect(normalizeRetailStore('Fresh Farm')).toBe('Fresh Farm');
    expect(normalizeRetailStore('')).toBe('Other');
  });

  it('getStoreColor should return brand colors', () => {
    expect(getStoreColor('Fresh Farm')).toBe('#2e7d32');
    expect(getStoreColor('Aldi')).toBe('#1565c0');
    expect(getStoreColor('Costco')).toBe('#c62828');
    expect(getStoreColor("Binny's")).toBe('#212121');
    expect(getStoreColor('Other')).toBe('#9e9e9e');
  });
});
