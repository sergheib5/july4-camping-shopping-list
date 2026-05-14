import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useMenuMeals from './useMenuMeals';

const baseMenu = [
  { id: 'a1', type: 'salad', name: 'Test salad' },
  { id: 'd1', type: 'daily', date: 'July 1', lunch: 'L', dinner: 'D' },
];

let latestCallback;

vi.mock('../firebase/db', () => ({
  subscribeToMenu: (cb) => {
    latestCallback = cb;
    cb(baseMenu);
    return vi.fn();
  },
}));

describe('useMenuMeals', () => {
  it('should expose meal options from menu', async () => {
    const { result } = renderHook(() => useMenuMeals());
    await waitFor(() => {
      expect(result.current.mealOptions.length).toBeGreaterThan(0);
    });
    expect(result.current.mealOptions.some((o) => o.value === 'a1')).toBe(true);
    expect(result.current.mealOptions.some((o) => o.value === 'd1|lunch')).toBe(true);
    expect(result.current.campMealOptions.map((o) => o.value)).toEqual(['a1']);
    expect(result.current.campMealOptions.some((o) => o.value === 'd1|lunch')).toBe(false);
  });

  it('should update when menu snapshot updates', async () => {
    const { result } = renderHook(() => useMenuMeals());
    await waitFor(() => expect(result.current.menuItems.length).toBe(2));
    act(() => {
      latestCallback([
        ...baseMenu,
        { id: 'k1', type: 'snack', name: 'Chips' },
      ]);
    });
    await waitFor(() => {
      expect(result.current.mealOptions.some((o) => o.value === 'k1')).toBe(true);
    });
    expect(result.current.campMealOptions.some((o) => o.value === 'k1')).toBe(false);
  });
});
