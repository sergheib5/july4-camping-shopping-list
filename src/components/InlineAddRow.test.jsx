import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineAddRow from './InlineAddRow';

// Mock useSalads hook
vi.mock('../hooks/useSalads', () => ({
  default: () => ['Caesar Salad', 'Greek Salad', 'Cobb Salad']
}));

describe('InlineAddRow', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form inputs', () => {
    render(<InlineAddRow onSave={mockOnSave} />);

    expect(screen.getByPlaceholderText('Add item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cooler & drinks')).toBeInTheDocument();
    expect(screen.getByDisplayValue('General')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Qty')).toBeInTheDocument();
  });

  it('should have General as default salad value', () => {
    render(<InlineAddRow onSave={mockOnSave} />);

    const saladSelect = screen.getByDisplayValue('General');
    expect(saladSelect).toBeInTheDocument();
  });

  it('should include salad options from useSalads hook', () => {
    render(<InlineAddRow onSave={mockOnSave} />);

    const saladSelect = screen.getByDisplayValue('General');
    
    expect(saladSelect).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Greek Salad')).toBeInTheDocument();
    expect(screen.getByText('Cobb Salad')).toBeInTheDocument();
  });

  it('should call onSave with salad field when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const nameInput = screen.getByPlaceholderText('Add item');
    const saladSelect = screen.getByDisplayValue('General');

    await user.type(nameInput, 'Lettuce');
    await user.selectOptions(saladSelect, 'Caesar Salad');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Lettuce',
        store: 'Cooler & drinks',
        salad: 'Caesar Salad',
        quantity: ''
      });
    });
  });

  it('should include salad in form data when submitting', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const nameInput = screen.getByPlaceholderText('Add item');
    const saladSelect = screen.getByDisplayValue('General');
    const quantityInput = screen.getByPlaceholderText('Qty');

    await user.type(nameInput, 'Tomatoes');
    await user.selectOptions(saladSelect, 'Greek Salad');
    await user.type(quantityInput, '2 lbs');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Tomatoes',
        store: 'Cooler & drinks',
        salad: 'Greek Salad',
        quantity: '2 lbs'
      });
    });
  });

  it('should reset salad to General after submission', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const nameInput = screen.getByPlaceholderText('Add item');
    const saladSelect = screen.getByDisplayValue('General');

    await user.type(nameInput, 'Test Item');
    await user.selectOptions(saladSelect, 'Cobb Salad');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    // After submission, salad should reset to General
    expect(screen.getByDisplayValue('General')).toBeInTheDocument();
  });

  it('should reset all fields including salad when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const nameInput = screen.getByPlaceholderText('Add item');
    const saladSelect = screen.getByDisplayValue('General');

    await user.type(nameInput, 'Test Item');
    await user.selectOptions(saladSelect, 'Caesar Salad');
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.getByDisplayValue('General')).toBeInTheDocument();
    });

    expect(nameInput.value).toBe('');
  });

  it('should handle salad selection change', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const saladSelect = screen.getByDisplayValue('General');
    await user.selectOptions(saladSelect, 'Greek Salad');

    expect(saladSelect.value).toBe('Greek Salad');
  });

  it('should maintain salad selection when changing other fields', async () => {
    const user = userEvent.setup();
    render(<InlineAddRow onSave={mockOnSave} />);

    const nameInput = screen.getByPlaceholderText('Add item');
    const saladSelect = screen.getByDisplayValue('General');
    const storeSelect = screen.getByDisplayValue('Cooler & drinks');

    await user.selectOptions(saladSelect, 'Caesar Salad');
    await user.type(nameInput, 'Lettuce');
    await user.selectOptions(storeSelect, 'Grill & foil');

    expect(saladSelect.value).toBe('Caesar Salad');
  });
});
