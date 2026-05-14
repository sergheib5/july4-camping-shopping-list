import { describe, it, expect } from 'vitest';
import { STORES, getStoreColor, DEFAULT_STORE } from './constants';

describe('constants', () => {
  describe('STORES', () => {
    it('should contain expected camp packing lanes', () => {
      expect(STORES).toContain('Cooler & drinks');
      expect(STORES).toContain('Grill & foil');
      expect(STORES).toContain('Snacks');
      expect(STORES).toContain('Breakfast');
      expect(STORES).toContain('Safety & bugs');
      expect(STORES).toContain('Lighting');
      expect(STORES).toContain('Trash & recycling');
      expect(STORES).toContain('Other');
    });

    it('should default store to first lane', () => {
      expect(DEFAULT_STORE).toBe(STORES[0]);
    });

    it('should be an array', () => {
      expect(Array.isArray(STORES)).toBe(true);
    });
  });

  describe('getStoreColor', () => {
    it('should return a color for each store lane', () => {
      STORES.forEach((store) => {
        expect(getStoreColor(store)).toMatch(/^#/);
      });
    });

    it('should return default color for unknown store', () => {
      expect(getStoreColor('Unknown Store')).toBe('#78909c');
    });

    it('should return default color for null', () => {
      expect(getStoreColor(null)).toBe('#78909c');
    });

    it('should return default color for undefined', () => {
      expect(getStoreColor(undefined)).toBe('#78909c');
    });
  });
});
