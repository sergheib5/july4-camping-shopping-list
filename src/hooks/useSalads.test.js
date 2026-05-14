import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useSalads from './useSalads';

// Mock Firebase db module
vi.mock('../firebase/db', () => ({
  subscribeToMenu: vi.fn()
}));

import { subscribeToMenu } from '../firebase/db';

describe('useSalads', () => {
  let mockUnsubscribe;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array initially', () => {
    subscribeToMenu.mockImplementation((callback) => {
      // Don't call callback immediately
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    expect(result.current).toEqual([]);
  });

  it('should return salad names when menu items are provided', async () => {
    const mockMenuItems = [
      { id: '1', type: 'salad', name: 'Caesar Salad' },
      { id: '2', type: 'daily', name: 'Monday Menu' },
      { id: '3', type: 'salad', name: 'Greek Salad' },
      { id: '4', type: 'snack', name: 'Chips' },
      { id: '5', type: 'salad', name: 'Cobb Salad' }
    ];

    subscribeToMenu.mockImplementation((callback) => {
      // Call callback immediately with menu items
      callback(mockMenuItems);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    await waitFor(() => {
      expect(result.current).toHaveLength(3);
    });

    expect(result.current).toEqual(['Caesar Salad', 'Cobb Salad', 'Greek Salad']);
  });

  it('should filter out items without name', async () => {
    const mockMenuItems = [
      { id: '1', type: 'salad', name: 'Caesar Salad' },
      { id: '2', type: 'salad', name: null },
      { id: '3', type: 'salad', name: '' },
      { id: '4', type: 'salad', name: 'Greek Salad' }
    ];

    subscribeToMenu.mockImplementation((callback) => {
      callback(mockMenuItems);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current).toEqual(['Caesar Salad', 'Greek Salad']);
  });

  it('should return empty array when no salads exist', async () => {
    const mockMenuItems = [
      { id: '1', type: 'daily', name: 'Monday Menu' },
      { id: '2', type: 'snack', name: 'Chips' },
      { id: '3', type: 'drink', name: 'Water' }
    ];

    subscribeToMenu.mockImplementation((callback) => {
      callback(mockMenuItems);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should sort salad names alphabetically', async () => {
    const mockMenuItems = [
      { id: '1', type: 'salad', name: 'Zucchini Salad' },
      { id: '2', type: 'salad', name: 'Apple Salad' },
      { id: '3', type: 'salad', name: 'Caesar Salad' },
      { id: '4', type: 'salad', name: 'Banana Salad' }
    ];

    subscribeToMenu.mockImplementation((callback) => {
      callback(mockMenuItems);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    await waitFor(() => {
      expect(result.current).toHaveLength(4);
    });

    expect(result.current).toEqual([
      'Apple Salad',
      'Banana Salad',
      'Caesar Salad',
      'Zucchini Salad'
    ]);
  });

  it('should unsubscribe when component unmounts', () => {
    subscribeToMenu.mockImplementation(() => {
      return mockUnsubscribe;
    });

    const { unmount } = renderHook(() => useSalads());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should update when menu items change', async () => {
    let callback;
    subscribeToMenu.mockImplementation((cb) => {
      callback = cb;
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSalads());

    // Initial call with some salads
    act(() => {
      callback([
        { id: '1', type: 'salad', name: 'Caesar Salad' }
      ]);
    });

    await waitFor(() => {
      expect(result.current).toEqual(['Caesar Salad']);
    });

    // Update with more salads
    act(() => {
      callback([
        { id: '1', type: 'salad', name: 'Caesar Salad' },
        { id: '2', type: 'salad', name: 'Greek Salad' }
      ]);
    });

    await waitFor(() => {
      expect(result.current).toEqual(['Caesar Salad', 'Greek Salad']);
    });
  });
});
