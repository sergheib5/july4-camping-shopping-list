import { describe, it, expect } from 'vitest';
import { MEAL_TAG_UNASSIGNED_VALUE, formatMealTagForDisplay } from './mealTag';

describe('mealTag', () => {
  it('should show Unassigned for General sentinel', () => {
    expect(formatMealTagForDisplay(MEAL_TAG_UNASSIGNED_VALUE)).toBe('Unassigned');
  });

  it('should show Unassigned for empty', () => {
    expect(formatMealTagForDisplay('')).toBe('Unassigned');
    expect(formatMealTagForDisplay(undefined)).toBe('Unassigned');
  });

  it('should pass through named dishes', () => {
    expect(formatMealTagForDisplay('Pasta salad (pesto)')).toBe('Pasta salad (pesto)');
  });
});
