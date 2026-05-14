import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./hooks/useTripCountdown', () => ({
  useTripCountdown: () => ({
    phase: 'before',
    tripStartIso: '2026-07-02',
    tripEndIso: '2026-07-05',
    nightCaption: '',
    display: { days: '01', hours: '02', minutes: '03', seconds: '04' },
  }),
}));

vi.mock('./pages/ShoppingList', () => ({
  default: () => <div>Shopping List Page</div>,
}));

vi.mock('./pages/Menu', () => ({
  default: () => <div>Menu Page</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TRIP_START', '2026-07-02');
    vi.stubEnv('VITE_TRIP_END', '2026-07-05');
  });

  it('should render ShoppingList on root path', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Shopping List Page')).toBeInTheDocument();
  });

  it('should render Menu on /menu path', () => {
    window.history.pushState({}, '', '/menu');
    render(<App />);

    expect(screen.getByText('Menu Page')).toBeInTheDocument();
  });
});
