import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineAddRow from './InlineAddRow';

const campMealOptions = [
  { value: 's1', label: 'Caesar Salad' },
  { value: 's2', label: 'Greek Salad' },
];

describe('InlineAddRow', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form inputs', () => {
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    expect(screen.getByPlaceholderText('Add item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fresh Farm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Unassigned')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Qty')).toBeInTheDocument();
  });

  it('meal dropdown only lists camp meal options (plus Unassigned)', () => {
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);
    const mealSelect = screen.getByLabelText('Menu meal');
    const values = [...mealSelect.querySelectorAll('option')].map((o) => o.value);
    expect(values).toContain('General');
    expect(values).toContain('s1');
    expect(values).toContain('s2');
    expect(values).toHaveLength(3);
  });

  it('should call onSave with store lane and camp meal id', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByPlaceholderText('Add item'), 'Lettuce');
    await user.selectOptions(screen.getByLabelText('Menu meal'), 's1');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Lettuce',
        store: 'Fresh Farm',
        salad: 's1',
        quantity: '',
      });
    });
  });
});
