import { describe, it, expect } from 'vitest';
import { parseQuantityForDisplay } from './quantityDisplay';

describe('parseQuantityForDisplay', () => {
  it('returns empty for blank quantity', () => {
    expect(parseQuantityForDisplay('')).toEqual({ empty: true });
    expect(parseQuantityForDisplay('   ')).toEqual({ empty: true });
    expect(parseQuantityForDisplay(null)).toEqual({ empty: true });
  });

  it('splits number and unit', () => {
    expect(parseQuantityForDisplay('4 pack')).toEqual({ amount: '4', unit: 'pack' });
    expect(parseQuantityForDisplay('2 lbs')).toEqual({ amount: '2', unit: 'lbs' });
    expect(parseQuantityForDisplay('12 pk')).toEqual({ amount: '12', unit: 'pk' });
    expect(parseQuantityForDisplay('2 lb')).toEqual({ amount: '2', unit: 'lb' });
    expect(parseQuantityForDisplay('3 gal')).toEqual({ amount: '3', unit: 'gal' });
    expect(parseQuantityForDisplay('1 large')).toEqual({ amount: '1', unit: 'large' });
    expect(parseQuantityForDisplay('2 rolls')).toEqual({ amount: '2', unit: 'rolls' });
    expect(parseQuantityForDisplay('3 bags')).toEqual({ amount: '3', unit: 'bags' });
  });

  it('returns amount only for bare numbers', () => {
    expect(parseQuantityForDisplay('18')).toEqual({ amount: '18', unit: '' });
    expect(parseQuantityForDisplay('1')).toEqual({ amount: '1', unit: '' });
    expect(parseQuantityForDisplay('2.5')).toEqual({ amount: '2.5', unit: '' });
  });

  it('returns full text when pattern does not match', () => {
    expect(parseQuantityForDisplay('dozen')).toEqual({ text: 'dozen' });
    expect(parseQuantityForDisplay('a few')).toEqual({ text: 'a few' });
  });
});
