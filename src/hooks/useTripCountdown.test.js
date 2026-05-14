import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTripCountdown } from './useTripCountdown';

describe('useTripCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('should report "before" phase and countdown when now is before trip start', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));

    const { result } = renderHook(() => useTripCountdown());
    expect(result.current.phase).toBe('before');
    expect(result.current.days).toBeGreaterThan(0);
  });

  it('should report "on" phase during the trip window', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date('2026-07-03T15:00:00'));

    const { result } = renderHook(() => useTripCountdown());
    expect(result.current.phase).toBe('on');
    expect(result.current.nightCaption.length).toBeGreaterThan(0);
  });

  it('should stay in "before" on start date until the configured local start time (default 5 PM)', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0)); // Jul 2 noon local

    const { result } = renderHook(() => useTripCountdown());
    expect(result.current.phase).toBe('before');
  });

  it('should enter "on" phase at explicit local start time from env', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02T17:00:00');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date(2026, 6, 2, 17, 0, 0));

    const { result } = renderHook(() => useTripCountdown());
    expect(result.current.phase).toBe('on');
  });

  it('should report "after" phase once the inclusive end day has passed', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date('2026-07-06T12:00:00'));

    const { result } = renderHook(() => useTripCountdown());
    expect(result.current.phase).toBe('after');
  });

  it('should tick once per second', () => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));

    const { result } = renderHook(() => useTripCountdown());
    const first = result.current.display.seconds;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.display.seconds).not.toBe(first);
  });
});
