import { describe, it, expect } from 'vitest';
import {
  buildMealOptions,
  buildCampMealOptions,
  buildCampMealAssignmentOptions,
  buildMealAssignmentOptions,
  resolveNormalizedMealKey,
  labelForMealKey,
  getMealColor,
  UNASSIGNED_MEAL_VALUE,
} from './menuMeals';

const menu = [
  { id: 'd1', type: 'daily', date: 'July 3', lunch: 'Tacos', dinner: 'Chicken' },
  { id: 's1', type: 'salad', name: 'Pasta salad' },
  { id: 'k1', type: 'snack', name: 'Chips' },
];

describe('menuMeals', () => {
  it('buildMealOptions should include daily lunch/dinner and named rows', () => {
    const opts = buildMealOptions(menu);
    const values = opts.map((o) => o.value);
    expect(values).toContain('d1|lunch');
    expect(values).toContain('d1|dinner');
    expect(values).toContain('s1');
    expect(values).toContain('k1');
  });

  it('buildCampMealOptions should include only type salad with a name', () => {
    const opts = buildCampMealOptions(menu);
    expect(opts.map((o) => o.value)).toEqual(['s1']);
    expect(opts.some((o) => o.value === 'k1')).toBe(false);
    expect(opts.some((o) => o.value === 'd1|lunch')).toBe(false);
  });

  it('buildCampMealAssignmentOptions should add one legacy row when key is not a camp meal', () => {
    const opts = buildCampMealAssignmentOptions(menu, 'k1');
    expect(opts.map((o) => o.value)).toEqual(['s1', 'k1']);
    expect(opts[1].label).toBe('Chips');
  });

  it('buildCampMealAssignmentOptions should not duplicate camp meal keys', () => {
    expect(buildCampMealAssignmentOptions(menu, 's1').map((o) => o.value)).toEqual(['s1']);
  });

  it('buildCampMealAssignmentOptions should ignore unassigned sentinel', () => {
    expect(buildCampMealAssignmentOptions(menu, UNASSIGNED_MEAL_VALUE)).toEqual(
      buildCampMealOptions(menu),
    );
  });

  it('buildMealAssignmentOptions should match buildMealOptions when key is in menu', () => {
    expect(buildMealAssignmentOptions(menu, 'd1|lunch').map((o) => o.value)).toEqual(
      buildMealOptions(menu).map((o) => o.value),
    );
  });

  it('buildMealAssignmentOptions should append orphan key not in menu', () => {
    const opts = buildMealAssignmentOptions(menu, 'missing-id');
    expect(opts.map((o) => o.value)).toContain('missing-id');
    expect(opts[opts.length - 1].label).toBe('Removed meal');
  });

  it('resolveNormalizedMealKey should map legacy salad name to id', () => {
    expect(resolveNormalizedMealKey({ salad: 'Pasta salad' }, menu)).toBe('s1');
  });

  it('resolveNormalizedMealKey should accept composite daily keys', () => {
    expect(resolveNormalizedMealKey({ salad: 'd1|lunch' }, menu)).toBe('d1|lunch');
  });

  it('resolveNormalizedMealKey should return unassigned for General', () => {
    expect(resolveNormalizedMealKey({ salad: UNASSIGNED_MEAL_VALUE }, menu)).toBe(UNASSIGNED_MEAL_VALUE);
  });

  it('labelForMealKey should return General for unassigned', () => {
    expect(labelForMealKey(UNASSIGNED_MEAL_VALUE, menu)).toBe('General');
    expect(labelForMealKey('', menu)).toBe('General');
  });

  it('labelForMealKey should describe daily slots', () => {
    expect(labelForMealKey('d1|lunch', menu)).toContain('Lunch');
    expect(labelForMealKey('d1|lunch', menu)).toContain('Tacos');
  });

  it('getMealColor should return hex', () => {
    expect(getMealColor('s1')).toMatch(/^#/);
    expect(getMealColor(UNASSIGNED_MEAL_VALUE)).toMatch(/^#/);
  });
});
