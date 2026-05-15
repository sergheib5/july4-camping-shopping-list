import { describe, it, expect } from 'vitest';
import { MEAL_TAG_UNASSIGNED_VALUE, formatMealTagForDisplay } from './mealTag';

describe('mealTag', () => {
  it('should show General for General sentinel', () => {
    expect(formatMealTagForDisplay(MEAL_TAG_UNASSIGNED_VALUE)).toBe('General');
  });

  it('should show General for empty', () => {
    expect(formatMealTagForDisplay('')).toBe('General');
    expect(formatMealTagForDisplay(undefined)).toBe('General');
  });

  it('should pass through named dishes', () => {
    expect(formatMealTagForDisplay('Pasta salad (pesto)')).toBe('Pasta salad (pesto)');
  });
});
