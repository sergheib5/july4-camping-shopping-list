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

  it('starts with plus icon and Add item field only', () => {
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByLabelText('Add item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add item')).toBeInTheDocument();
    expect(screen.queryByLabelText('Store lane')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Menu meal')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument();
  });

  it('reveals store after name is entered and Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Lettuce');
    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Store lane')).toBeInTheDocument();
    expect(screen.queryByLabelText('Menu meal')).not.toBeInTheDocument();
  });

  it('reveals meal and quantity together after store is chosen', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Lettuce');
    await user.keyboard('{Enter}');
    await user.selectOptions(screen.getByLabelText('Store lane'), 'Aldi');

    expect(screen.getByLabelText('Menu meal')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('shows meal and quantity when store is unchanged but field is left', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Lettuce');
    await user.keyboard('{Enter}');
    await user.tab();

    expect(screen.getByLabelText('Menu meal')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('meal dropdown only lists camp meal options (plus General)', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Lettuce');
    await user.keyboard('{Enter}');
    await user.selectOptions(screen.getByLabelText('Store lane'), 'Aldi');

    const mealSelect = screen.getByLabelText('Menu meal');
    const values = [...mealSelect.querySelectorAll('option')].map((o) => o.value);
    expect(values).toContain('General');
    expect(values).toContain('s1');
    expect(values).toContain('s2');
    expect(values).toHaveLength(3);
  });

  it('should call onSave with store lane and camp meal id after full flow', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Lettuce');
    await user.keyboard('{Enter}');
    await user.selectOptions(screen.getByLabelText('Store lane'), 'Aldi');
    await user.selectOptions(screen.getByLabelText('Menu meal'), 's1');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Lettuce',
        store: 'Aldi',
        salad: 's1',
        quantity: '',
      });
    });
  });

  it('can save with General default without changing meal dropdown', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} campMealOptions={campMealOptions} />);

    await user.type(screen.getByLabelText('Add item'), 'Ice');
    await user.keyboard('{Enter}');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Ice',
        store: 'Fresh Farms',
        salad: 'General',
        quantity: '',
      });
    });
  });
});
